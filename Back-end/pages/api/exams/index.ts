import type { NextApiResponse } from 'next';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import { client } from '@/lib/elasticsearch';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }

    const { examType, examDate, startDate, endDate, page, pageSize, q, text } = req.query;

    // Parâmetros de paginação
    const currentPage = parseInt(page as string) || 1;
    const size = parseInt(pageSize as string) || 10;
    const from = (currentPage - 1) * size;

    // Construir query de busca
    let query: any = {
      bool: {
        must: [
          {
            term: { userId: req.user.userId },
          },
        ],
      },
    };

    // Adicionar filtro por tipo de exame se fornecido
    if (examType && examType !== '') {
      query.bool.must.push({
        match: { examType: examType as string },
      });
    }

    // Filtro de texto avançado (detalhes e IA)
    const searchText = (q as string) || (text as string) || '';
    if (searchText && searchText.trim() !== '') {
      // Normalizar texto de busca removendo acentos
      const normalizedText = searchText
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      
      query.bool.must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: searchText,
                fields: ['examData^2', 'pdfContent', 'aiAnalysis^3'],
                type: 'phrase_prefix',
                operator: 'or',
              },
            },
            {
              multi_match: {
                query: normalizedText,
                fields: ['examData^2', 'pdfContent', 'aiAnalysis^3'],
                type: 'phrase_prefix',
                operator: 'or',
              },
            },
            {
              multi_match: {
                query: searchText,
                fields: ['examData', 'pdfContent', 'aiAnalysis'],
                fuzziness: 'AUTO',
              },
            },
          ],
          minimum_should_match: 1,
        },
      });
    }

    // Adicionar filtro por data específica se fornecido
    if (examDate && examDate !== '') {
      const startDateObj = new Date(examDate as string);
      startDateObj.setHours(0, 0, 0, 0);
      const endDateObj = new Date(examDate as string);
      endDateObj.setHours(23, 59, 59, 999);

      query.bool.must.push({
        range: {
          examDate: {
            gte: startDateObj.toISOString(),
            lte: endDateObj.toISOString(),
          },
        },
      });
    }

    // Adicionar filtro por período (data inicial e final) se fornecido
    if (startDate && startDate !== '' && endDate && endDate !== '') {
      const startDateObj = new Date(startDate as string);
      startDateObj.setHours(0, 0, 0, 0);
      const endDateObj = new Date(endDate as string);
      endDateObj.setHours(23, 59, 59, 999);

      query.bool.must.push({
        range: {
          examDate: {
            gte: startDateObj.toISOString(),
            lte: endDateObj.toISOString(),
          },
        },
      });
    } else if (startDate && startDate !== '') {
      // Apenas data inicial
      const startDateObj = new Date(startDate as string);
      startDateObj.setHours(0, 0, 0, 0);

      query.bool.must.push({
        range: {
          examDate: {
            gte: startDateObj.toISOString(),
          },
        },
      });
    } else if (endDate && endDate !== '') {
      // Apenas data final
      const endDateObj = new Date(endDate as string);
      endDateObj.setHours(23, 59, 59, 999);

      query.bool.must.push({
        range: {
          examDate: {
            lte: endDateObj.toISOString(),
          },
        },
      });
    }

    // Primeiro, buscar o total de documentos
    const countResult = await client.count({
      index: 'exams',
      query: query,
    });

    const total = countResult.count;

    // Buscar os documentos paginados
    const result = await client.search({
      index: 'exams',
      query: query,
      from: from,
      size: size,
      sort: [
        {
          examDate: {
            order: 'desc',
            missing: '_last', // Exames sem data vão para o final
          },
        },
        {
          createdAt: {
            order: 'desc', // Ordenação secundária por data de cadastro
          },
        },
      ],
    });

    const exams = result.hits.hits.map((hit: any) => ({
      id: hit._id,
      doctorCrm: hit._source.doctorCrm,
      examDate: hit._source.examDate,
      examType: hit._source.examType,
      examData: hit._source.examData,
      pdfContent: hit._source.pdfContent,
      aiAnalysis: hit._source.aiAnalysis,
      aiAnalyzedAt: hit._source.aiAnalyzedAt,
      createdAt: hit._source.createdAt,
    }));

    const totalPages = Math.ceil(total / size);

    res.status(200).json({
      exams,
      pagination: {
        page: currentPage,
        pageSize: size,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar exames:', error);
    res.status(500).json({ error: 'Erro ao listar exames', details: error.message });
  }
}

export default authenticate(handler);

