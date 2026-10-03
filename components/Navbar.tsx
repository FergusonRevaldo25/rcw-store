"use client";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { categoryMeta, navSlugs } from "@/lib/categoryMeta";
import { useCart } from "@/components/CartProvider";
import { useFavourites } from "@/components/FavouritesProvider";

const navCategories = navSlugs
  .map((s) => categoryMeta.find((c) => c.slug === s))
  .filter((c): c is NonNullable<typeof c> => !!c);

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

/* ---------- Small pieces ---------- */

export function SAFlag({ className = "h-4 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={`${className} shrink-0 rounded-[2px] shadow-sm`}
      role="img"
      aria-label="South African flag"
    >
      <rect width="30" height="10" fill="#E03C31" />
      <rect y="10" width="30" height="10" fill="#001489" />
      <path
        d="M0 0 L11 10 L0 20 M11 10 H30"
        fill="none"
        stroke="#fff"
        strokeWidth="7"
      />
      <path
        d="M0 0 L11 10 L0 20 M11 10 H30"
        fill="none"
        stroke="#007749"
        strokeWidth="4.2"
      />
      <path d="M0 2 L8.5 10 L0 18 Z" fill="#FFB612" />
      <path d="M0 4.5 L6 10 L0 15.5 Z" fill="#000" />
    </svg>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </svg>
  );
}

function IconLink({
  href,
  label,
  count = 0,
  onClick,
  className = "",
  children,
}: {
  href: string;
  label: string;
  count?: number;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const badge = count > 99 ? "99+" : String(count);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={
        count > 0
          ? `${label}, ${count} ${count === 1 ? "item" : "items"}`
          : label
      }
      className={`relative flex items-center gap-2 rounded-lg border border-[var(--border)] px-2.5 py-2 text-sm text-[var(--text)] transition-colors hover:bg-[var(--hover)] ${focus} ${className}`}
    >
      {children}
      <span className="hidden lg:inline">{label}</span>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-1 text-[10px] font-semibold text-white"
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function SearchBar({
  className = "",
  onSearch,
}: {
  className?: string;
  onSearch: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    onSearch();
  }

  return (
    <form role="search" onSubmit={submit} className={className}>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className={`w-full rounded-full border border-[var(--border)] bg-[var(--surface)] py-2 pl-4 pr-11 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:border-fuchsia-500/50 ${focus}`}
        />
        <button
          type="submit"
          aria-label="Search"
          className={`absolute right-1 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)] ${focus}`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
        </button>
      </div>
    </form>
  );
}

function CategoryList({
  onNavigate,
  columns,
}: {
  onNavigate: () => void;
  columns: string;
}) {
  return (
    <ul className={`grid gap-1 ${columns}`}>
      {categoryMeta.map((c) => (
        <li key={c.slug}>
          {c.live ? (
            <Link
              href={`/products/${c.slug}`}
              onClick={onNavigate}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
            >
              <span className="flex-1">{c.name}</span>
              <span className="rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                Shop
              </span>
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--dim)]"
            >
              <span className="flex-1">{c.name}</span>
              <span className="text-[10px]">Soon</span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function CategoryScroller() {
  const ref = useRef<HTMLUListElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  function scrollByDir(dir: 1 | -1) {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    ref.current?.scrollBy({
      left: dir * 240,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  const arrow = `absolute top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full border border-[var(--border-strong)] bg-[var(--menu)] text-[var(--text)] shadow hover:bg-[var(--hover)] ${focus}`;

  return (
    <div className="relative flex min-w-0 flex-1 items-center">
      {canLeft && (
        <button
          type="button"
          aria-label="Scroll categories left"
          onClick={() => scrollByDir(-1)}
          className={`${arrow} left-0`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}

      <ul
        ref={ref}
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {navCategories.map((c) => (
          <li key={c.slug} className="shrink-0">
            {c.live ? (
              <Link
                href={`/products/${c.slug}`}
                className={`flex items-center rounded-full px-3 py-1.5 text-sm text-[var(--text)] transition-colors hover:bg-[var(--hover)] ${focus}`}
              >
                {c.name}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                title="Coming soon"
                className="flex cursor-default items-center rounded-full px-3 py-1.5 text-sm text-[var(--dim)]"
              >
                {c.name}
              </span>
            )}
          </li>
        ))}
      </ul>

      {canRight && (
        <button
          type="button"
          aria-label="Scroll categories right"
          onClick={() => scrollByDir(1)}
          className={`${arrow} right-0`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ---------- Navbar ---------- */

export default function Navbar() {
  const cart = useCart();
  const favourites = useFavourites();

  // Counts come from localStorage, so only show them after hydration
  // to keep server and client markup identical on first render.
  const cartCount = cart.hydrated ? cart.count : 0;
  const favouritesCount = favourites.hydrated ? favourites.count : 0;

  const [menuOpen, setMenuOpen] = useState(false); // desktop mega menu
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile
  const wrapRef = useRef<HTMLElement>(null);

  const closeAll = () => {
    setMenuOpen(false);
    setDrawerOpen(false);
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setDrawerOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const drawerLink = `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] ${focus}`;

  return (
    <>
      {/* Promo banner (clickable) */}
      <Link
        href="/deals"
        className={`group flex items-center justify-center gap-2 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-orange-500 px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm ${focus}`}
      >
        <SAFlag />
        <span>
          Great deals <span aria-hidden="true">&nbsp;|&nbsp;</span> Cheap prices{" "}
          <span className="hidden sm:inline">
            <span aria-hidden="true">&nbsp;|&nbsp;</span> Proudly South African
          </span>
        </span>
        <span className="hidden underline-offset-2 group-hover:underline sm:inline">
          Shop now <span aria-hidden="true">&rarr;</span>
        </span>
        <SAFlag className="hidden h-4 w-6 sm:block" />
      </Link>

      <header
        ref={wrapRef}
        className="sticky top-0 z-50 w-full max-w-full border-b border-[var(--border)] bg-[var(--header)] backdrop-blur"
      >
        {/* Row 1: logo, search (desktop), actions */}
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6">
          <Link
            href="/"
            onClick={closeAll}
            aria-label="RCW Store home"
            className={`flex min-w-0 shrink-0 items-center gap-2.5 rounded-full ${focus}`}
          >
            <Image
              src="/logo.png"
              alt=""
              width={40}
              height={40}
              priority
              className="h-10 w-10 shrink-0 rounded-full border border-[var(--border-strong)] object-cover"
            />
            {/* Hidden on very small phones so the row cannot overflow */}
            <span className="hidden text-xl font-bold rcw-gradient-text min-[400px]:inline">
              RCW Store
            </span>
          </Link>

          <SearchBar
            onSearch={closeAll}
            className="hidden max-w-xl flex-1 md:block"
          />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Favourites, Orders and Account move into the menu on phones */}
            <IconLink
              href="/favourites"
              label="Favourites"
              count={favouritesCount}
              className="hidden sm:flex"
            >
              <Icon>
                <path d="M12 21s-7-4.35-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9z" />
              </Icon>
            </IconLink>
            <IconLink href="/orders" label="Orders" className="hidden sm:flex">
              <Icon>
                <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
                <path d="M3 8l9 5 9-5M12 13v8" />
              </Icon>
            </IconLink>
            <IconLink
              href="/account"
              label="Account"
              className="hidden sm:flex"
            >
              <Icon>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </Icon>
            </IconLink>
            <IconLink href="/cart" label="Cart" count={cartCount}>
              <Icon>
                <path d="M3 4h2l2.4 11h10.2L20 7H6" />
                <circle cx="9" cy="20" r="1.5" />
                <circle cx="17" cy="20" r="1.5" />
              </Icon>
            </IconLink>

            <ThemeToggle />
            <button
              type="button"
              className={`rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] md:hidden ${focus}`}
              aria-expanded={drawerOpen}
              aria-controls="mobile-categories"
              onClick={() => setDrawerOpen((o) => !o)}
            >
              {drawerOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Row 2 (mobile): search */}
        <div className="px-3 pb-3 md:hidden">
          <SearchBar onSearch={closeAll} />
        </div>

        {/* Row 2 (desktop): category links */}
        <div className="hidden border-t border-[var(--border)] md:block">
          <nav
            className="mx-auto flex h-11 w-full max-w-6xl items-center gap-1 px-6"
            aria-label="Main"
          >
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="category-menu"
              onClick={() => setMenuOpen((o) => !o)}
              className={`flex shrink-0 items-center gap-1.5 rounded px-2 py-1 text-sm font-medium text-[var(--text)] hover:text-fuchsia-500 ${focus}`}
            >
              All categories
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <span
              aria-hidden="true"
              className="mx-2 h-4 w-px shrink-0 bg-[var(--border)]"
            />

            <CategoryScroller />

            <Link
              href="/deals"
              className={`ml-2 shrink-0 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 px-3 py-1 text-xs font-bold text-white transition-transform hover:scale-105 ${focus}`}
            >
              Deals
            </Link>
            <Link
              href="/partner"
              className={`ml-2 shrink-0 rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-semibold text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
            >
              Sell with us
            </Link>
          </nav>
        </div>

        {/* Desktop mega menu */}
        {menuOpen && (
          <div
            id="category-menu"
            className="hidden border-t border-[var(--border)] bg-[var(--menu)] md:block"
          >
            <div className="mx-auto w-full max-w-6xl px-6 py-5">
              <CategoryList
                onNavigate={closeAll}
                columns="grid-cols-3 lg:grid-cols-4"
              />
            </div>
          </div>
        )}

        {/* Mobile drawer */}
        {drawerOpen && (
          <nav
            id="mobile-categories"
            aria-label="Menu"
            className="max-h-[65dvh] overflow-y-auto border-t border-[var(--border)] bg-[var(--menu)] px-3 py-3 md:hidden"
          >
            {/* Shown only below 640px, where the header icons are hidden */}
            <div className="mb-2 grid gap-1 border-b border-[var(--border)] pb-2 sm:hidden">
              <Link
                href="/favourites"
                onClick={closeAll}
                className={drawerLink}
              >
                <span>Favourites</span>
                {favouritesCount > 0 && (
                  <span className="rounded-full bg-[var(--hover)] px-2 py-0.5 text-xs text-[var(--muted)]">
                    {favouritesCount > 99 ? "99+" : favouritesCount}
                  </span>
                )}
              </Link>
              <Link href="/orders" onClick={closeAll} className={drawerLink}>
                Orders
              </Link>
              <Link href="/account" onClick={closeAll} className={drawerLink}>
                Account
              </Link>
            </div>

            <Link
              href="/partner"
              onClick={closeAll}
              className={`mb-2 ${drawerLink} font-semibold`}
            >
              Sell with us
            </Link>
            <CategoryList onNavigate={closeAll} columns="grid-cols-1" />
          </nav>
        )}
      </header>
    </>
  );
}
