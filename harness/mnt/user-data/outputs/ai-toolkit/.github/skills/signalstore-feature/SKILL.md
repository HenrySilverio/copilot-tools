---
name: signalstore-feature
description: Criacao e revisao de stores com NgRx SignalStore (@ngrx/signals) - withState, withComputed, withMethods, withHooks, withEntities, rxMethod, patchState e features customizadas. Use SEMPRE que aparecerem os termos signalStore, SignalStore, @ngrx/signals, patchState, withState, withComputed, withMethods, withEntities, rxMethod, ou quando o pedido envolver "onde guardar esse estado", "criar store", "gerenciamento de estado" em Angular.
---

# NgRx SignalStore

A superficie da API e pequena, mas idiossincratica. Modelos confundem com NgRx Store
classico e geram `createReducer`, `createEffect`, `select` e `dispatch` - nada disso
existe aqui.

## Escopo

Modelagem de estado com `@ngrx/signals`. Nao cobre APIs do framework Angular, HTTP,
federation nem testes.

## Dependencias

Nenhuma.

---

## Passo 0 - Confirmar versao e pacotes

Leia `package.json`: versao de `@ngrx/signals`. Confirme os subpacotes disponiveis
(`@ngrx/signals/entities`, `@ngrx/signals/rxjs-interop`) antes de importar.
Se `@ngrx/signals` nao estiver instalado, **pare** e diga isso - nao proponha instalar.

---

## 1. Decisao anterior ao codigo: precisa de store?

Nem todo estado merece uma store. Ordem de escalada:

| Situacao | Solucao |
|---|---|
| Estado usado por um unico componente | `signal()` no proprio componente |
| Derivado de input | `computed()` / `linkedSignal()` |
| Compartilhado entre pai e filhos de uma tela | SignalStore **providenciada no componente** |
| Compartilhado entre rotas ou features | SignalStore `providedIn: 'root'` |
| Estado do servidor sem interacao complexa | recurso HTTP declarativo, sem store |

Criar store para estado local e overhead sem retorno. Se voce so precisa de um booleano
de "modal aberto", use `signal()`.

**Escopo importa:** `{ providedIn: 'root' }` cria estado global com tempo de vida da
aplicacao. Store de tela deve ser provida no componente (`providers: [MinhaStore]`) para
morrer junto com a tela. Store global usada por uma unica tela e vazamento de estado
entre navegacoes.

## 2. Anatomia obrigatoria

Ordem canonica das features: `withState` -> `withComputed` -> `withMethods` -> `withHooks`.
Manter a ordem importa: `withComputed` e `withMethods` recebem o store montado ate ali.

```ts
type PedidosState = {
  pedidos: Pedido[];
  filtro: string;
  carregando: boolean;
  erro: string | null;
};

const estadoInicial: PedidosState = {
  pedidos: [],
  filtro: '',
  carregando: false,
  erro: null,
};

export const PedidosStore = signalStore(
  { providedIn: 'root' },
  withState(estadoInicial),
  withComputed(({ pedidos, filtro }) => ({
    filtrados: computed(() =>
      pedidos().filter((p) => p.descricao.includes(filtro())),
    ),
    total: computed(() => pedidos().length),
  })),
  withMethods((store, service = inject(PedidosService)) => ({
    definirFiltro(valor: string): void {
      patchState(store, { filtro: valor });
    },
    async carregar(): Promise<void> {
      patchState(store, { carregando: true, erro: null });
      try {
        patchState(store, { pedidos: await service.listar(), carregando: false });
      } catch (e) {
        patchState(store, { erro: mensagemDe(e), carregando: false });
      }
    },
  })),
  withHooks({
    onInit(store) {
      void store.carregar();
    },
  }),
);
```

## 3. Regras duras

1. **`patchState` so dentro de `withMethods` (ou `withHooks`).** Componente que chama
   `patchState(store, ...)` transforma a store em bag de variaveis e destroi o
   encapsulamento. O componente chama metodos; a store decide como o estado muda.
2. **Estado sai como signal somente-leitura.** Nao exponha `WritableSignal` nem o objeto
   de estado bruto.
3. **Tudo que e derivavel vai em `withComputed`.** Se um metodo existe apenas para gravar
   um valor calculado a partir de outros campos do estado, era `computed`.
4. **DI acontece na assinatura da factory**, com parametro default:
   `withMethods((store, service = inject(X)) => ...)`. Nao chame `inject()` dentro do
   corpo de um metodo - o contexto de injecao ja terminou.
5. **Nao guarde no estado o que da para derivar.** Estado duplicado desincroniza.
6. **Nao guarde objeto nao serializavel** (instancia de classe com metodos, `Map` mutado
   por referencia, elemento de DOM) no estado.
7. **Um agregado por store.** Store que gerencia pedidos, usuario e tema ao mesmo tempo
   nao e store, e singleton de conveniencia.
8. Fluxos assincronos com composicao temporal (debounce, cancelamento, retry) usam
   `rxMethod` do subpacote de interop com RxJS. Chamada simples de um endpoint pode ser
   `async/await` - nao introduza RxJS por ritual.

## 4. Colecoes

Para colecao indexada por id, use o subpacote de entidades em vez de manipular array a
mao. Ele fornece o formato normalizado e os operadores de insercao, atualizacao e remocao.
Reimplementar isso com `map`/`filter` gera bug de identidade e re-render desnecessario.

## 5. Reuso

Comportamento repetido em varias stores (indicador de carregamento, tratamento de erro,
paginacao) vira uma **feature customizada** com `signalStoreFeature`, nao copia e cola.
Ver `references/templates.md`.

## 6. Anti-padroes

| Anti-padrao | Por que |
|---|---|
| `createReducer` / `createEffect` / `dispatch` / `select` | API do NgRx Store classico; nao existe aqui |
| `patchState` chamado no componente | quebra encapsulamento |
| `withComputed` chamando metodo do proprio store | dependencia circular |
| `effect()` dentro de `withMethods` para sincronizar estado | use `computed` ou `rxMethod` |
| store `providedIn: 'root'` para estado de uma tela | vaza estado entre navegacoes |
| campo `carregandoX` para cada operacao | modele um estado de status, ou aceite a duplicacao conscientemente |
| expor o objeto de estado inteiro para o template | acopla template a forma interna |

## 7. Auto-verificacao antes de responder

- [ ] Confirmei que `@ngrx/signals` esta instalado e em qual versao?
- [ ] O escopo da store (root vs componente) foi decidido conscientemente?
- [ ] `patchState` aparece apenas dentro de `withMethods`/`withHooks`?
- [ ] Todo derivado esta em `withComputed`?
- [ ] `inject()` esta na assinatura da factory, nao no corpo do metodo?
- [ ] A store cuida de um unico agregado?
- [ ] Nenhuma API do NgRx Store classico apareceu?
