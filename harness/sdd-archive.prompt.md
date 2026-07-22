---
mode: agent
description: SDD - faz o merge do delta na spec oficial e move a mudanca concluida para openspec/changes/archive/.
---

# /sdd-archive

Objetivo: encerrar uma mudanca, promovendo o delta a fonte de verdade.

Esta e a operacao **mais destrutiva** do fluxo: ela reescreve `openspec/specs/`.
Execute com precisao ou nao execute.

## Passo 0 - Carregar o contrato (obrigatorio)

Leia `.github/skills/sdd-openspec/SKILL.md` e
`.github/skills/sdd-openspec/references/delta-spec-format.md`.

## Passo 1 - Selecionar e travar

Mudanca alvo: **${input:changeId:change-id}**

Pre-condicoes. Se qualquer uma falhar, **pare e reporte**, sem arquivar:

- [ ] Todas as tarefas de `tasks.md` estao marcadas.
- [ ] O delta e sintaticamente valido (checklist da secao 5 da referencia).
- [ ] A arvore de trabalho do git nao tem alteracoes nao commitadas em `openspec/`.

## Passo 2 - Preferir o CLI

Se `openspec --version` funcionar, use o comando de archive do CLI e pule para o Passo 5.
O CLI faz o merge de forma deterministica; o merge manual e o plano B.

## Passo 3 - Merge manual (apenas se nao houver CLI)

Para cada `openspec/changes/<id>/specs/<dominio>/spec.md`:

1. Abra `openspec/specs/<dominio>/spec.md`. Se nao existir, crie com cabecalho
   `# <Dominio> Specification` e secao `## Purpose` extraida do proposal.
2. `## ADDED Requirements` -> anexe cada bloco `### Requirement:` ao fim de `## Requirements`.
3. `## MODIFIED Requirements` -> localize o bloco com o **mesmo** `### Requirement:` e
   substitua-o inteiro (titulo, frase normativa e todos os cenarios). Remova a anotacao
   "(Anterior: ...)" ao gravar na spec oficial.
4. `## REMOVED Requirements` -> apague o bloco correspondente da spec oficial.

Se um `MODIFIED` ou `REMOVED` nao encontrar o requisito de destino, **aborte o archive
inteiro** e reporte. Merge parcial e pior do que nenhum merge.

## Passo 4 - Mover

Mova `openspec/changes/<id>/` para `openspec/changes/archive/YYYY-MM-DD-<id>/`,
com a data de hoje. Preserve todos os artefatos. Nao delete nada.

## Passo 5 - Verificacao pos-merge

- Nenhuma secao `ADDED`/`MODIFIED`/`REMOVED` sobrou dentro de `openspec/specs/`.
- Nenhum requisito duplicado no mesmo dominio.
- `openspec/changes/<id>/` nao existe mais fora do archive.

## Saida

Responda no chat, em no maximo 15 linhas:

- caminho do archive criado
- por dominio: requisitos adicionados / modificados / removidos (so os titulos)
- inconsistencias encontradas, se houver
- lembrete de commit: `openspec/` deve entrar no mesmo commit da implementacao
