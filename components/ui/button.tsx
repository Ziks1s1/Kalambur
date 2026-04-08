"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
};

export function Button({ className, variant = "primary", fullWidth, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-accent text-white shadow-card",
        variant === "secondary" && "bg-white text-ink shadow-card",
        variant === "ghost" && "bg-transparent text-ink",
        variant === "danger" && "bg-danger text-white shadow-card",
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
