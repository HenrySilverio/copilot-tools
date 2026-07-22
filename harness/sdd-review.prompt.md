---
mode: agent
description: SDD - verifica se a implementacao satisfaz os requisitos e cenarios do delta. Somente leitura.
---

# /sdd-review

Objetivo: auditar uma mudanca contra a sua propria especificacao.

Esta etapa e somente leitura. Nao altere codigo, nao altere especificacao, nao marque
tarefas. Um revisor que corrige o problema esconde o problema e remove do time a chance de
decidir prioridade.

## Passo 0 - Carregar o contrato

Leia `.github/skills/sdd-workflow/SKILL.md` e
`.github/skills/sdd-workflow/references/formato-spec.md`.

## Passo 1 - Selecionar a mudanca

Mudanca alvo: ${input:changeId:change-id (vazio para listar as mudancas abertas)}

## Passo 2 - Montar a matriz de rastreabilidade

Para cada requisito do delta, e para cada cenario dentro dele, localize o codigo que
implementa o comportamento e o teste automatizado que cobre o cenario.

Classifique cada cenario:

| Status | Criterio |
|---|---|
| COBERTO | existe codigo e existe teste que exercita exatamente aquela condicao |
| PARCIAL | existe codigo, mas nenhum teste afirma nada sobre aquela condicao |
| AUSENTE | nao existe codigo, ou nao existe teste algum |
| DIVERGENTE | o codigo faz algo diferente do que o cenario descreve |

## Passo 3 - Verificar higiene do processo

Procure e reporte:

- tarefas marcadas como concluidas sem evidencia correspondente no codigo
- codigo entregue que nao corresponde a nenhum requisito, ou seja, escopo alem do combinado
- requisito modificado cujo comportamento antigo ainda existe no codigo
- detalhe de implementacao dentro de spec.md, que e defeito de especificacao

## Passo 4 - Executar verificacoes disponiveis

Rode lint, checagem de tipos e a suite de testes, se os comandos existirem no projeto.
Reporte o resultado. Nao conserte nada.

## Saida

1. Veredito: APROVADO, APROVADO COM RESSALVAS ou REPROVADO.
2. Matriz, em tabela: dominio, requisito, cenario, status, evidencia com arquivo e linha.
3. Bloqueadores: itens ausentes ou divergentes, em ordem de risco.
4. Ressalvas: itens parciais e escopo excedente.
5. Proximo passo objetivo: o que precisa acontecer para o veredito virar aprovado.

Regra de veredito, sem excecao: qualquer cenario ausente ou divergente resulta em
REPROVADO. Nao suavize, nao negocie, nao arredonde para aprovado com ressalvas.
