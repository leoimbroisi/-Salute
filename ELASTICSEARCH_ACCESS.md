# Como Acessar o Elasticsearch

## Acesso Básico via URL

O Elasticsearch está rodando na porta **9200**. Você pode acessar diretamente no navegador:

### 1. Informações do Cluster
```
http://localhost:9200
```

Isso retornará informações sobre o cluster em JSON.

### 2. Verificar Índices
```
http://localhost:9200/_cat/indices?v
```

Isso mostra todos os índices criados (users, exams, etc.)

### 3. Ver Dados de um Índice
```
http://localhost:9200/users/_search?pretty
http://localhost:9200/exams/_search?pretty
```

O parâmetro `?pretty` formata o JSON para melhor leitura.

### 4. Verificar Health do Cluster
```
http://localhost:9200/_cluster/health?pretty
```

### 5. Ver Mapeamento de um Índice
```
http://localhost:9200/users/_mapping?pretty
http://localhost:9200/exams/_mapping?pretty
```

## Ferramentas Recomendadas

### 1. Elasticsearch Head (Plugin do Chrome)
- Instale a extensão "Elasticsearch Head" no Chrome
- Configure para conectar em `http://localhost:9200`
- Interface visual para explorar dados

### 2. Kibana (Interface Completa para Dashboards)
O Kibana já está configurado no docker-compose.yml!

**Para iniciar o Kibana:**
```bash
docker-compose up -d kibana
```

**Acesse o Kibana:**
```
http://localhost:5601
```

**Primeiros passos no Kibana:**
1. Acesse `http://localhost:5601`
2. Vá em **Stack Management** > **Kibana** > **Data Views**
3. Clique em **Create data view**
4. Crie um Data View para seus índices:
   - Para exames: `exams`
   - Para usuários: `users`
5. Selecione o campo de data (`examDate` ou `createdAt`)
6. Depois vá em **Discover** para explorar os dados
7. Em **Dashboard** você pode criar visualizações e dashboards personalizados

### 3. Postman ou Insomnia
Use ferramentas de API para fazer requisições GET/POST ao Elasticsearch.

## Comandos Úteis via cURL

### Listar todos os índices
```bash
curl http://localhost:9200/_cat/indices?v
```

### Buscar todos os usuários
```bash
curl http://localhost:9200/users/_search?pretty
```

### Buscar todos os exames
```bash
curl http://localhost:9200/exams/_search?pretty
```

### Buscar um documento específico
```bash
curl http://localhost:9200/users/USER_ID?pretty
```

### Deletar um índice (cuidado!)
```bash
curl -X DELETE http://localhost:9200/users
```

## Verificar se está rodando

```bash
curl http://localhost:9200
```

Se retornar JSON com informações do cluster, está funcionando!

