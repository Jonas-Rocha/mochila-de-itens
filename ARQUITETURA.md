# Mochila de Itens: arquitetura e roteiro

> Mapa do projeto do começo ao fim. Ele mostra **onde cada coisa vai morar** e **em que ordem** vamos construir.
> Não tem código pronto aqui: quem escreve o código é o Jonas. Os nomes de classes e métodos são uma **sugestão**
> e podem mudar no caminho.
>
> Criado em 30/10/2026. Marque `[x]` em cada etapa quando terminar.

---

## 1. Visão geral

```
 FASE 1                     FASE 2                         FASE 3
 ┌──────────────┐           ┌──────────────────────┐       ┌──────────────────────┐
 │   DOMÍNIO    │  usado →  │         API          │  ←──  │      FRONT-END       │
 │ (as regras)  │   pela    │ Express + Zod        │ fetch │ React + Tailwind     │
 │ Item, Mochila│           │ dados em memória     │       │ grade de "slots"     │
 └──────────────┘           └──────────────────────┘       └──────────────────────┘
                                                            FASE 4: banco (ORM) + Docker
```

**Ideia central:** as **regras do jogo** (peso máximo, usar poção etc.) ficam nas classes da fase 1.
A API (fase 2) **não reescreve essas regras**: ela só recebe o pedido, chama a mochila e devolve a resposta.

> Analogia: o domínio é o **cozinheiro**, que sabe fazer o prato. A API é o **garçom**, que leva o pedido até
> a cozinha e traz o prato. O front-end é o **cardápio na mesa**. O garçom não cozinha.

---

## 2. Estrutura de pastas (onde vamos chegar)

```
mochila-de-itens/
├─ package.json
├─ tsconfig.json
├─ ARQUITETURA.md                ← este arquivo
└─ src/
   ├─ index.ts                   ← FASE 1: "laboratório" de testes com console.log
   │
   ├─ dominio/                   ← FASE 1: as regras (não sabe nada de Express)
   │  ├─ tipos/
   │  │  └─ Raridade.ts          ← "comum" | "raro" | "epico"
   │  ├─ interfaces/
   │  │  └─ Usavel.ts            ← contrato "itens que podem ser usados"
   │  ├─ itens/
   │  │  ├─ Item.ts              ← classe base (abstrata)
   │  │  ├─ Arma.ts
   │  │  ├─ Pocao.ts
   │  │  └─ Armadura.ts
   │  ├─ mochila/
   │  │  └─ Mochila.ts
   │  └─ erros/
   │     └─ MochilaError.ts
   │
   ├─ server.ts                  ← FASE 2 em diante
   ├─ routes/
   ├─ controllers/
   ├─ schemas/                   ← validações com Zod
   ├─ middlewares/               ← tratamento de erro
   └─ dados/                     ← a "memória" da API (catálogo + mochila)

mochila-front/                   ← FASE 3: projeto SEPARADO, numa pasta ao lado
```

Por que `dominio/` desde o começo? Para que na fase 2 a gente **não precise mover nada**:
o `server.ts` e as rotas só vão importar o que já existe.

---

## 3. O modelo (as classes e o que cada uma sabe)

```
                 ┌───────────────────────────┐
                 │   Item  (abstrata)        │
                 │ id, nome, peso, raridade  │
                 │ descrever()               │
                 └─────────────┬─────────────┘
                   extends     │
        ┌──────────────────────┼──────────────────────┐
 ┌──────┴──────┐        ┌──────┴──────┐        ┌──────┴──────┐
 │   Arma      │        │   Pocao     │        │  Armadura   │
 │   dano      │        │   cura      │        │   defesa    │
 └─────────────┘        │   usar()    │        └─────────────┘
                        └──────┬──────┘
                    implements │
                        ┌──────┴──────┐
                        │  «Usavel»   │  (interface)
                        │  usar()     │
                        └─────────────┘

 ┌────────────────────────────────────────────┐
 │ Mochila                                    │
 │ pesoMaximo   (readonly)                    │
 │ itens: Item[] (private: ninguém mexe fora) │  ← uma LISTA de itens
 │ pesoTotal    (getter)                      │
 │ adicionar(item) / remover(id) / listar()   │
 │ usar(id)                                   │
 └────────────────────────────────────────────┘
```

**Pergunta-chave para cada método:** "ele recebe/devolve **UM** item ou **UMA LISTA** de itens?"

| Método (sugestão) | Recebe | Devolve | Quando dá erro |
|---|---|---|---|
| `adicionar` | UM item | nada (ou o item) | se passar do peso máximo |
| `remover` | UM id | o item removido | se o id não existir |
| `listar` | nada | uma LISTA (cópia) | nunca (lista vazia é normal!) |
| `pesoTotal` | nada | um número | nunca (mochila vazia = 0) |
| `usar` | UM id | o efeito/mensagem | id não existe **ou** item não é usável |

---

## 4. Roteiro

Cada etapa tem **um conceito novo no máximo**. Só passe para a próxima quando os testes da etapa passarem.

### ✅ Etapa 0: preparar o projeto
- [x] `package.json` com `"type": "module"` e script `dev`
- [x] `typescript`, `tsx`, `@types/node`
- [x] `tsconfig.json`
- [x] `src/index.ts` imprimindo "mochila funcionando"

---

### FASE 1: só TypeScript e POO (sem servidor)

Todos os testes desta fase são feitos no `src/index.ts`, com `console.log`.

| # | Etapa | Conceito novo | Pronto quando... |
|---|---|---|---|
| 1 | [ ] Classe `Item` simples (id, nome, peso) | revisão: `class`, `constructor`, `this` | consigo criar 2 itens e imprimir os dados |
| 2 | [ ] Separar em arquivos (`Item.ts` + import no `index.ts`) | `export` / `import` com `.js` | o mesmo teste funciona importando |
| 3 | [ ] Tipo `Raridade` e campo `raridade` no Item | **união de tipos** | o TS reclama se eu escrever `"lendario"` |
| 4 | [ ] `Mochila` com uma lista de itens, `adicionar` e `listar` | lista de objetos (`Item[]`) | adiciono 3 itens e listo os 3 |
| 5 | [ ] `pesoTotal` | percorrer/somar uma lista | mochila vazia = 0; com itens = soma certa |
| 6 | [ ] Peso máximo + erro ao passar do limite | `throw` + `try/catch` | erro só quando **passa** do limite (igual ao limite pode) |
| 7 | [ ] Classe de erro própria `MochilaError` | `extends Error` | o `catch` mostra a minha mensagem |
| 8 | [ ] `remover(id)` | buscar na lista (`find`/`findIndex`/`filter`) | remove o certo; id inexistente dá erro |
| 9 | [ ] Proteger a lista da mochila | **encapsulamento**: `private`, `readonly`, getter | `mochila.itens.push(...)` por fora dá erro do TS |
| 10 | [ ] `Arma`, `Pocao`, `Armadura` herdando de `Item` | **herança**: `extends`, `super` | cada um tem o campo dele + os campos do Item |
| 11 | [ ] Tornar `Item` abstrato | **classe abstrata** | `new Item(...)` dá erro; `new Arma(...)` funciona |
| 12 | [ ] `descrever()` diferente em cada item | **polimorfismo** | listar a mochila mostra cada item do seu jeito |
| 13 | [ ] Interface `Usavel` na `Pocao` | **interface**, `implements` | o TS cobra o `usar()` na Pocao |
| 14 | [ ] `mochila.usar(id)`: a poção some depois de usada | **narrowing** (descobrir se o item é usável) | poção some; usar espada dá erro claro |
| 15 | [ ] Revisão final da fase 1 | (nenhum) | checklist de testes da seção 5 completa |
| 16 | [ ] *(opcional)* um método genérico, ex.: buscar itens de um tipo | **generics** | só se a fase 1 estiver tranquila |

---

### FASE 2: API com Express + Zod (dados em memória)

Parecido com o projeto do restaurante, mas **sem Knex e sem banco**: a mochila vive na memória
(se o servidor reiniciar, ela volta vazia; isso é esperado).

| # | Etapa | Conceito novo | Pronto quando... |
|---|---|---|---|
| 17 | [ ] Instalar Express e Zod, criar `server.ts` | (já conhecido) | servidor sobe e responde algo |
| 18 | [ ] `dados/`: um catálogo de itens e **uma** mochila | "banco" em memória | os dados existem ao subir |
| 19 | [ ] `GET /itens` (catálogo) | (já conhecido) | devolve uma lista |
| 20 | [ ] `GET /mochila` (itens + peso total + peso máximo) | formato de resposta fixo | sempre o mesmo formato, vazia ou cheia |
| 21 | [ ] `POST /mochila/itens` (body com o id do catálogo) | Zod no body | adiciona; id inválido dá 400 |
| 22 | [ ] `DELETE /mochila/itens/:id` | (já conhecido) | remove; inexistente dá 404 |
| 23 | [ ] `POST /mochila/itens/:id/usar` | (já conhecido) | poção some; item não usável dá erro |
| 24 | [ ] Middleware de erro: `MochilaError` vira status certo | traduzir erro do domínio em HTTP | passar do peso dá 409/422 com mensagem |
| 25 | [ ] Revisão da API (Insomnia/Postman/HTTP file) | (nenhum) | tabela de testes com status e resposta |

**Regra da fase 2:** o controller **não** calcula peso nem decide se pode adicionar. Quem decide é a `Mochila`.

---

### FASE 3: front-end com React + Tailwind (mundo novo)

Projeto separado (`mochila-front/`). Aqui quase tudo é conceito novo, então os passos serão ainda menores
e sempre com exemplo antes.

| # | Etapa | Conceito novo |
|---|---|---|
| 26 | [ ] Criar o projeto (Vite + React + TS) e rodar a página inicial | ferramenta Vite |
| 27 | [ ] Primeiro componente mostrando um item fixo | componente, JSX, props |
| 28 | [ ] Instalar Tailwind e estilizar o "slot" | classes utilitárias |
| 29 | [ ] Grade de slots com uma lista fixa | `.map()` no JSX, `key` |
| 30 | [ ] Liberar CORS na API | CORS |
| 31 | [ ] Buscar a mochila da API | `useState`, `useEffect`, `fetch` |
| 32 | [ ] Barra de peso (atual / máximo) | estado derivado |
| 33 | [ ] Botões: adicionar do catálogo, remover, usar | eventos, atualizar a tela após a ação |
| 34 | [ ] Mostrar erros da API (ex.: "mochila cheia") | estado de erro / carregando |

---

### FASE 4: depois (só quando as fases acima estiverem prontas)
- [ ] Banco de dados com um ORM (escolher na hora, conferindo a versão atual)
- [ ] Docker para subir API + banco
- Ideias para o futuro (fora do escopo agora): itens empilháveis, equipar itens, arrastar e soltar, vários jogadores, login.

---

## 5. Checklist de testes (usar em TODA etapa)

Antes de dizer "terminei", testar:

- [ ] **Caso normal** (o que eu queria que funcionasse)
- [ ] **Lista vazia**: mochila sem nada (listar, peso total, remover, usar)
- [ ] **Não existe**: id que não está na mochila
- [ ] **No limite**: peso exatamente igual ao máximo (pode) e 1 acima (não pode)
- [ ] **Tipo errado**: usar um item que não é usável
- [ ] **Mensagem certa**: o texto do erro/sucesso combina com a ação?
- [ ] **Formato da resposta** (fase 2): sempre o mesmo formato na mesma rota?

E anotar o resultado numa tabelinha: `caso → esperado → o que aconteceu`.

---

## 6. Regras do jogo (como vamos trabalhar)

1. **Um passo pequeno, depois testar.** Nada de escrever três partes antes de rodar.
2. **Conceito novo = exemplo parecido primeiro** (com outros dados), depois eu faço o meu.
3. **Pistas e perguntas**, código só quando eu pedir ou travar de vez (explicado pedaço por pedaço).
4. **Conferir imports** que o editor coloca sozinho antes de aceitar.
5. **Nomes que dizem a verdade**: `item` guarda UM item, `itens` guarda a LISTA.
6. Quando o TypeScript reclamar, copiar a mensagem inteira e pedir tradução.
