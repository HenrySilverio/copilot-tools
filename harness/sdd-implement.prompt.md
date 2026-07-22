---
mode: agent
description: SDD - implementa as tarefas de uma mudanca da pasta .sdd/, marcando o progresso no arquivo de tarefas.
---

# /sdd-implement

Objetivo: executar o checklist de tarefas de uma mudanca ate que a implementacao satisfaca
os requisitos do delta.

## Passo 0 - Carregar o contrato

Leia `.github/skills/sdd-workflow/SKILL.md` antes de qualquer acao.

## Passo 1 - Selecionar a mudanca

Mudanca alvo: ${input:changeId:change-id (deixe vazio para eu listar as mudancas abertas)}

- Se vazio, liste as pastas de `.sdd/changes/`, exceto archive, com o percentual de tarefas
  concluidas, e pare pedindo a escolha.
- Se informado e inexistente, liste as opcoes e pare.

## Passo 2 - Carregar contexto na ordem certa

Leia, da mudanca selecionada: proposta, depois os deltas de especificacao, depois design
se existir, depois tarefas.

Depois disso, e somente depois, leia o codigo relevante. Nao explore o repositorio antes de
saber o que deve ser feito: isso queima contexto sem retorno e enviesa a solucao para o que
ja existe.

As regras tecnicas de framework, camadas, testes e nomenclatura vem das instructions do
projeto e de outras skills. Este prompt nao define nenhuma.

## Passo 3 - Executar

Para cada tarefa nao marcada, em ordem:

1. Implemente a menor mudanca que satisfaz a tarefa.
2. Rode a verificacao correspondente, seja build, lint ou teste, quando aplicavel.
3. Marque a tarefa como concluida somente apos a verificacao passar.
4. Se a tarefa se mostrar impossivel ou errada, pare imediatamente e reporte. Nao improvise
   caminho alternativo sem aprovacao.

## Passo 4 - Divergencia entre especificacao e realidade

Se durante a implementacao ficar claro que um requisito esta errado, incompleto ou inviavel:

1. Pare de codificar.
2. Descreva a divergencia: requisito afetado, o que a realidade mostrou, opcoes disponiveis.
3. Aguarde decisao. Nao edite o delta por conta propria.

Ajustar a especificacao silenciosamente para caber no codigo destroi o valor do fluxo
inteiro: a especificacao deixa de ser acordo e vira documentacao do que ja foi feito.

## Passo 5 - Fechamento

Ao concluir todas as tarefas, execute o agrupamento de verificacao final.

## Saida

Responda no chat, em no maximo vinte linhas:

- tarefas concluidas nesta sessao, com numero e titulo
- arquivos criados ou alterados
- comandos de verificacao executados e o resultado de cada um
- tarefas restantes
- divergencias ou bloqueios, se houver

Nao reproduza diffs completos no chat.
