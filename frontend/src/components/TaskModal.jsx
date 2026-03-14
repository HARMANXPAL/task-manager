import { useState, useEffect } from 'react';
import { createTask, updateTask } from '../services/api';

const STATUS_OPTIONS = [
  { value: 'todo',        label: '📋 To Do' },
  { value: 'in-progress', label: '🔄 In Progress' },
  { value: 'done',        label: '✅ Done' }
];

const PRIORITY_OPTIONS = [
  { value: 'low',    label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high',   label: '🔴 High' }
];

const EMPTY_FORM = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

export default function TaskModal({ task, onClose, onSaved }) {
  const isEdit = Boolean(task);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       || '',
        description: task.description || '',
        status:      task.status      || 'todo',
        priority:    task.priority    || 'medium',
        dueDate:     task.dueDate ? task.dueDate.substring(0, 10) : ''
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [task]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || null };
      if (isEdit) { await updateTask(task._id, payload); }
      else        { await createTask(payload); }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <h2 className="modal-title">{isEdit ? '✏️ Edit Task' : '➕ New Task'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input name="title" className="input" placeholder="What needs to be done?" value={form.title} onChange={handleChange} maxLength={100} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="input" placeholder="Add details… (stored encrypted)" value={form.description} onChange={handleChange} rows={3} maxLength={1000} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="input" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select name="priority" className="input" value={form.priority} onChange={handleChange}>
                {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input name="dueDate" type="date" className="input" value={form.dueDate} onChange={handleChange} min={new Date().toISOString().substring(0, 10)} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
