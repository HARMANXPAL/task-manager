export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line w-70" />
      <div className="skeleton-line w-40 sk-sm" />
      <div className="skeleton-line w-90 sk-sm" />
      <div className="skeleton-line w-60 sk-sm" />
      <div className="skeleton-footer">
        <div className="skeleton-line w-30 sk-sm" />
        <div style={{ display:'flex', gap: 6 }}>
          <div className="skeleton-btn" />
          <div className="skeleton-btn" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="task-grid">
      {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
