# AdoteJá

API de um sistema de adoção de animais. O projeto foi desenvolvido com foco na aplicação de fundamentos sólidos de engenharia de software, como **Clean Architecture**, **Domain-Driven Design (DDD)** e **Test-Driven Development (TDD)**, visando a criação de um código desacoplado, manutenível, escalável e altamente testável.

## Configuração do Ambiente de Desenvolvimento

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

- Node.js (v22.0.0 ou superior)
- pnpm (v10 ou superior)
- Docker e Docker Compose

**Configure as variáveis de ambiente:**

- Crie um arquivo `.env` na raiz do projeto, com base no arquivo `.env.example`.
- Preencha as variáveis de ambiente com os valores corretos para o seu ambiente. Exemplo:

```
DATABASE_URL=postgresql:/user:password@localhost:5432/adoteja
JWT_ACCESS_TOKEN_SECRET=secret1
JWT_REFRESH_TOKEN_SECRET=secret2
REDIS_URL=redis:/default:passwordredis@localhost:6379/0
REDIS_TTL_SECONDS=60
```

**Atualize o schema do Prisma:**

```bash
npx prisma db push
```

**Inicie os containers e o servidor:**

```bash
docker-compose up -d

npm run dev
```

## Estrutura em camadas

```
├── docs/             → Documentação gerada com Swagger
├── src/
│   ├── application/  → Casos de uso
│   ├── domain/       → Entidades e value objects
│   ├── infra/        → Infraestrutura
│   ├── app.ts        → Composition Root
│   └── main.ts       → Ponto de entrada da aplicação
└── tests/            → Testes unitários e de integração
```

## Tecnologias Utilizadas

- **Node.js**
- **TypeScript**
- **Express.js**
- **Prisma**
- **PostgreSQL**
- **Docker**
- **Redis**
- **Vitest**
- **Zod**
- **Multer**
- **JSON Web Token (JWT)**
- **Swagger**

## Cache

Para otimizar a performance e reduzir a carga sobre o banco de dados, a aplicação utiliza uma estratégia de cache com **Redis**. Consultas frequentes e de alto custo são armazenadas em cache, garantindo tempos de resposta mais rápidos para os usuários.

## Testes Automatizados

A qualidade do software é garantida por uma suíte de testes robusta.

Conta com **mais de 200 testes automatizados** que cobrem todas as camadas da aplicação, alcançando uma **cobertura de código superior a 95%**.

**Rodar todos os testes**

```bash
npm run test
```

## Documentação com Swagger

A documentação completa da API pode ser acessada em http://localhost:8080/docs
