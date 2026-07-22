---
mode: agent
description: Audita um arquivo .ts e seu .spec.ts - cenarios nao cobertos, riscos e melhorias. Somente leitura.
---

# /auditar-testes

Arquivo de implementacao: **${input:arquivo:Caminho do .ts a auditar (ex.: src/app/features/pedidos/pedidos.service.ts)}**

Voce esta em modo auditoria. **Nao edite nenhum arquivo.** Se o usuario pedir a correcao,
recuse e explique que a correcao acontece em outra etapa, com este relatorio em maos.

## Passo 1 - Coletar

1. Leia integralmente o arquivo de implementacao informado.
2. Localize o `.spec.ts` correspondente. Se nao existir, registre e continue.
3. Nao leia o resto do repositorio. Leia apenas o que a implementacao importa e que for
   necessario para entender o comportamento (tipos e contratos diretos).

Ordem importa: implementacao antes do teste.

## Passo 2 - Enumerar ramificacoes

Antes de olhar a cobertura, liste toda ramificacao da implementacao:

- cada `if`, ternario, `??`, `?.`, `||`, `&&`
- cada `case` e o `default`
- cada `throw`, `catch`, rejeicao de promessa, resposta HTTP nao 2xx
- cada limite: valor minimo/maximo, data de corte, quantidade zero, colecao vazia
- cada estado assincrono: carregando, sucesso, vazio, erro, cancelamento
- cada recurso que precisa de limpeza (timer, listener, subscription)

## Passo 3 - Mapear cobertura

Para cada ramificacao, marque: COBERTO / PARCIAL / AUSENTE.

- PARCIAL = existe teste que passa por ali, mas nao afirma nada sobre o resultado daquela
  condicao especifica.

## Passo 4 - Auditar a qualidade do que existe

Procure e reporte:

- `it` sem assercao, ou com assercao tautologica
- teste que so verifica que um spy foi chamado, sem verificar o resultado
- teste acoplado a detalhe interno (metodo privado, nome de campo interno, ordem de chamada)
- `toEqual(expect.anything())` ou matcher frouxo em campo relevante
- snapshot amplo
- dependencia de tempo real, de ordem de execucao ou de estado global entre testes
- `beforeEach` que monta cenario que a maioria dos testes nao usa
- mock do proprio objeto sob teste

## Passo 5 - Relatorio (formato obrigatorio)

### 1. Veredito
Uma linha: `SUFICIENTE` / `INSUFICIENTE` / `CRITICO`.
`CRITICO` se houver ramificacao ALTO risco AUSENTE.

### 2. Matriz de ramificacoes

| # | Ramificacao (condicao) | Status | Risco | Teste existente |
|---|---|---|---|---|

### 3. Cenarios ausentes

Para cada lacuna, uma linha no formato:

`[RISCO] it('<titulo do teste que falta>') - <por que importa, em uma frase>`

Agrupe por categoria: caminho feliz, borda, erro, concorrencia/cancelamento, limpeza.
**Nao escreva o corpo dos testes.**

### 4. Problemas nos testes existentes

| Arquivo:linha | Problema | Impacto |
|---|---|---|

### 5. Riscos de desenho

Somente se aplicavel: pontos em que a implementacao e dificil de testar por acoplamento,
responsabilidade excessiva ou dependencia oculta. Uma linha cada.

### 6. Plano priorizado

No maximo 5 itens, em ordem de execucao, cada um com o ganho esperado.

## Restricoes de saida

- Nao reproduza a implementacao no relatorio.
- Nao escreva codigo de teste.
- Sem elogios, sem resumo do que o arquivo faz.
- Se a suite estiver realmente boa, diga em uma linha e liste so o que sobrou.
