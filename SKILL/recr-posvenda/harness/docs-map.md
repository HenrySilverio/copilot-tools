# Mapa de documentação oficial — recr-fed-agc-posvenda

Fonte de verdade para diagnóstico. Regra: **nenhuma correção é proposta com base em memória de treino** — a página relevante deste mapa deve ser buscada (`#fetch`) na execução e citada no fix. Se a URL quebrou, buscar a seção equivalente no domínio oficial e **reportar a URL nova para atualizar este arquivo**.

## Angular 21

| Sintoma / área | URL |
|---|---|
| Erro runtime `NG0xxx` (ex.: NG0100, NG0203, NG0600) | https://angular.dev/errors |
| Signals: `signal`, `computed`, `effect` (regras de escrita em effect) | https://angular.dev/guide/signals |
| `resource` / `httpResource` (dado assíncrono derivado) | https://angular.dev/guide/signals/resource |
| `input()` / `output()` / `model()` signal-based | https://angular.dev/guide/components/inputs |
| Ciclo de vida, `DestroyRef`, `takeUntilDestroyed` | https://angular.dev/guide/components/lifecycle |
| Change detection, `OnPush`, zoneless | https://angular.dev/best-practices/skipping-subtrees |
| HttpClient, interceptors, tratamento de erro HTTP | https://angular.dev/guide/http |
| Reactive Forms, validators customizados | https://angular.dev/guide/forms/reactive-forms |
| Angular Elements (o web component exposto) | https://angular.dev/guide/elements |
| Sanitização, `DomSanitizer`, segurança de template | https://angular.dev/best-practices/security |
| Guia de update entre versões | https://angular.dev/update-guide |

## NgRx SignalStore

| Sintoma / área | URL |
|---|---|
| Estrutura: `signalStore`, `withState`, `withComputed`, `withMethods` | https://ngrx.io/guide/signals/signal-store |
| `patchState` e imutabilidade (o cast do dashboard mora aqui) | https://ngrx.io/guide/signals/signal-store/state-tracking |
| `rxMethod` (efeito assíncrono correto, em vez de `effect`) | https://ngrx.io/guide/signals/rxjs-integration |
| `withEntities` (coleções) | https://ngrx.io/guide/signals/signal-store/entity-management |
| Lifecycle hooks do store (`withHooks`) | https://ngrx.io/guide/signals/signal-store/lifecycle-hooks |
| Testes de SignalStore | https://ngrx.io/guide/signals/signal-store/testing |

## Native Federation

| Sintoma / área | URL |
|---|---|
| Config, `exposes`, `shared`, `skip` | https://www.npmjs.com/package/@angular-architects/native-federation |
| Erros de carga de remote / import maps | https://github.com/angular-architects/module-federation-plugin/tree/main/libs/native-federation |

## Jest + jest-preset-angular

| Sintoma / área | URL |
|---|---|
| Config, transform, ESM, erros de preset | https://thymikee.github.io/jest-preset-angular/docs/ |
| API do Jest (matchers, mocks, timers) | https://jestjs.io/docs/api |
| Zone/testbed issues com preset | https://thymikee.github.io/jest-preset-angular/docs/guides/troubleshooting |

## Tabulator (motor do `bsc-table`)

| Sintoma / área | URL |
|---|---|
| Colunas, `formatter`, tipos de célula (`CellComponent`) | https://tabulator.info/docs/6.3/columns |
| Formatters built-in (money, html — e riscos de XSS) | https://tabulator.info/docs/6.3/format |
| Eventos e callbacks de célula/linha | https://tabulator.info/docs/6.3/callbacks |

## TypeScript

| Sintoma / área | URL |
|---|---|
| Erro `TSxxxx` do compilador | https://www.typescriptlang.org/docs/ |
| Narrowing, type guards (substituir `as unknown as`) | https://www.typescriptlang.org/docs/handbook/2/narrowing.html |

## Convenções internas (canon local — prevalece sobre doc externa em caso de conflito de estilo)

| Área | Fonte |
|---|---|
| Tratamento de erro (`ErroService`/`ErroStore`/interceptor) | `src/app/core/errors/data-access/data-access.md`, `models.md`, `ui.md` |
| Specs destiladas de arquétipo (quando existirem) | `rules-specs/*.spec.md` |
