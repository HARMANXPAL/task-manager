import { useState, useEffect, useCallback, useRef } from 'react';
import { getTasks, updateTask, getStats } from '../services/api';
import Navbar     from '../components/Navbar';
import TaskCard   from '../components/TaskCard';
import TaskModal  from '../components/TaskModal';
import Pagination from '../components/Pagination';
import StatsBar   from '../components/StatsBar';

const STATUS_FILTERS = [
  { value: '',            label: 'All' },
  { value: 'todo',        label: '📋 To Do' },
  { value: 'in-progress', label: '🔄 In Progress' },
  { value: 'done',        label: '✅ Done' }
];

const PRIORITY_FILTERS = [
  { value: '',       label: 'All' },
  { value: 'high',   label: '🔴 High' },
  { value: 'medium', label: '🟡 Med' },
  { value: 'low',    label: '🟢 Low' }
];

// Kanban columns for drag & drop
const COLUMNS = [
  { id: 'todo',        label: '📋 To Do' },
  { id: 'in-progress', label: '🔄 In Progress' },
  { id: 'done',        label: '✅ Done' }
];

export default function Dashboard() {
  const [tasks,       setTasks]       = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [pagination,  setPagination]  = useState({ page: 1, limit: 9, total: 0, totalPages: 0 });
  const [search,      setSearch]      = useState('');
  const [status,      setStatus]      = useState('');
  const [priority,    setPriority]    = useState('');
  const [page,        setPage]        = useState(1);
  const [view,        setView]        = useState('grid'); // 'grid' | 'kanban'
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const dragTask = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, status, priority]);

  const fetchStats = useCallback(async () => {
    try { const { data } = await getStats(); setStats(data.data); } catch {}
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page, limit: 9 };
      if (debouncedSearch) params.search   = debouncedSearch;
      if (status)          params.status   = status;
      if (priority)        params.priority = priority;
      const { data } = await getTasks(params);
      setTasks(data.data);
      setPagination(data.pagination);
    } catch { setError('Failed to load tasks.'); }
    finally { setLoading(false); }
  }, [page, debouncedSearch, status, priority]);

  useEffect(() => { fetchTasks(); fetchStats(); }, [fetchTasks, fetchStats]);

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit   = (task) => { setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };
  const handleSaved = () => { closeModal(); fetchTasks(); fetchStats(); };
  const handleDeleted = (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));
    fetchStats();
    if (tasks.length === 1 && page > 1) setPage(p => p - 1);
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragStart = (e, task) => {
    dragTask.current = task;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOver(colId);
  };
  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOver(null);
    const task = dragTask.current;
    if (!task || task.status === newStatus) return;
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));
    try { await updateTask(task._id, { status: newStatus }); fetchStats(); }
    catch { fetchTasks(); } // revert on error
    dragTask.current = null;
  };

  // ── Kanban grouped tasks ────────────────────────────────────────────────────
  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  return (
    <>
      <Navbar />
      <main className="dashboard">
        {/* Stats */}
        <StatsBar stats={stats} />

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Tasks</h1>
            <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginTop: 2 }}>
              {pagination.total} task{pagination.total !== 1 ? 's' : ''} total
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="view-toggle">
              <button className={`view-btn ${view === 'grid'   ? 'active' : ''}`} onClick={() => setView('grid')}>⊞ Grid</button>
              <button className={`view-btn ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>⧉ Kanban</button>
            </div>
            <button className="btn btn-primary" onClick={openCreate}>＋ New Task</button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="input search-input" placeholder="Search by title…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-pills">
            {STATUS_FILTERS.map(f => (
              <button key={f.value} className={`pill ${status === f.value ? 'active' : ''}`} onClick={() => setStatus(f.value)}>{f.label}</button>
            ))}
          </div>
          <div className="filter-pills">
            {PRIORITY_FILTERS.map(f => (
              <button key={f.value} className={`pill ${priority === f.value ? 'active' : ''}`} onClick={() => setPriority(f.value)}>{f.label}</button>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <h3>No tasks found</h3>
            <p>{search || status || priority ? 'Try adjusting your filters.' : 'Click "+ New Task" to get started!'}</p>
          </div>
        ) : view === 'grid' ? (
          <>
            <div className="task-grid">
              {tasks.map(task => (
                <TaskCard key={task._id} task={task} onEdit={openEdit} onDeleted={handleDeleted} onDragStart={handleDragStart} />
              ))}
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        ) : (
          // Kanban view
          <div className="kanban-board">
            {COLUMNS.map(col => (
              <div
                key={col.id}
                className={`kanban-col ${dragOver === col.id ? 'drag-over' : ''}`}
                onDragOver={e => handleDragOver(e, col.id)}
                onDrop={e => handleDrop(e, col.id)}
                onDragLeave={() => setDragOver(null)}
              >
                <div className="kanban-col-header">
                  <span>{col.label}</span>
                  <span className="kanban-count">{tasksByStatus[col.id]?.length || 0}</span>
                </div>
                <div className="kanban-cards">
                  {tasksByStatus[col.id]?.length === 0 ? (
                    <div className="kanban-empty">Drop tasks here</div>
                  ) : (
                    tasksByStatus[col.id].map(task => (
                      <TaskCard key={task._id} task={task} onEdit={openEdit} onDeleted={handleDeleted} onDragStart={handleDragStart} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && <TaskModal task={editingTask} onClose={closeModal} onSaved={handleSaved} />}
    </>
  );
}
