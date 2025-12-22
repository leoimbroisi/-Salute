import type { NextApiResponse } from 'next';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import { client } from '@/lib/elasticsearch';
import pdfParse from 'pdf-parse';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    // Para Next.js, precisamos usar uma abordagem diferente para upload de arquivos
    // Vamos receber o PDF como base64 no body
    const { pdfBase64, doctorCrm, examDate, examType } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'PDF é obrigatório' });
    }

    if (!examType || examType.trim() === '') {
      return res.status(400).json({ error: 'Tipo de exame é obrigatório' });
    }

    if (!examDate || examDate.trim() === '') {
      return res.status(400).json({ error: 'Data do exame é obrigatória' });
    }

    // Converter base64 para buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Extrair texto do PDF
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text;

    // Criar documento de exame
    const examId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    await client.index({
      index: 'exams',
      id: examId,
      document: {
        userId: req.user.userId,
        doctorCrm: doctorCrm || '',
        examDate: examDate,
        examType: examType,
        examData: pdfText,
        pdfContent: pdfText,
        createdAt: new Date().toISOString(),
      },
    });

    res.status(201).json({
      message: 'Exame enviado com sucesso',
      examId,
      extractedText: pdfText.substring(0, 500), // Primeiros 500 caracteres para preview
    });
  } catch (error: any) {
    console.error('Erro ao processar PDF:', error);
    res.status(500).json({ error: 'Erro ao processar PDF', details: error.message });
  }
}

export default authenticate(handler);

// Configuração para desabilitar body parser padrão e permitir upload
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

