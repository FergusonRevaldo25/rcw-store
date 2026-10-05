import { auditValues } from "@/lib/audit/log";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { fetchRemoteImage, ImageFetchError } from "@/lib/images/remote";
import { MAX_IMAGE_BYTES, sniffImage } from "@/lib/images/sniff";
import { storageConfigured, storeProductImage } from "@/lib/images/store";
import { tryGetStaff } from "@/lib/rbac/guard";

export const runtime = "nodejs";

type Reply = { ok: true; url: string } | { ok: false; error: string };
const reply = (body: Reply, status = 200) => Response.json(body, { status });

// Accepts either a file (multipart form, field "file") or JSON { "url": "https://..." }.
export async function POST(req: Request) {
  const staff = await tryGetStaff();
  if (!staff) return reply({ ok: false, error: "Please sign in again." }, 401);
  if (!staff.permissions.has("products:create"))
    return reply({ ok: false, error: "You do not have permission to add product images." }, 403);
  if (!storageConfigured())
    return reply({ ok: false, error: "Image storage is not set up yet. Ask an admin to connect it." }, 503);

  let bytes: Buffer | null = null;
  let source = "";
  try {
    const type = req.headers.get("content-type") ?? "";
    if (type.startsWith("multipart/form-data")) {
      const file = (await req.formData()).get("file");
      if (!(file instanceof File))
        return reply({ ok: false, error: "Choose an image file." }, 400);
      if (file.size > MAX_IMAGE_BYTES)
        return reply({ ok: false, error: "That image is over 4 MB. Use a smaller one." }, 413);
      bytes = Buffer.from(await file.arrayBuffer());
      source = "file upload";
    } else {
      const body = (await req.json()) as { url?: unknown };
      if (typeof body.url !== "string" || body.url.length > 2000)
        return reply({ ok: false, error: "Paste an image link." }, 400);
      bytes = await fetchRemoteImage(body.url);
      source = new URL(body.url.trim()).hostname;
    }
  } catch (e) {
    if (e instanceof ImageFetchError) return reply({ ok: false, error: e.message }, 400);
    return reply({ ok: false, error: "We could not read that image." }, 400);
  }

  if (!bytes || bytes.length > MAX_IMAGE_BYTES)
    return reply({ ok: false, error: "That image is over 4 MB. Use a smaller one." }, 413);

  const kind = sniffImage(bytes);
  if (!kind)
    return reply({ ok: false, error: "That is not a JPG, PNG, WebP or AVIF image." }, 415);

  try {
    const url = await storeProductImage(bytes, kind);
    await db
      .insert(auditLog)
      .values(auditValues(staff.user, "product.image.add", "image", url, null, { source, bytes: bytes.length }));
    return reply({ ok: true, url });
  } catch {
    return reply({ ok: false, error: "The image could not be saved. Please try again." }, 500);
  }
}