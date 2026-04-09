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
          "bg-[#173533] text-[#fff9f1] shadow-[0_14px_30px_rgba(23,53,51,0.22)] hover:bg-[#112927] disabled:bg-[#d8cab8] disabled:text-[#4f4338] disabled:shadow-none",
        variant === "secondary" &&
          "border border-[#cdb493] bg-[#ecd9bb] text-[#2f2822] hover:bg-[#e4ccaa] disabled:border-[#d4c1a8] disabled:bg-[#efe4d4] disabled:text-[#5f5143]",
        variant === "ghost" && "bg-transparent text-[#1c2838] hover:bg-white/60 disabled:bg-transparent disabled:text-[#7c6e60]",
        variant === "danger" &&
          "bg-danger text-white shadow-[0_12px_30px_rgba(209,67,67,0.18)] hover:bg-[#b93a3a] disabled:bg-[#e7bebe] disabled:text-[#fff6f6] disabled:shadow-none",
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
