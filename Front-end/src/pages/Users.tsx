import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import '../App.css';

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  state?: string;
  createdAt: string;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; state: string; role: string; password: string }>({
    name: '',
    email: '',
    state: 'DF',
    role: 'user',
    password: '',
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

  // Recarregar lista quando solicitado (padrão usado em Exames)
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const startEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      state: user.state || 'DF',
      role: user.role || 'user',
      password: '',
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', state: 'DF', role: 'user', password: '' });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      setError('');
      const payload: any = {
        name: form.name,
        email: form.email,
        state: form.state,
        role: form.role,
      };
      if (form.password && form.password.length >= 6) {
        payload.password = form.password;
      }
      await api.put(`/users/${editingUser.id}`, payload);
      cancelEdit();
      // Pequeno atraso para o backend aplicar a atualização (consistência)
      await new Promise(resolve => setTimeout(resolve, 500));
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao salvar alterações');
    }
  };

  const deleteUser = async (user: User) => {
    const ok = window.confirm('vc tem certeza?');
    if (!ok) return;
    try {
      setError('');
      await api.delete(`/users/${user.id}`);
      // Pequeno atraso para o backend processar a exclusão
      await new Promise(resolve => setTimeout(resolve, 500));
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao excluir usuário');
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
                  <th>Estado</th>
                  <th>Perfil</th>
                  <th>Data de Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.state || 'DF'}</td>
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
                      <td>
                        <button className="button" style={{ marginRight: '8px' }} onClick={() => startEdit(user)}>Editar</button>
                        <button className="button" style={{ backgroundColor: '#dc3545' }} onClick={() => deleteUser(user)}>Excluir</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
          {editingUser && (
            <div style={{ marginTop: '20px' }}>
              <h2>Editar Usuário</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="label">Nome</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                    <option value="AC">Acre (AC)</option>
                    <option value="AL">Alagoas (AL)</option>
                    <option value="AP">Amapá (AP)</option>
                    <option value="AM">Amazonas (AM)</option>
                    <option value="BA">Bahia (BA)</option>
                    <option value="CE">Ceará (CE)</option>
                    <option value="DF">Distrito Federal (DF)</option>
                    <option value="ES">Espírito Santo (ES)</option>
                    <option value="GO">Goiás (GO)</option>
                    <option value="MA">Maranhão (MA)</option>
                    <option value="MT">Mato Grosso (MT)</option>
                    <option value="MS">Mato Grosso do Sul (MS)</option>
                    <option value="MG">Minas Gerais (MG)</option>
                    <option value="PA">Pará (PA)</option>
                    <option value="PB">Paraíba (PB)</option>
                    <option value="PR">Paraná (PR)</option>
                    <option value="PE">Pernambuco (PE)</option>
                    <option value="PI">Piauí (PI)</option>
                    <option value="RJ">Rio de Janeiro (RJ)</option>
                    <option value="RN">Rio Grande do Norte (RN)</option>
                    <option value="RS">Rio Grande do Sul (RS)</option>
                    <option value="RO">Rondônia (RO)</option>
                    <option value="RR">Roraima (RR)</option>
                    <option value="SC">Santa Catarina (SC)</option>
                    <option value="SP">São Paulo (SP)</option>
                    <option value="SE">Sergipe (SE)</option>
                    <option value="TO">Tocantins (TO)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Perfil</label>
                  <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="label">Senha (opcional, min 6)</label>
                  <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <button className="button" style={{ marginRight: '8px' }} onClick={saveEdit}>Salvar</button>
                <button className="button" style={{ backgroundColor: '#6c757d' }} onClick={cancelEdit}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;

