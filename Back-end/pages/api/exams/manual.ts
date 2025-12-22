import type { NextApiResponse } from 'next';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import { client } from '@/lib/elasticsearch';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { doctorCrm, examDate, examType, examData } = req.body;

    if (!doctorCrm || !examDate || !examType || !examData) {
      return res.status(400).json({ 
        error: 'CRM do médico, data do exame, tipo de exame e dados do exame são obrigatórios' 
      });
    }

    // Criar documento de exame
    const examId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    await client.index({
      index: 'exams',
      id: examId,
      document: {
        userId: req.user.userId,
        doctorCrm,
        examDate,
        examType,
        examData,
        pdfContent: '',
        createdAt: new Date().toISOString(),
      },
    });

    res.status(201).json({
      message: 'Exame cadastrado com sucesso',
      examId,
    });
  } catch (error: any) {
    console.error('Erro ao cadastrar exame:', error);
    res.status(500).json({ error: 'Erro ao cadastrar exame', details: error.message });
  }
}

export default authenticate(handler);

