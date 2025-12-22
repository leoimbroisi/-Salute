// Script simples para testar conexão com Elasticsearch
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

async function testConnection() {
  try {
    console.log('Testando conexão com Elasticsearch...');
    const response = await client.info();
    console.log('✅ Elasticsearch conectado!');
    console.log('Versão:', response.version.number);
    console.log('Cluster:', response.cluster_name);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Elasticsearch:', error.message);
    console.log('\nVerifique se:');
    console.log('1. O Docker está rodando');
    console.log('2. O Elasticsearch está iniciado: docker-compose up -d');
    console.log('3. O Elasticsearch está acessível em http://localhost:9200');
    return false;
  }
}

testConnection().then((success) => {
  process.exit(success ? 0 : 1);
});

