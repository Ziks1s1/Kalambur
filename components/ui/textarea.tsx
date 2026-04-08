import { cn } from "@/lib/utils/cn";

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-accent", className)} {...props} />;
}
