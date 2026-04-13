# Prontuário Eletrônico - Backend

## 📋 Descrição

Backend de um sistema de **Prontuário Eletrônico** desenvolvido como projeto integrador. O sistema possibilita o gerenciamento completo de informações de pacientes, incluindo prescrições, cuidados, medicamentos e relatórios médicos em ambiente hospitalar.

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web para criação de APIs REST
- **MySQL** - Banco de dados relacional
- **BCrypt** - Autenticação e criptografia de senhas
- **Express-Session** - Gerenciamento de sessões
- **CORS** - Compartilhamento de recursos entre origens
- **Body-Parser** - Parsing de requisições HTTP
- **Dotenv** - Gerenciamento de variáveis de ambiente
- **Nodemon** - Ferramenta de desenvolvimento (recarregamento automático)

---

## ✨ Funcionalidades

### Autenticação e Autorização
- Login de usuários com autenticação segura
- Criptografia de senhas com BCrypt
- Sistema de sessões para manter usuários autenticados
- Verificação de login e autorização de acesso

### Gerenciamento de Usuários
- Criar, ler, atualizar e deletar usuários
- Controle de diferentes tipos de usuários (pacientes, médicos, enfermeiros)

### Gerenciamento de Pacientes
- Cadastro e atualização de informações de pacientes
- Vinculação de pacientes a setor de atendimento
- Consulta de histórico de pacientes

### Prescrições Médicas
- Criação e gerenciamento de prescrições
- Associação de medicamentos às prescrições
- Controle de prescrições por paciente

### Medicamentos
- Cadastro de medicamentos
- Gerenciamento de informações farmacêuticas
- Consulta de medicamentos disponíveis

### Cuidados
- Registro de cuidados prestados aos pacientes
- Vinculação de cuidados aos pacientes
- Rastreamento de histórico de cuidados

### Setores e Organização
- Gerenciamento de setores do hospital
- Organização de pacientes por setores

### Relatórios
- Geração de relatórios com base em dados de pacientes
- Consulta de histórico médico

---

## 📦 Repositórios Relacionados

Este projeto faz parte de um sistema integrado e **depende de dois outros repositórios** para funcionar completamente:

### 1. **Frontend** (Interface do Usuário)
- Repositório: [PI-prontuario-eletronico](https://github.com/eduardoberettarod/PI-prontuario-eletronico)
- Descrição: Interface web para acesso ao sistema

### 2. **Documentação e Banco de Dados** ⚠️ **OBRIGATÓRIO**
- Repositório: [documentacao-prontuario-eletronico](https://github.com/eduardoberettarod/documentacao-prontuario-eletronico)
- Descrição: Contém a estrutura do banco de dados MySQL e documentação do projeto

> **Nota Importante**: O repositório de documentação é **essencial** para o funcionamento do backend, pois contém o schema do banco de dados.

---

## 🚀 Como Utilizar o Projeto

### Pré-requisitos

- **Node.js** (versão 14 ou superior)
- **npm** ou **yarn**
- **MySQL** instalado e rodando localmente
- **Git**

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/eduardoberettarod/PI-prontuario-eletronico-backend.git
cd PI-prontuario-eletronico-backend
```

### Passo 2: Instalar Dependências

```bash
npm install
```

### Passo 3: Configurar o Banco de Dados

1. Clone o repositório de documentação:
   ```bash
   git clone https://github.com/eduardoberettarod/documentacao-prontuario-eletronico.git
   ```

2. Acesse o repositório de documentação e siga as instruções para criar o banco de dados:
   ```bash
   cd documentacao-prontuario-eletronico
   ```

3. Execute o arquivo de schema do banco de dados no MySQL para criar as tabelas

### Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Banco de Dados
HOST=localhost
USER=root
PASSWORD=sua_senha_do_mysql
NOME_BANCO=bd_prontuario_eletronico

# Servidor
PORT=3000
PORTA=3000

# Sessão
SESSION_SECRET=sua_chave_secreta_aqui

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

> **Ajuste os valores de acordo com sua configuração local de MySQL**

### Passo 5: Executar o Backend

**Modo de desenvolvimento (com recarregamento automático):**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O servidor iniciará na porta especificada nas variáveis de ambiente (padrão: `3000`)

### Passo 6: Executar o Frontend

Clone e configure o repositório do frontend conforme suas instruções:
```bash
git clone https://github.com/eduardoberettarod/PI-prontuario-eletronico.git
```

---

## 📁 Estrutura do Projeto

```
.
├── server.js                 # Arquivo principal do servidor Express
├── conexao.js               # Configuração de conexão com MySQL
├── package.json             # Dependências e scripts do projeto
├── .env.example             # Exemplo de variáveis de ambiente
├── middlewares/             # Middlewares customizados
│   ├── autorizar.js        # Autorização de acesso
│   └── verificarLogin.js   # Verificação de login
└── routes/                  # Rotas da API
    ├── auth.js             # Autenticação
    ├── usuarios.js         # Gerenciamento de usuários
    ├── pacientes.js        # Gerenciamento de pacientes
    ├── medicamentos.js     # Gerenciamento de medicamentos
    ├── prescricoes.js      # Gerenciamento de prescrições
    ├── cuidados.js         # Gerenciamento de cuidados
    ├── pacienteCuidados.js # Relação paciente x cuidados
    ├── setores.js          # Gerenciamento de setores
    ├── relatorios.js       # Geração de relatórios
    ├── registro.js         # Registro de atividades
    └── teste.js            # Rotas de teste
```

---

## 🔌 Endpoints Principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Autenticação de usuário |
| GET/POST | `/usuarios` | Gerenciar usuários |
| GET/POST | `/pacientes` | Gerenciar pacientes |
| GET/POST | `/medicamentos` | Gerenciar medicamentos |
| GET/POST | `/prescricoes` | Gerenciar prescrições |
| GET/POST | `/cuidados` | Gerenciar cuidados |
| GET/POST | `/setores` | Gerenciar setores |
| GET | `/relatorios` | Gerar relatórios |
| GET/POST | `/paciente-cuidados` | Relações paciente-cuidados |


---

## 🔐 Segurança

- Senhas criptografadas com **BCrypt**
- Sistema de **sessões** para autenticação
- **CORS** configurado para aceitar requisições apenas do frontend autorizado
- **Middlewares** de autenticação e autorização nas rotas protegidas

---

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento com nodemon

---

## 🐛 Troubleshooting

### Erro: "Deu ruim na conexão"
- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo `.env`
- Verifique se o banco de dados foi criado corretamente

### Erro: "CORS error"
- Certifique-se de que a variável `FRONTEND_URL` está correta no `.env`
- Verificar se o frontend está rodando na URL especificada

### Erro: "PORT já está em uso"
- Mude a porta na variável `PORT` do `.env`
- Ou termine o processo que está using a porta

---

## 👨‍💻 Autor

Eduardo Rodrigues de Almeida Beretta-

---

## 📄 Licença

ISC

---

## 🔗 Links Úteis

- **Frontend**: https://github.com/eduardoberettarod/PI-prontuario-eletronico
- **Documentação e BD**: https://github.com/eduardoberettarod/documentacao-prontuario-eletronico
- **Issues**: https://github.com/eduardoberettarod/PI-prontuario-eletronico-backend/issues

---

**Desenvolvido como projeto integrador** 🎓
