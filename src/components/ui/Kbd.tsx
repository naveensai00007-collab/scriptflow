export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono font-medium text-text-muted bg-surface-2 border border-border rounded shadow-sm">
      {children}
    </kbd>
  );
}