---
mode: agent
description: SDD - encerra uma mudanca concluida movendo-a para .sdd/changes/archive/.
---

# /sdd-archive

Encerrar uma mudanca concluida.

## Entradas

Mudanca: ${input:changeId:change-id}

## Passo 0

Leia `.github/skills/sdd-workflow/SKILL.md`.

## Passo 1 - Pre-condicoes

Se qualquer uma falhar, pare e reporte sem arquivar:

- todas as tarefas estao marcadas com `[x]`
- a arvore de trabalho do git nao tem alteracoes nao commitadas dentro de `.sdd/`

A segunda existe para que a operacao seja reversivel por git.

## Passo 2 - Mover

Mova a pasta da mudanca para `.sdd/changes/archive/AAAA-MM-DD-<change-id>/`, com a data de
hoje. Preserve todos os artefatos, sem editar nem apagar nada.

Nao altere nada fora de `.sdd/`.

## Passo 3 - Verificar

A pasta da mudanca nao existe mais fora do archive, e todos os arquivos que estavam nela
estao no destino.

## Saida

No maximo oito linhas: caminho do archive criado; total de tarefas concluidas; e o lembrete
de que `.sdd/` deve entrar no mesmo commit da implementacao.
