'use client';

import type { InputHTMLAttributes, CSSProperties } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  width?: string | number;
  height?: string | number;
  className?: string;
  variant?: "light" | "dark";
  error?: boolean;
};

const variantBase: Record<NonNullable<InputProps["variant"]>, string> = {
  light: "w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 dark:bg-[#2A1F52] dark:border-silver/30 dark:text-white dark:placeholder:text-silver/50 dark:focus:border-gold/50 dark:focus:ring-gold/20",
  dark:  "w-full h-10 px-3 rounded-xl text-sm bg-background/5 border border-silver/20 text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/60 transition-colors",
};

function normalizeSize(value?: string | number) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function Input({
  width,
  height,
  variant = "light",
  className,
  style,
  error,
  ...props
}: InputProps) {
  const sizeStyle: CSSProperties = {
    width: normalizeSize(width),
    height: normalizeSize(height),
    ...style,
  };

  return (
    <input
      {...props}
      style={sizeStyle}
      className={[
        variantBase[variant],
        error ? "!border-red-500 focus:!border-red-500" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
