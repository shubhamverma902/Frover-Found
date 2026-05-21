'use client';

import type { FormHTMLAttributes } from "react";

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  className?: string;
};

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form {...props} className={["space-y-5", className].filter(Boolean).join(" ")}>
      {children}
    </form>
  );
}
