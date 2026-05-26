'use client';

import type { ButtonHTMLAttributes, CSSProperties } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  width?: string | number;
  height?: string | number;
  variant?: "primary" | "secondary" | "ghost" | "cancel" | "gold" | "close" | "save" | "gold-cta" | "danger" | "cancel-sm" | "outline" | "outline-blush";
};

// Light-theme variants share a common base (rounded, padded, full-size text)
const LIGHT_BASE = "inline-flex items-center justify-center px-4 py-3 text-sm font-semibold transition active:scale-95";

const lightVariants: Partial<Record<NonNullable<ButtonProps["variant"]>, string>> = {
  primary:   "rounded-2xl bg-blush text-white hover:bg-blush/90 shadow-sm shadow-blush/20",
  secondary: "rounded-2xl border border-silver bg-white text-dark hover:border-blush hover:bg-silver/20",
  ghost:     "rounded-2xl bg-transparent text-dark hover:bg-silver/30",
};

// Modal-theme variants are standalone (no shared base — different sizing/typography)
const modalVariants: Partial<Record<NonNullable<ButtonProps["variant"]>, string>> = {
  cancel:         "flex-1 py-2.5 text-xs font-semibold rounded-xl border border-silver/20 text-silver/50 hover:border-silver/40 hover:text-dark dark:hover:text-white transition-colors",
  gold:           "flex-1 py-2.5 text-xs font-bold rounded-xl bg-gold text-dark hover:bg-gold/90 hover:shadow-[0_4px_14px_rgba(205,180,219,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
  close:          "w-8 h-8 flex items-center justify-center rounded-xl text-silver/40 hover:text-dark dark:hover:text-white hover:bg-silver/10 transition-colors text-lg",
  save:           "px-6 py-2.5 text-xs font-semibold rounded-xl bg-blush dark:bg-dark text-white dark:text-gold hover:bg-blush/90 dark:hover:bg-dark/85 transition-all duration-200 hover:shadow-[0_4px_14px_rgba(94,84,142,0.35)] disabled:opacity-50 disabled:cursor-not-allowed",
  "gold-cta":     "px-6 py-2.5 text-xs font-semibold rounded-xl bg-gold text-dark hover:bg-gold/90 hover:shadow-[0_4px_14px_rgba(205,180,219,0.4)] transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none",
  danger:         "px-3 py-1.5 text-[11px] font-bold rounded-xl bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60",
  "cancel-sm":    "px-3 py-1.5 text-[11px] font-semibold rounded-xl border border-silver/20 text-silver/50 hover:text-dark dark:hover:text-white transition-colors",
  outline:        "px-5 py-2.5 text-xs font-semibold rounded-xl border border-silver dark:border-[#3D3268] text-zinc-500 dark:text-silver/60 hover:border-blush hover:text-dark dark:hover:text-white transition-all",
  "outline-blush":"px-5 py-2.5 text-xs font-semibold rounded-xl border border-blush/40 text-blush hover:bg-blush/8 hover:border-blush transition-all",
};

function normalizeSize(value?: string | number) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function Button({
  width,
  height,
  variant = "primary",
  className,
  style,
  children,
  ...props
}: ButtonProps) {
  const sizeStyle: CSSProperties = {
    width: normalizeSize(width),
    height: normalizeSize(height),
    ...style,
  };

  // Close buttons contain only a symbol (✕) — provide a default accessible label
  // so every modal dismiss button is usable by screen-reader / keyboard-only users
  // without requiring every call site to remember aria-label.
  if (variant === 'close' && !props['aria-label']) {
    props = { ...props, 'aria-label': 'Close' };
  }

  const isModal   = variant in modalVariants;
  const baseClass = isModal ? modalVariants[variant] : `${LIGHT_BASE} ${lightVariants[variant] ?? ""}`;

  return (
    <button
      {...props}
      style={sizeStyle}
      className={[baseClass, className].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}