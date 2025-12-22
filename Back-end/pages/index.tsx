export default function Home() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Sistema de Gestão de Dados de Saúde - API</h1>
      <p>Backend Next.js rodando na porta 3001</p>
      <p style={{ marginTop: '20px', color: '#666' }}>
        Os índices do Elasticsearch serão criados automaticamente na primeira requisição.
      </p>
    </div>
  );
}

