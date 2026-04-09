import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(39,28,18,0.08)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
