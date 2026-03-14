export default function StatsBar({ stats }) {
  if (!stats) return null;
  const { total, byStatus, byPriority, overdue } = stats;
  const donePercent = total > 0 ? Math.round((byStatus.done / total) * 100) : 0;

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-number">{total}</div>
        <div className="stat-label">Total Tasks</div>
      </div>
      <div className="stat-card">
        <div className="stat-number" style={{ color: 'var(--primary)' }}>{byStatus['in-progress']}</div>
        <div className="stat-label">In Progress</div>
      </div>
      <div className="stat-card">
        <div className="stat-number" style={{ color: 'var(--done-fg)' }}>{byStatus.done}</div>
        <div className="stat-label">Completed</div>
        <div className="stat-bar-wrap">
          <div className="stat-bar-fill" style={{ width: `${donePercent}%` }} />
        </div>
        <div className="stat-pct">{donePercent}%</div>
      </div>
      <div className="stat-card">
        <div className="stat-number" style={{ color: overdue > 0 ? 'var(--danger)' : 'var(--muted)' }}>{overdue}</div>
        <div className="stat-label">Overdue</div>
      </div>
      <div className="stat-card">
        <div className="priority-mini-bars">
          <div className="priority-mini">
            <span className="priority-dot high" />
            <span>High</span>
            <strong>{byPriority.high}</strong>
          </div>
          <div className="priority-mini">
            <span className="priority-dot medium" />
            <span>Med</span>
            <strong>{byPriority.medium}</strong>
          </div>
          <div className="priority-mini">
            <span className="priority-dot low" />
            <span>Low</span>
            <strong>{byPriority.low}</strong>
          </div>
        </div>
        <div className="stat-label">By Priority</div>
      </div>
    </div>
  );
}
