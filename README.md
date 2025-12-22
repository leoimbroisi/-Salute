# Sistema de Gestão de Dados de Saúde

Sistema completo para gestão e centralização de dados clínicos, desenvolvido para resolver problemas de fragmentação e falta de interoperabilidade entre sistemas de saúde.

## 🏗️ Arquitetura

- **Front-end**: React + TypeScript + Vite
- **Back-end**: Next.js + TypeScript
- **Banco de Dados**: Elasticsearch

## 📋 Funcionalidades

### Autenticação e Usuários
- ✅ Autenticação (Login e Cadastro de usuários)
- ✅ Sistema de roles (Administrador/Usuário)
- ✅ Listagem de usuários (apenas para administradores)
- ✅ Controle de acesso baseado em permissões

### Gestão de Exames
- ✅ Upload de PDF com extração automática de texto
- ✅ Cadastro manual de dados de exame
- ✅ Listagem de exames com paginação
- ✅ Filtros por tipo de exame
- ✅ Filtros por data específica
- ✅ Filtros por período de datas (data inicial e final)
- ✅ Visualização detalhada de exames
- ✅ Exclusão de exames com confirmação
- ✅ Ordenação por data de exame (mais recentes primeiro)
- ✅ Armazenamento centralizado no Elasticsearch

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose instalados

### 1. Iniciar Elasticsearch

**Importante**: Certifique-se de que o Docker Desktop está rodando antes de executar o comando abaixo.

```bash
docker-compose up -d
```

Isso iniciará o Elasticsearch na porta 9200.

**Nota**: Se você receber um erro sobre o Docker daemon não estar rodando, inicie o Docker Desktop primeiro.

### 2. Configurar Back-end

```bash
cd Back-end
npm install
```

Crie um arquivo `.env` na pasta `Back-end`:

```
ELASTICSEARCH_URL=http://localhost:9200
JWT_SECRET=sua-chave-secreta-aqui
NODE_ENV=development
```

Inicie o servidor:

```bash
npm run dev
```

O back-end estará rodando em `http://localhost:3001`

### 3. Configurar Front-end

Em um novo terminal:

```bash
cd Front-end
npm install
npm run dev
```

O front-end estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
02-projeto/
├── Back-end/          # API Next.js
│   ├── pages/
│   │   └── api/       # Endpoints da API
│   ├── lib/           # Bibliotecas e utilitários
│   └── middleware/    # Middlewares de autenticação
├── Front-end/         # Aplicação React
│   ├── src/
│   │   ├── pages/     # Páginas da aplicação
│   │   ├── components/# Componentes reutilizáveis
│   │   ├── context/   # Context API para autenticação
│   │   └── services/ # Serviços de API
└── docker-compose.yml # Configuração do Elasticsearch
```

## 🔌 Endpoints da API

### Autenticação

- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login

### Usuários

- `GET /api/users` - Listar usuários (requer autenticação e role de administrador)

### Exames

- `GET /api/exams` - Listar exames do usuário autenticado (requer autenticação)
  - Query params: `page`, `pageSize`, `examType`, `examDate`, `startDate`, `endDate`
- `GET /api/exams/[id]` - Obter detalhes de um exame específico (requer autenticação)
- `POST /api/exams/upload` - Upload de PDF (requer autenticação)
- `POST /api/exams/manual` - Cadastro manual de exame (requer autenticação)
- `DELETE /api/exams/[id]` - Excluir um exame (requer autenticação)

## 📝 Formato de Dados

### Cadastro Manual de Exame

```json
{
  "doctorCrm": "CRM-123456",
  "examDate": "2024-01-15",
  "examType": "Hemograma",
  "examData": "Dados completos do exame..."
}
```

### Upload de PDF

O PDF é enviado como base64 no body:

```json
{
  "pdfBase64": "base64_string_here",
  "doctorCrm": "CRM-123456",
  "examDate": "2024-01-15",
  "examType": "Raio-X"
}
```

## 🔒 Autenticação e Permissões

O sistema usa JWT (JSON Web Tokens) para autenticação. Após o login, o token deve ser enviado no header:

```
Authorization: Bearer <token>
```

### Sistema de Roles

O sistema possui dois tipos de usuários:

- **Administrador**: Acesso completo ao sistema, incluindo visualização de todos os usuários
  - Email autorizado: `leonardo.imbroisi@gmail.com`
- **Usuário**: Acesso às funcionalidades de exames (listar, criar, visualizar e excluir seus próprios exames)

### Controle de Acesso

- A lista de usuários (`/users`) é acessível apenas para administradores
- Cada usuário pode visualizar e gerenciar apenas seus próprios exames
- Tentativas de acesso não autorizado resultam em redirecionamento ou erro 403

## 🛠️ Tecnologias Utilizadas

### Front-end
- **React 18**: Biblioteca para construção da interface
- **TypeScript**: Tipagem estática
- **Vite**: Build tool e servidor de desenvolvimento
- **React Router**: Roteamento de páginas
- **Axios**: Cliente HTTP para comunicação com API
- **Context API**: Gerenciamento de estado de autenticação

### Back-end
- **Next.js 14**: Framework para o back-end
- **TypeScript**: Tipagem estática
- **Elasticsearch 8.11**: Banco de dados NoSQL
- **pdf-parse**: Extração de texto de PDFs
- **bcryptjs**: Hash de senhas
- **jsonwebtoken**: Geração e validação de tokens JWT
- **Kibana 8.11**: Visualização e análise de dados (opcional)

## 📊 Índices do Elasticsearch

O sistema cria automaticamente dois índices:

1. **users**: Armazena dados de usuários
   - Campos: `email`, `name`, `password`, `role`, `createdAt`
2. **exams**: Armazena dados de exames
   - Campos: `userId`, `doctorCrm`, `examDate`, `examType`, `examData`, `pdfContent`, `createdAt`

## 🎨 Interface do Usuário

### Componentes Principais

- **Logo personalizado**: Logo do sistema com cruz médica e linha de ECG
- **DatePicker customizado**: Seletor de data com calendário visual
- **Tabela de exames**: Listagem paginada com filtros avançados
- **Modais**: Visualização de detalhes e confirmação de exclusão
- **Navbar responsiva**: Navegação adaptada baseada no role do usuário

### Filtros Disponíveis

- **Por tipo de exame**: Dropdown com tipos únicos
- **Por data específica**: Seleção de uma data única
- **Por período**: Seleção de data inicial e final para busca em intervalo

## 🐛 Troubleshooting

### Elasticsearch não inicia

Verifique se a porta 9200 está disponível:

```bash
lsof -i :9200
```

### Erro de conexão com Elasticsearch

Certifique-se de que o Docker Compose está rodando:

```bash
docker-compose ps
```

### Erro CORS no front-end

O proxy está configurado no `vite.config.ts`. Certifique-se de que o back-end está rodando na porta 3001.

### Acesso negado na lista de usuários

Apenas o email `leonardo.imbroisi@gmail.com` tem permissão de administrador. Se você já tinha uma conta antes da implementação de roles, faça logout e login novamente para que o sistema atualize seu perfil.

### Kibana (Visualização de Dados)

O sistema inclui Kibana para visualização e análise de dados. Após iniciar o Docker Compose, acesse:

```
http://localhost:5601
```

Consulte o arquivo `KIBANA_GUIDE.md` para instruções detalhadas sobre como criar dashboards e visualizações.

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

