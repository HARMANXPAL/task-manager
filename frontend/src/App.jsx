import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute    from './components/ProtectedRoute';
import PublicRoute       from './components/PublicRoute';
import Login             from './pages/Login';
import Register          from './pages/Register';
import Dashboard         from './pages/Dashboard';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
