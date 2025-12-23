import type { NextApiResponse } from 'next';
import { authenticate, AuthenticatedRequest } from '@/middleware/auth';
import { client } from '@/lib/elasticsearch';
import { hashPassword } from '@/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apenas administradores
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de usuário inválido' });
  }

  if (req.method === 'PUT') {
    try {
      const { name, email, state, role, password } = req.body || {};
      const doc: any = {};
      if (name) doc.name = name;
      if (email) doc.email = String(email).toLowerCase();
      if (typeof state === 'string') doc.state = state;
      if (role) doc.role = role;
      if (password) doc.password = await hashPassword(password);

      if (Object.keys(doc).length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }

      await client.update({
        index: 'users',
        id,
        doc,
      });

      return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro ao atualizar usuário', details: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await client.delete({ index: 'users', id });
      return res.status(200).json({ message: 'Usuário excluído com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      return res.status(500).json({ error: 'Erro ao excluir usuário', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}

export default authenticate(handler);
