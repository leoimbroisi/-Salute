import type { NextApiResponse } from 'next';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import { client } from '@/lib/elasticsearch';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar se o usuário é administrador
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem ver a lista de usuários.' });
    }

    const result = await client.search({
      index: 'users',
      query: {
        match_all: {},
      },
      size: 100,
    });

    const users = result.hits.hits.map((hit: any) => ({
      id: hit._id,
      email: hit._source.email,
      name: hit._source.name,
      state: hit._source.state || 'DF',
      role: hit._source.role || 'user',
      createdAt: hit._source.createdAt,
    }));

    res.status(200).json({ users });
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários', details: error.message });
  }
}

export default authenticate(handler);

