import type { ReactNode } from "react";
import { TRUST_ITEMS, type TrustItem } from "@/lib/trust";

const icons: Record<TrustItem["icon"], ReactNode> = {
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  returns: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </>
  ),
};

export default function TrustStrip() {
  const dev = process.env.NODE_ENV !== "production";
  const items = TRUST_ITEMS.filter((i) => i.confirmed || dev);

  if (items.length === 0) return null;

  return (
    <section aria-label="Why shop with RCW Store">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((i) => (
          <li
            key={i.id}
            className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {icons[i.icon]}
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">
                {i.title}
              </h3>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{i.text}</p>
              {!i.confirmed && (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-orange-500">
                  Placeholder: confirm before launch
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
