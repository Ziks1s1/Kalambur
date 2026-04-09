"use client";

import Link from "next/link";
import { ArrowLeft, House } from "lucide-react";

export function TopBar({ title, backHref }: { title: string; backHref?: string }) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/70 bg-[#fbf5ed]/90 px-4 py-4 backdrop-blur">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link href={backHref} className="rounded-full border border-[#dccdbb] bg-white/80 p-2 text-slate-700">
            <ArrowLeft size={18} />
          </Link>
        ) : (
          <span className="h-9 w-9" />
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <Link href="/" className="rounded-full border border-[#dccdbb] bg-white/80 p-2 text-slate-700">
        <House size={18} />
      </Link>
    </div>
  );
}
