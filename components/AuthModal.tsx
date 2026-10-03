"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import AuthPanel from "@/components/AuthPanel";

type Mode = "sign-in" | "sign-up";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focus =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/70";

export default function AuthModal({
  open,
  mode,
  onModeChange,
  onClose,
}: {
  open: boolean;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close whenever the route changes.
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // While open: lock page scroll, move focus in, trap Tab, close on Escape.
  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first =
      panelRef.current?.querySelector<HTMLElement>("input") ?? closeRef.current;
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const nodes = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current.contains(active);

      if (e.shiftKey && (active === firstNode || !inside)) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && (active === lastNode || !inside)) {
        e.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
          >
            <div
              aria-hidden="true"
              onClick={onClose}
              className="absolute inset-0 bg-black/60"
            />

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--menu)] p-6 shadow-2xl sm:rounded-2xl sm:p-8"
            >
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500"
              />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={`absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-[var(--text)] hover:bg-[var(--hover)] ${focus}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>

              <AuthPanel
                mode={mode}
                onSwitch={onModeChange}
                onDone={() => {
                  onClose();
                  router.refresh();
                }}
                onSkip={onClose}
                onNavigate={onClose}
                headingId="auth-modal-title"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}