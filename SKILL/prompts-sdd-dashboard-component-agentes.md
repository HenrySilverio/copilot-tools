# Prompts Base — Refactor do Componente `feature/dashboard` (com agentes SDD)

> Versão refatorada usando os agentes já configurados no projeto. Cada item
> passa por uma fase de **Discovery** (levantamento manual, sem gastar o
> agente) antes de acionar `/sdd-planner`, `/implementer` ou `/reviewer`.

## Agentes disponíveis

| Agente | Modelo | Quando entra |
|---|---|---|
| `/sdd-planner` | Sonnet 5 | Só quando há decisão arquitetural — gera `design.md`/`tasks.md` |
| `/implementer` | Haiku 4.5 | Execução — implementa a partir do `tasks.md` (ou direto, se não houver SDD) |
| `/reviewer` | Haiku 4.5 | Revisão — valida o que o `/implementer` gerou antes de seguir |

---

## 1. Matriz de decisão

| # | Mudança | SDD? | Fluxo de agentes |
|---|---|---|---|
| 1 | constructor → ngOnInit/ngOnDestroy | Não | Discovery → `/implementer` → `/reviewer` |
| 2 | Orquestrar 2 services/store no mesmo componente | SDD leve | Discovery → `/sdd-planner` → `/implementer` (por tarefa) → `/reviewer` (por tarefa) |
| 3 | Extrair regras de negócio pra `service/` | SDD leve | Discovery → `/sdd-planner` → `/implementer` (por tarefa) → `/reviewer` (por tarefa) |

**Por que a Discovery vem antes de qualquer agente:** o `/sdd-planner` (Sonnet 5) é o passo mais caro do fluxo — não faz sentido acioná-lo sem antes ter levantado, com uma leitura barata (`#readFile`, sem agente nenhum), os fatos que ele vai precisar pra decidir. Isso evita idas e vindas caras de "planner pedindo mais contexto".

**Governança (vale pra todas as fases):** nunca `@workspace`; sempre `#readFile`/`#fileSearch` pontual; manter Discovery → planner → implementer → reviewer na mesma janela de chat (cache de sessão).

---

## 2. Item 1 — constructor → ngOnInit/ngOnDestroy (sem SDD)

### Fase 0 — Discovery (manual, nenhum agente ainda)

Objetivo: entender exatamente o que existe hoje antes de mexer, sem gastar o `/implementer` numa exploração.

```
#readFile ./caminho/para/dashboard.component.ts

Antes de qualquer implementação, apenas relate (não altere nada):
1. Quais chamadas de serviço/store estão hoje dentro do constructor().
2. Se existe algum subscribe() manual sem unsubscribe já implementado.
3. Se o componente já implementa alguma interface de ciclo de vida
   (OnInit, OnDestroy) hoje.
```

### Fase 1 — `/implementer` (Haiku 4.5)

Sem `design.md`/`tasks.md` — a mudança é mecânica o suficiente pra ir direto.

```
/implementer

Modo: agent

#readFile ./caminho/para/dashboard.component.ts

Discovery já realizado: [colar aqui o resultado da Fase 0]

Tarefas:
1. Remova a chamada ao serviço/store de dentro do constructor.
2. Faça o componente implementar OnInit e mova o dispatch pra ngOnInit().
3. Faça o componente implementar OnDestroy e implemente ngOnDestroy() pra
   dar unsubscribe em qualquer subscription aberta (evitar memory leak).
4. Não altere nenhuma outra lógica além do ciclo de vida.

Formato de saída: apenas o diff/trecho alterado.
```

### Fase 2 — `/reviewer` (Haiku 4.5)

```
/reviewer

Modo: ask

#readFile ./caminho/para/dashboard.component.ts

Revise o diff gerado pelo /implementer:
1. O constructor ficou realmente limpo (sem chamadas de serviço/store)?
2. ngOnInit e ngOnDestroy foram implementados corretamente, com unsubscribe
   de tudo que precisa?
3. Alguma lógica que não era de ciclo de vida foi alterada por engano?

Aponte só os problemas, com sugestão objetiva de correção.
```

---

## 3. Item 2 — Orquestração de 2 services via store (SDD leve)

### Fase 0 — Discovery (manual, antes do `/sdd-planner`)

Objetivo: levantar os fatos que o planner vai precisar pra decidir a estratégia de orquestração, sem gastar Sonnet 5 nisso.

```
#readFile ./caminho/para/dashboard.component.ts
#readFile ./caminho/para/dashboard.store.ts
#fileSearch novo-servico-cliente

Antes de gerar qualquer design, levante (não decida nada ainda):
1. Quais actions/selectors já existem na store pro serviço atual.
2. Qual o contrato (shape dos dados) do novo serviço de consulta de cliente.
3. Se já existe, em outro componente do projeto, algum padrão de "loading
   combinado" que possamos reaproveitar (pra manter consistência).
4. Se há testes existentes que dependem do estado atual do componente.
```

### Fase 1 — `/sdd-planner` (Sonnet 5): `design.md` + `tasks.md`

```
/sdd-planner

Modo: plan

#readFile ./caminho/para/dashboard.component.ts
#readFile ./caminho/para/dashboard.store.ts

Discovery já realizado: [colar aqui o resultado da Fase 0]

Objetivo: as duas fontes assíncronas (serviço atual + novo serviço de
cliente) precisam ser combinadas de forma que a tela SÓ renderize quando
AMBOS os dados estiverem prontos — nenhum estado parcial deve aparecer na UI.

Gere:
1. design.md — pelo menos 2 alternativas para combinar os dois streams
   (ex.: combineLatest, selector composto, flag de loading combinada),
   recomendação justificada, tratamento de erro parcial e de onde essa
   lógica deve viver (componente, selector dedicado ou service).
2. tasks.md — passos pequenos e sequenciais pro /implementer executar
   (ex.: criar selector composto, ajustar ngOnInit, tratar erro parcial,
   testes).

Não implemente nada ainda.
```

### Fase 2 — `/implementer` (Haiku 4.5), uma vez por tarefa do `tasks.md`

```
/implementer

Modo: agent

#readFile ./tasks.md
#readFile ./design.md

Execute a tarefa [N] do tasks.md.

Não avance para a próxima tarefa sem confirmação.
```

### Fase 3 — `/reviewer` (Haiku 4.5), uma vez por tarefa implementada

```
/reviewer

Modo: ask

#readFile ./design.md
[colar o diff/trecho implementado na tarefa N]

Revise:
1. A implementação segue exatamente a alternativa recomendada no design.md?
2. O estado parcial realmente nunca é renderizado (loading combinado correto)?
3. Erro parcial (um dado falha, o outro não) foi tratado?
4. Unsubscribes estão corretos no ngOnDestroy?

Aponte só os problemas, com sugestão objetiva de correção.
```

---

## 4. Item 3 — Extração de regras de negócio pra `service/` (SDD leve)

### Fase 0 — Discovery (manual, antes do `/sdd-planner`)

```
#readFile ./caminho/para/dashboard.component.ts
#fileSearch feature/dashboard/service

Antes de gerar qualquer design, levante:
1. Quais trechos do componente parecem regra de negócio pura (cálculo,
   formatação, decisão condicional) versus estritamente apresentação/DOM.
2. O que já existe hoje dentro de feature/dashboard/service (se houver
   algo), pra não duplicar responsabilidade.
3. Se algum outro componente depende dessa mesma lógica hoje (risco de
   quebra ao mover).
```

### Fase 1 — `/sdd-planner` (Sonnet 5): `design.md` + `tasks.md`

```
/sdd-planner

Modo: plan

#readFile ./caminho/para/dashboard.component.ts
#fileSearch feature/dashboard/service

Discovery já realizado: [colar aqui o resultado da Fase 0]

Gere:
1. design.md — nome e responsabilidade de cada novo método/serviço a criar
   dentro de service/, com a interface pública (assinatura de métodos,
   tipos de entrada/saída), sem implementar ainda; e os riscos de quebrar
   testes/contratos existentes.
2. tasks.md — um serviço/método por tarefa, na ordem de extração.

Não implemente ainda.
```

### Fase 2 — `/implementer` (Haiku 4.5), uma vez por tarefa

```
/implementer

Modo: agent

#readFile ./tasks.md
#readFile ./design.md

Execute a tarefa [N] do tasks.md.

Não avance para a próxima tarefa sem confirmação.
```

### Fase 3 — `/reviewer` (Haiku 4.5), uma vez por tarefa implementada

```
/reviewer

Modo: ask

#readFile ./design.md
[colar o diff/trecho implementado na tarefa N]

Revise:
1. O método/serviço extraído respeita a interface definida no design.md?
2. Sobrou alguma regra de negócio no componente que deveria ter ido junto?
3. Algum teste ou componente dependente pode ter quebrado?

Aponte só os problemas, com sugestão objetiva de correção.
```

---

## 5. Resumo final

| Item | Discovery | Planejamento | Execução | Revisão |
|---|---|---|---|---|
| 1. constructor → ngOnInit/ngOnDestroy | Manual (`#readFile`) | — (sem SDD) | `/implementer` (Haiku 4.5) | `/reviewer` (Haiku 4.5) |
| 2. Orquestração 2 services/store | Manual (`#readFile`/`#fileSearch`) | `/sdd-planner` (Sonnet 5) | `/implementer` por tarefa (Haiku 4.5) | `/reviewer` por tarefa (Haiku 4.5) |
| 3. Extração pra `service/` | Manual (`#readFile`/`#fileSearch`) | `/sdd-planner` (Sonnet 5) | `/implementer` por tarefa (Haiku 4.5) | `/reviewer` por tarefa (Haiku 4.5) |

Regra de custo: Sonnet 5 (`/sdd-planner`) só entra nos itens 2 e 3, uma vez cada, depois que a Discovery já entregou os fatos prontos. Todo o volume de execução e revisão fica em Haiku 4.5.
