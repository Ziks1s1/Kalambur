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
        "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-100",
        variant === "primary" &&
          "bg-ink text-white shadow-[0_12px_30px_rgba(24,33,47,0.18)] hover:bg-[#0f1726] disabled:bg-[#e6d9c8] disabled:text-[#6c5a49] disabled:shadow-none",
        variant === "secondary" &&
          "border border-[#d8c9b7] bg-[#f8f2ea] text-ink hover:bg-[#f3eadf] disabled:border-[#d8c9b7] disabled:bg-[#f3eadf] disabled:text-[#6c5a49]",
        variant === "ghost" && "bg-transparent text-ink hover:bg-white/60 disabled:bg-transparent disabled:text-[#7c6e60]",
        variant === "danger" &&
          "bg-danger text-white shadow-[0_12px_30px_rgba(209,67,67,0.18)] disabled:bg-[#e7bebe] disabled:text-white disabled:shadow-none",
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
