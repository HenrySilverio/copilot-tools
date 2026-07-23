---
name: sdd-workflow
description: Fluxo guiado por especificacao sobre a pasta .sdd/ do repositorio. Use SEMPRE que o pedido envolver planejar, propor, implementar, revisar ou arquivar uma mudanca, e sempre que aparecerem os termos briefing, proposta, criterio de aceite, tarefas, ou os comandos /sdd-plan, /sdd-implement, /sdd-review, /sdd-archive. Use tambem quando pedirem para criar ou alterar algo sem que exista proposta: a resposta correta e abrir a proposta antes de escrever codigo.
---

# SDD - Contrato de fluxo

Fonte unica de verdade do fluxo. Os quatro prompts sao invocadores finos deste contrato.

## Escopo

Processo e artefatos. Nao cobre stack, framework nem padroes de codigo, que vem das
instructions do projeto e de outras skills.

## Dependencias

Nenhuma. Markdown puro, sem CLI e sem ferramenta externa.

## 1. Estrutura

Na raiz do repositorio:

- `.sdd/changes/<change-id>/proposta.md` - intencao, escopo e criterios de aceite
- `.sdd/changes/<change-id>/design.md` - decisoes tecnicas. Opcional, so em rigor Full
- `.sdd/changes/<change-id>/tarefas.md` - checklist de implementacao
- `.sdd/changes/archive/AAAA-MM-DD-<change-id>/` - mudancas concluidas

Nao existe camada de especificacao viva do sistema. A entrada do fluxo e um briefing
escrito a mao pelo usuario, fora de `.sdd/`, informado a cada invocacao. Nao crie,
referencie nem sugira pasta de especificacao persistente.

## 2. Entradas do fluxo

O planejamento recebe duas coisas:

| Entrada | Natureza |
|---|---|
| briefing | obrigatorio. Arquivo do usuario com a necessidade, as restricoes e o que nao pode ser feito |
| contexto | opcional. Zero ou mais caminhos de arquivo: alvos da alteracao, contrato, mapa de dependencias, o que for |

Trate qualquer entrada de contexto como material de leitura, seja qual for a origem. Nao
assuma formato, nao assuma ferramenta que a gerou, nao invente caminho que nao foi passado.

## 3. change-id

Kebab-case, iniciado por verbo, no maximo quatro palavras. Chave de ticket vai dentro da
proposta, nunca no id.

## 4. Rigor

Padrao e Lite: proposta e tarefas, sem design.

Suba para Full, com design obrigatorio, se houver ao menos um: mudanca de contrato entre
camadas, operacao irreversivel ou migracao de dados, exigencia regulatoria ou de seguranca,
ou mais de um repositorio envolvido. Cerimonia acima do risco e desperdicio.

## 5. Formato

Leia `references/moldes-artefatos.md` antes de escrever qualquer artefato.

Regra de tarefas, que vale em todas as etapas: toda tarefa e item de checklist markdown.
Pendente usa `- [ ]`, concluida usa `- [x]`, com x minusculo. Nunca use outro marcador,
nunca risque texto, nunca remova tarefa concluida. O arquivo e o controle de progresso.

## 6. Portoes de qualidade

- Todo criterio de aceite e verificavel, ou seja, daria para escrever um teste a partir dele.
- Todo criterio aparece em ao menos uma tarefa.
- Toda tarefa tem criterio de conclusao observavel.
- Nenhuma restricao declarada no briefing foi violada pelo plano.

## 7. Limites

- Nao escreva codigo de producao no planejamento.
- Nao altere a proposta durante a implementacao. Se a realidade contradisser o plano, pare
  e reporte antes de seguir.
- Nao marque tarefa como concluida sem evidencia: comando executado ou arquivo alterado.
- Ambiguidade nao se resolve por suposicao. Liste as perguntas e pare.
- Nao crie, renomeie nem apague nada fora de `.sdd/` durante planejamento e arquivamento.
