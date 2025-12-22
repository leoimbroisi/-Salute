import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeIndices } from '@/lib/elasticsearch';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    await initializeIndices();
    res.status(200).json({ message: 'Índices inicializados com sucesso' });
  } catch (error: any) {
    console.error('Erro ao inicializar índices:', error);
    res.status(500).json({ error: 'Erro ao inicializar índices', details: error.message });
  }
}

