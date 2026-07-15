---
name: auditoria-estado-angular
description: Catálogo de regras de estado e reatividade para Angular 21 com NgRx SignalStore. Use ao auditar arquivos *.store.ts, signals, computed, effect, resource, ou qualquer subscribe/pipe RxJS em componente ou service.
context: fork
user-invocable: false
---

# Estado e reatividade — Angular 21 + NgRx SignalStore

Antes: rode `npx eslint <escopo> -f compact`. O `@ngrx/eslint-plugin` já pega parte disto. **Não duplique o que ele apontou.**

## EST-01 · Mutação de estado fora de `patchState` — `ALTO`

`store.entidade().campo = x`, `.push(...)`, `.sort()` sobre array de estado, `Object.assign` em objeto do store. Signal compara por referência: mutação in-place não notifica, e o bug aparece como "a tela não atualiza" três sprints depois.

Fix: `patchState(store, { lista: [...store.lista(), item] })`.

## EST-02 · Subscription sem teardown — `ALTO`

`.subscribe()` sem `takeUntilDestroyed()` nem `async` pipe, em componente ou store. Em MFE isso é pior que em SPA: o custom element é montado e desmontado pelo shell repetidamente — o leak acumula por navegação.

Fix preferido: `toSignal()` ou `async`. Se `subscribe()` é inevitável, `takeUntilDestroyed(inject(DestroyRef))`.

## EST-03 · `effect` como orquestrador — `ALTO`

`effect()` que chama HTTP, faz `patchState`, ou navega. `effect` é para sincronizar com o mundo de fora (DOM, logger, storage). Usá-lo para lógica cria cascata de gravação difícil de rastrear e reentrância silenciosa.

Fix: `rxMethod` no store, ou `resource`/`httpResource` para leitura derivada de parâmetro.

## EST-04 · Derivação que não é `computed` — `MEDIO`

Campo do estado que é função pura de outros campos, mantido via `patchState` em dois ou três lugares. Fonte clássica de estado inconsistente.

Fix: `withComputed`. Regra: se dá para derivar, não guarde.

## EST-05 · Store como saco de estado da feature — `MEDIO`

`*.store.ts` acumulando estado de UI (`modalAberto`, `abaSelecionada`, `carregandoBotao`). Estado de UI é `signal()` local do componente. O store é do domínio.

## EST-06 · Assinatura de mudança sem `OnPush` — `MEDIO`

Componente sem `changeDetection: ChangeDetectionStrategy.OnPush`. Com signals o custo é baixo, mas o remote roda dentro do zone do shell.
Não é finding se o componente já for zoneless por config.

## EST-07 · `any` / cast em fronteira de dados — `MEDIO`

`any`, `as unknown as T`, `<any>` em resposta HTTP, payload de store, ou `@Input()`. Cada um é um contrato desligado em silêncio — exatamente o que `tsc --noEmit` não pega porque você mandou ele não pegar.

## Falsos positivos — não reporte

- `signal()` privado com `asReadonly()` público: é o padrão correto.
- `computed` "caro": não especule sobre performance sem medição.
- Sugerir migração para NgRx Store clássico. A escolha por SignalStore está feita.
