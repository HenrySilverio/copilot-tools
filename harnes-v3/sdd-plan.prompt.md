---
agent: agent
# CONFIRMAR a grafia exata do modelo no seu Chat: Open Customizations.
# As imagens mostram voce em GPT-5.6 Terra, nao neste pin. Ou o pin nao vale na sua
# versao, ou o nome esta diferente. Fixe aqui o modelo que voce quer de fato usar,
# para nao trocar na UI no meio da sessao (troca reseta o cache).
model: Claude Sonnet 5 (copilot)
# CONFIRMAR os nomes de ferramenta. NAO inclua busca de codebase aqui de proposito:
# este comando so deve ler os caminhos que voce passa. Deixar busca disponivel faz o
# agente varrer o repositorio apesar da instrucao em prosa, e foi o suspeito numero um
# do seu custo (66 tool calls num plan com poucos arquivos de entrada).
tools: ['readFile', 'createFile']
description: SDD - transforma um briefing em proposta, criterios de aceite e tarefas dentro de .sdd/changes/.
---

# /sdd-plan

Transformar um briefing em uma mudanca implementavel. Nao escreva codigo de producao aqui.

## Entradas

Briefing: ${input:briefing:Caminho do arquivo com a necessidade e as restricoes}

Contexto adicional: ${input:contexto:Caminhos separados por virgula, ou vazio}

## Passo 0

Leia `.github/skills/sdd-workflow/SKILL.md` e
`.github/skills/sdd-workflow/references/moldes-artefatos.md`. Se nao existirem, pare e
informe que o toolkit SDD nao esta instalado.

## Passo 1 - Ler as entradas

Leia o briefing por inteiro. Depois leia cada caminho informado em contexto adicional, seja
qual for o formato ou a origem.

Regra dura de contexto: leia exatamente os caminhos passados, nada alem. Nao infira caminho,
nao abra arquivo vizinho, nao siga import, nao procure no restante do repositorio. O usuario
ja selecionou o que e relevante. Cada arquivo lido fora dessa lista e relido em todos os
turnos seguintes e e a maior fonte de desperdicio deste fluxo.

Se um caminho informado nao existir, reporte e pare. Nao substitua por palpite.

## Passo 2 - Extrair restricoes

Do briefing, separe o que e necessidade do que e restricao, ou seja, o que nao pode ser
feito, o que nao pode ser tocado e o que precisa permanecer compativel. Restricao perdida
entre o briefing e o plano e a falha mais cara deste fluxo.

## Passo 3 - Consultar o historico

Liste `.sdd/changes/`, exceto archive. Se ja houver mudanca aberta relacionada, refine a
existente em vez de criar outra, e diga isso na primeira linha da resposta.

Depois, apenas se houver archive, verifique nomes de pasta em `.sdd/changes/archive/` que
citem o mesmo dominio desta mudanca, e leia somente a proposta dessas. Nao abra o archive
inteiro e nao leia mudanca cujo nome nao tenha relacao obvia. Se o archive estiver vazio ou
sem correspondencia de nome, pule este passo sem ler nada.

## Passo 4 - Classificar rigor

Aplique a secao de rigor do contrato. Declare em uma linha se e Lite ou Full e por que.

## Passo 5 - Gerar

Crie `.sdd/changes/<change-id>/` com proposta, tarefas e, se Full, design. Use os moldes da
referencia. Todo criterio de aceite precisa aparecer em ao menos uma tarefa.

Se o briefing nao permitir escrever criterios verificaveis, faca ate tres perguntas
objetivas e pare. Nao invente criterio para preencher lacuna. Pergunte apenas sobre regra
ambigua, comportamento de erro indefinido, limite de valor ou tempo, e o que fica fora do
escopo. Nao pergunte sobre stack.

## Saida

No maximo quinze linhas: change-id e rigor; arquivos criados; titulos dos criterios de
aceite; restricoes extraidas do briefing; historico relevante encontrado no archive, se
houver; premissas assumidas, marcadas com a palavra PREMISSA; perguntas em aberto.

Nao reproduza o conteudo dos arquivos no chat.
