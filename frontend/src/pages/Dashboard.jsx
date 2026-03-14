import { useState, useEffect, useCallback } from 'react';
import { getTasks } from '../services/api';
import Navbar      from '../components/Navbar';
import TaskCard    from '../components/TaskCard';
import TaskModal   from '../components/TaskModal';
import Pagination  from '../components/Pagination';

const STATUS_FILTERS = [
  { value: '',            label: 'All' },
  { value: 'todo',        label: '📋 To Do' },
  { value: 'in-progress', label: '🔄 In Progress' },
  { value: 'done',        label: '✅ Done' }
];

const DEFAULT_PAGINATION = { page: 1, limit: 9, total: 0, totalPages: 0 };

export default function Dashboard() {
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  // Filters
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [page,    setPage]    = useState(1);

  // Modal
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 9 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status)          params.status = status;

      const { data } = await getTasks(params);
      setTasks(data.data);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load tasks. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Modal handlers ─────────────────────────────────────────────────────────
  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit   = (task) => { setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };

  const handleSaved = () => {
    closeModal();
    fetchTasks();
  };

  const handleDeleted = (id) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
    // If last task on current page > 1, go back one page
    if (tasks.length === 1 && page > 1) setPage((p) => p - 1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />

      <main className="dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Tasks</h1>
            <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginTop: 2 }}>
              {pagination.total} task{pagination.total !== 1 ? 's' : ''} total
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            ＋ New Task
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="input search-input"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tasks"
            />
          </div>

          <div className="filter-pills" role="group" aria-label="Filter by status">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`pill ${status === f.value ? 'active' : ''}`}
                onClick={() => setStatus(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Loading state */}
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : tasks.length === 0 ? (
          /* Empty state */
          <div className="empty">
            <div className="empty-icon">📭</div>
            <h3>No tasks found</h3>
            <p>
              {search || status
                ? 'Try adjusting your search or filter.'
                : 'Click "+ New Task" to get started!'}
            </p>
          </div>
        ) : (
          /* Task grid */
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={openEdit}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <Pagination
            pagination={pagination}
            onPageChange={setPage}
          />
        )}
      </main>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
