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
                border: '2px dashed #007bff',
                borderRadius: '8px',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: file ? '#e7f3ff' : '#f8f9fa',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                marginBottom: '16px',
                position: 'relative',
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#0056b3';
                e.currentTarget.style.backgroundColor = '#e7f3ff';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.backgroundColor = file ? '#e7f3ff' : '#f8f9fa';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.backgroundColor = '#e7f3ff';
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
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
                  <div style={{ fontWeight: 'bold', color: '#007bff', marginBottom: '8px' }}>
                    {file.name}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                    Clique para selecionar outro arquivo
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📤</div>
                  <div style={{ fontWeight: 'bold', color: '#007bff', marginBottom: '8px' }}>
                    Clique para selecionar ou arraste um arquivo PDF
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
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
              {loading ? (
                <>
                  <span>⏳</span>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Enviar PDF</span>
                </>
              )}
            </button>
          </form>

          {extractedText && (
            <div style={{ marginTop: '24px' }}>
              <h3>Texto Extraído do PDF (preview):</h3>
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
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

