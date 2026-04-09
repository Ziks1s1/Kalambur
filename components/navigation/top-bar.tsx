"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, FolderPlus, House, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { useSessionUser } from "@/lib/auth/use-session-user";
import { cn } from "@/lib/utils/cn";

type TopBarProps = {
  title: string;
  backHref?: string;
};

export function TopBar({ title, backHref }: TopBarProps) {
  const pathname = usePathname();
  const { isAdmin } = useSessionUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const menuItems = [
    { href: "/", label: "Предметы", visible: true },
    { href: "/statistics", label: "Статистика", visible: true },
    { href: "/admin/tasks", label: "Добавить задание", visible: isAdmin }
  ].filter((item) => item.visible);

  return (
    <div className="sticky top-0 z-30 border-b border-white/70 bg-[rgba(251,245,237,0.94)] backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {backHref ? (
            <Link href={backHref} className="rounded-full border border-[#d8c2a3] bg-[#f4e2c7] p-2 text-[#2c251f] shadow-sm">
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <Link href="/" className="rounded-full border border-[#d8c2a3] bg-[#f4e2c7] p-2 text-[#2c251f] shadow-sm">
              <House size={18} />
            </Link>
          )}

          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#926842]">Kalambur EGE</p>
            <h1 className="text-base font-semibold text-[#1f2b3a]">{title}</h1>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={cn(
              "rounded-full border border-[#d8c2a3] p-2 text-[#2c251f] shadow-sm transition",
              open ? "bg-[#173533] text-[#fff8ef]" : "bg-[#f4e2c7]"
            )}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          {open ? (
            <div className="absolute right-0 top-14 w-56 rounded-[1.25rem] border border-[#e1d2bf] bg-[#fffaf4] p-3 shadow-[0_22px_40px_rgba(48,35,21,0.12)]">
              <div className="mb-2 px-2">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#9a6f46]">Быстрое меню</p>
              </div>

              <div className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition",
                      pathname === item.href ? "bg-[#173533] text-[#fff8ef]" : "bg-[#f7ede1] text-[#243041] hover:bg-[#efdfc8]"
                    )}
                  >
                    <span>{item.label}</span>
                    {item.href === "/statistics" ? <BarChart3 size={16} /> : null}
                    {item.href === "/admin/tasks" ? <FolderPlus size={16} /> : null}
                    {item.href === "/" ? <House size={16} /> : null}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
