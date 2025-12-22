import type { NextApiResponse } from 'next';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import { client } from '@/lib/elasticsearch';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'GET' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'ID do exame é obrigatório' });
        }

        // Se for DELETE, deletar o exame
        if (req.method === 'DELETE') {
            try {
                // Buscar exame para verificar se pertence ao usuário
                const result = await client.get({
                    index: 'exams',
                    id: id,
                });

                const exam = result._source as any;

                // Verificar se o exame pertence ao usuário
                if (exam.userId !== req.user.userId) {
                    return res.status(403).json({ error: 'Acesso negado' });
                }

                // Deletar o exame
                await client.delete({
                    index: 'exams',
                    id: id,
                    refresh: 'wait_for', // Forçar espera até que a exclusão seja visível
                });

                return res.status(200).json({ message: 'Exame excluído com sucesso' });
            } catch (error: any) {
                if (error.statusCode === 404) {
                    return res.status(404).json({ error: 'Exame não encontrado' });
                }
                console.error('Erro ao excluir exame:', error);
                return res.status(500).json({ error: 'Erro ao excluir exame', details: error.message });
            }
        }

        // Se for GET, buscar o exame
        // Buscar exame específico
        const result = await client.get({
            index: 'exams',
            id: id,
        });

        const exam = result._source as any;

        // Verificar se o exame pertence ao usuário
        if (exam.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        res.status(200).json({
            id: result._id,
            doctorCrm: exam.doctorCrm,
            examDate: exam.examDate,
            examType: exam.examType,
            examData: exam.examData,
            pdfContent: exam.pdfContent,
            aiAnalysis: exam.aiAnalysis || null, // Análise da IA se existir
            aiAnalyzedAt: exam.aiAnalyzedAt || null, // Data da análise da IA
            createdAt: exam.createdAt,
        });
    } catch (error: any) {
        if (error.statusCode === 404) {
            return res.status(404).json({ error: 'Exame não encontrado' });
        }
        console.error('Erro ao buscar exame:', error);
        res.status(500).json({ error: 'Erro ao buscar exame', details: error.message });
    }
}

export default authenticate(handler);

