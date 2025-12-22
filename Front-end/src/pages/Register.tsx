import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Logo from '../components/Logo';
import '../App.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', { name, email, password });
      setSuccess('Conta criada com sucesso! Redirecionando...');
      login(response.data.token, response.data.user);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao criar conta');
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
          <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>Cadastro</h1>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <label className="label">Nome</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              minLength={6}
            />
            <button type="submit" className="button" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
          <p style={{ marginTop: '16px', textAlign: 'center' }}>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

