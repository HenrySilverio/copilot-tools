# Copilot Instructions — recr-posvenda

Angular 21 micro-frontend: **Native Federation remote** que sobe como **Angular Element** (web component). Domínio: renegociação pós-venda (bancário). Estado em **NgRx SignalStore**. Testes em **Jest**.

## Stack (não sugira alternativas)
- Angular 21.2 · standalone · `inject()` · control flow `@if`/`@for`/`@switch` · signals
- `@angular-architects/native-federation` · `@angular/elements`
- `@ngrx/signals` (SignalStore) + `@ngrx/operators` · RxJS 7.8
- TypeScript strict · Jest + `jest-preset-angular`
- Prettier: `singleQuote`, `printWidth: 180`

## Onde cada coisa vive
- `core/services` — infra/singletons (http, auth, config, loading, router, monitoramento)
- `domain/models/{dto,modelos,enums}` — DTO (fio) ≠ modelo (domínio)
- `domain/mappers` — DTO ⇄ modelo, 1 por recurso
- `domain/services` — serviços de negócio/API (contrato, parcelas, boleto, dados-cliente…)
- `domain/store` — SignalStore por feature (ex.: `renegociacao.store`)
- `domain/ui` — cards apresentacionais, sem HTTP
- `feature/<x>/pages` — componentes smart/rota
- `shared/{components,pipes,utils}` — transversal, prefixo `bsc-`

## Leis globais (valem em todo request)
- Fluxo de dados: **DTO → mapper → modelo**. Componentes/UI nunca tocam DTO.
- Só standalone. Sem `NgModule`. Sem DI por construtor — use `inject()`.
- Estado em signals; RxJS só na borda de serviço; encerre com `takeUntilDestroyed`.
- Nomes de domínio em PT (renegociacao, parcelas, contrato); código/API em EN.
- Todo `.ts` tem `.spec.ts` (Jest). *Como* testar carrega ao editar o spec — não repita técnica aqui.

## Delegação (não replique conteúdo)
- Gerar DTO/model/mapper/service → skill `data-layer` (`.github/skills/data-layer/templates`). Não invente shapes.
- Detalhe de UI e de data-layer → `.instructions.md` path-scoped (carregam só na camada certa).

## Não
- Sem libs novas sem perguntar. Sem `any`. Sem `@Injectable` singleton fora de `core`.
