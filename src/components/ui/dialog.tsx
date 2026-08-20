"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Accessible modal using the native `<dialog>` element (focus trap + Escape).
 * No extra CSS files — Tailwind only.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) {
        node.showModal();
      }
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
      className={cn(
        "z-[70] m-auto max-h-[min(90dvh,800px)] w-[min(100%-1.5rem,42rem)] overflow-y-auto rounded-xl border border-border bg-white p-0 text-foreground shadow-registry backdrop:bg-[#1D1D1F]/70 open:fixed open:inset-0",
        className,
      )}
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-white px-5 py-4">
        <div className="min-w-0">
          <h2
            id={titleId}
            className="text-base font-semibold tracking-tight text-foreground"
          >
            {title}
          </h2>
          {description ? (
            <p
              id={descriptionId}
              className="mt-1 text-sm text-muted-foreground"
            >
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close dialog"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
