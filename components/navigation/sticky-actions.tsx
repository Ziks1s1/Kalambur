export function StickyActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 border-t border-white/60 bg-[#fbf5ed]/92 px-4 py-3 backdrop-blur">
      {children}
    </div>
  );
}
