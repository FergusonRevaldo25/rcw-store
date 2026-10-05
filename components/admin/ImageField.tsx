"use client";

import { useRef, useState } from "react";

type Reply = { ok: true; url: string } | { ok: false; error: string };

const MAX_BYTES = 4 * 1024 * 1024;

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";
const btn =
  "min-h-11 rounded-full border border-[var(--border-strong)] px-5 py-2 text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] disabled:opacity-60";

export default function ImageField({
  initial = "",
  error,
  disabled = false,
}: {
  initial?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState(initial);
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function send(init: RequestInit) {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", ...init });
      const data = (await res.json()) as Reply;
      if (data.ok) {
        setUrl(data.url);
        setLink("");
        setMsg("Image saved. It is used when you save the product.");
      } else {
        setMsg(data.error);
      }
    } catch {
      setMsg("The upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setMsg("That image is over 4 MB. Use a smaller one.");
      return;
    }
    const body = new FormData();
    body.append("file", file);
    void send({ body });
  }

  function onLink() {
    if (!link.trim()) {
      setMsg("Paste an image link first.");
      return;
    }
    void send({
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: link.trim() }),
    });
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-[var(--text)]">
        Product image
      </span>

      {/* The saved address is what the form submits. */}
      <input type="hidden" name="image" value={url} />

      <div className="flex flex-wrap items-start gap-4">
        <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Product preview" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-[var(--muted)]">No image yet</span>
          )}
        </div>

        {!disabled && (
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className={`${btn} ${focus}`}
              >
                Upload a file
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onFile}
                className="hidden"
              />
              <p className="mt-1 text-xs text-[var(--muted)]">JPG, PNG, WebP or AVIF, up to 4 MB.</p>
            </div>

            <div>
              <label htmlFor="image-link" className="mb-1 block text-xs text-[var(--muted)]">
                Or paste a link to an image. We save a copy of it.
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  id="image-link"
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com/photo.jpg"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className={`min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] ${focus}`}
                />
                <button type="button" disabled={busy} onClick={onLink} className={`${btn} ${focus}`}>
                  Use link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p role="status" aria-live="polite" className="mt-2 min-h-5 text-sm text-[var(--muted)]">
        {busy ? "Working..." : msg}
      </p>
      <p role="alert" className="min-h-4 text-xs text-red-500">
        {error}
      </p>
    </div>
  );
}