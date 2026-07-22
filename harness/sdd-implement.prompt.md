---
mode: agent
description: SDD - implementa as tarefas de uma mudanca openspec, marcando o progresso em tasks.md.
---

# /sdd-implement

Objetivo: executar `tasks.md` de uma mudanca ate que a implementacao satisfaca os
requisitos do delta.

## Passo 0 - Carregar o contrato (obrigatorio)

Leia `.github/skills/sdd-openspec/SKILL.md` antes de qualquer acao.

## Passo 1 - Selecionar a mudanca

Mudanca alvo: **${input:changeId:change-id (deixe vazio para eu listar as mudancas abertas)}**

- Se vazio, liste as pastas de `openspec/changes/` (exceto `archive/`) com o percentual
  de tarefas concluidas e **pare**, pedindo a escolha.
- Se informado e inexistente, liste as opcoes e pare.

## Passo 2 - Carregar contexto na ordem certa

Leia, da mudanca selecionada: `proposal.md`, depois `specs/**/spec.md`, depois `design.md`
(se existir), depois `tasks.md`.

Depois disso, e **so depois**, leia o codigo relevante. Nao explore o repositorio antes de
saber o que deve ser feito - isso queima contexto sem retorno.

As regras tecnicas (framework, camadas, testes, nomenclatura) vem das instructions do
projeto e de outras skills. Este prompt nao define nenhuma.

## Passo 3 - Executar

Para cada tarefa nao marcada, em ordem:

1. Implemente a menor mudanca que satisfaz a tarefa.
2. Rode a verificacao correspondente (build, lint, teste) quando aplicavel.
3. Marque `- [x]` em `tasks.md` **somente apos** a verificacao passar.
4. Se a tarefa se mostrar impossivel ou errada, **pare imediatamente** e reporte. Nao
   improvise um caminho alternativo sem aprovacao.

## Passo 4 - Divergencia entre spec e realidade

Se durante a implementacao ficar claro que um requisito esta errado, incompleto ou
inviavel:

1. Pare de codificar.
2. Descreva a divergencia: requisito afetado, o que a realidade mostrou, opcoes.
3. Aguarde decisao. **Nao edite o delta spec por conta propria.**

Ajustar a spec silenciosamente para caber no codigo destroi o valor do SDD.

## Passo 5 - Fechamento

Ao concluir todas as tarefas, execute o grupo de verificacao final do `tasks.md`.

## Saida

Responda no chat, em no maximo 20 linhas:

- tarefas concluidas nesta sessao (numero e titulo)
- arquivos criados/alterados
- comandos de verificacao executados e resultado
- tarefas restantes
- divergencias ou bloqueios, se houver

Nao cole diffs completos no chat.
