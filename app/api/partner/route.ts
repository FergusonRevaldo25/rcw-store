import { NextResponse } from "next/server";
import { CONSENT_TEXT, getPartnerType } from "@/lib/partnerTypes";

// Simple per-instance limiter: 5 applications per IP per hour.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 5;

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const b = (body ?? {}) as {
    type?: unknown;
    fields?: Record<string, unknown>;
    consent?: unknown;
    hp?: unknown;
  };

  // Spam trap filled in: pretend success, send nothing.
  if (typeof b.hp === "string" && b.hp.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const to = process.env.PARTNER_NOTIFY_EMAIL;
  const from = process.env.PARTNER_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const type = typeof b.type === "string" ? getPartnerType(b.type) : undefined;
  if (!type || b.consent !== true) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const clean: { name: string; label: string; value: string }[] = [];
  const raw = b.fields ?? {};
  for (const f of type.fields) {
    const input = raw[f.name];
    let value = "";
    if (f.type === "checkboxes") {
      const picked = Array.isArray(input)
        ? input.filter((x): x is string => typeof x === "string")
        : [];
      value = picked.filter((x) => f.options?.includes(x)).join(", ");
    } else if (typeof input === "string") {
      value = input.trim().slice(0, f.maxLength ?? 2000);
      if (f.type === "select" && value && !f.options?.includes(value)) value = "";
    }
    if (f.required && !value) {
      return NextResponse.json({ error: "invalid", field: f.name }, { status: 400 });
    }
    if (f.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) {
      return NextResponse.json({ error: "invalid", field: f.name }, { status: 400 });
    }
    if (value) clean.push({ name: f.name, label: f.label, value });
  }

  const email = clean.find((c) => c.name === "email")?.value;
  const applicant = clean.find((c) => c.name === "name")?.value ?? "Unknown";

  const rows = clean
    .map(
      (c) =>
        `<tr><td style="padding:6px 12px;font-weight:600;vertical-align:top">${esc(c.label)}</td><td style="padding:6px 12px;white-space:pre-wrap">${esc(c.value)}</td></tr>`
    )
    .join("");
  const htmlContent = `<h2>New partner application: ${esc(type.name)}</h2>
<table style="border-collapse:collapse">${rows}</table>
<p style="margin-top:16px;font-size:12px;color:#555">Consent recorded ${new Date().toISOString()}:<br>${esc(CONSENT_TEXT)}</p>`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "RCW Store applications", email: from },
      to: [{ email: to }],
      ...(email ? { replyTo: { email } } : {}),
      subject: `New partner application: ${type.name} - ${applicant}`
        .replace(/[\r\n]+/g, " ")
        .slice(0, 200),
      htmlContent,
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
