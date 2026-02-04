# +Salute — Plataforma de Saúde Integral (Versão 1.0)

Este canvas resume o sistema localizado em `02-projeto`, cobrindo contexto, hipóteses, objetivos e backlog com base no código fonte e documentação (`README.md`, `ELASTICSEARCH_ACCESS.md`, `KIBANA_GUIDE.md`).

---

## Análise de Contexto

O cenário atual da saúde possui dados clínicos dispersos em múltiplos sistemas com baixa interoperabilidade. Pacientes e profissionais enfrentam dificuldade em consolidar histórico de exames e consultas, o que impacta a continuidade do cuidado e a tomada de decisão baseada em evidências.

O projeto +Salute propõe uma plataforma digital centralizada para gestão de dados de saúde, com armazenamento em Elasticsearch e visualização via Kibana, oferecendo filtros, busca cronológica e estruturação dos dados para uso futuro de IA.

Referências técnicas:
- Back-end (`Next.js + TypeScript`): `02-projeto/Back-end/`
- Front-end (`React + Vite + TypeScript`): `02-projeto/Front-end/`
- Banco de dados (`Elasticsearch`): `docker-compose.yml` e guias de acesso
- Visualização (`Kibana`): `KIBANA_GUIDE.md`

---

## Personas

- Paciente adulto que utiliza diferentes serviços de saúde e precisa acessar seu histórico completo de exames de forma simples e segura.
- Profissional de saúde que deseja consultar exames com filtros por período, tipo e data, visando decisões mais rápidas e embasadas.
- Administrador do sistema que gerencia usuários e monitora o uso, garantindo conformidade e segurança.

---

## Premissas e Restrições

- O paciente é dono dos dados; controle de acesso via JWT e roles (admin/usuário).
- Interoperabilidade via APIs REST no back-end (`/api/auth`, `/api/users`, `/api/exams`).
- Conformidade com LGPD: segurança, privacidade e segregação por usuário (cada usuário gerencia apenas seus dados).
- Dependências: Docker (Elasticsearch/Kibana), Node.js 18+, ambiente `development`.
- Custos e desempenho: índices otimizados em Elasticsearch; visualização opcional em Kibana.

---

## Backlog

Funcionalidades já implementadas (MVP):
- Autenticação e cadastro de usuários (`/api/auth/register`, `/api/auth/login`).
- Roles e controle de acesso (lista de usuários restrita ao admin).
- Gestão de exames:
  - Upload de PDF com extração automática de texto.
  - Cadastro manual de dados de exames.
  - Listagem com paginação, filtros por tipo, data específica e intervalo.
  - Visualização detalhada e exclusão com confirmação.
  - Análise de exames por IA (campo `aiAnalysis` e `aiAnalyzedAt`).
- Armazenamento centralizado em índices `users` e `exams` do Elasticsearch.
- Integração com Kibana para dashboards e insights.

Próximas evoluções (propostas):
- Importação por lote e integração com clínicas/laboratórios via APIs.
- Gestão de consentimento e trilhas de auditoria.
- Catálogo de tipos de exames e normalização semântica.
- Notificações e compartilhamento seguro de laudos.
- Módulo de predição de diagnósticos com IA (modelo supervisionado e explainability).

---

## Benefícios e Justificativas

- Histórico clínico consolidado por paciente, reduzindo fragmentação.
- Base para decisão clínica apoiada por dados e visualizações (Kibana).
- Redução de erros e redundâncias em exames; ganho de produtividade.
- Fundamento para evolução de IA preditiva (campos e estrutura já preparados).

---

## Hipóteses

- Usuários conseguem centralizar e consultar seus exames com menor tempo e maior confiança quando há filtros e ordenação cronológica.
- Profissionais tomam decisões mais rápidas com acesso a histórico e visualizações.
- A estrutura em Elasticsearch facilita análises e futuras integrações com IA.

---

## Objetivo S.M.A.R.T

Desenvolver e operar, em até 12 meses, uma plataforma capaz de:
- Centralizar o histórico de exames por usuário, com autenticação segura.
- Oferecer filtros e visualização detalhada de exames com tempo de resposta sub-1s para consultas típicas.
- Disponibilizar dashboards no Kibana para indicadores operacionais e clínicos.
- Preparar dados e APIs para integração com módulo de IA preditiva.

Métricas de sucesso (exemplos):
- ≥ 95% de consultas com latência < 1s.
- ≥ 80% de usuários ativos usando filtros de data/tipo semanalmente.
- 100% dos exames com metadados mínimos (`examType`, `examDate`, `doctorCrm`).

---

## Área de Experimentação

Ambiente local com Docker Compose para Elasticsearch e Kibana, back-end Next.js na porta `3001` e front-end Vite na porta `3000`. Exploração de dados em `Discover` e construção de dashboards no Kibana conforme `KIBANA_GUIDE.md`.

---

## Resultado (Esperado)

- Melhoria na qualidade da assistência pela consolidação do histórico.
- Diagnósticos mais rápidos e redução de custos operacionais.
- Base para medicina preditiva e evolução contínua do modelo.

---

## Solução (Arquitetura)

- Front-end: React + Vite + TS, autenticação via Context API, rotas protegidas e componentes de filtro.
- Back-end: Next.js + TS, rotas REST em `pages/api`, middleware de autenticação com JWT.
- Banco: Elasticsearch (índices `users` e `exams`), mapeamentos com campos de IA.
- Observabilidade: Kibana para data views, dashboards e análises.

Arquivos-chave:
- `02-projeto/Back-end/lib/elasticsearch.ts` (client e inicialização de índices)
- `02-projeto/Back-end/middleware/auth.ts` (auth/JWT e CORS)
- `02-projeto/Back-end/pages/api/exams/*` (upload, manual, listagem, análise)
- `02-projeto/Front-end/src/services/api.ts` (consumo da API)

---

## Lições Aprendidas

- Integração e interoperabilidade são desafios centrais; padronização de campos é essencial.
- Segurança e privacidade exigem atenção contínua (LGPD, controle de acesso por usuário/role).
- O valor está na continuidade do histórico ao longo da vida e na estruturação para IA.

---

## Como Executar (resumo)

```bash
# Subir banco e visualização
cd 02-projeto
docker-compose up -d

# Back-end
cd Back-end
npm install
cp env.example .env   # ajustar JWT_SECRET
npm run dev           # http://localhost:3001

# Front-end
cd ../Front-end
npm install
npm run dev           # http://localhost:3000
```

Para explorar dados e dashboards, consulte `ELASTICSEARCH_ACCESS.md` e `KIBANA_GUIDE.md`.
