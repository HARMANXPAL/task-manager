import { useState, useEffect } from 'react';
import { createTask, updateTask } from '../services/api';

const STATUS_OPTIONS = [
  { value: 'todo',        label: '📋 To Do' },
  { value: 'in-progress', label: '🔄 In Progress' },
  { value: 'done',        label: '✅ Done' }
];

const EMPTY_FORM = { title: '', description: '', status: 'todo' };

export default function TaskModal({ task, onClose, onSaved }) {
  const isEdit = Boolean(task);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       || '',
        description: task.description || '',
        status:      task.status      || 'todo'
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [task]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await updateTask(task._id, form);
      } else {
        await createTask(form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 className="modal-title" id="modal-title">
          {isEdit ? '✏️ Edit Task' : '➕ New Task'}
        </h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              className="input"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="input"
              placeholder="Add details… (stored encrypted)"
              value={form.description}
              onChange={handleChange}
              rows={3}
              maxLength={1000}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              className="input"
              value={form.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
