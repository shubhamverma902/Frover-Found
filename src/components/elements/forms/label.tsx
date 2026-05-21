'use client';

import type { LabelHTMLAttributes, HTMLAttributes } from "react";

const BASE = "block text-[10px] font-semibold text-[#DDDED9]/50 uppercase tracking-widest mb-1.5";

export type FieldLabelProps =
  | ({ as?: "label" } & LabelHTMLAttributes<HTMLLabelElement>)
  | ({ as: "p"     } & HTMLAttributes<HTMLParagraphElement>);

export function FieldLabel({ as: Tag = "label", className, children, ...props }: FieldLabelProps) {
  return (
    // @ts-expect-error — polymorphic element; props are correct at runtime
    <Tag {...props} className={[BASE, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
