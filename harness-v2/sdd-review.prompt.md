---
mode: agent
description: SDD - audita a implementacao contra os criterios de aceite da propria mudanca. Somente leitura.
---

# /sdd-review

Auditar uma mudanca contra a sua propria proposta.

Somente leitura. Nao altere codigo, nao altere a proposta, nao marque tarefas. Um revisor
que corrige o problema esconde o problema e tira do time a decisao de prioridade.

## Entradas

Mudanca: ${input:changeId:change-id, ou vazio para listar as abertas}

## Passo 0

Leia `.github/skills/sdd-workflow/SKILL.md`, depois a proposta e as tarefas da mudanca.

## Passo 1 - Matriz de rastreabilidade

Para cada criterio de aceite, e para cada condicao de verificacao dentro dele, localize o
codigo que implementa o comportamento e o teste automatizado que o cobre. Classifique:

| Status | Criterio |
|---|---|
| COBERTO | existe codigo e existe teste que exercita exatamente aquela condicao |
| PARCIAL | existe codigo, mas nenhum teste afirma nada sobre aquela condicao |
| AUSENTE | nao existe codigo, ou nao existe teste algum |
| DIVERGENTE | o codigo faz algo diferente do que a condicao descreve |

## Passo 2 - Higiene

Procure e reporte: tarefas marcadas com `[x]` sem evidencia correspondente no codigo;
codigo entregue que nao corresponde a nenhum criterio, ou seja, escopo alem do combinado;
e violacao de qualquer restricao declarada na proposta.

A verificacao de restricao e a mais importante desta etapa e a mais facil de pular, porque
exige comparar o que foi feito com o que foi proibido, e nao com o que foi pedido.

## Passo 3 - Verificacoes disponiveis

Rode lint, checagem de tipos e testes, se os comandos existirem. Reporte. Nao conserte nada.

## Saida

1. Veredito: APROVADO, APROVADO COM RESSALVAS ou REPROVADO.
2. Matriz em tabela: criterio, condicao, status, evidencia com arquivo e linha.
3. Bloqueadores: itens ausentes, divergentes ou que violam restricao, em ordem de risco.
4. Ressalvas: itens parciais e escopo excedente.
5. O que precisa acontecer para o veredito virar aprovado.

Regra sem excecao: qualquer condicao ausente ou divergente, ou qualquer restricao violada,
resulta em REPROVADO. Nao suavize, nao negocie, nao arredonde para aprovado com ressalvas.
