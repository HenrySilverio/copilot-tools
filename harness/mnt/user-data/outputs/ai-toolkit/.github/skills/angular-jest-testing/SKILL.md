---
name: angular-jest-testing
description: Escrita de testes unitarios Angular com Jest e jest-preset-angular, orientados a comportamento e alta cobertura de branch. Use SEMPRE que o pedido envolver criar, corrigir, completar ou revisar arquivos .spec.ts, quando aparecerem os termos teste unitario, cobertura, mock, TestBed, spy, fixture, describe/it, ou quando um teste estiver falhando. Use tambem quando alguem pedir "escreve os testes desse service/componente".
---

# Testes Angular com Jest

## Escopo

Testes **unitarios e de componente** com Jest. Nao cobre e2e, teste de contrato,
performance nem regras de codigo de producao.

## Dependencias

Nenhuma obrigatoria. Se o projeto usar bibliotecas de estado ou federation, veja a secao
"Casos especiais" - o tratamento e opcional e degrada com elegancia.

---

## Passo 0 - Ler a configuracao real (obrigatorio)

Nao assuma a configuracao. Leia:

| Arquivo | O que confirmar |
|---|---|
| `package.json` | versao de `jest`, `jest-preset-angular`, `@angular/core`; script de teste |
| `jest.config.js` / `jest.config.ts` | `preset`, `setupFilesAfterEnv`, `testEnvironment`, `coverageThreshold` |
| arquivo de setup (`setup-jest.ts`, `src/setup-jest.ts`) | qual entrypoint do preset e importado |
| `src/app/app.config.ts` | zoneless ou zone.js |

O entrypoint do `jest-preset-angular` mudou entre versoes maiores. **Copie o padrao do
arquivo de setup existente**; nao gere um import de memoria.

Se o projeto for zoneless, `fakeAsync`/`tick` dependem do modulo de teste do zone.js e
podem nao estar disponiveis. Prefira `await fixture.whenStable()`.

**Nota de trade-off, diga uma vez e siga em frente:** a partir do v21 o runner padrao do
Angular e o Vitest e o ecossistema esta migrando. Manter Jest e uma escolha legitima
(estabilidade, base instalada), mas e nadar contra a corrente e o custo tende a subir a
cada versao maior. Isso e decisao do time, nao motivo para recusar a tarefa.

---

## 1. Principio: comportamento, nao implementacao

O teste descreve o que o usuario ou o chamador observa. Se um refactor interno que preserva
o comportamento quebra o teste, o teste estava errado.

| Nao teste | Teste |
|---|---|
| que um metodo privado foi chamado | que o efeito observavel aconteceu |
| que `service.buscar` recebeu argumento X | que a tela mostra o resultado correspondente |
| a existencia de uma propriedade | o valor que ela produz sob cada condicao |
| o framework (que `@if` esconde elemento) | a sua regra que decide esconder |

Nome do teste descreve comportamento e condicao, nao o metodo:

- Ruim: `it('deve chamar calcularJuros')`
- Bom: `it('aplica juros de mora quando o vencimento ja passou')`

## 2. Meta de cobertura

Alvo: **branch coverage**, nao line coverage. Line coverage alta com branch baixa e
falsa seguranca.

Para cada unidade, enumere as ramificacoes antes de escrever qualquer teste:

- cada `if` / ternario / `??` / `?.` / `||` / `&&`
- cada `case` do `switch`, incluindo `default`
- cada caminho de erro (`catch`, status HTTP != 2xx, `throwError`)
- cada limite numerico, temporal ou de permissao (valor minimo, valor maximo, expirado)
- cada estado de recurso: carregando, sucesso, vazio, erro

Escreva um `it` por ramificacao. Um `it` com tres `expect` de coisas distintas esconde
qual delas quebrou.

## 3. Estrutura obrigatoria de arquivo

```
describe('<Unidade>', () => {
  // setup compartilhado minimo
  describe('<comportamento ou metodo>', () => {
    it('<resultado esperado> quando <condicao>', () => { ... });
  });
});
```

Dentro de cada `it`: bloco Arrange, bloco Act, bloco Assert, separados por linha em branco.
Sem comentarios `// arrange`. A separacao visual basta.

Uma unica assercao logica por `it`. Multiplos `expect` sobre o **mesmo** objeto de saida
sao aceitaveis.

## 4. Estrategia de dublês

Ordem de preferencia:

1. **Objeto real** quando for puro e barato (mapper, validador, funcao utilitaria).
2. **Fake tipado** - objeto simples que satisfaz a interface. Preferido para services.
3. **`jest.fn()` em provider do TestBed** quando precisar verificar interacao.
4. `jest.spyOn` sobre instancia real - use com moderacao.
5. `jest.mock` de modulo - **ultimo recurso**. Nunca mocke modulos do `@angular/*`.

Nunca mocke o que voce esta testando. Se o teste precisa de cinco mocks para rodar, o
problema e acoplamento na unidade, nao no teste - reporte isso.

HTTP: sempre `provideHttpClient()` + `provideHttpClientTesting()` e `HttpTestingController`.
Nunca `jest.mock('@angular/common/http')`.

## 5. Anti-padroes que reprovam a entrega

| Anti-padrao | Por que |
|---|---|
| `expect(true).toBe(true)` ou assercao tautologica | nao verifica nada |
| `expect(spy).toHaveBeenCalled()` como unica assercao | verifica chamada, nao resultado |
| `it` sem assercao | passa sempre |
| `toEqual(expect.anything())` em campo relevante | mascara regressao |
| snapshot de template inteiro | quebra a cada mudanca cosmetica |
| `setTimeout` real dentro do teste | flaky |
| teste que depende da ordem de execucao | flaky |
| `beforeEach` de 40 linhas com tudo | acoplamento; use factory por cenario |
| mockar o proprio SUT | teste vazio |

## 6. Casos especiais (opcionais)

- **Componente com signal inputs**: use `fixture.componentRef.setInput('nome', valor)`.
  Atribuir direto na instancia nao funciona com `input()`.
- **Zoneless**: `await fixture.whenStable()` em vez de `fakeAsync`/`tick`.
- **Store de terceiros (qualquer biblioteca de estado)**: teste pela API publica da store
  (metodos e valores expostos), nunca pelo objeto de estado interno. Se o projeto usar uma
  biblioteca especifica, siga a fonte de verdade dessa biblioteca - esta skill nao a define.
- **Componente carregado dinamicamente / remoto**: teste o componente diretamente,
  importando-o. Nao tente exercitar o mecanismo de carregamento dinamico em teste unitario.

## 7. Receitas concretas

Leia `references/patterns.md` para os moldes prontos: componente com signal inputs,
service com HTTP, `httpResource`, guard funcional, interceptor, pipe e controle de tempo.

## 8. Auto-verificacao antes de responder

- [ ] Li a configuracao real de Jest em vez de assumir?
- [ ] Listei as ramificacoes antes de escrever os testes?
- [ ] Existe um `it` para cada ramificacao, incluindo erro e vazio?
- [ ] Algum `it` sem assercao real ou com assercao tautologica?
- [ ] Usei `setInput` para signal inputs?
- [ ] Usei `HttpTestingController` em vez de mockar o HttpClient?
- [ ] Os nomes descrevem comportamento, nao nome de metodo?
