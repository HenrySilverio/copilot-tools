---
mode: agent
description: SDD - faz o merge do delta na especificacao oficial e move a mudanca concluida para .sdd/changes/archive/.
---

# /sdd-archive

Objetivo: encerrar uma mudanca, promovendo o delta a fonte de verdade.

Esta e a operacao mais destrutiva do fluxo: ela reescreve `.sdd/specs/`. Execute com
precisao ou nao execute.

## Passo 0 - Carregar o contrato

Leia `.github/skills/sdd-workflow/SKILL.md` e
`.github/skills/sdd-workflow/references/formato-spec.md`.

## Passo 1 - Selecionar e travar

Mudanca alvo: ${input:changeId:change-id}

Pre-condicoes. Se qualquer uma falhar, pare e reporte, sem arquivar:

- todas as tarefas estao marcadas como concluidas
- o delta passa no checklist de validacao da referencia de formato
- a arvore de trabalho do git nao tem alteracoes nao commitadas dentro de `.sdd/`

A terceira pre-condicao existe para que o merge seja reversivel por git. Sem ela, um merge
errado nao tem volta.

## Passo 2 - Merge

Para cada arquivo de delta em `.sdd/changes/<change-id>/specs/<dominio>/spec.md`:

1. Abra `.sdd/specs/<dominio>/spec.md`. Se nao existir, crie com o titulo do dominio e a
   secao de proposito extraida da proposta.
2. Requisitos adicionados: anexe cada bloco de requisito ao fim da secao de requisitos,
   preservando a ordem em que aparecem no delta.
3. Requisitos modificados: localize o bloco com exatamente o mesmo nome de requisito e
   substitua o bloco inteiro, incluindo frase normativa e todos os cenarios. Remova a nota
   de valor anterior ao gravar na especificacao oficial: ela e artefato de revisao, nao de
   especificacao.
4. Requisitos removidos: apague o bloco correspondente da especificacao oficial.

Se um requisito modificado ou removido nao encontrar o destino, aborte o arquivamento
inteiro e reporte. Merge parcial e pior do que nenhum merge, porque deixa a fonte de
verdade em estado que ninguem consegue auditar.

## Passo 3 - Mover

Mova a pasta da mudanca para `.sdd/changes/archive/AAAA-MM-DD-<change-id>/`, com a data de
hoje. Preserve todos os artefatos. Nao apague nada.

## Passo 4 - Verificacao pos-merge

- Nenhum rotulo de secao de delta sobrou dentro de `.sdd/specs/`.
- Nenhum requisito duplicado dentro do mesmo dominio.
- A pasta da mudanca nao existe mais fora do archive.

## Saida

Responda no chat, em no maximo quinze linhas:

- caminho do archive criado
- por dominio, os titulos dos requisitos adicionados, modificados e removidos
- inconsistencias encontradas, se houver
- lembrete de commit: a pasta `.sdd/` deve entrar no mesmo commit da implementacao
