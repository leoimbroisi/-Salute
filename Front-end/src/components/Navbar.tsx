import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import '../App.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div>
          <Link 
            to="/dashboard" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              color: 'white'
            }}
          >
            <Logo size="medium" showText={true} />
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          {user?.role === 'admin' && (
            <Link to="/users" className="navbar-link">
              Usuários
            </Link>
          )}
          <Link to="/exams" className="navbar-link">
            Exames
          </Link>
          <Link to="/upload-exam" className="navbar-link">
            Upload PDF
          </Link>
          <Link to="/manual-exam" className="navbar-link">
            Cadastro Manual
          </Link>
          <span className="navbar-link" style={{ cursor: 'pointer' }} onClick={handleLogout}>
            Sair ({user?.name})
          </span>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

