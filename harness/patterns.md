# Receitas de teste (Jest + Angular 21+)

## 1. Componente com signal inputs e output

```ts
describe('CartaoConta', () => {
  let fixture: ComponentFixture<CartaoConta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CartaoConta] }).compileComponents();
    fixture = TestBed.createComponent(CartaoConta);
  });

  function renderizar(saldo: number, bloqueada = false) {
    fixture.componentRef.setInput('saldo', saldo);
    fixture.componentRef.setInput('bloqueada', bloqueada);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('exibe aviso de saldo negativo quando o saldo e menor que zero', () => {
    const el = renderizar(-10);

    expect(el.querySelector('[data-testid="aviso-negativo"]')).not.toBeNull();
  });

  it('nao exibe aviso de saldo negativo quando o saldo e zero', () => {
    const el = renderizar(0);

    expect(el.querySelector('[data-testid="aviso-negativo"]')).toBeNull();
  });

  it('emite selecionada com o id da conta ao clicar no cartao', () => {
    const emitido: string[] = [];
    fixture.componentRef.setInput('contaId', 'C-1');
    fixture.componentInstance.selecionada.subscribe((v) => emitido.push(v));
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('[data-testid="cartao"]')!.click();

    expect(emitido).toEqual(['C-1']);
  });
});
```

Notas:

- `setInput` e obrigatorio para `input()`. Atribuicao direta nao propaga.
- Selecione por `data-testid`, nunca por classe CSS de estilo. Classe muda por design;
  `data-testid` e contrato de teste.

## 2. Service com HttpClient

```ts
describe('ContaService', () => {
  let service: ContaService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContaService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('mapeia o DTO para o modelo de dominio', async () => {
    const promessa = firstValueFrom(service.buscar('C-1'));

    http.expectOne('/api/contas/C-1').flush({ conta_id: 'C-1', saldo_centavos: 12345 });

    await expect(promessa).resolves.toEqual({ id: 'C-1', saldo: 123.45 });
  });

  it('propaga erro de dominio quando a API responde 404', async () => {
    const promessa = firstValueFrom(service.buscar('C-X'));

    http.expectOne('/api/contas/C-X').flush('nao encontrado', { status: 404, statusText: 'Not Found' });

    await expect(promessa).rejects.toThrow(ContaNaoEncontradaError);
  });
});
```

`http.verify()` no `afterEach` e o que impede requisicao orfa de passar despercebida.

## 3. httpResource

```ts
it('expoe o extrato apos a resposta da API', async () => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });

  const recurso = TestBed.runInInjectionContext(() =>
    httpResource<Extrato[]>(() => '/api/extrato'),
  );
  TestBed.tick();

  const http = TestBed.inject(HttpTestingController);
  http.expectOne('/api/extrato').flush([{ id: 1 }]);
  TestBed.tick();

  expect(recurso.value()).toEqual([{ id: 1 }]);
  expect(recurso.error()).toBeUndefined();
});
```

Se a versao do projeto nao expuser `TestBed.tick()`, use `await fixture.whenStable()` a
partir de um componente hospedeiro. Confirme a API disponivel antes de gerar.

## 4. Guard funcional

```ts
describe('autenticadoGuard', () => {
  function executar(autenticado: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: SessaoService, useValue: { autenticado: () => autenticado } },
        provideRouter([]),
      ],
    });
    return TestBed.runInInjectionContext(() =>
      autenticadoGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('libera a navegacao quando ha sessao ativa', () => {
    expect(executar(true)).toBe(true);
  });

  it('redireciona para /login quando nao ha sessao', () => {
    const resultado = executar(false) as UrlTree;

    expect(resultado.toString()).toBe('/login');
  });
});
```

`TestBed.runInInjectionContext` e o que permite testar guard, interceptor e resolver
funcionais sem instanciar componente.

## 5. Interceptor funcional

```ts
it('adiciona o header Authorization quando ha token', () => {
  TestBed.configureTestingModule({
    providers: [{ provide: TokenService, useValue: { atual: () => 'abc' } }],
  });

  let capturada: HttpRequest<unknown> | undefined;
  const next: HttpHandlerFn = (req) => { capturada = req; return of(); };

  TestBed.runInInjectionContext(() =>
    autenticacaoInterceptor(new HttpRequest('GET', '/api/x'), next),
  );

  expect(capturada!.headers.get('Authorization')).toBe('Bearer abc');
});
```

## 6. Controle de tempo

```ts
beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-03-10T12:00:00Z')));
afterEach(() => jest.useRealTimers());

it('marca a fatura como vencida um dia apos o vencimento', () => {
  expect(estaVencida({ vencimento: '2026-03-09' })).toBe(true);
});

it('nao marca como vencida no proprio dia do vencimento', () => {
  expect(estaVencida({ vencimento: '2026-03-10' })).toBe(false);
});
```

Teste que depende de `new Date()` sem congelar o tempo e uma falha esperando a virada
do mes. Congele sempre.

## 7. Enumeracao de ramificacoes - exemplo pratico

Dada a funcao:

```ts
function calcularTarifa(valor: number, cliente: Cliente): number {
  if (cliente.isento) return 0;
  if (valor <= 0) throw new ValorInvalidoError();
  const base = valor > 10_000 ? valor * 0.005 : valor * 0.01;
  return cliente.premium ? base / 2 : base;
}
```

Ramificacoes -> testes minimos:

| # | Condicao | Esperado |
|---|---|---|
| 1 | cliente isento | 0, sem avaliar valor |
| 2 | valor 0 | lanca ValorInvalidoError |
| 3 | valor negativo | lanca ValorInvalidoError |
| 4 | valor 10000, comum | 100 (limite inferior da faixa alta) |
| 5 | valor 10001, comum | 50.005 (faixa alta) |
| 6 | valor 1000, premium | 5 |
| 7 | valor 20000, premium | 50 |

Sete testes, sete ramificacoes. Cobertura de linha estaria em 100% com tres.
