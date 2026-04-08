import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  tone = "blue"
}: {
  children: React.ReactNode;
  tone?: "blue" | "green" | "amber";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        tone === "blue" && "bg-accentSoft text-accent",
        tone === "green" && "bg-emerald-50 text-success",
        tone === "amber" && "bg-amber-50 text-warning"
      )}
    >
      {children}
    </span>
  );
}
