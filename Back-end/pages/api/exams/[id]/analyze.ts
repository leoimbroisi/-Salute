import type { NextApiResponse } from 'next';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import { client } from '@/lib/elasticsearch';
import OpenAI from 'openai';

// Inicializar cliente OpenAI apenas se a chave estiver disponível
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        timeout: 60000, // 60 segundos de timeout para requisições
        maxRetries: 2, // Número de tentativas em caso de falha
    });
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
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

        // Verificar se a API key do OpenAI está configurada
        if (!process.env.OPENAI_API_KEY || !openai) {
            return res.status(500).json({
                error: 'API do OpenAI não configurada. Configure a variável OPENAI_API_KEY no arquivo .env e reinicie o servidor.'
            });
        }

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

        // Verificar se já existe análise da IA gravada
        if (exam.aiAnalysis && exam.aiAnalysis.trim() !== '') {
            // Retornar análise já gravada (economiza créditos da IA)
            return res.status(200).json({
                analysis: exam.aiAnalysis,
                examType: exam.examType || 'exame médico',
                analyzedAt: exam.aiAnalyzedAt || exam.createdAt,
                cached: true, // Indicar que é uma análise em cache
            });
        }

        // Obter dados do exame para análise
        const examData = exam.examData || exam.pdfContent || '';
        const examType = exam.examType || 'exame médico';

        if (!examData || examData.trim() === '') {
            return res.status(400).json({ error: 'O exame não possui dados para análise' });
        }

        // Preparar prompt para a IA
        const prompt = `Você é um assistente médico especializado em análise de exames. Analise os seguintes dados de um ${examType} e forneça:

1. Um resumo executivo dos resultados principais
2. Valores que estão fora da normalidade (se houver)
3. Possíveis problemas ou anormalidades identificadas
4. Recomendações gerais (se aplicável)

IMPORTANTE: 
- Seja objetivo e claro
- Use linguagem médica apropriada mas acessível
- Destaque apenas problemas reais, não invente problemas
- Se tudo estiver normal, informe claramente
- Formate a resposta de forma organizada

Dados do exame:
${examData.substring(0, 8000)}`; // Limitar a 8000 caracteres para não exceder limites da API

        // Chamar a API do OpenAI
        const completion = await openai!.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Você é um assistente médico especializado em análise de exames clínicos. Forneça análises precisas, objetivas e baseadas apenas nos dados fornecidos.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.3, // Menor temperatura para respostas mais precisas
            max_tokens: 1000,
        });

        const analysis = completion.choices[0]?.message?.content || 'Não foi possível gerar a análise.';
        const analyzedAt = new Date().toISOString();

        // Salvar a análise no Elasticsearch para reutilização futura
        await client.update({
            index: 'exams',
            id: id,
            doc: {
                aiAnalysis: analysis,
                aiAnalyzedAt: analyzedAt,
            },
        });

        res.status(200).json({
            analysis,
            examType: examType,
            analyzedAt: analyzedAt,
            cached: false, // Indicar que é uma análise nova
        });
    } catch (error: any) {
        if (error.statusCode === 404) {
            return res.status(404).json({ error: 'Exame não encontrado' });
        }

        // Tratamento específico para erros da API do OpenAI
        if (error.code === 'insufficient_quota') {
            return res.status(500).json({
                error: 'Créditos insuficientes na conta da OpenAI. Adicione créditos para continuar usando o serviço.'
            });
        }

        if (error.code === 'invalid_api_key' || error.status === 401) {
            return res.status(500).json({
                error: 'Chave de API do OpenAI inválida. Verifique se a chave está correta no arquivo .env e se o servidor foi reiniciado após a configuração.'
            });
        }

        // Log detalhado do erro para debug
        console.error('Erro ao analisar exame com IA:', {
            message: error.message,
            code: error.code,
            status: error.status,
            statusCode: error.statusCode,
            response: error.response?.data,
        });

        // Retornar mensagem de erro mais detalhada
        const errorMessage = error.response?.data?.error?.message || error.message || 'Erro desconhecido';
        const errorCode = error.code || error.status || 'UNKNOWN';

        res.status(500).json({
            error: 'Erro ao analisar exame com IA',
            details: errorMessage,
            code: errorCode,
            hint: 'Verifique se a chave da API está correta e se o servidor foi reiniciado após configurar o .env'
        });
    }
}

export default authenticate(handler);

// Configuração para aumentar o timeout da API route (60 segundos)
export const config = {
    api: {
        responseLimit: false,
        bodyParser: {
            sizeLimit: '1mb',
        },
        // Timeout aumentado para análise com IA
        externalResolver: true,
    },
};

