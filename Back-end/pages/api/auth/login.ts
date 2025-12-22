import type { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/lib/elasticsearch';
import { comparePassword, generateToken } from '@/lib/auth';

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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const result = await client.search({
      index: 'users',
      query: {
        term: { email: email.toLowerCase() },
      },
    });

    if (result.hits.hits.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.hits.hits[0]._source as any;
    const userId = result.hits.hits[0]._id;

    // Verificar senha
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Determinar role: se não tiver role, verificar se é o admin autorizado
    let role = user.role;
    if (!role) {
      const adminEmail = 'leonardo.imbroisi@gmail.com';
      role = user.email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';
      
      // Atualizar o usuário no banco com o role correto
      await client.update({
        index: 'users',
        id: userId,
        doc: {
          role: role,
        },
      });
    }

    const token = generateToken({ userId, email: user.email, role });

    res.status(200).json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role,
      },
    });
  } catch (error: any) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login', details: error.message });
  }
}

