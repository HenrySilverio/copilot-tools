---
mode: agent
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
qual for o formato ou a origem. Nao infira caminho que nao foi passado e nao explore o
repositorio por conta propria nesta etapa: o usuario ja selecionou o que e relevante, e
varrer alem disso queima contexto sem retorno.

Se um caminho informado nao existir, reporte e pare. Nao substitua por palpite.

## Passo 2 - Extrair restricoes

Do briefing, separe o que e necessidade do que e restricao, ou seja, o que nao pode ser
feito, o que nao pode ser tocado e o que precisa permanecer compativel. Restricao perdida
entre o briefing e o plano e a falha mais cara deste fluxo.

## Passo 3 - Consultar o historico

Liste `.sdd/changes/`, exceto archive. Se ja houver mudanca aberta relacionada, refine a
existente em vez de criar outra, e diga isso na primeira linha da resposta.

Depois varra `.sdd/changes/archive/` atras de mudancas concluidas que tenham tocado os
mesmos arquivos ou o mesmo dominio desta. Leia apenas a proposta das que derem
correspondencia, nunca o archive inteiro. Reporte o que encontrar, com change-id e a
decisao relevante.

Nao existe camada de especificacao acumulada neste fluxo. O archive e a unica memoria do
que ja foi decidido, e e consultado sob demanda, nao mantido como documento vivo.

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
