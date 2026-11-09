export function Loading({ label = "正在加载" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex items-center justify-center py-16 text-muted">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
    </div>
  );
}
