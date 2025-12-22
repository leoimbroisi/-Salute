import { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import DatePicker from '../components/DatePicker';
import '../App.css';

function ManualExam() {
  const [doctorCrm, setDoctorCrm] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examType, setExamType] = useState('');
  const [examData, setExamData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!doctorCrm || !examDate || !examType || !examData) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setLoading(true);

    try {
      await api.post('/exams/manual', {
        doctorCrm,
        examDate,
        examType,
        examData,
      });

      setSuccess('Exame cadastrado com sucesso!');
      setDoctorCrm('');
      setExamDate('');
      setExamType('');
      setExamData('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar exame');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <div className="card">
          <h1>Cadastro Manual de Exame</h1>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <label className="label">CRM do Médico *</label>
            <input
              type="text"
              className="input"
              value={doctorCrm}
              onChange={(e) => setDoctorCrm(e.target.value)}
              placeholder="Ex: CRM-123456"
              required
            />

            <label className="label">Data do Exame *</label>
            <DatePicker
              value={examDate}
              onChange={setExamDate}
              max={new Date().toISOString().split('T')[0]}
              required
              placeholder="Selecione a data do exame"
            />

            <label className="label">Tipo de Exame *</label>
            <input
              type="text"
              className="input"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              placeholder="Ex: Hemograma, Raio-X, Ultrassom, etc."
              required
            />

            <label className="label">Dados do Exame *</label>
            <textarea
              className="textarea"
              value={examData}
              onChange={(e) => setExamData(e.target.value)}
              placeholder="Digite os dados do exame aqui..."
              required
            />

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar Exame'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ManualExam;

