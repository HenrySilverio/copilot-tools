---
mode: agent
description: SDD - verifica se a implementacao satisfaz os requisitos e cenarios do delta spec. Somente leitura.
---

# /sdd-review

Objetivo: auditar uma mudanca contra a sua propria especificacao.

**Esta etapa e somente leitura. Nao altere codigo, nao altere specs, nao marque tarefas.**
Um revisor que corrige o problema esconde o problema.

## Passo 0 - Carregar o contrato (obrigatorio)

Leia `.github/skills/sdd-openspec/SKILL.md` e
`.github/skills/sdd-openspec/references/delta-spec-format.md`.

## Passo 1 - Selecionar a mudanca

Mudanca alvo: **${input:changeId:change-id (vazio = listar mudancas abertas)}**

## Passo 2 - Montar a matriz de rastreabilidade

Para cada requisito do delta, e para cada cenario dentro dele, encontre:

- o codigo que implementa o comportamento
- o teste automatizado que cobre o cenario

Classifique cada cenario em:

| Status | Criterio |
|---|---|
| COBERTO | ha codigo e ha teste que exercita exatamente aquele cenario |
| PARCIAL | ha codigo, mas o teste nao exercita a condicao do cenario |
| AUSENTE | nao ha codigo ou nao ha teste |
| DIVERGENTE | o codigo faz algo diferente do que o cenario descreve |

## Passo 3 - Verificar higiene do processo

- Tarefas marcadas em `tasks.md` que nao tem evidencia no codigo (marcacao otimista).
- Codigo entregue que **nao** corresponde a nenhum requisito (escopo alem do combinado).
- Requisitos MODIFIED cujo comportamento antigo ainda existe no codigo.
- Uso de detalhe de implementacao dentro de `spec.md` (defeito de especificacao).

## Passo 4 - Executar verificacoes disponiveis

Rode lint, type-check e a suite de testes se os comandos existirem no `package.json`.
Reporte o resultado. Nao conserte nada.

## Saida

Responda no chat com:

1. **Veredito**: APROVADO / APROVADO COM RESSALVAS / REPROVADO
2. **Matriz** - tabela: dominio | requisito | cenario | status | evidencia (arquivo:linha)
3. **Bloqueadores** - itens AUSENTE ou DIVERGENTE, em ordem de risco
4. **Ressalvas** - itens PARCIAL e escopo excedente
5. **Proximo passo objetivo** - o que precisa acontecer para virar APROVADO

Regra de veredito: qualquer cenario AUSENTE ou DIVERGENTE => REPROVADO. Nao suavize.
