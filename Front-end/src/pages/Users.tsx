import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import '../App.css';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  createdAt: string;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <div className="card">
          <h1>Lista de Usuários</h1>
          {error && <div className="error">{error}</div>}
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Data de Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: user.role === 'admin' ? '#007bff' : '#6c757d',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;

