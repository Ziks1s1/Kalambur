import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-accent", className)} {...props} />;
}
