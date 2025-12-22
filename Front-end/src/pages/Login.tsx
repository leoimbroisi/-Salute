import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/Logo';
import '../App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <Logo size="large" showText={true} />
        </div>
        <div className="card">
          <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>Login</h1>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="label">Senha</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="button" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p style={{ marginTop: '16px', textAlign: 'center' }}>
            Não tem uma conta? <Link to="/register">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

