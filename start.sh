#!/bin/bash

echo "🚀 Iniciando Sistema de Gestão de Dados de Saúde"
echo ""

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Iniciar Elasticsearch
echo "📦 Iniciando Elasticsearch..."
docker-compose up -d

# Aguardar Elasticsearch estar pronto
echo "⏳ Aguardando Elasticsearch estar pronto..."
sleep 10

# Verificar se o Elasticsearch está respondendo
if curl -s http://localhost:9200 > /dev/null; then
    echo "✅ Elasticsearch está rodando!"
else
    echo "⚠️  Elasticsearch pode não estar pronto ainda. Continuando..."
fi

echo ""
echo "📝 Próximos passos:"
echo "1. Configure o arquivo .env na pasta Back-end (copie de env.example)"
echo "2. Execute 'npm install' na pasta Back-end"
echo "3. Execute 'npm run dev' na pasta Back-end (porta 3001)"
echo "4. Execute 'npm install' na pasta Front-end"
echo "5. Execute 'npm run dev' na pasta Front-end (porta 3000)"
echo ""
echo "✨ Sistema pronto para uso!"

