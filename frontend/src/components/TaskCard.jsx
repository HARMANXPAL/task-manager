import { useState } from 'react';
import confetti from 'canvas-confetti';
import { deleteTask, updateTask } from '../services/api';

const STATUS_META = {
  'todo':        { label: 'To Do',       cls: 'badge-todo' },
  'in-progress': { label: 'In Progress', cls: 'badge-wip'  },
  'done':        { label: 'Done',        cls: 'badge-done' }
};
const PRIORITY_META = {
  low:    { label: '🟢 Low',    cls: 'priority-low'    },
  medium: { label: '🟡 Medium', cls: 'priority-medium' },
  high:   { label: '🔴 High',   cls: 'priority-high'   }
};

const fireConfetti = () => {
  confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#4f46e5','#22c55e','#f59e0b','#ec4899'] });
};

export default function TaskCard({ task, onEdit, onDeleted, onDragStart, onUpdated }) {
  const [deleting, setDeleting] = useState(false);
  const meta     = STATUS_META[task.status]    || STATUS_META['todo'];
  const priority = PRIORITY_META[task.priority] || PRIORITY_META['medium'];

  const now = new Date();
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = due && due < now && task.status !== 'done';
  const isDueSoon = due && !isOverdue && (due - now) < 48 * 60 * 60 * 1000;
  const dueDateStr = due ? due.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : null;
  const createdStr = new Date(task.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' });

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(true);
    try { await deleteTask(task._id); onDeleted(task._id); }
    catch { setDeleting(false); }
  };

  const handleMarkDone = async () => {
    if (task.status === 'done') return;
    try {
      await updateTask(task._id, { status: 'done' });
      fireConfetti();
      onUpdated && onUpdated();
    } catch {}
  };

  return (
    <article
      className={`task-card ${isOverdue ? 'task-overdue' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    >
      <div className={`priority-stripe priority-${task.priority || 'medium'}`} />

      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`badge ${meta.cls}`}>{meta.label}</span>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta-row">
        <span className={`priority-chip priority-${task.priority || 'medium'}`}>{priority.label}</span>
        {dueDateStr && (
          <span className={`due-chip ${isOverdue ? 'due-overdue' : isDueSoon ? 'due-soon' : ''}`}>
            {isOverdue ? '⚠️ Overdue' : isDueSoon ? '⏰ Due soon' : '📅'} {dueDateStr}
          </span>
        )}
      </div>

      <div className="task-footer">
        <span className="task-date">Created {createdStr}</span>
        <div className="task-actions">
          {task.status !== 'done' && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkDone} title="Mark as done">✅</button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>✏️</button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? '…' : '🗑️'}
          </button>
        </div>
      </div>
    </article>
  );
}
