# Barbearia — Sistema de Agendamento

Sistema de agendamento de uma barbearia, construído como SPA client-side com persistência em `localStorage` simulando o backend.

## Stack

- **React 19 + TypeScript** (strict)
- **Tailwind CSS v4** (tokens de design em `src/styles.css`, paleta quente: charcoal + creme + dourado)
- **TanStack Router** (file-based routing)
- **TanStack Start** (template base — toda lógica é client-side)
- **shadcn/ui** + **lucide-react** + **sonner**
- **date-fns** (formatação `pt-BR`)
- **Vite** (bundler + dev server)

> Todas as regras de negócio rodam 100% no cliente. Persistência via `localStorage` (chave `barbearia.appointments.v1`).

---

## Pré-requisitos

- **Node.js 20+** (recomendado 22+)
- **Bun 1.2+** (gerenciador de pacotes principal — o projeto possui `bun.lock` e `bunfig.toml`)
- Ou **npm** como alternativa (sem garantia de lockfile compatível)

Para instalar o Bun:

```bash
curl -fsSL https://bun.sh/install | bash
```

---

## Como executar — desenvolvimento

```bash
# Instalar dependências
bun install

# Iniciar servidor de desenvolvimento
bun dev
```

A aplicação sobe em `http://localhost:8080` (porta configurada pelo Vite).  
Hot Module Replacement (HMR) ativo — alterações no código refletem instantaneamente.

### Comandos disponíveis

| Comando           | Descrição                                 |
| ----------------- | ----------------------------------------- |
| `bun dev`         | Inicia servidor de desenvolvimento (Vite) |
| `bun run build`   | Gera build de produção em `dist/`         |
| `bun run preview` | Servir build de produção localmente       |
| `bun run lint`    | Executa ESLint em todo o projeto          |
| `bun run format`  | Formata código com Prettier               |

---

## Rotas

| Caminho              | Descrição                                       |
| -------------------- | ----------------------------------------------- |
| `/`                  | Landing page com hero, serviços e profissionais |
| `/agendar`           | Fluxo de agendamento em 5 passos                |
| `/meus-agendamentos` | Lista de agendamentos com opção de cancelamento |

---

## Arquitetura — separação por responsabilidades

```
src/
├─ domain/
│  ├─ types.ts
│  ├─ catalog.ts
│  ├─ rules.ts
│  └─ rules/
│     ├─ rule.ts
│     ├─ engine.ts
│     ├─ rules.ts
│     ├─ overlap-utils.ts
│     ├─ professional-performs-service.ts
│     ├─ no-overlap.ts
│     ├─ business-hours.ts
│     └─ not-in-past.ts
├─ infrastructure/
│  └─ appointmentRepository.ts
├─ features/
│  ├─ booking/
│  │  └─ BookingFlow.tsx
│  └─ appointments/
│     ├─ AppointmentsList.tsx
│     └─ useAppointments.ts
├─ components/
│  ├─ SiteHeader.tsx
│  └─ ui/
├─ routes/
│  ├─ index.tsx
│  ├─ agendar.tsx
│  └─ meus-agendamentos.tsx
├─ hooks/
│  └─ use-mobile.tsx
├─ lib/
│  ├─ error-capture.ts
│  ├─ error-page.ts
│  └─ utils.ts
├─ styles.css
├─ router.tsx
├─ routeTree.gen.ts
├─ server.ts
└─ start.ts
```

### Princípios arquiteturais

- `domain/` **não importa de nenhuma outra camada** — funções puras, fáceis de testar e sem dependências de I/O.
- `infrastructure/` é a **única camada** que toca `localStorage` ou qualquer sistema externo.
- `features/` **orquestra** domínio + infra para implementar casos de uso completos.
- `routes/` **apenas monta páginas** e é responsável por SEO via `head()`.

---

## Regras de negócio — Specification Pattern

Todas as regras seguem o **Specification Pattern**: cada regra é uma função pura e independente em seu próprio arquivo, implementando a interface `BookingRule` em `src/domain/rules/rule.ts`.

### Arquitetura das regras

```
src/domain/rules/
├── rule.ts
├── engine.ts
├── rules.ts
├── overlap-utils.ts
├── professional-performs-service.ts
├── no-overlap.ts
├── business-hours.ts
└── not-in-past.ts
```

O `RulesEngine` executa as regras em sequência. A primeira que falhar interrompe e retorna `{ ok: false, reason }`. A função `canBook()` em `src/domain/rules.ts` delega para o engine, mantendo compatibilidade com o código existente.

---

## Decisões técnicas

### Persistência

- **`localStorage` com chave versionada** (`barbearia.appointments.v1`) — a versão no nome da chave permite migração futura de schema sem quebrar dados existentes.
- **Sem estado global** (Redux/Zustand/Context): o hook `useAppointments` lê e escreve direto no repositório e sincroniza múltiplas abas via `CustomEvent` + evento nativo `storage`.
- **IDs gerados com `crypto.randomUUID()`** — nativos, sem dependência extra.
- **Datas como string `YYYY-MM-DD`** e horários como `HH:mm` — formato serializável que evita timezone hell.

---

## Limpando os dados

Abra o console do navegador e execute:

```js
localStorage.removeItem("barbearia.appointments.v1");
```

Ou, para inspecionar os dados armazenados:

```js
JSON.parse(localStorage.getItem("barbearia.appointments.v1"));
```
