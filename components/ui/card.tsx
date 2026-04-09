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
        "rounded-[1.5rem] border border-white/80 bg-[rgba(255,250,244,0.92)] p-5 shadow-[0_18px_45px_rgba(62,43,24,0.08)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}
