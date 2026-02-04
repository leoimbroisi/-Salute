import { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import DatePicker from '../components/DatePicker';
import '../App.css';

function UploadExam() {
  const [file, setFile] = useState<File | null>(null);
  const [doctorCrm, setDoctorCrm] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examType, setExamType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setExtractedText('');

    if (!file) {
      setError('Por favor, selecione um arquivo PDF');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Por favor, selecione um arquivo PDF válido');
      return;
    }

    if (!examType || examType.trim() === '') {
      setError('Tipo de exame é obrigatório');
      return;
    }

    if (!examDate || examDate.trim() === '') {
      setError('Data do exame é obrigatória');
      return;
    }

    setLoading(true);

    try {
      const pdfBase64 = await convertFileToBase64(file);
      const response = await api.post('/exams/upload', {
        pdfBase64,
        doctorCrm,
        examDate,
        examType,
      });

      setSuccess('PDF enviado e processado com sucesso!');
      setExtractedText(response.data.extractedText);
      setFile(null);
      setDoctorCrm('');
      setExamDate('');
      setExamType('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao processar PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <div className="container">
        <div className="card">
          <h1>Upload de PDF de Exame</h1>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <label className="label">Arquivo PDF *</label>
            <div
              style={{
                border: '2px dashed var(--neutral-300)',
                borderRadius: 'var(--radius-md)',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: file ? 'var(--primary-50)' : 'var(--neutral-50)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                marginBottom: '16px',
                position: 'relative',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--primary-500)';
                e.currentTarget.style.backgroundColor = 'var(--primary-50)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--neutral-300)';
                e.currentTarget.style.backgroundColor = file ? 'var(--primary-50)' : 'var(--neutral-50)';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--neutral-300)';
                e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  if (e.dataTransfer.files[0].type === 'application/pdf') {
                    setFile(e.dataTransfer.files[0]);
                  } else {
                    setError('Por favor, selecione um arquivo PDF válido');
                  }
                }
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {file ? (
                <div>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--primary-600)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginBottom: '12px' }}
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <div style={{ fontWeight: '500', color: 'var(--primary-700)', marginBottom: '8px' }}>
                    {file.name}
                  </div>
                  <div style={{ color: 'var(--neutral-500)', fontSize: '14px' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div style={{ color: 'var(--neutral-400)', fontSize: '12px', marginTop: '8px' }}>
                    Clique para selecionar outro arquivo
                  </div>
                </div>
              ) : (
                <div>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--neutral-400)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginBottom: '12px' }}
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <div style={{ fontWeight: '500', color: 'var(--neutral-700)', marginBottom: '8px' }}>
                    Clique para selecionar ou arraste um arquivo PDF
                  </div>
                  <div style={{ color: 'var(--neutral-500)', fontSize: '14px' }}>
                    Apenas arquivos PDF são aceitos
                  </div>
                </div>
              )}
            </div>

            <label className="label">CRM do Médico (opcional)</label>
            <input
              type="text"
              className="input"
              value={doctorCrm}
              onChange={(e) => setDoctorCrm(e.target.value)}
              placeholder="Ex: CRM-123456"
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
              placeholder="Ex: Hemograma, Raio-X, etc."
              required
            />

            <button type="submit" className="button" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Processando...' : 'Enviar PDF'}
            </button>
          </form>

          {extractedText && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>Texto Extraído do PDF</h3>
              <div className="data-display">
                {extractedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadExam;
