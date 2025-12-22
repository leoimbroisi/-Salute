import { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import DatePicker from '../components/DatePicker';
import '../App.css';

interface Exam {
    id: string;
    doctorCrm: string;
    examDate: string;
    examType: string;
    examData: string;
    pdfContent: string;
    aiAnalysis?: string; // Análise da IA (opcional)
    aiAnalyzedAt?: string; // Data da análise da IA (opcional)
    createdAt: string;
}

interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

function Exams() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [examToAnalyze, setExamToAnalyze] = useState<Exam | null>(null);
    const [isCachedAnalysis, setIsCachedAnalysis] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Estado para forçar atualização
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
    });

    // Filtros
    const [filterExamType, setFilterExamType] = useState('');
    const [filterExamDate, setFilterExamDate] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    useEffect(() => {
        // Resetar para primeira página quando filtros mudarem
        if (pagination.page !== 1) {
            setPagination(prev => ({ ...prev, page: 1 }));
        } else {
            fetchExams();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterExamType, filterExamDate, filterStartDate, filterEndDate]);

    useEffect(() => {
        fetchExams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.pageSize]);

    // useEffect para detectar quando uma exclusão acontece e recarregar os dados
    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchExams();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    const fetchExams = async (pageOverride?: number, pageSizeOverride?: number) => {
        try {
            setLoading(true);
            setError('');

            const currentPage = pageOverride !== undefined ? pageOverride : pagination.page;
            const currentPageSize = pageSizeOverride !== undefined ? pageSizeOverride : pagination.pageSize;

            const params: any = {
                page: currentPage,
                pageSize: currentPageSize,
            };
            if (filterExamType) params.examType = filterExamType;
            if (filterExamDate) params.examDate = filterExamDate;
            if (filterStartDate) params.startDate = filterStartDate;
            if (filterEndDate) params.endDate = filterEndDate;

            const response = await api.get('/exams', { params });
            const newExams = response.data.exams || [];

            // Forçar nova referência do array para garantir que o React detecte a mudança
            setExams([...newExams]);

            if (response.data.pagination) {
                setPagination(response.data.pagination);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Erro ao carregar exames');
        } finally {
            setLoading(false);
        }
    };

    const handleViewExam = (exam: Exam) => {
        setSelectedExam(exam);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedExam(null);
    };

    const clearFilters = () => {
        setFilterExamType('');
        setFilterExamDate('');
        setFilterStartDate('');
        setFilterEndDate('');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize: newPageSize, page: 1 }));
    };

    const handleDeleteClick = (exam: Exam) => {
        setExamToDelete(exam);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!examToDelete) return;

        setDeleting(true);
        setError('');

        try {
            // Fazer a exclusão
            await api.delete(`/exams/${examToDelete.id}`);

            // Fechar modal
            setShowDeleteModal(false);
            setExamToDelete(null);

            // Aguardar um pouco para garantir que o Elasticsearch processe a exclusão
            await new Promise(resolve => setTimeout(resolve, 500));

            // Disparar atualização através do estado refreshTrigger
            // Isso vai acionar o useEffect que recarrega os dados
            setRefreshTrigger(prev => prev + 1);

        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Erro ao excluir exame');
            setShowDeleteModal(false);
            setExamToDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setExamToDelete(null);
    };

    const handleAnalyzeClick = (exam: Exam) => {
        setExamToAnalyze(exam);
        setShowAIModal(true);
        setAiAnalysis('');
        analyzeExam(exam.id);
    };

    const analyzeExam = async (examId: string) => {
        setAnalyzing(true);
        setError('');
        setIsCachedAnalysis(false);
        try {
            // Timeout aumentado para 60 segundos, pois a análise com IA pode demorar
            const response = await api.post(`/exams/${examId}/analyze`, {}, {
                timeout: 60000, // 60 segundos
            });
            setAiAnalysis(response.data.analysis);
            setIsCachedAnalysis(response.data.cached || false);
        } catch (err: any) {
            if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                setError('A análise está demorando mais que o esperado. Por favor, tente novamente.');
            } else {
                setError(err.response?.data?.error || err.message || 'Erro ao analisar exame com IA');
            }
            setShowAIModal(false);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleCloseAIModal = () => {
        setShowAIModal(false);
        setExamToAnalyze(null);
        setAiAnalysis('');
        setIsCachedAnalysis(false);
    };

    // Obter tipos de exame únicos para o filtro
    // Nota: Isso pode não funcionar bem com paginação, mas mantemos para compatibilidade
    const uniqueExamTypes = Array.from(new Set(exams.map(exam => exam.examType))).filter(Boolean);

    return (
        <div className="app">
            <Navbar />
            <div className="container">
                <div className="card">
                    <h1>Lista de Exames</h1>

                    {/* Filtros */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px'
                    }}>
                        <div>
                            <label className="label">Filtrar por Tipo de Exame</label>
                            <select
                                className="input"
                                value={filterExamType}
                                onChange={(e) => setFilterExamType(e.target.value)}
                                style={{ marginBottom: 0 }}
                            >
                                <option value="">Todos os tipos</option>
                                {uniqueExamTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">Filtrar por Data Específica</label>
                            <DatePicker
                                value={filterExamDate}
                                onChange={setFilterExamDate}
                                placeholder="Selecione uma data específica"
                                maxDate={new Date()}
                            />
                        </div>

                        <div>
                            <label className="label">Data Inicial (Período)</label>
                            <DatePicker
                                value={filterStartDate}
                                onChange={setFilterStartDate}
                                placeholder="Data inicial do período"
                                maxDate={filterEndDate ? new Date(filterEndDate) : new Date()}
                            />
                        </div>

                        <div>
                            <label className="label">Data Final (Período)</label>
                            <DatePicker
                                value={filterEndDate}
                                onChange={setFilterEndDate}
                                placeholder="Data final do período"
                                maxDate={new Date()}
                            />
                        </div>

                        <div>
                            <label className="label" style={{ visibility: 'hidden' }}>Ações</label>
                            <button
                                type="button"
                                className="button button-secondary"
                                onClick={clearFilters}
                                style={{ width: '100%' }}
                            >
                                🗑️ Limpar Filtros
                            </button>
                        </div>
                    </div>

                    {error && <div className="error">{error}</div>}

                    {loading ? (
                        <p>Carregando...</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Tipo de Exame</th>
                                        <th>CRM do Médico</th>
                                        <th>Data do Exame</th>
                                        <th>Data de Cadastro</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                                                Nenhum exame encontrado
                                            </td>
                                        </tr>
                                    ) : (
                                        exams.map((exam) => (
                                            <tr key={exam.id}>
                                                <td>{exam.examType || 'Não especificado'}</td>
                                                <td>{exam.doctorCrm || 'Não informado'}</td>
                                                <td>
                                                    {exam.examDate
                                                        ? new Date(exam.examDate).toLocaleDateString('pt-BR')
                                                        : 'Não informado'}
                                                </td>
                                                <td>
                                                    {new Date(exam.createdAt).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                        <button
                                                            className="button"
                                                            onClick={() => handleViewExam(exam)}
                                                            style={{ padding: '6px 12px', fontSize: '14px' }}
                                                        >
                                                            🔍 Ver Detalhes
                                                        </button>
                                                        <button
                                                            className="button"
                                                            onClick={() => handleAnalyzeClick(exam)}
                                                            disabled={analyzing}
                                                            style={{
                                                                padding: '6px 12px',
                                                                fontSize: '14px',
                                                                backgroundColor: '#28a745',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!analyzing) {
                                                                    e.currentTarget.style.backgroundColor = '#218838';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!analyzing) {
                                                                    e.currentTarget.style.backgroundColor = '#28a745';
                                                                }
                                                            }}
                                                        >
                                                            {analyzing && examToAnalyze?.id === exam.id ? '🤖 Analisando...' : '🤖 Analisar com IA'}
                                                        </button>
                                                        <button
                                                            className="button"
                                                            onClick={() => handleDeleteClick(exam)}
                                                            style={{
                                                                padding: '6px 12px',
                                                                fontSize: '14px',
                                                                backgroundColor: '#dc3545',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#c82333';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#dc3545';
                                                            }}
                                                        >
                                                            🗑️ Excluir
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Paginação */}
                    {pagination.total > 0 && (
                        <div style={{
                            marginTop: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ color: '#666', fontSize: '14px' }}>
                                    Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a{' '}
                                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{' '}
                                    {pagination.total} exames
                                </span>
                                <select
                                    value={pagination.pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                    style={{
                                        padding: '6px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                    }}
                                >
                                    <option value={10}>10 por página</option>
                                    <option value={20}>20 por página</option>
                                    <option value={50}>50 por página</option>
                                    <option value={100}>100 por página</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    className="button"
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.page === 1}
                                    style={{ padding: '6px 12px', fontSize: '14px' }}
                                >
                                    ⏮️ Primeira
                                </button>
                                <button
                                    className="button"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    style={{ padding: '6px 12px', fontSize: '14px' }}
                                >
                                    ◀️ Anterior
                                </button>
                                <span style={{ padding: '0 12px', color: '#666' }}>
                                    Página {pagination.page} de {pagination.totalPages}
                                </span>
                                <button
                                    className="button"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    style={{ padding: '6px 12px', fontSize: '14px' }}
                                >
                                    Próxima ▶️
                                </button>
                                <button
                                    className="button"
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    style={{ padding: '6px 12px', fontSize: '14px' }}
                                >
                                    Última ⏭️
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalhes do Exame */}
            {showModal && selectedExam && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}
                    onClick={handleCloseModal}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '24px',
                            maxWidth: '800px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Detalhes do Exame</h2>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666',
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <strong>Tipo de Exame:</strong> {selectedExam.examType || 'Não especificado'}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <strong>CRM do Médico:</strong> {selectedExam.doctorCrm || 'Não informado'}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <strong>Data do Exame:</strong>{' '}
                            {selectedExam.examDate
                                ? new Date(selectedExam.examDate).toLocaleDateString('pt-BR')
                                : 'Não informado'}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <strong>Data de Cadastro:</strong>{' '}
                            {new Date(selectedExam.createdAt).toLocaleDateString('pt-BR')}
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <strong>Dados do Exame:</strong>
                            <div
                                style={{
                                    marginTop: '8px',
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    whiteSpace: 'pre-wrap',
                                    maxHeight: '400px',
                                    overflow: 'auto',
                                    fontFamily: 'monospace',
                                    fontSize: '14px',
                                }}
                            >
                                {selectedExam.examData || selectedExam.pdfContent || 'Nenhum dado disponível'}
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="button" onClick={handleCloseModal}>
                                ❌ Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && examToDelete && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1001,
                        padding: '20px',
                    }}
                    onClick={handleCancelDelete}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '24px',
                            maxWidth: '500px',
                            width: '100%',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ color: '#dc3545', marginBottom: '12px' }}>⚠️ Confirmar Exclusão</h2>
                            <p style={{ color: '#666', lineHeight: '1.6' }}>
                                Tem certeza que deseja excluir este exame?
                            </p>
                            <div
                                style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    borderLeft: '4px solid #dc3545',
                                }}
                            >
                                <div><strong>Tipo:</strong> {examToDelete.examType || 'Não especificado'}</div>
                                <div style={{ marginTop: '8px' }}>
                                    <strong>Data do Exame:</strong>{' '}
                                    {examToDelete.examDate
                                        ? new Date(examToDelete.examDate).toLocaleDateString('pt-BR')
                                        : 'Não informado'}
                                </div>
                                {examToDelete.doctorCrm && (
                                    <div style={{ marginTop: '8px' }}>
                                        <strong>CRM:</strong> {examToDelete.doctorCrm}
                                    </div>
                                )}
                            </div>
                            <p style={{ color: '#dc3545', marginTop: '16px', fontWeight: 'bold' }}>
                                Esta ação não pode ser desfeita!
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                className="button button-secondary"
                                onClick={handleCancelDelete}
                                disabled={deleting}
                            >
                                ❌ Cancelar
                            </button>
                            <button
                                className="button"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                style={{
                                    backgroundColor: '#dc3545',
                                }}
                                onMouseEnter={(e) => {
                                    if (!deleting) {
                                        e.currentTarget.style.backgroundColor = '#c82333';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!deleting) {
                                        e.currentTarget.style.backgroundColor = '#dc3545';
                                    }
                                }}
                            >
                                {deleting ? '⏳ Excluindo...' : '🗑️ Sim, Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Análise com IA */}
            {showAIModal && examToAnalyze && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1002,
                        padding: '20px',
                    }}
                    onClick={handleCloseAIModal}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '24px',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>🤖</span>
                                <span>Análise com Inteligência Artificial</span>
                            </h2>
                            <button
                                onClick={handleCloseAIModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#666',
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
                            <div><strong>Tipo de Exame:</strong> {examToAnalyze.examType || 'Não especificado'}</div>
                            <div style={{ marginTop: '8px' }}>
                                <strong>Data do Exame:</strong>{' '}
                                {examToAnalyze.examDate
                                    ? new Date(examToAnalyze.examDate).toLocaleDateString('pt-BR')
                                    : 'Não informado'}
                            </div>
                        </div>

                        {analyzing ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                                <p style={{ color: '#666', fontSize: '16px', fontWeight: '500' }}>Analisando exame com IA...</p>
                                <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>Isso pode levar até 60 segundos. Por favor, aguarde.</p>
                            </div>
                        ) : aiAnalysis ? (
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <strong style={{ fontSize: '16px', color: '#333' }}>Resumo da Análise:</strong>
                                    {isCachedAnalysis && (
                                        <span style={{
                                            fontSize: '12px',
                                            color: '#28a745',
                                            backgroundColor: '#d4edda',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontWeight: '500'
                                        }}>
                                            💾 Análise em cache
                                        </span>
                                    )}
                                </div>
                                <div
                                    style={{
                                        marginTop: '12px',
                                        padding: '16px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '4px',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.6',
                                        fontSize: '15px',
                                        borderLeft: '4px solid #28a745',
                                    }}
                                >
                                    {aiAnalysis}
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                Aguardando análise...
                            </div>
                        )}

                        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="button" onClick={handleCloseAIModal}>
                                ❌ Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Exams;

