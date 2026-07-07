---
name: 'Angular 21 + Jest — Testes Unitários'
description: 'Padrões de teste unitário para projetos Angular 21 (Jest, jest-preset-angular, NgRx Signals, Native Federation).'
applyTo: '**/*.spec.ts'
---

# Padrões de Teste Unitário — Angular 21 / Jest

Stack: Angular 21, Jest 29 + jest-preset-angular 14, `@ngrx/signals` 21, Native Federation. O gate real é **branches >= 90%** — é a métrica que reprova teste preguiçoso. Cobertura é **por comportamento**.

## Regras gerais (inegociáveis)
- **Cubra ramos, não linhas.** Cada `if/else`, ternário, `?.`, `??`, `switch`, guard clause, caminho de erro e `error/complete` de stream RxJS precisa de teste.
- **1 comportamento por `it`.** Estrutura AAA (Arrange–Act–Assert). `describe`/`it` descritivos.
- **Todo método público:** ao menos um teste de sucesso **e** um de falha.
- **Proibido:** `expect(true).toBe(true)`, asserts sem valor, snapshot como única verificação de lógica, testar biblioteca de terceiro em vez do próprio código.
- **Mock só nas bordas** (HTTP, router, storage, libs externas). Nunca mocke a unidade sob teste.
- **Determinismo:** sem rede, timer ou data reais. `jest.useFakeTimers()`, `Date` fixa. `afterEach(() => jest.clearAllMocks())`.
- **Dados de teste:** builders/factories pequenos e inline. Sem fixtures gigantes (custo de token).
- Estilo: aspas simples, `printWidth` 180.

## Services (HTTP)
- `TestBed.configureTestingModule({ providers: [Service, provideHttpClient(), provideHttpClientTesting()] })`. Use `provideHttpClientTesting()` — **não** `HttpClientTestingModule` (legado).
- `const http = TestBed.inject(HttpTestingController)`. Em `afterEach`: `http.verify()`.
- Por método: verifique URL/verbo/params/headers/body via `http.expectOne(...)`; `flush(payload)` para sucesso; `.error(new ProgressEvent('error'), { status: 500 })` para falha. Valide mapeamento e tratamento de erro.

## NgRx SignalStore (@ngrx/signals)
- Prover no TestBed: `providers: [MyStore, { provide: Dep, useValue: depMock }]`; `TestBed.inject(MyStore)`. (Store puro sem DI pode usar `new`.)
- **Teste pela API pública:** leia signals chamando-os (`store.total()`), leia `computed`, invoque métodos e verifique o **estado resultante nos signals**. Nunca acesse estado interno nem chame `patchState` direto no teste.
- Cubra cada transição/branch de `computed` e de cada método.
- `rxMethod` (`@ngrx/signals/rxjs-interop`) e effects async: envolva em `fakeAsync` + `tick()`/`flush()` ou use `await`, e force detecção com `fixture.detectChanges()` quando aplicável. Teste sucesso, erro e estados de loading.

## Mappers / funções puras
- Sem TestBed — input→output direto (mais rápido, maior ganho de cobertura por token).
- Cubra `null`/`undefined`/vazio, limites, cada ramo de transformação e o **shape** da saída. Nenhum branch de fallback sem teste.

## Components (quando for o alvo)
- `TestBed` + `ComponentFixture`; `fixture.detectChanges()`. Teste `@Input/@Output`, estado renderizado por ramo e handlers de evento. Priorize lógica sobre DOM; para CDK, use component harnesses (`@angular/cdk/testing`).

## Native Federation
- É build-time — **irrelevante** para teste unitário. Nunca importe entrypoints remotos no spec; trate fronteiras federadas como dependências normais e mocke-as.

## Libs de terceiros (jsbarcode, GTM, etc.)
- `jest.mock('lib')` no topo. Verifique que foi chamada com os args certos; não teste a lib.
