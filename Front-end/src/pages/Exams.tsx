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
    aiAnalysis?: string;
    aiAnalyzedAt?: string;
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
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
    });

    const [filterExamType, setFilterExamType] = useState('');
    const [filterExamDate, setFilterExamDate] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        if (pagination.page !== 1) {
            setPagination(prev => ({ ...prev, page: 1 }));
        } else {
            fetchExams();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterExamType, filterExamDate, filterStartDate, filterEndDate, filterText]);

    useEffect(() => {
        fetchExams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.pageSize]);

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
            if (filterText) params.text = filterText;

            const response = await api.get('/exams', { params });
            const newExams = response.data.exams || [];

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
        setFilterText('');
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
            await api.delete(`/exams/${examToDelete.id}`);

            setShowDeleteModal(false);
            setExamToDelete(null);

            await new Promise(resolve => setTimeout(resolve, 500));

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
            const response = await api.post(`/exams/${examId}/analyze`, {}, {
                timeout: 60000,
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

    const uniqueExamTypes = Array.from(new Set(exams.map(exam => exam.examType))).filter(Boolean);

    return (
        <div className="app">
            <Navbar />
            <div className="container">
                <div className="card">
                    <h1>Lista de Exames</h1>

                    {/* Filtros */}
                    <div className="filter-section">
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="label">Busca por Conteúdo</label>
                            <input
                                type="text"
                                className="input"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="Pesquisar em dados do exame, PDF ou análise de IA..."
                                style={{ marginBottom: 0 }}
                            />
                        </div>
                        <div>
                            <label className="label">Tipo de Exame</label>
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
                            <label className="label">Data Específica</label>
                            <DatePicker
                                value={filterExamDate}
                                onChange={setFilterExamDate}
                                placeholder="Selecione uma data"
                                maxDate={new Date()}
                            />
                        </div>

                        <div>
                            <label className="label">Data Inicial</label>
                            <DatePicker
                                value={filterStartDate}
                                onChange={setFilterStartDate}
                                placeholder="Data inicial"
                                maxDate={filterEndDate ? new Date(filterEndDate) : new Date()}
                            />
                        </div>

                        <div>
                            <label className="label">Data Final</label>
                            <DatePicker
                                value={filterEndDate}
                                onChange={setFilterEndDate}
                                placeholder="Data final"
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
                                Limpar Filtros
                            </button>
                        </div>
                    </div>

                    {error && <div className="error">{error}</div>}

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Carregando exames...</p>
                        </div>
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
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--neutral-500)' }}>
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
                                                            className="button button-sm"
                                                            onClick={() => handleViewExam(exam)}
                                                        >
                                                            Ver Detalhes
                                                        </button>
                                                        <button
                                                            className="button button-success button-sm"
                                                            onClick={() => handleAnalyzeClick(exam)}
                                                            disabled={analyzing}
                                                        >
                                                            {analyzing && examToAnalyze?.id === exam.id ? 'Analisando...' : 'Analisar IA'}
                                                        </button>
                                                        <button
                                                            className="button button-danger button-sm"
                                                            onClick={() => handleDeleteClick(exam)}
                                                        >
                                                            Excluir
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
                        <div className="pagination">
                            <div className="pagination-info">
                                <span>
                                    Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} a{' '}
                                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{' '}
                                    {pagination.total} exames
                                </span>
                                <select
                                    className="select"
                                    value={pagination.pageSize}
                                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                >
                                    <option value={10}>10 por página</option>
                                    <option value={20}>20 por página</option>
                                    <option value={50}>50 por página</option>
                                    <option value={100}>100 por página</option>
                                </select>
                            </div>

                            <div className="pagination-controls">
                                <button
                                    className="button button-secondary button-sm"
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.page === 1}
                                >
                                    Primeira
                                </button>
                                <button
                                    className="button button-secondary button-sm"
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    Anterior
                                </button>
                                <span className="pagination-text">
                                    Página {pagination.page} de {pagination.totalPages}
                                </span>
                                <button
                                    className="button button-secondary button-sm"
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                >
                                    Próxima
                                </button>
                                <button
                                    className="button button-secondary button-sm"
                                    onClick={() => handlePageChange(pagination.totalPages)}
                                    disabled={pagination.page >= pagination.totalPages}
                                >
                                    Última
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalhes do Exame */}
            {showModal && selectedExam && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div
                        className="modal-content modal-content-lg"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxHeight: '90vh', overflow: 'auto' }}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">Detalhes do Exame</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div style={{ display: 'grid', gap: '12px' }}>
                                <div>
                                    <strong style={{ color: 'var(--neutral-600)', fontSize: '13px' }}>Tipo de Exame</strong>
                                    <p style={{ marginTop: '4px' }}>{selectedExam.examType || 'Não especificado'}</p>
                                </div>

                                <div>
                                    <strong style={{ color: 'var(--neutral-600)', fontSize: '13px' }}>CRM do Médico</strong>
                                    <p style={{ marginTop: '4px' }}>{selectedExam.doctorCrm || 'Não informado'}</p>
                                </div>

                                <div>
                                    <strong style={{ color: 'var(--neutral-600)', fontSize: '13px' }}>Data do Exame</strong>
                                    <p style={{ marginTop: '4px' }}>
                                        {selectedExam.examDate
                                            ? new Date(selectedExam.examDate).toLocaleDateString('pt-BR')
                                            : 'Não informado'}
                                    </p>
                                </div>

                                <div>
                                    <strong style={{ color: 'var(--neutral-600)', fontSize: '13px' }}>Data de Cadastro</strong>
                                    <p style={{ marginTop: '4px' }}>
                                        {new Date(selectedExam.createdAt).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>

                                <div>
                                    <strong style={{ color: 'var(--neutral-600)', fontSize: '13px' }}>Dados do Exame</strong>
                                    <div className="data-display">
                                        {selectedExam.examData || selectedExam.pdfContent || 'Nenhum dado disponível'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="button button-secondary" onClick={handleCloseModal}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteModal && examToDelete && (
                <div className="modal-overlay" onClick={handleCancelDelete}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">Confirmar Exclusão</h2>
                            <button className="modal-close" onClick={handleCancelDelete}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <p style={{ color: 'var(--neutral-600)', marginBottom: '16px' }}>
                                Tem certeza que deseja excluir este exame?
                            </p>

                            <div className="info-box info-box-danger">
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

            {/* Modal de Análise com IA */}
            {showAIModal && examToAnalyze && (
                <div className="modal-overlay" onClick={handleCloseAIModal}>
                    <div
                        className="modal-content modal-content-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2 className="modal-title">Análise com Inteligência Artificial</h2>
                            <button className="modal-close" onClick={handleCloseAIModal}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="info-box info-box-primary" style={{ marginTop: 0 }}>
                                <div><strong>Tipo de Exame:</strong> {examToAnalyze.examType || 'Não especificado'}</div>
                                <div style={{ marginTop: '8px' }}>
                                    <strong>Data do Exame:</strong>{' '}
                                    {examToAnalyze.examDate
                                        ? new Date(examToAnalyze.examDate).toLocaleDateString('pt-BR')
                                        : 'Não informado'}
                                </div>
                            </div>

                            {analyzing ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p style={{ fontWeight: '500' }}>Analisando exame com IA...</p>
                                    <p style={{ color: 'var(--neutral-400)', fontSize: '13px', marginTop: '8px' }}>
                                        Isso pode levar até 60 segundos. Por favor, aguarde.
                                    </p>
                                </div>
                            ) : aiAnalysis ? (
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <strong style={{ color: 'var(--neutral-700)' }}>Resumo da Análise</strong>
                                        {isCachedAnalysis && (
                                            <span className="badge badge-success">
                                                Análise em cache
                                            </span>
                                        )}
                                    </div>
                                    <div className="info-box info-box-success">
                                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                            {aiAnalysis}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="loading-container">
                                    <p style={{ color: 'var(--neutral-500)' }}>Aguardando análise...</p>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="button button-secondary" onClick={handleCloseAIModal}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Exams;
