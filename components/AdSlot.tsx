export function AdSlot({ label = 'Advertisement' }: { label?: string }) {
  return (
    <aside className="mx-auto flex min-h-24 max-w-4xl items-center justify-center border-y border-border-default px-4 py-5 text-center" aria-label={label}>
      <div className="text-xs text-text-muted">
        <span className="block uppercase tracking-[0.18em]">{label}</span>
        <span className="mt-1 block">Useful tools stay free because of carefully placed advertising.</span>
      </div>
    </aside>
  );
}
