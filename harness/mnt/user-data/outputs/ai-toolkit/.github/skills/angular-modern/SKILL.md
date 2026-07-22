---
name: angular-modern
description: Padroes obrigatorios de Angular 21+ (signals, input()/output()/model(), inject(), control flow @if/@for/@switch, standalone, zoneless, defer, httpResource). Use SEMPRE que for criar, alterar, revisar ou migrar qualquer arquivo Angular (.ts de componente, diretiva, pipe, service, guard, interceptor, resolver, .html de template ou app.config.ts). Use tambem quando o pedido mencionar "modernizar", "migrar versao", "esta usando API antiga", NgModule, ngIf, ngFor, @Input, @Output, subscribe em componente ou ChangeDetectionStrategy.
---

# Angular Moderno (v21+)

Modelos de linguagem foram treinados majoritariamente em Angular 15-17. Sem esta skill o
codigo gerado sai com `@Input()`, `*ngIf`, `NgModule` e `constructor(private http)`.
Esta skill existe para impedir isso.

## Escopo

Apenas APIs do **framework Angular**. Nao cobre gerenciamento de estado, module federation,
testes, design system nem arquitetura de pastas. Se o pedido envolver esses temas, trate-os
por outra fonte.

## Dependencias

Nenhuma.

---

## Passo 0 - Detectar o perfil do projeto (obrigatorio)

Nunca assuma. Antes de escrever codigo, leia:

| Arquivo | O que extrair |
|---|---|
| `package.json` | versao exata de `@angular/core`; presenca de `zone.js` |
| `src/app/app.config.ts` | `provideZonelessChangeDetection()` vs `provideZoneChangeDetection()` |
| `angular.json` | `polyfills` contem `zone.js`? |
| `tsconfig.json` | `strict`, `strictTemplates` |

Classifique e **declare em uma linha** no inicio da resposta:

- **PERFIL-ZL** (zoneless): sem `zone.js`. Padrao em projetos novos a partir do v21.
- **PERFIL-Z** (zone.js): ainda usa `zone.js`. Comum em projetos migrados.

O perfil muda o codigo gerado. Em PERFIL-Z, `setTimeout` e `subscribe` ainda disparam
deteccao de mudanca; em PERFIL-ZL, **nao disparam** - o estado precisa ser signal ou
o evento precisa vir do template.

---

## 1. Regras nao negociaveis

| Nunca gere | Sempre gere |
|---|---|
| `NgModule`, `declarations`, `imports` de modulo | componente standalone (padrao desde v19; nao escreva `standalone: true`) |
| `@Input() nome: string` | `nome = input<string>()` / `input.required<string>()` |
| `@Output() ev = new EventEmitter()` | `ev = output<T>()` |
| two-way com `@Input`+`@Output` | `model<T>()` |
| `@ViewChild` / `@ContentChild` | `viewChild()` / `contentChild()` / `viewChildren()` |
| `constructor(private x: X)` | `private readonly x = inject(X)` |
| `*ngIf` / `*ngFor` / `[ngSwitch]` | `@if` / `@for` (com `track` obrigatorio) / `@switch` |
| `ngClass` / `ngStyle` | `[class.x]` / `[style.x]` (ou `[class]` / `[style]` com objeto) |
| `subscribe()` dentro de componente | `toSignal()`, `httpResource()` ou `async` no template |
| `ngOnChanges` para reagir a input | `computed()` ou `effect()` sobre o signal de input |
| campo mutavel + `markForCheck()` | `signal()` |
| `ChangeDetectionStrategy.Default` | `OnPush` (obrigatorio; em PERFIL-ZL e o unico modo coerente) |
| `any` | tipo explicito ou `unknown` com narrowing |

## 2. Status das APIs (v21)

Estavel - use livremente:
`signal`, `computed`, `effect`, `linkedSignal`, `input`, `output`, `model`, `viewChild`,
`contentChild`, `inject`, `toSignal`, `toObservable`, controle de fluxo embutido,
`@defer`, `afterNextRender`, `afterRenderEffect`, `provideZonelessChangeDetection`,
`httpResource`.

Developer preview - use apenas se o projeto ja usar, e sinalize no codigo:
`Angular Aria`.

Experimental - **nao use sem autorizacao explicita do usuario**:
Signal Forms (`@angular/forms/signals`). A API pode mudar antes de estabilizar.
Para formularios, mantenha Reactive Forms tipado ate que o time decida migrar.

Quando houver duvida sobre o status de uma API na versao exata do projeto, consulte o
MCP server oficial (`ng mcp`) via `search_documentation`, que filtra pela versao do
projeto. Nao chute com base em memoria.

## 3. Regras de reatividade

1. `computed()` para qualquer valor derivado. Se voce escreveu um `effect()` cujo unico
   trabalho e atribuir a outro signal, era `computed()` ou `linkedSignal()`.
2. `effect()` so para saida do sistema reativo: log, storage, integracao imperativa com
   API de terceiro, foco de DOM. **Nunca** para orquestrar fluxo de dados.
3. Signal exposto por service e `readonly` para fora: guarde o `WritableSignal` privado e
   exponha `.asReadonly()` ou um `computed()`.
4. `linkedSignal()` quando o estado local precisa ser resetado por uma fonte externa.
5. `untracked()` para ler sem criar dependencia. Se voce precisa dele com frequencia,
   o desenho da reatividade esta errado.

## 4. Protocolo de migracao

Ao modernizar codigo existente, **prefira o schematic oficial ao rewrite manual**:

```
ng generate @angular/core:control-flow
ng generate @angular/core:signal-input-migration
ng generate @angular/core:output-migration
ng generate @angular/core:signal-queries-migration
ng generate @angular/core:inject-migration
ng generate @angular/core:standalone
ng generate @angular/core:cleanup-unused-imports
```

O schematic e deterministico, cobre o repositorio inteiro e nao consome token. Rewrite
manual arquivo a arquivo e mais caro e introduz erro. Reescreva a mao apenas o que o
schematic nao cobre, e diga explicitamente o que foi manual.

Para migracao a zoneless, o MCP oficial expoe `onpush_zoneless_migration`, que produz um
plano por componente. Use-o antes de propor a migracao.

## 5. Erros que o modelo comete com frequencia

Leia `references/api-map.md` antes de gerar componente ou template. Contem o mapa
legado -> moderno com codigo dos dois lados e as armadilhas de `@for`, `input.required`,
`effect` em contexto de injecao e `httpResource`.

## 6. Auto-verificacao antes de responder

- [ ] Declarei o perfil (PERFIL-Z ou PERFIL-ZL)?
- [ ] Zero ocorrencias de `*ngIf`, `*ngFor`, `ngClass`, `ngStyle`, `NgModule`, `@Input`, `@Output`?
- [ ] Todo `@for` tem `track`?
- [ ] Todo componente tem `changeDetection: OnPush`?
- [ ] Nenhum `subscribe()` em componente?
- [ ] Nenhum `effect()` que so escreve em outro signal?
- [ ] Nenhuma API experimental usada sem autorizacao?
