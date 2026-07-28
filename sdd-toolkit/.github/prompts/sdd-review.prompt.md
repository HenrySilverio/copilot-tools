---
agent: agent
model: Claude Sonnet 5 (copilot)
tools: ['readFile', 'search', 'runCommands']
description: SDD - audita uma mudança implementada contra a proposta, as tarefas e os deltas.
---

# /sdd-review

Auditar. Esta etapa não corrige nada: ela emite veredito.

## Entradas

Mudança: ${input:changeId:change-id, ou vazio para listar as abertas}

## Passo 0 - Contrato e artefatos

Leia `.github/skills/sdd-workflow/SKILL.md`.

Leia `proposta.md`, `tarefas.md`, `design.md` se existir e `deltas.md` se existir. Se
`deltas.md` existir, leia também `.sdd/specs/index.md` e o `spec.md` de cada capacidade
citada nos deltas.

Não leia `briefing.md`. O acordo auditável é a proposta.

Se a mudança vier vazia ou inexistente, liste as opções e pare.

## Passo 1 - Critérios contra código

Para cada critério de aceite, localize a implementação e o teste que o cobrem. Registre
uma das três situações: coberto, coberto parcialmente, ou não coberto.

Critério coberto por código sem teste é parcial, não coberto.

## Passo 2 - Tarefas contra realidade

Toda tarefa marcada `[x]` precisa ter evidência: arquivo alterado ou comando executado.
Tarefa marcada sem evidência é achado, não detalhe.

## Passo 2.5 - Conferir os deltas

Só quando `deltas.md` existir.

Verifique nas duas direções:

- Todo critério de aceite que descreve comportamento observável novo ou alterado tem
  delta correspondente. Critério sem delta significa que o sistema vai mudar sem que a
  spec registre.
- Todo delta tem critério de aceite correspondente. Delta sem critério é escopo entrando
  pela porta dos fundos: comportamento que ninguém negociou e ninguém testou.

Verifique os alvos: todo `SUBSTITUIR` e todo `REMOVER` aponta para um `REQ-...` que
existe hoje no `spec.md` daquela capacidade. Alvo inexistente é erro, não aviso — o
delta foi escrito contra um estado que já mudou.

Verifique o texto: cada entrada traz o texto final do requisito e dos cenários, pronto
para cópia. Delta que descreve a intenção em vez de trazer o texto final não é aplicável
mecanicamente e reprova.

## Passo 3 - Verificação

Rode lint, checagem de tipos e testes, se os comandos estiverem declarados no
agrupamento de verificação. Não conserte falha; reporte.

## Passo 4 - Veredito

APROVADO ou REPROVADO.

Reprove se: houver critério não coberto; houver tarefa marcada sem evidência; a
verificação falhar; a implementação tiver ampliado o escopo além da proposta; alguma
restrição da proposta tiver sido violada; ou houver qualquer achado do Passo 2.5 —
critério sem delta, delta sem critério, alvo inexistente ou texto não final.

Não há veredito parcial. "Aprovado com ressalvas" é reprovado com educação.

## Saída

No máximo vinte linhas: veredito; achados em ordem de gravidade, cada um com o artefato e
o que está errado; resultado dos comandos de verificação; o que precisa acontecer para
aprovar. Não proponha o código da correção.
