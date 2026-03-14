import { useState } from 'react';
import { deleteTask } from '../services/api';

const STATUS_META = {
  'todo':        { label: 'To Do',       cls: 'badge-todo' },
  'in-progress': { label: 'In Progress', cls: 'badge-wip'  },
  'done':        { label: 'Done',        cls: 'badge-done' }
};

export default function TaskCard({ task, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const meta = STATUS_META[task.status] || STATUS_META['todo'];

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await deleteTask(task._id);
      onDeleted(task._id);
    } catch {
      setDeleting(false);
    }
  };

  const dateStr = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <article className="task-card">
      <div className="task-card-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`badge ${meta.cls}`}>{meta.label}</span>
      </div>

      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      <div className="task-footer">
        <span className="task-date">📅 {dateStr}</span>
        <div className="task-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(task)}
            title="Edit task"
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
            title="Delete task"
          >
            {deleting ? '…' : '🗑️'}
          </button>
        </div>
      </div>
    </article>
  );
}
