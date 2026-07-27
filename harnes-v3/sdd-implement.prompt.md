---
agent: agent
# CONFIRMAR a grafia do modelo. Fixe aqui e nao troque na UI durante a sessao.
model: Claude Sonnet 5 (copilot)
# CONFIRMAR os nomes de ferramenta. Sem busca de codebase de proposito: o implement
# trabalha a partir de tarefas.md e dos caminhos que a propria tarefa nomeia, nao
# varrendo o repositorio. 'execute' e o nome provavel da ferramenta de terminal na sua
# versao; confirme (pode ser runInTerminal ou similar).
tools: ['readFile', 'createFile', 'editFiles', 'execute']
description: SDD - executa as tarefas de uma mudanca, marcando o checklist conforme conclui.
---

# /sdd-implement

Executar o checklist ate que a implementacao satisfaca os criterios de aceite.

Rode este comando em um chat novo, separado do /sdd-plan. O plano ja esta escrito em disco;
herdar a conversa do planejamento recarrega dezenas de leituras que a implementacao nao usa.

## Entradas

Mudanca: ${input:changeId:change-id, ou vazio para listar as abertas}

Contexto adicional: ${input:contexto:Caminhos separados por virgula, ou vazio}

## Passo 0

Leia `.github/skills/sdd-workflow/SKILL.md`.

Se a mudanca vier vazia, liste as pastas de `.sdd/changes/`, exceto archive, com a contagem
de tarefas concluidas sobre o total, e pare pedindo a escolha. Se vier inexistente, liste
as opcoes e pare.

## Passo 1 - Carregar na ordem certa

Leia proposta, depois design se existir, depois tarefas. Depois disso, e so depois, leia os
caminhos de contexto adicional e, para cada tarefa, apenas os arquivos que a propria tarefa
nomeia.

Leia sob demanda, tarefa a tarefa, nao tudo de uma vez no inicio. Nao explore o repositorio,
nao siga import e nao abra arquivo que nenhuma tarefa citou. Ler codigo antes de saber o que
deve ser feito queima contexto e enviesa a solucao para o que ja existe. As regras tecnicas
vem das instructions do projeto e de outras skills; este prompt nao define nenhuma.

## Passo 2 - Executar

Para cada tarefa pendente, em ordem:

1. Implemente a menor mudanca que a satisfaz.
2. Rode a verificacao correspondente, seja build, lint ou teste, quando aplicavel.
3. Edite o arquivo de tarefas trocando `[ ]` por `[x]` naquela linha, somente apos a
   verificacao passar. Nao altere o texto da tarefa, nao reordene, nao remova.
4. Se a tarefa se mostrar impossivel ou errada, pare imediatamente e reporte. Nao improvise
   caminho alternativo sem aprovacao.

## Passo 3 - Divergencia

Se um criterio de aceite se revelar errado, incompleto ou inviavel: pare de codificar,
descreva o criterio afetado, o que a realidade mostrou e as opcoes, e aguarde decisao. Nao
edite a proposta por conta propria.

Ajustar a proposta em silencio para caber no codigo destroi o valor do fluxo: ela deixa de
ser acordo e vira registro do que ja foi feito.

## Passo 4 - Fechamento

Ao concluir tudo, execute o agrupamento de verificacao.

## Saida

No maximo quinze linhas: tarefas concluidas nesta sessao, com numero e titulo; arquivos
criados ou alterados; comandos de verificacao e resultado; tarefas restantes; divergencias
ou bloqueios. Nao reproduza diffs.
