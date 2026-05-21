'use client';

import type { InputHTMLAttributes, CSSProperties } from "react";

export type RadioProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
};

function normalizeSize(value?: string | number) {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function Radio({
  label,
  width,
  height,
  className,
  style,
  ...props
}: RadioProps) {
  const sizeStyle: CSSProperties = {
    width: normalizeSize(width),
    height: normalizeSize(height),
    ...style,
  };

  return (
    <label className={["inline-flex items-center gap-2 text-sm text-slate-800", className].filter(Boolean).join(" ")}>
      <input
        type="radio"
        {...props}
        style={sizeStyle}
        className="h-4 w-4 rounded-full border-slate-300 text-slate-950 focus:ring-slate-900"
      />
      {label ? <span>{label}</span> : null}
    </label>
  );
}
