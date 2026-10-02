"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CONSENT_TEXT, type Field, type PartnerType } from "@/lib/partnerTypes";

type Values = Record<string, string | string[]>;
type Status = "idle" | "sending" | "done" | "unavailable" | "error";

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

const control = `w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-fuchsia-500/50 ${focus}`;

function validUrl(v: string) {
  try {
    new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return true;
  } catch {
    return false;
  }
}

export default function PartnerForm({ type }: { type: PartnerType }) {
  const [values, setValues] = useState<Values>({});
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");

  const str = (name: string) =>
    typeof values[name] === "string" ? (values[name] as string) : "";
  const list = (name: string) =>
    Array.isArray(values[name]) ? (values[name] as string[]) : [];

  function validate() {
    const e: Record<string, string> = {};
    for (const f of type.fields) {
      if (f.type === "checkboxes") {
        if (f.required && list(f.name).length === 0) e[f.name] = "Choose at least one.";
        continue;
      }
      const v = str(f.name).trim();
      if (f.required && !v) e[f.name] = "This field is required.";
      else if (v && f.type === "email" && !/^\S+@\S+\.\S+$/.test(v))
        e[f.name] = "Enter a valid email address.";
      else if (v && f.type === "url" && !validUrl(v))
        e[f.name] = "Enter a valid link.";
      else if (v && f.type === "tel" && v.replace(/\D/g, "").length < 9)
        e[f.name] = "Enter a valid phone number.";
    }
    if (!consent) e.consent = "Please tick the box to continue.";
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type.slug, fields: values, consent, hp }),
      });
      if (res.ok) setStatus("done");
      else if (res.status === 503) setStatus("unavailable");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
        <h2 className="text-xl font-bold text-[var(--text)]">Application received</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Thanks for applying. We will reply to the email address you gave us.
        </p>
        <Link
          href="/partner"
          className={`mt-5 inline-flex min-h-10 items-center rounded-full bg-[var(--btn-bg)] px-5 py-2 text-sm font-semibold text-[var(--btn-fg)] ${focus}`}
        >
          Back to partner options
        </Link>
      </div>
    );
  }

  function renderField(f: Field) {
    const id = `f-${f.name}`;
    const err = errors[f.name];
    const describedBy = [f.help ? `${id}-help` : "", err ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;

    const label = (
      <>
        {f.label}
        {f.required ? (
          <span className="text-fuchsia-500"> *</span>
        ) : (
          <span className="font-normal text-[var(--muted)]"> (optional)</span>
        )}
      </>
    );

    let input;
    if (f.type === "checkboxes") {
      return (
        <fieldset key={f.name} id={id} tabIndex={-1} aria-describedby={describedBy} className={`rounded-lg ${focus}`}>
          <legend className="mb-2 text-sm font-medium text-[var(--text)]">{label}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {f.options?.map((o) => (
              <label key={o} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--hover)]">
                <input
                  type="checkbox"
                  checked={list(f.name).includes(o)}
                  onChange={(e) =>
                    setValues((v) => {
                      const cur = Array.isArray(v[f.name]) ? (v[f.name] as string[]) : [];
                      return { ...v, [f.name]: e.target.checked ? [...cur, o] : cur.filter((x) => x !== o) };
                    })
                  }
                  className="h-4 w-4 accent-fuchsia-600"
                />
                {o}
              </label>
            ))}
          </div>
          {f.help && <p id={`${id}-help`} className="mt-1 text-xs text-[var(--muted)]">{f.help}</p>}
          {err && <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-red-500">{err}</p>}
        </fieldset>
      );
    }

    const common = {
      id,
      name: f.name,
      value: str(f.name),
      "aria-invalid": !!err,
      "aria-describedby": describedBy,
      onChange: (e: { target: { value: string } }) =>
        setValues((v) => ({ ...v, [f.name]: e.target.value })),
    };

    if (f.type === "textarea") {
      input = <textarea {...common} rows={4} maxLength={f.maxLength} placeholder={f.placeholder} className={control} />;
    } else if (f.type === "select") {
      input = (
        <select {...common} className={control}>
          <option value="">Choose one</option>
          {f.options?.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      );
    } else {
      input = (
        <input
          {...common}
          type={f.type === "url" ? "text" : f.type}
          inputMode={f.type === "url" ? "url" : undefined}
          maxLength={f.maxLength ?? 200}
          placeholder={f.placeholder}
          autoComplete={f.type === "email" ? "email" : f.type === "tel" ? "tel" : undefined}
          className={control}
        />
      );
    }

    return (
      <div key={f.name}>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--text)]">{label}</label>
        {input}
        {f.help && <p id={`${id}-help`} className="mt-1 text-xs text-[var(--muted)]">{f.help}</p>}
        {err && <p id={`${id}-err`} role="alert" className="mt-1 text-xs text-red-500">{err}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="relative space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      {/* Spam trap: real people never see or fill this in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </label>
      </div>

      {type.fields.map(renderField)}

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-[var(--text)]">
          <input
            id="f-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "f-consent-err" : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 accent-fuchsia-600"
          />
          <span>
            {CONSENT_TEXT} See our{" "}
            <Link href="/privacy" className="underline hover:text-fuchsia-500">Privacy Policy</Link>.
          </span>
        </label>
        {errors.consent && <p id="f-consent-err" role="alert" className="mt-1 text-xs text-red-500">{errors.consent}</p>}
      </div>

      {status === "unavailable" && (
        <p role="alert" className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-3 text-sm text-[var(--text)]">
          Applications are not available yet. Please try again soon.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-[var(--text)]">
          We could not send your application. Check your connection and try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className={`min-h-11 w-full rounded-full bg-[var(--btn-bg)] px-6 py-2.5 text-sm font-semibold text-[var(--btn-fg)] disabled:opacity-60 ${focus}`}
      >
        {status === "sending" ? "Sending..." : "Send application"}
      </button>
    </form>
  );
}
