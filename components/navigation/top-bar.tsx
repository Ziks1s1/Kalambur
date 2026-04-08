"use client";

import Link from "next/link";
import { ArrowLeft, House } from "lucide-react";

export function TopBar({ title, backHref }: { title: string; backHref?: string }) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between rounded-b-3xl bg-white/90 px-4 py-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link href={backHref} className="rounded-full bg-slate-100 p-2 text-slate-700">
            <ArrowLeft size={18} />
          </Link>
        ) : (
          <span className="h-9 w-9" />
        )}
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <Link href="/" className="rounded-full bg-slate-100 p-2 text-slate-700">
        <House size={18} />
      </Link>
    </div>
  );
}
