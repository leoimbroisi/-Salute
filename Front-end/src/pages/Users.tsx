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
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      await new Promise(resolve => setTimeout(resolve, 500));
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao salvar alterações');
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    setError('');

    try {
      await api.delete(`/users/${userToDelete.id}`);

      setShowDeleteModal(false);
      setUserToDelete(null);

      await new Promise(resolve => setTimeout(resolve, 500));

      setRefreshTrigger(prev => prev + 1);

    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Erro ao excluir usuário');
      setShowDeleteModal(false);
      setUserToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <div className="card">
          <h1>Lista de Usuários</h1>
          {error && <div className="error">{error}</div>}
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando usuários...</p>
            </div>
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
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--neutral-500)' }}>
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
                        <span className={user.role === 'admin' ? 'badge badge-primary' : 'badge badge-neutral'}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="button button-sm" onClick={() => startEdit(user)}>
                            Editar
                          </button>
                          <button className="button button-danger button-sm" onClick={() => handleDeleteClick(user)}>
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {editingUser && (
            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--neutral-200)' }}>
              <h2 style={{ marginBottom: '16px' }}>Editar Usuário</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label className="label">Nome</label>
                  <input className="input" style={{ marginBottom: 0 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" style={{ marginBottom: 0 }} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select className="input" style={{ marginBottom: 0 }} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
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
                  <select className="input" style={{ marginBottom: 0 }} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="label">Nova Senha (opcional, mín. 6 caracteres)</label>
                  <input className="input" style={{ marginBottom: 0 }} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Deixe em branco para manter" />
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                <button className="button" onClick={saveEdit}>Salvar</button>
                <button className="button button-secondary" onClick={cancelEdit}>Cancelar</button>
              </div>
            </div>
          )}

          {/* Modal de Confirmação de Exclusão */}
          {showDeleteModal && userToDelete && (
            <div className="modal-overlay" onClick={handleCancelDelete}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Confirmar Exclusão</h2>
                  <button className="modal-close" onClick={handleCancelDelete}>
                    ×
                  </button>
                </div>

                <div className="modal-body">
                  <p style={{ color: 'var(--neutral-600)', marginBottom: '16px' }}>
                    Tem certeza que deseja excluir este usuário?
                  </p>

                  <div className="info-box info-box-danger">
                    <div><strong>Nome:</strong> {userToDelete.name}</div>
                    <div style={{ marginTop: '8px' }}>
                      <strong>Email:</strong> {userToDelete.email}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <strong>Estado:</strong> {userToDelete.state || 'DF'}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      <strong>Perfil:</strong> {userToDelete.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </div>
                  </div>

                  <p style={{ color: 'var(--danger-600)', marginTop: '16px', fontWeight: '500', fontSize: '14px' }}>
                    Esta ação não pode ser desfeita.
                  </p>
                </div>

                <div className="modal-footer">
                  <button
                    className="button button-secondary"
                    onClick={handleCancelDelete}
                    disabled={deleting}
                  >
                    Cancelar
                  </button>
                  <button
                    className="button button-danger"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Excluindo...' : 'Sim, Excluir'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Users;
