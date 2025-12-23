import { Client } from '@elastic/elasticsearch';

const elasticsearchUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

export const client = new Client({
    node: elasticsearchUrl,
});

// Inicializar índices
export async function initializeIndices() {
    try {
        // Índice para usuários
        try {
            await client.indices.get({ index: 'users' });
        } catch (error: any) {
            // Índice não existe, criar
            if (error.statusCode === 404) {
                await client.indices.create({
                    index: 'users',
                    mappings: {
                        properties: {
                            email: { type: 'keyword' },
                            name: { type: 'text' },
                            password: { type: 'keyword' },
                            state: { type: 'keyword' },
                            role: { type: 'keyword' },
                            createdAt: { type: 'date' },
                        },
                    },
                });
                console.log('Índice "users" criado com sucesso');
            } else {
                throw error;
            }
        }

        // Índice para exames
        try {
            await client.indices.get({ index: 'exams' });
            // Índice já existe - Elasticsearch adicionará os novos campos (aiAnalysis, aiAnalyzedAt) dinamicamente
            console.log('Índice "exams" já existe');
        } catch (error: any) {
            // Índice não existe, criar
            if (error.statusCode === 404) {
                await client.indices.create({
                    index: 'exams',
                    mappings: {
                        properties: {
                            userId: { type: 'keyword' },
                            doctorCrm: { type: 'keyword' },
                            examDate: { type: 'date' },
                            examType: { type: 'keyword' },
                            examData: { type: 'text' },
                            pdfContent: { type: 'text' },
                            aiAnalysis: { type: 'text' }, // Análise da IA armazenada
                            aiAnalyzedAt: { type: 'date' }, // Data da análise da IA
                            createdAt: { type: 'date' },
                        },
                    },
                });
                console.log('Índice "exams" criado com sucesso');
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar índices do Elasticsearch:', error);
        throw error;
    }
}

