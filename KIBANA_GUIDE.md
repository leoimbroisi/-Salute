# Guia do Kibana - Dashboards e Visualizações

## 🚀 Como Iniciar o Kibana

1. **Inicie o Kibana (se ainda não estiver rodando):**
   ```bash
   docker-compose up -d kibana
   ```

2. **Acesse o Kibana no navegador:**
   ```
   http://localhost:5601
   ```

## 📊 Configuração Inicial

### 1. Criar Data Views (Index Patterns)

O Kibana precisa de Data Views para visualizar os dados. Nas versões 8.x do Kibana, "Index Patterns" foi renomeado para "Data Views".

**Criar Data View para Exames:**

1. Acesse **Stack Management** (ícone de engrenagem no menu lateral)
2. Vá em **Kibana** > **Data Views**
3. Clique em **Create data view**
4. No campo **Name**, digite: `exams` (ou qualquer nome descritivo)
5. No campo **Index pattern**, digite: `exams` (sem asterisco, para pegar apenas o índice exams)
6. No campo **Timestamp field**, selecione: `examDate` ou `createdAt`
7. Clique em **Save data view to Kibana**

**Criar Data View para Usuários:**

1. Repita o processo acima
2. No campo **Name**, digite: `users`
3. No campo **Index pattern**, digite: `users` (sem asterisco)
4. No campo **Timestamp field**, selecione: `createdAt`
5. Clique em **Save data view to Kibana**

**Dica:** Se você usar um padrão como `example-*` ou `*`, ele vai capturar múltiplos índices. Para criar Data Views separadas, use o nome exato do índice sem asteriscos.

### 2. Explorar Dados (Discover)

1. Vá em **Discover** (ícone de lupa no menu lateral)
2. Selecione o Data View criado (no dropdown no topo)
3. Você verá todos os documentos do índice
4. Use os filtros para buscar dados específicos

## 📈 Criar Visualizações

### Exemplo: Gráfico de Exames por Tipo

1. Vá em **Visualize Library** (ícone de gráfico)
2. Clique em **Create visualization**
3. Selecione o tipo de visualização (ex: **Pie Chart**)
4. Selecione o Data View `exams`
5. Configure:
   - **Metrics**: Count
   - **Buckets**: Split slices
   - **Aggregation**: Terms
   - **Field**: `examType.keyword`
6. Clique em **Update** para ver o gráfico

### Exemplo: Timeline de Exames

1. Crie uma nova visualização do tipo **Line Chart**
2. Selecione o Data View `exams`
3. Configure:
   - **Metrics**: Count
   - **Buckets**: X-axis
   - **Aggregation**: Date Histogram
   - **Field**: `examDate`
   - **Interval**: Daily ou Weekly
4. Clique em **Update**

## 🎯 Criar Dashboards

1. Vá em **Dashboard** (ícone de painel)
2. Clique em **Create dashboard**
3. Clique em **Add** para adicionar visualizações
4. Selecione as visualizações criadas anteriormente
5. Arraste e redimensione os painéis
6. Clique em **Save** para salvar o dashboard

## 🔍 Exemplos de Visualizações Úteis

### 1. Total de Exames por Tipo
- Tipo: Pie Chart ou Bar Chart
- Agregação: Terms em `examType.keyword`

### 2. Exames ao Longo do Tempo
- Tipo: Line Chart ou Area Chart
- Agregação: Date Histogram em `examDate`

### 3. Exames por Médico (CRM)
- Tipo: Bar Chart
- Agregação: Terms em `doctorCrm.keyword`

### 4. Distribuição de Exames por Data
- Tipo: Heat Map
- Agregação: Date Histogram em `examDate`

## 💡 Dicas

- Use filtros para focar em dados específicos
- Combine múltiplas visualizações em um dashboard
- Exporte dashboards como PDF ou imagem
- Compartilhe dashboards com outros usuários
- Use o Query Language (KQL) para buscas avançadas

## 🐛 Troubleshooting

### Kibana não conecta ao Elasticsearch
- Verifique se o Elasticsearch está rodando: `docker-compose ps`
- Verifique os logs: `docker-compose logs kibana`

### Data View não encontra dados
- Verifique se os índices existem: `curl http://localhost:9200/_cat/indices?v`
- Certifique-se de que o nome do Data View está correto (deve corresponder ao nome do índice)

### Campos não aparecem
- Alguns campos podem precisar do sufixo `.keyword` para agregações
- Verifique o mapeamento: `curl http://localhost:9200/exams/_mapping?pretty`

