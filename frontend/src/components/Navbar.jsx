import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); } catch { setLoggingOut(false); }
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">✅ TaskFlow</span>

      <div className="navbar-user">
        <span>👤 {user?.name}</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
      </div>
    </nav>
  );
}
