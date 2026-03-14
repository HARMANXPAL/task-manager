import { useEffect, useState } from 'react';
import { getActivity } from '../services/api';

const ACTION_META = {
  created:          { icon: '✨', color: 'var(--primary)' },
  updated:          { icon: '✏️', color: 'var(--muted)'   },
  deleted:          { icon: '🗑️', color: 'var(--danger)'  },
  status_changed:   { icon: '🔄', color: '#2563eb'        },
  priority_changed: { icon: '🎯', color: '#d97706'        }
};

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function ActivityLog({ visible }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    getActivity().then(({ data }) => {
      setActivities(data.data);
    }).finally(() => setLoading(false));
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="activity-panel">
      <h3 className="activity-title">📋 Recent Activity</h3>
      {loading ? (
        <div style={{ padding: '20px 0' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton-line w-90 sk-sm" style={{ marginBottom: 12 }} />)}
        </div>
      ) : activities.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '.875rem' }}>No activity yet.</p>
      ) : (
        <ul className="activity-list">
          {activities.map(a => {
            const meta = ACTION_META[a.action] || ACTION_META.updated;
            return (
              <li key={a._id} className="activity-item">
                <span className="activity-icon" style={{ color: meta.color }}>{meta.icon}</span>
                <div className="activity-body">
                  <span className="activity-task">{a.taskTitle}</span>
                  <span className="activity-action">{a.action.replace('_', ' ')}</span>
                  {a.detail && <span className="activity-detail">{a.detail}</span>}
                </div>
                <span className="activity-time">{timeAgo(a.createdAt)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
