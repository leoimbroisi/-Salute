import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Exams from './pages/Exams';
import UploadExam from './pages/UploadExam';
import ManualExam from './pages/ManualExam';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  if (!token) {
    return <Navigate to="/login" />;
  }
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
          <Route
            path="/exams"
            element={
              <PrivateRoute>
                <Exams />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload-exam"
            element={
              <PrivateRoute>
                <UploadExam />
              </PrivateRoute>
            }
          />
          <Route
            path="/manual-exam"
            element={
              <PrivateRoute>
                <ManualExam />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

