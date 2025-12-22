import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import '../App.css';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Logo size="large" showText={true} />
          </div>
          <h1 style={{ textAlign: 'center' }}>Bem-vindo, {user?.name}!</h1>
          <p style={{ marginTop: '16px', color: '#666', textAlign: 'center' }}>
            Sistema de Gestão de Dados de Saúde
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {user?.role === 'admin' && (
            <div className="card">
              <h2 style={{ marginBottom: '16px' }}>Usuários</h2>
              <p style={{ marginBottom: '16px', color: '#666' }}>
                Visualize e gerencie todos os usuários do sistema
              </p>
              <Link to="/users" className="button">
                Ver Usuários
              </Link>
            </div>
          )}

          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>Meus Exames</h2>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Visualize e filtre todos os seus exames cadastrados
            </p>
            <Link to="/exams" className="button">
              Ver Exames
            </Link>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>Upload de PDF</h2>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Envie um PDF de exame para extração automática de dados
            </p>
            <Link to="/upload-exam" className="button">
              Enviar PDF
            </Link>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '16px' }}>Cadastro Manual</h2>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Cadastre dados de exame manualmente
            </p>
            <Link to="/manual-exam" className="button">
              Cadastrar Exame
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

