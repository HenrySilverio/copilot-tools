---
agent: agent
model: Claude Sonnet 5 (copilot)
tools: ['readFile', 'search', 'createFile', 'editFiles', 'runCommands']
description: SDD - executa as tarefas de uma mudança, marcando o checklist conforme conclui.
---

# /sdd-implement

Executar o checklist até que a implementação satisfaça os critérios de aceite.

## Entradas

Mudança: ${input:changeId:change-id, ou vazio para listar as abertas}

Contexto adicional: ${input:contexto:Caminhos separados por vírgula, ou vazio}

## Passo 0 - Contrato

Leia `.github/skills/sdd-workflow/SKILL.md`.

Se a mudança vier vazia, liste as pastas de `.sdd/changes/`, exceto archive, com a contagem
de tarefas concluídas sobre o total, e pare pedindo a escolha. Se vier inexistente, liste
as opções e pare.

## Passo 1 - Carregar na ordem certa

Leia proposta, depois design se existir, depois tarefas. Depois disso, e só depois, leia os
caminhos de contexto adicional e o código necessário.

Ler código antes de saber o que deve ser feito queima contexto e enviesa a solução para o
que já existe. As regras técnicas vêm das instructions do projeto e de outras skills; este
prompt não define nenhuma.

Não leia `briefing.md`, `deltas.md` nem `.sdd/specs/`. A proposta é o acordo; o resto é
entrada de outra etapa e só ocuparia contexto.

## Passo 2 - Executar

Para cada tarefa pendente, em ordem:

1. Implemente a menor mudança que a satisfaz.
2. Rode a verificação correspondente, seja build, lint ou teste, quando aplicável.
3. Edite o arquivo de tarefas trocando `[ ]` por `[x]` naquela linha, somente após a
   verificação passar. Não altere o texto da tarefa, não reordene, não remova.
4. Se a tarefa se mostrar impossível ou errada, pare imediatamente e reporte. Não improvise
   caminho alternativo sem aprovação.

## Passo 3 - Divergência

Se um critério de aceite se revelar errado, incompleto ou inviável: pare de codificar,
descreva o critério afetado, o que a realidade mostrou e as opções, e aguarde decisão. Não
edite a proposta por conta própria.

Ajustar a proposta em silêncio para caber no código destrói o valor do fluxo: ela deixa de
ser acordo e vira registro do que já foi feito. O mesmo vale para `deltas.md` e para
`.sdd/specs/`, que esta etapa não edita em nenhuma hipótese.

## Passo 4 - Fechamento

Ao concluir tudo, execute o agrupamento de verificação.

## Saída

No máximo quinze linhas: tarefas concluídas nesta sessão, com número e título; arquivos
criados ou alterados; comandos de verificação e resultado; tarefas restantes; divergências
ou bloqueios. Não reproduza diffs.
