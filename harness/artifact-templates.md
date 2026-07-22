# Moldes de artefatos

## proposal.md

```markdown
# Proposal: <Titulo curto>

## Intent
Qual problema real esta sendo resolvido e para quem. Duas a quatro frases.
Se houver ticket, referencie aqui: [ABC-1234].

## Scope
In scope:
- item observavel
- item observavel

Out of scope:
- item explicitamente adiado, com o motivo

## Approach
Um paragrafo sobre a direcao escolhida. Sem codigo, sem nome de classe.

## Risks
- <risco>: <impacto> / <mitigacao>
```

A secao `Out of scope` nao e opcional. Escopo que nao foi negado por escrito volta como
retrabalho na revisao.

## design.md (apenas em rigor Full)

```markdown
# Design: <Titulo>

## Technical Approach
Como sera construido, em prosa. Uma pagina no maximo.

## Decisions

### Decision: <o que foi decidido>
Contexto: <restricao que forcou a decisao>
Escolha: <opcao adotada>
Alternativas descartadas:
- <alternativa>: <por que nao>
Consequencia aceita: <divida ou limitacao assumida>

## Contracts
Contratos afetados (API, evento, storage) e como cada camada consome o contrato de forma
isolada. Se a proposta cria um artefato compartilhado rigidamente entre camadas,
justifique aqui ou recuse a abordagem.

## File Changes
- caminho/arquivo (novo | alterado | removido)
```

Decisao sem alternativa descartada nao e decisao, e narrativa. Se voce nao consegue nomear
a alternativa, provavelmente nao avaliou nenhuma.

## tasks.md

```markdown
# Tasks

## 1. <Agrupamento>
- [ ] 1.1 <acao verificavel>
- [ ] 1.2 <acao verificavel>

## 2. <Agrupamento>
- [ ] 2.1 <acao verificavel>

## 3. Verificacao
- [ ] 3.1 Lint e type-check sem erro
- [ ] 3.2 Testes automatizados cobrindo os cenarios do delta
- [ ] 3.3 Cada cenario da spec mapeado para pelo menos um teste
```

### Regras de tarefa

- Uma tarefa = uma unidade concluivel em uma sessao. Se precisa de tres commits, quebre.
- Toda tarefa tem criterio observavel. "Ajustar service" nao e tarefa; "Adicionar metodo de
  revalidacao de token no client HTTP tratando 401" e.
- O grupo final de verificacao e obrigatorio em toda mudanca.
- A numeracao e a ordem de execucao sugerida.
