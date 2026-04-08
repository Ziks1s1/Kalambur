import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("rounded-4xl border border-white/80 bg-white/90 p-5 shadow-card", className)}>{children}</div>;
}
