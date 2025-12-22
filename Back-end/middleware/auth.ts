import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/auth';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
    role?: string;
  };
}

export function authenticate(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = payload;
    return handler(req, res);
  };
}

