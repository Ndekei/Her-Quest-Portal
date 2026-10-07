"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

/** Modal surface: a bottom sheet on phones, a side panel or popover on larger screens. */
export function Sheet({
  title,
  kind,
  onClose,
  children,
}: {
  title: string;
  kind: "panel" | "popover";
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    // On touch screens, don't focus a text field: it would throw up the keyboard over the sheet.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const first = ref.current?.querySelector<HTMLElement>(
      fine ? "input, [aria-current='true'], button:not([data-close])" : "[aria-current='true']",
    );
    (first ?? ref.current)?.focus({ preventScroll: true });
    if (first instanceof HTMLElement && first.getAttribute("aria-current") === "true") {
      first.scrollIntoView({ block: "center" });
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      // Keep keyboard focus inside the sheet while it is open.
      if (event.key === "Tab" && ref.current) {
        const focusable = ref.current.querySelectorAll<HTMLElement>("a[href], button:not(:disabled), input");
        const list = Array.from(focusable);
        if (!list.length) return;
        const [head, tail] = [list[0], list[list.length - 1]];
        if (event.shiftKey && document.activeElement === head) {
          event.preventDefault();
          tail.focus();
        } else if (!event.shiftKey && document.activeElement === tail) {
          event.preventDefault();
          head.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden />
      <div ref={ref} className="sheet" data-kind={kind} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <div className="sheet-grabber" aria-hidden />
        <div className="sheet-header">
          <h2>{title}</h2>
          <button type="button" className="icon-button" data-close onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
