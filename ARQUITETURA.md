# Mochila de Itens: arquitetura e roteiro

> Mapa do projeto do começo ao fim: **onde cada coisa vai morar** e **em que ordem** vamos construir.
> Não tem código pronto aqui: quem escreve o código é o Jonas. Os nomes são uma **sugestão** e podem mudar.
>
> Criado em 30/10/2026. **Atualizado em 04/11/2026**: o back-end usa o mesmo stack do projeto do restaurante
> (Express + Zod + Knex + SQLite) e o front-end é React + Vite + Tailwind. ORM e Docker saíram do projeto.
> Objetivo: reaproveitar o que já pratiquei no restaurante e aprender um front-end moderno, com práticas de mercado.
> Marque `[x]` em cada etapa quando terminar.

---

## 1. Stack

| Parte | Tecnologias |
|---|---|
| Base | Node + TypeScript 7 (`tsx` em modo watch), ESM (`"type": "module"`, imports com `.js`), `verbatimModuleSyntax` (`import type`) |
| Domínio (fase 1) | só TypeScript, sem bibliotecas |
| Back-end (fase 2) | **Express 5**, **Zod 4**, **Knex 3 + SQLite** (driver `sqlite3`) |
| Front-end (fase 3) | **React + Vite + Tailwind** (TypeScript), consumindo a API |
| Ferramentas | Insomnia (testar a API, variável `BASE_URL`), Beekeeper Studio (ver o banco) |

As versões são conferidas na hora de começar cada fase, porque as bibliotecas mudam.

**Padrões que vêm do projeto do restaurante** (para repetir aqui):
- `server.ts` → `routes/index.ts` → arquivos de rotas → controllers (classes com `index`, `show`, `create`, `remove`...)
  com `try/catch/next`;
- middleware de erro global: `BagError` → status dele, `ZodError` → 400 com `z.flattenError`, resto → 500;
- status: 200 ok, 201 criado, 400 validação, 404 não encontrado, 409 conflito (ex.: mochila cheia), 500 inesperado;
- a mesma rota responde **sempre no mesmo formato**;
- `knexfile.ts` com `PRAGMA foreign_keys = ON` e `useNullAsDefault`; conexão em `src/database/knex.ts`;
- tipos das tabelas em arquivos `.d.ts` (`src/database/types/`), importados com `import type`;
- scripts: `npm run dev` (servidor) e `npm run knex -- <comando>` (migrations e seeds);
- imports relativos (sem `@/`); importar a **conexão** nos controllers, nunca a biblioteca `"knex"`.

---

## 2. Visão geral

```
 FASE 1                     FASE 2                                   FASE 3
 ┌──────────────┐           ┌──────────────────────────────┐         ┌──────────────────┐
 │   DOMÍNIO    │  usado →  │            API               │  ←────  │    FRONT-END     │
 │ (as regras)  │   pela    │ Express + Zod                │  fetch  │  React + Vite    │
 │              │           │                              │         │  + Tailwind      │
 │ Item, Bag... │           │ 2A: dados em memória         │         │ grade de "slots" │
 └──────────────┘           │ 2B: dados no SQLite (Knex)   │         └──────────────────┘
                            └──────────────────────────────┘
```

**Ideia central:** as **regras** (peso máximo, item não encontrado, usar poção) ficam nas classes da fase 1.
A API **não reescreve essas regras**. Em cada pedido ela faz:

1. **carregar** os dados (da memória na 2A, do banco na 2B) e montar os objetos (`Bag`, `Item`);
2. **chamar o método** da classe (`add`, `remove`, `use`), que aplica a regra ou lança um `BagError`;
3. **salvar** o resultado e responder.

Por isso a fase 2 é dividida em duas: primeiro a API funcionando em memória (2A), depois a troca da memória
pelo banco (2B). Uma coisa nova de cada vez.

---

## 3. Estrutura de pastas (onde vamos chegar)

```
mochila-de-itens/                  ← BACK-END (este projeto)
├─ package.json
├─ tsconfig.json
├─ knexfile.ts                     ← FASE 2B
├─ ARQUITETURA.md                  ← este arquivo
└─ src/
   ├─ index.ts                     ← FASE 1: laboratório de testes com console.log
   │
   ├─ domain/                      ← FASE 1: as regras (não sabe nada de Express nem de banco)
   │  ├─ types/Rarity.ts           ✅
   │  ├─ interfaces/Usable.ts
   │  ├─ items/
   │  │  ├─ Item.ts                ✅ (vai virar abstrata)
   │  │  ├─ Weapon.ts
   │  │  ├─ Potion.ts
   │  │  └─ Armor.ts
   │  ├─ bag/Bag.ts                ✅ (add, list, totalWeight, remove)
   │  └─ errors/BagError.ts        ✅
   │
   ├─ server.ts                    ← FASE 2A em diante
   ├─ routes/
   ├─ controllers/
   ├─ schemas/                     ← validações com Zod
   ├─ middlewares/                 ← tratamento de erro (BagError → status HTTP)
   ├─ data/                        ← FASE 2A: a "memória" (catálogo + mochila)
   └─ database/                    ← FASE 2B
      ├─ knex.ts                   ← a conexão
      ├─ migrations/
      ├─ seeds/
      ├─ types/                    ← tipos das tabelas (.d.ts), ex.: ItemRepository
      └─ db.sqlite                 ← o arquivo do SQLite

mochila-front/                     ← FASE 3: projeto SEPARADO (Vite + React + Tailwind), numa pasta ao lado
└─ src/
   ├─ main.tsx                     ← ponto de entrada (o Vite cria)
   ├─ App.tsx
   ├─ components/                  ← ItemSlot, BagGrid, WeightBar...
   ├─ services/api.ts              ← as chamadas fetch para a API
   └─ types/                       ← o formato das respostas da API
```

---

## 4. O modelo (classes)

```
                 ┌───────────────────────────┐
                 │   Item  (abstrata)        │
                 │ id, name, weight, rarity  │
                 │ describe()                │
                 └─────────────┬─────────────┘
                   extends     │
        ┌──────────────────────┼──────────────────────┐
 ┌──────┴──────┐        ┌──────┴──────┐        ┌──────┴──────┐
 │   Weapon    │        │   Potion    │        │   Armor     │
 │   damage    │        │   heal      │        │   defense   │
 └─────────────┘        │   use()     │        └─────────────┘
                        └──────┬──────┘
                    implements │
                        ┌──────┴──────┐
                        │  «Usable»   │  (interface)
                        │  use()      │
                        └─────────────┘

 ┌────────────────────────────────────────────┐
 │ Bag                                        │
 │ maxWeight   (readonly)                     │
 │ items: Item[] (private)                    │
 │ add(item) / remove(id) / list()            │
 │ totalWeight() / use(id)                    │
 └────────────────────────────────────────────┘
```

| Método | Recebe | Devolve | Quando dá erro |
|---|---|---|---|
| `add` | UM item | nada (`void`) | se passar do peso máximo |
| `remove` | UM id | o item removido | se o id não existir |
| `list` | nada | uma LISTA | nunca (lista vazia é normal) |
| `totalWeight` | nada | um número | nunca (mochila vazia = 0) |
| `use` | UM id | o efeito/mensagem | id não existe **ou** item não é usável |

---

## 5. O banco (fase 2B)

```
 items (catálogo)                 bags                        bag_items
 ┌──────────────────────┐         ┌──────────────────┐        ┌────────────────────────┐
 │ id                   │         │ id               │        │ id                     │
 │ name                 │         │ max_weight       │        │ bag_id   → bags.id     │
 │ weight               │         └──────────────────┘        │ item_id  → items.id    │
 │ rarity               │                                     └────────────────────────┘
 │ type (weapon/potion/ │
 │       armor)         │
 │ damage  (ou null)    │
 │ heal    (ou null)    │
 │ defense (ou null)    │
 └──────────────────────┘
```

- **`items`**: o catálogo do jogo, ou seja, todos os itens que existem.
- **`bags`**: as mochilas. Por enquanto vai existir só uma.
- **`bag_items`**: quais itens estão em qual mochila. Cada linha = **um item dentro de uma mochila**
  (as mochilas cheias crescem em **linhas**, e não em colunas).
- O **peso total não é guardado** no banco: ele é **calculado** pelo `totalWeight()`.
- Os 3 tipos de item ficam na **mesma tabela**, com a coluna `type`. As colunas específicas de cada tipo
  ficam `null` nos outros tipos (ex.: uma poção tem `damage` = `null`).

**Decisão para a fase 2B:** quando o banco entrar, o `remove` e o `use` vão receber o `id` de qual tabela?
(Pista: se a mesma poção estiver 2 vezes na mochila, o `id` do catálogo é igual nas duas.)

---

## 6. Roteiro

Cada etapa tem **um conceito novo no máximo**. Só passe para a próxima quando os testes da etapa passarem.

### ✅ Etapa 0: preparar o projeto
- [x] `package.json` com `"type": "module"` e script `dev`
- [x] `typescript`, `tsx`, `@types/node`
- [x] `tsconfig.json`
- [x] `src/index.ts` imprimindo "mochila funcionando"

---

### FASE 1: só TypeScript e POO (sem servidor)

| # | Etapa | Conceito novo |
|---|---|---|
| 1 | [x] Classe `Item` (id, name, weight) | revisão: `class`, `constructor`, `this` |
| 2 | [x] Separar em arquivos | `export` / `import` com `.js` |
| 3 | [x] Tipo `Rarity` | **união de tipos** |
| 4 | [x] `Bag` com `add` e `list` | método, lista de objetos (`Item[]`) |
| 5 | [x] `totalWeight` | loop `for...of`, acumulador |
| 6 | [x] Peso máximo + erro ao passar do limite | `throw` + `try/catch`, método chamando método |
| 7 | [x] `BagError` | **herança** com `extends Error`, `super`, `instanceof` |
| 8 | [x] `remove(id)` | `find`, `filter`, callback |
| 9 | [ ] Proteger a lista da mochila | **encapsulamento**: `private`, `readonly` |
| 10 | [ ] `Weapon`, `Potion`, `Armor` herdando de `Item` | **herança** entre as suas classes |
| 11 | [ ] Tornar `Item` abstrato | **classe abstrata** |
| 12 | [ ] `describe()` diferente em cada item | **polimorfismo** |
| 13 | [ ] Interface `Usable` na `Potion` | **interface**, `implements` |
| 14 | [ ] `bag.use(id)`: a poção some depois de usada | **narrowing** |
| 15 | [ ] Revisão final da fase 1 | checklist da seção 7 |
| 16 | [ ] *(opcional)* um método genérico | **generics** |

---

### FASE 2A: API com Express + Zod (dados em memória)

| # | Etapa | Conceito novo |
|---|---|---|
| 17 | [ ] Instalar Express, Zod e os tipos; ajustar o `"types"` do `tsconfig`; criar o `server.ts` | (já conhecido) |
| 18 | [ ] `data/`: um catálogo de itens e **uma** mochila em memória | dados em memória |
| 19 | [ ] `GET /items` (catálogo) | (já conhecido) |
| 20 | [ ] `GET /bag` → itens + peso total + peso máximo | formato de resposta fixo |
| 21 | [ ] `POST /bag/items` (body com o id do catálogo) | Zod no body |
| 22 | [ ] `DELETE /bag/items/:id` | (já conhecido) |
| 23 | [ ] `POST /bag/items/:id/use` | (já conhecido) |
| 24 | [ ] Middleware de erro: `BagError` → 409/404, Zod → 400, outros → 500 | erro do domínio → status HTTP |
| 25 | [ ] Revisão da API | tabela de testes (status + resposta) |

**Regra da fase 2:** o controller **não** calcula peso nem decide se pode adicionar. Quem decide é a `Bag`.

---

### FASE 2B: trocar a memória pelo SQLite (Knex)

| # | Etapa | Conceito novo |
|---|---|---|
| 26 | [ ] Instalar Knex e o `sqlite3`, criar o `knexfile.ts` (com `foreign_keys = ON`), a conexão e o script `knex` | (já conhecido) |
| 27 | [ ] Migration `items` (catálogo, com `type` e as colunas específicas) | colunas que aceitam `null` |
| 28 | [ ] Migrations `bags` e `bag_items` (chaves estrangeiras) | (praticado no restaurante) |
| 29 | [ ] Seeds: o catálogo + uma mochila (+ tipos `.d.ts` das tabelas) | (praticado no restaurante) |
| 30 | [ ] `GET /items` lendo do banco | transformar linha do banco em objeto (`Weapon`, `Potion`...) |
| 31 | [ ] `GET /bag`: `join` de `bag_items` com `items` e montar a `Bag` | carregar → montar objetos |
| 32 | [ ] `POST /bag/items`: carregar a `Bag`, chamar `add` (a regra) e salvar em `bag_items` | carregar → regra → salvar |
| 33 | [ ] `DELETE` e `use` no mesmo esquema | (repetição) |
| 34 | [ ] Revisão: reiniciar o servidor e os dados continuam lá | |

---

### FASE 3: front-end com React + Vite + Tailwind

Projeto separado (`mochila-front/`). Quase tudo é conceito novo, então os passos serão ainda menores
e sempre com exemplo antes.

| # | Etapa | Conceito novo |
|---|---|---|
| 35 | [ ] Criar o projeto (Vite + React + TS) e rodar a página inicial | Vite |
| 36 | [ ] Instalar o Tailwind e estilizar um elemento de teste | classes utilitárias |
| 37 | [ ] Primeiro componente: um slot mostrando um item fixo | componente, JSX, props |
| 38 | [ ] Grade de slots com uma lista fixa | `.map()` no JSX, `key` |
| 39 | [ ] Liberar CORS na API | CORS |
| 40 | [ ] `services/api.ts` + buscar a mochila da API | `fetch`, `useState`, `useEffect` |
| 41 | [ ] Barra de peso (atual / máximo) | estado derivado |
| 42 | [ ] Botões: adicionar do catálogo, remover, usar | eventos, atualizar a tela após a ação |
| 43 | [ ] Mostrar erros da API (ex.: "mochila cheia") e "carregando" | estado de erro / carregando |
| 44 | [ ] Revisão do front: layout responsivo, componentes organizados | boas práticas |

**Fora do escopo:** itens empilháveis, equipar itens, arrastar e soltar, vários jogadores, login.

---

## 7. Checklist de testes (usar em TODA etapa)

- [ ] **Caso normal**
- [ ] **Lista vazia**: mochila sem nada (listar, peso total, remover, usar)
- [ ] **Não existe**: id que não está na mochila
- [ ] **No limite**: peso exatamente igual ao máximo (pode) e 1 acima (não pode)
- [ ] **Tipo errado**: usar um item que não é usável
- [ ] **Mensagem certa**: o texto do erro/sucesso combina com a ação?
- [ ] **Formato da resposta** (fase 2): sempre o mesmo formato na mesma rota?
- [ ] **Persistência** (fase 2B): reiniciei o servidor e os dados continuam?

Anotar o resultado numa tabela: `caso → esperado → o que aconteceu`.

---

## 8. Como vamos trabalhar

1. **Objetivo primeiro:** cada etapa começa dizendo **o que o código precisa fazer** (recebe, devolve, quando dá erro).
2. **Direto ao ponto:** nomear o conceito e a ferramenta (método, loop, `find`...). Metáforas só quando eu pedir.
3. **Conceito novo = exemplo com outros dados primeiro**, depois eu faço o meu.
4. **Sem código pronto**: só quando eu pedir ou travar de vez (explicado pedaço por pedaço).
5. **Um passo pequeno, depois testar.**
6. **Conferir imports** que o editor coloca sozinho.
7. **Nomes que dizem a verdade**: `item` guarda UM item, `items` guarda a LISTA.
8. Quando o TypeScript reclamar, copiar a mensagem inteira e pedir tradução.
