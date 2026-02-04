# Sprint 01 - Evidências de Implementação
## Segurança da Informação, Controle de Acesso e Gestão de Identidades

**Data:** Janeiro 2026  
**Status:** ✅ Concluído

---

## 📋 Objetivos da Sprint

A primeira sprint focou na implementação dos fundamentos técnicos da solução, com ênfase na **segurança da informação**, **controle de acesso** e **gestão de identidades**. As atividades concentraram-se na definição e implementação dos mecanismos de autenticação e autorização, assegurando que o acesso ao sistema fosse realizado de forma controlada e confiável.

---

## 🎯 Principais Entregas

### 1. ✅ Sistema de Autenticação de Usuários
### 2. ✅ Arquitetura de Segurança da Aplicação
### 3. ✅ Base Segura para Desenvolvimento Subsequente

---

## 🔐 1. Implementação do Sistema de Autenticação de Usuários

### Back-end - Endpoints de Autenticação

#### 1.1. Endpoint de Login
**Arquivo:** [`Back-end/pages/api/auth/login.ts`](../Back-end/pages/api/auth/login.ts)

**Funcionalidades implementadas:**
- ✅ Validação de credenciais (email e senha)
- ✅ Busca de usuário no Elasticsearch
- ✅ Verificação de senha com hash bcrypt
- ✅ Geração de token JWT com validade de 7 dias
- ✅ Sistema de roles (admin/user)
- ✅ Configuração CORS para permitir requisições do front-end
- ✅ Tratamento de erros e mensagens apropriadas

**Código de exemplo:**
```typescript
// Verificar senha com hash
const isValidPassword = await comparePassword(password, user.password);
if (!isValidPassword) {
  return res.status(401).json({ error: 'Credenciais inválidas' });
}

// Gerar token JWT
const token = generateToken({ userId, email: user.email, role });
```

#### 1.2. Endpoint de Registro
**Arquivo:** [`Back-end/pages/api/auth/register.ts`](../Back-end/pages/api/auth/register.ts)

**Funcionalidades implementadas:**
- ✅ Validação de dados obrigatórios (email, senha, nome, estado)
- ✅ Verificação de unicidade do email
- ✅ Hash de senha com bcrypt (10 rounds)
- ✅ Geração automática de IDs únicos
- ✅ Sistema de roles com administrador autorizado
- ✅ Armazenamento seguro no Elasticsearch
- ✅ Geração automática de token após registro

**Código de exemplo:**
```typescript
// Hash da senha antes de armazenar
const hashedPassword = await hashPassword(password);

// Definir role baseado em email autorizado
const adminEmail = 'leonardo.imbroisi@gmail.com';
const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';
```

---

## 🔒 2. Definição Inicial da Arquitetura de Segurança

### 2.1. Biblioteca de Autenticação
**Arquivo:** [`Back-end/lib/auth.ts`](../Back-end/lib/auth.ts)

**Componentes de segurança implementados:**

#### a) Gerenciamento de Tokens JWT
```typescript
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
```

**Características:**
- ✅ Token JWT com assinatura segura
- ✅ Expiração de 7 dias
- ✅ Payload contendo: userId, email, role
- ✅ Tratamento de erros na verificação

#### b) Criptografia de Senhas
```typescript
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Características:**
- ✅ Bcrypt com 10 rounds de salt
- ✅ Senhas nunca armazenadas em texto plano
- ✅ Comparação segura de hashes

### 2.2. Middleware de Autenticação
**Arquivo:** [`Back-end/middleware/auth.ts`](../Back-end/middleware/auth.ts)

**Funcionalidades implementadas:**
- ✅ Verificação automática de token JWT
- ✅ Extração de informações do usuário
- ✅ Proteção de rotas privadas
- ✅ Configuração CORS completa
- ✅ Tratamento de requisições OPTIONS (preflight)
- ✅ Mensagens de erro apropriadas

**Código de exemplo:**
```typescript
export function authenticate(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
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
```

---

## 🎨 3. Front-end - Interface de Autenticação

### 3.1. Página de Login
**Arquivo:** [`Front-end/src/pages/Login.tsx`](../Front-end/src/pages/Login.tsx)

**Funcionalidades implementadas:**
- ✅ Formulário de login responsivo
- ✅ Validação de campos obrigatórios
- ✅ Feedback visual de loading
- ✅ Tratamento de erros
- ✅ Integração com AuthContext
- ✅ Redirecionamento após login bem-sucedido
- ✅ Link para página de registro

### 3.2. Página de Registro
**Arquivo:** [`Front-end/src/pages/Register.tsx`](../Front-end/src/pages/Register.tsx)

**Funcionalidades implementadas:**
- ✅ Formulário completo de cadastro
- ✅ Seletor de estado (UF) com todos os estados brasileiros
- ✅ Validação de senha mínima (6 caracteres)
- ✅ Feedback de sucesso e erro
- ✅ Auto-login após registro
- ✅ Interface intuitiva e amigável

### 3.3. Context de Autenticação
**Arquivo:** [`Front-end/src/context/AuthContext.tsx`](../Front-end/src/context/AuthContext.tsx)

**Funcionalidades implementadas:**
- ✅ Gerenciamento global do estado de autenticação
- ✅ Persistência no localStorage
- ✅ Funções de login e logout
- ✅ Hook personalizado useAuth()
- ✅ Recuperação automática de sessão

**Código de exemplo:**
```typescript
const login = (newToken: string, newUser: User) => {
  setToken(newToken);
  setUser(newUser);
  localStorage.setItem('token', newToken);
  localStorage.setItem('user', JSON.stringify(newUser));
};

const logout = () => {
  setToken(null);
  setUser(null);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
```

---

## 🏗️ Arquitetura de Segurança Implementada

### Fluxo de Autenticação

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│  Front-end  │────────▶│   Back-end   │────────▶│ Elasticsearch│
│   (React)   │         │   (Next.js)  │         │  (Database)  │
└─────────────┘         └──────────────┘         └──────────────┘
      │                        │                         │
      │  1. Login (email/pwd)  │                         │
      │───────────────────────▶│                         │
      │                        │  2. Buscar usuário      │
      │                        │────────────────────────▶│
      │                        │                         │
      │                        │  3. Usuário encontrado  │
      │                        │◀────────────────────────│
      │                        │                         │
      │                        │  4. Verificar senha     │
      │                        │     (bcrypt.compare)    │
      │                        │                         │
      │  5. Token JWT + User   │                         │
      │◀───────────────────────│                         │
      │                        │                         │
      │  6. Armazenar token    │                         │
      │     (localStorage)     │                         │
      │                        │                         │
```

### Camadas de Segurança

1. **Camada de Transporte**
   - ✅ CORS configurado adequadamente
   - ✅ Headers de autorização padrão

2. **Camada de Autenticação**
   - ✅ JWT com assinatura HMAC
   - ✅ Tokens com expiração
   - ✅ Validação em cada requisição

3. **Camada de Dados**
   - ✅ Senhas criptografadas com bcrypt
   - ✅ Validação de unicidade de email
   - ✅ IDs únicos gerados por timestamp + random

4. **Camada de Autorização**
   - ✅ Sistema de roles (admin/user)
   - ✅ Middleware de proteção de rotas
   - ✅ Verificação de permissões

---

## 📊 Métricas de Segurança Implementadas

### Proteções Implementadas

| Proteção | Implementado | Arquivo |
|----------|--------------|---------|
| Hash de senha (bcrypt) | ✅ | `Back-end/lib/auth.ts` |
| Token JWT | ✅ | `Back-end/lib/auth.ts` |
| Middleware de autenticação | ✅ | `Back-end/middleware/auth.ts` |
| Validação de entrada | ✅ | Todos os endpoints |
| CORS configurado | ✅ | Todos os endpoints |
| Roles e permissões | ✅ | Login e Register |
| Persistência segura | ✅ | AuthContext |
| Expiração de token | ✅ | 7 dias |

### Endpoints Protegidos

Os seguintes endpoints foram preparados para utilizar o middleware de autenticação:

- ✅ `/api/exams/*` - Gerenciamento de exames
- ✅ `/api/users/*` - Gerenciamento de usuários

---

## 🧪 Testes Realizados

### Cenários de Teste - Autenticação

| Cenário | Resultado | Evidência |
|---------|-----------|-----------|
| Login com credenciais válidas | ✅ Passou | Token gerado e usuário autenticado |
| Login com senha incorreta | ✅ Passou | Retorna erro 401 "Credenciais inválidas" |
| Login com email inexistente | ✅ Passou | Retorna erro 401 "Credenciais inválidas" |
| Login sem email ou senha | ✅ Passou | Retorna erro 400 "Email e senha são obrigatórios" |
| Registro de novo usuário | ✅ Passou | Usuário criado e token gerado |
| Registro com email duplicado | ✅ Passou | Retorna erro 400 "Usuário já existe" |
| Registro sem campos obrigatórios | ✅ Passou | Retorna erro 400 com mensagem apropriada |
| Atribuição de role admin | ✅ Passou | Email autorizado recebe role admin |
| Persistência de sessão | ✅ Passou | Token mantido no localStorage |
| Logout | ✅ Passou | Token removido do localStorage |

---

## 🔍 Decisões Técnicas e Justificativas

### 1. Escolha do JWT
**Justificativa:** Tokens JWT são stateless, permitindo escalabilidade horizontal sem necessidade de sessões centralizadas. Incluem informações do usuário no payload, reduzindo consultas ao banco.

### 2. Bcrypt para Hash de Senhas
**Justificativa:** Bcrypt é resistente a ataques de força bruta devido ao seu fator de trabalho ajustável (10 rounds). É um algoritmo comprovado e amplamente utilizado.

### 3. Expiração de 7 dias
**Justificativa:** Balanço entre segurança e experiência do usuário. Tempo suficiente para uso normal sem re-autenticação frequente, mas limitado para reduzir janela de vulnerabilidade.

### 4. Elasticsearch para Armazenamento
**Justificativa:** Já utilizado no projeto para outros dados. Oferece busca rápida por email e suporta índices estruturados.

### 5. Sistema de Roles
**Justificativa:** Prepara a aplicação para controle de acesso granular. Admin autorizado pode gerenciar usuários e exames, enquanto users regulares têm acesso limitado.

---

## 📁 Estrutura de Arquivos Criados/Modificados

```
Back-end/
├── lib/
│   └── auth.ts                    # Biblioteca de autenticação ✅
├── middleware/
│   └── auth.ts                    # Middleware de proteção de rotas ✅
└── pages/
    └── api/
        └── auth/
            ├── login.ts           # Endpoint de login ✅
            └── register.ts        # Endpoint de registro ✅

Front-end/
├── src/
│   ├── context/
│   │   └── AuthContext.tsx       # Context de autenticação ✅
│   └── pages/
│       ├── Login.tsx             # Página de login ✅
│       └── Register.tsx          # Página de registro ✅
```

---

## 🚀 Base Segura Estabelecida

Ao final desta sprint, a solução passou a dispor de uma **base segura**, capaz de sustentar as etapas subsequentes de desenvolvimento:

### ✅ Fundamentos Estabelecidos

1. **Autenticação Completa**
   - Sistema de login/registro funcional
   - Gerenciamento de sessão
   - Persistência de autenticação

2. **Segurança Robusta**
   - Criptografia de senhas
   - Tokens JWT seguros
   - Middleware de proteção

3. **Controle de Acesso**
   - Sistema de roles implementado
   - Administrador autorizado
   - Base para permissões futuras

4. **Arquitetura Escalável**
   - Código modular e reutilizável
   - Separação de responsabilidades
   - Pronto para expansão

### 🎯 Próximas Sprints

A base de autenticação e segurança agora permite:
- Implementação de funcionalidades de exames protegidas
- Controle de acesso granular por tipo de usuário
- Auditoria e logs de ações
- Integração com outros serviços de forma segura

---

## 📝 Conclusão

A Sprint 01 foi concluída com **sucesso**, estabelecendo uma **base técnica sólida** para o sistema. Todos os objetivos foram alcançados:

✅ Sistema de autenticação implementado e funcional  
✅ Arquitetura de segurança robusta e escalável  
✅ Base segura para desenvolvimento futuro estabelecida  

O sistema agora possui mecanismos confiáveis de **autenticação**, **autorização** e **gestão de identidades**, cumprindo os requisitos de segurança da informação e controle de acesso definidos para esta primeira sprint.

---

**Desenvolvido por:** Leonardo Imbroisi  
**Período:** Janeiro 2026  
**Tecnologias:** Next.js, React, TypeScript, JWT, Bcrypt, Elasticsearch
