# Moldes de SignalStore

## 1. Store de tela (escopo de componente)

```ts
export const DetalheContaStore = signalStore(
  withState({ conta: null as Conta | null, carregando: false, erro: null as string | null }),
  withComputed(({ conta }) => ({
    temSaldoNegativo: computed(() => (conta()?.saldo ?? 0) < 0),
  })),
  withMethods((store, service = inject(ContaService)) => ({
    async abrir(id: string): Promise<void> {
      patchState(store, { carregando: true, erro: null });
      try {
        patchState(store, { conta: await service.buscar(id), carregando: false });
      } catch (e) {
        patchState(store, { erro: mensagemDe(e), carregando: false, conta: null });
      }
    },
    limpar(): void {
      patchState(store, { conta: null, erro: null });
    },
  })),
);
```

Uso no componente, com tempo de vida amarrado a tela:

```ts
@Component({
  selector: 'app-detalhe-conta',
  providers: [DetalheContaStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.carregando()) {
      <app-spinner />
    } @else if (store.erro(); as erro) {
      <app-erro [mensagem]="erro" />
    } @else if (store.conta(); as conta) {
      <app-cartao [conta]="conta" [alerta]="store.temSaldoNegativo()" />
    }
  `,
})
export class DetalheConta {
  readonly store = inject(DetalheContaStore);
  readonly contaId = input.required<string>();

  constructor() {
    effect(() => void this.store.abrir(this.contaId()));
  }
}
```

## 2. Fluxo assincrono com composicao temporal

Quando houver debounce, cancelamento ou retry, use `rxMethod` do subpacote de interop:

```ts
withMethods((store, service = inject(BuscaService)) => ({
  buscar: rxMethod<string>(
    pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => patchState(store, { carregando: true, erro: null })),
      switchMap((termo) =>
        service.buscar(termo).pipe(
          tapResponse({
            next: (resultados) => patchState(store, { resultados, carregando: false }),
            error: (e: unknown) =>
              patchState(store, { erro: mensagemDe(e), carregando: false }),
          }),
        ),
      ),
    ),
  ),
}))
```

`switchMap` cancela a requisicao anterior - e por isso que este caso justifica RxJS.
Sem cancelamento nem debounce, `async/await` e mais simples e igualmente correto.

`rxMethod` aceita valor, Observable **ou signal**. Passando um signal, ele reexecuta a
cada mudanca:

```ts
constructor() {
  this.store.buscar(this.termoDigitado); // reexecuta quando o signal muda
}
```

## 3. Colecao com entidades

```ts
export const ClientesStore = signalStore(
  { providedIn: 'root' },
  withEntities<Cliente>(),
  withComputed(({ entities }) => ({
    ativos: computed(() => entities().filter((c) => c.ativo)),
  })),
  withMethods((store, service = inject(ClientesService)) => ({
    async carregar(): Promise<void> {
      patchState(store, setAllEntities(await service.listar()));
    },
    async atualizar(id: string, mudancas: Partial<Cliente>): Promise<void> {
      await service.atualizar(id, mudancas);
      patchState(store, updateEntity({ id, changes: mudancas }));
    },
    async remover(id: string): Promise<void> {
      await service.remover(id);
      patchState(store, removeEntity(id));
    },
  })),
);
```

Confirme os nomes exatos dos operadores na versao instalada antes de gerar - o subpacote
de entidades evoluiu entre versoes maiores.

## 4. Feature customizada (reuso sem duplicacao)

```ts
export function withRequisicao() {
  return signalStoreFeature(
    withState({ carregando: false, erro: null as string | null }),
    withComputed(({ carregando, erro }) => ({
      ocioso: computed(() => !carregando() && erro() === null),
    })),
    withMethods((store) => ({
      iniciarRequisicao(): void {
        patchState(store, { carregando: true, erro: null });
      },
      concluirRequisicao(): void {
        patchState(store, { carregando: false });
      },
      falharRequisicao(erro: unknown): void {
        patchState(store, { carregando: false, erro: mensagemDe(erro) });
      },
    })),
  );
}
```

Composicao:

```ts
export const PedidosStore = signalStore(
  { providedIn: 'root' },
  withRequisicao(),
  withState({ pedidos: [] as Pedido[] }),
  withMethods((store, service = inject(PedidosService)) => ({
    async carregar(): Promise<void> {
      store.iniciarRequisicao();
      try {
        patchState(store, { pedidos: await service.listar() });
        store.concluirRequisicao();
      } catch (e) {
        store.falharRequisicao(e);
      }
    },
  })),
);
```

Terceira store copiando o mesmo par `carregando`/`erro` e o gatilho para extrair uma
feature. Antes disso, duplicar e aceitavel.

## 5. Convivencia com formularios

A store guarda o **estado de dominio**, nao o estado do controle de formulario. O
formulario mantem o proprio estado (validade, dirty, touched) e entrega a store apenas
o valor final ja validado, via metodo.

Espelhar cada campo de formulario dentro da store gera duas fontes de verdade e problemas
de sincronizacao que aparecem tarde, geralmente em validacao assincrona.
