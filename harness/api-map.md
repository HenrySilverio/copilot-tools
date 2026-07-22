# Mapa legado -> moderno (Angular 21+)

## 1. Componente completo

Legado:

```ts
@Component({ selector: 'app-conta', templateUrl: './conta.component.html' })
export class ContaComponent implements OnInit, OnChanges {
  @Input() contaId!: string;
  @Output() selecionada = new EventEmitter<Conta>();
  conta?: Conta;
  constructor(private service: ContaService) {}
  ngOnInit() { this.service.buscar(this.contaId).subscribe(c => this.conta = c); }
  ngOnChanges() { /* refaz a busca */ }
}
```

Moderno:

```ts
@Component({
  selector: 'app-conta',
  templateUrl: './conta.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Conta {
  private readonly service = inject(ContaService);

  readonly contaId = input.required<string>();
  readonly selecionada = output<Conta>();

  readonly conta = httpResource<Conta>(() => `/api/contas/${this.contaId()}`);
}
```

Observe: `ngOnChanges` desapareceu. A dependencia de `contaId` esta na propria expressao
do recurso; mudar o input refaz a busca sozinho.

## 2. Inputs, outputs e two-way

```ts
readonly rotulo = input('');                          // opcional com default
readonly id = input.required<string>();               // obrigatorio
readonly total = input(0, { transform: numberAttribute });
readonly aliasado = input(0, { alias: 'valorInicial' });

readonly salvar = output<Pedido>();
readonly fechado = output<void>();

readonly aberto = model(false);                        // two-way: [(aberto)]
```

Armadilhas:

- `input.required()` **nao pode ser lido no construtor nem em field initializer sincrono**.
  Leia dentro de `computed`, `effect` ou apos `ngOnInit`.
- Input e signal somente-leitura. Para estado local derivado de input use `linkedSignal`:

```ts
readonly filtroSelecionado = linkedSignal(() => this.filtroPadrao());
```

## 3. Queries

```ts
readonly campo = viewChild.required<ElementRef<HTMLInputElement>>('campo');
readonly linhas = viewChildren(LinhaComponent);
readonly projetado = contentChild(CabecalhoComponent);
```

Queries sao signals: leia com `this.campo()`. Elas so resolvem apos a primeira renderizacao;
use `afterNextRender` para manipulacao imperativa de DOM.

## 4. Control flow no template

```html
@if (usuario(); as u) {
  <p>{{ u.nome }}</p>
} @else if (carregando()) {
  <app-spinner />
} @else {
  <p>Nenhum usuario.</p>
}

@for (item of itens(); track item.id) {
  <li>{{ item.nome }}</li>
} @empty {
  <li>Lista vazia.</li>
}

@switch (status()) {
  @case ('ativo')   { <app-ativo /> }
  @case ('inativo') { <app-inativo /> }
  @default          { <app-desconhecido /> }
}

@defer (on viewport) {
  <app-grafico-pesado />
} @placeholder (minimum 300ms) {
  <div class="skeleton"></div>
} @loading (after 100ms) {
  <app-spinner />
} @error {
  <p>Falha ao carregar.</p>
}
```

Armadilhas de `@for`:

- `track` e **obrigatorio**. `track $index` so e aceitavel para listas imutaveis sem
  reordenacao; caso contrario use a chave estavel do item.
- Variaveis implicitas: `$index`, `$first`, `$last`, `$even`, `$odd`, `$count`.
- `@empty` substitui o `@if (lista.length === 0)` que costumava envolver a lista.

Classes e estilos:

```html
<div [class.ativo]="ativo()" [class.erro]="temErro()"></div>
<div [class]="{ ativo: ativo(), erro: temErro() }"></div>
<div [style.width.px]="largura()"></div>
```

## 5. HTTP

```ts
// Leitura declarativa: use httpResource
readonly extrato = httpResource<Extrato>(() => ({
  url: `/api/contas/${this.contaId()}/extrato`,
  params: { pagina: this.pagina() },
}));
// extrato.value() | extrato.isLoading() | extrato.error() | extrato.reload()
```

```ts
// Escrita (POST/PUT/DELETE): HttpClient continua sendo o caminho
private readonly http = inject(HttpClient);

async salvar(pedido: Pedido): Promise<void> {
  await firstValueFrom(this.http.post<void>('/api/pedidos', pedido));
}
```

Regra: `httpResource` para **estado de leitura derivado de signals**. Comando imperativo
com efeito colateral continua sendo `HttpClient`. Nao force um no papel do outro.

Providers em `app.config.ts`:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptors([autenticacaoInterceptor])),
    provideRouter(routes),
  ],
};
```

## 6. Interceptor, guard e resolver (funcionais)

```ts
export const autenticacaoInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenService).atual();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};

export const autenticadoGuard: CanActivateFn = () => {
  const sessao = inject(SessaoService);
  return sessao.autenticado() || inject(Router).createUrlTree(['/login']);
};
```

Classes com `HTTP_INTERCEPTORS` e `CanActivate` como classe sao legado. Nao gere.

## 7. `effect` e contexto de injecao

```ts
export class Painel {
  private readonly analytics = inject(Analytics);
  readonly filtro = input('');

  constructor() {
    // OK: field initializer / construtor estao em contexto de injecao
    effect(() => this.analytics.rastrear('filtro', this.filtro()));
  }

  aoClicar(): void {
    // ERRADO: sem contexto de injecao
    // effect(() => ...);
    // Se realmente precisar, passe { injector: this.injector }.
  }
}
```

`effect` limpa-se sozinho quando o componente e destruido. Para limpeza propria use
`onCleanup`:

```ts
effect((onCleanup) => {
  const id = setInterval(() => this.tick(), 1000);
  onCleanup(() => clearInterval(id));
});
```

## 8. Interop com RxJS

```ts
readonly usuario = toSignal(this.service.usuario$, { initialValue: null });
readonly filtro$ = toObservable(this.filtro);
```

Use RxJS onde ele e superior: composicao temporal (`debounceTime`, `switchMap`,
`retry`, `combineLatest` sobre streams reais). Use signals para estado de UI.
Converter tudo para signal ou tudo para observable e ideologia, nao engenharia.

## 9. Diferencas praticas do zoneless (PERFIL-ZL)

Nao dispara mais deteccao de mudanca automaticamente:

- callback de `setTimeout` / `setInterval`
- `.then()` de Promise
- `subscribe()` de Observable
- `addEventListener` registrado a mao

Dispara: alteracao de signal, evento vindo do template (`(click)`), `AsyncPipe`,
`markForCheck()` explicito.

Consequencia pratica: qualquer estado que a UI le **precisa** ser signal. Um campo de
classe comum atualizado dentro de `subscribe` simplesmente nao aparece na tela.
