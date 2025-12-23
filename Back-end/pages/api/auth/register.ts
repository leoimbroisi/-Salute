import type { NextApiRequest, NextApiResponse } from 'next';
import { client, initializeIndices } from '@/lib/elasticsearch';
import { hashPassword, generateToken } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Garantir que os índices existam
    await initializeIndices();
    const { email, password, name, state } = req.body;

    if (!email || !password || !name || !state) {
      return res.status(400).json({ error: 'Email, senha, nome e estado são obrigatórios' });
    }

    // Verificar se o usuário já existe
    const existingUser = await client.search({
      index: 'users',
      query: {
        term: { email: email.toLowerCase() },
      },
    });

    if (existingUser.hits.hits.length > 0) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    // Criar novo usuário
    const hashedPassword = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Verificar se o email é o administrador autorizado
    const adminEmail = 'leonardo.imbroisi@gmail.com';
    const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';

    await client.index({
      index: 'users',
      id: userId,
      document: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role,
        state,
        createdAt: new Date().toISOString(),
      },
    });

    const token = generateToken({ userId, email: email.toLowerCase(), role });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        name,
        state,
        role,
      },
    });
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário', details: error.message });
  }
}

