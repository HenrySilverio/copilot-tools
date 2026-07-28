---
name: sdd-workflow
description: Fluxo guiado por especificação sobre a pasta .sdd/ do repositório. Use SEMPRE que o pedido envolver planejar, propor, implementar, revisar ou arquivar uma mudança, e sempre que aparecerem os termos briefing, proposta, critério de aceite, tarefas, delta, capacidade, ou os comandos /sdd-plan, /sdd-implement, /sdd-review, /sdd-archive. Use também quando pedirem para criar ou alterar algo sem que exista proposta: a resposta correta é abrir a proposta antes de escrever código.
---

# SDD - Contrato de fluxo

Fonte única de verdade do fluxo. Os quatro prompts são invocadores finos deste contrato.

## Escopo

Processo e artefatos. Não cobre stack, framework nem padrões de código, que vêm das
instructions do projeto e de outras skills.

## Dependências

Nenhuma. Markdown puro, sem CLI e sem ferramenta externa.

## 1. Estrutura

Na raiz do repositório:

| Caminho | Papel |
|---|---|
| `docs/briefings/<assunto>.md` | entrada crua, escrita à mão. Fica fora de `.sdd/` |
| `.sdd/specs/index.md` | índice das capacidades. Único arquivo de `specs/` lido sem critério |
| `.sdd/specs/<capacidade>/spec.md` | comportamento atual do sistema naquela capacidade |
| `.sdd/changes/<change-id>/proposta.md` | intenção, escopo, restrições e critérios de aceite |
| `.sdd/changes/<change-id>/design.md` | decisões técnicas. Opcional, só em rigor Full |
| `.sdd/changes/<change-id>/tarefas.md` | checklist de implementação |
| `.sdd/changes/<change-id>/deltas.md` | alterações a aplicar em `specs/`. Só se houver mudança de comportamento |
| `.sdd/changes/<change-id>/briefing.md` | cópia do briefing original, feita no planejamento |
| `.sdd/changes/archive/AAAA-MM-DD-<change-id>/` | mudanças concluídas |

Duas camadas, dois tempos verbais. `specs/` diz o que o sistema **faz** hoje. `changes/` diz o
que uma mudança **vai fazer**. Confundir as duas é o erro mais comum de quem chega no fluxo.

## 2. Entradas do fluxo

O planejamento recebe duas coisas:

| Entrada | Natureza |
|---|---|
| briefing | obrigatório. Arquivo do usuário em `docs/briefings/` com a necessidade, as restrições e o que não pode ser feito |
| contexto | opcional. Zero ou mais caminhos de arquivo: alvos da alteração, contrato, mapa de dependências, o que for |

Trate qualquer entrada de contexto como material de leitura, seja qual for a origem. Não
assuma formato, não assuma ferramenta que a gerou, não invente caminho que não foi passado.

O briefing é matéria-prima descartável: as restrições dele são transcritas para a proposta no
planejamento, e daí em diante a proposta é o acordo. A cópia em `briefing.md` existe só para
auditoria no archive. Nenhuma etapa depois do planejamento lê essa cópia — reler o pedido
original convida a reabrir decisão que já foi negociada.

## 3. change-id

Kebab-case, iniciado por verbo, no máximo quatro palavras. Chave de ticket vai dentro da
proposta, nunca no id.

## 4. Rigor

Padrão é Lite: proposta e tarefas, sem design.

Suba para Full, com design obrigatório, se houver ao menos um: mudança de contrato entre
camadas, operação irreversível ou migração de dados, exigência regulatória ou de segurança,
ou mais de um repositório envolvido. Cerimônia acima do risco é desperdício.

Tocar `specs/` não sobe o rigor. Quase toda mudança útil altera comportamento observável; se
isso bastasse para exigir design, o rigor Lite deixaria de existir na prática.

## 5. Formato

Leia `references/moldes-artefatos.md` antes de escrever qualquer artefato.

Se um molde impedir escrever um critério verificável, o molde perde: critério verificável é o
produto, molde é o formato. Mas o desvio vai registrado em `## Divergências` na proposta.
Desvio silencioso de molde é o mesmo defeito de expandir escopo em silêncio — a etapa
seguinte compara o plano com a entrada, encontra diferença e não tem como saber se foi
julgamento ou descuido.

Leia `references/specs-e-deltas.md` apenas quando a mudança consultar ou alterar comportamento
registrado em `specs/`. Fora disso, não carregue: é contexto pago sem retorno.

Regra de tarefas, que vale em todas as etapas: toda tarefa é item de checklist markdown.
Pendente usa `- [ ]`, concluída usa `- [x]`, com x minúsculo. Nunca use outro marcador,
nunca risque texto, nunca remova tarefa concluída. O arquivo é o controle de progresso.

## 6. Portões de qualidade

- Todo critério de aceite é verificável, ou seja, daria para escrever um teste a partir dele.
- Todo critério aparece em ao menos uma tarefa.
- Todo critério que descreve comportamento observável novo ou alterado tem delta correspondente.
- Toda tarefa tem critério de conclusão observável.
- Nenhuma restrição declarada no briefing foi violada pelo plano.
- Toda contradição entre entrada e realidade que alterou escopo, restrição ou critério está
  registrada em `## Divergências`. Divergência ausente vira reprovação de algo correto.

## 7. Limites

- Não escreva código de produção no planejamento.
- Não altere a proposta durante a implementação. Se a realidade contradisser o plano, pare
  e reporte antes de seguir.
- Não edite `.sdd/specs/` fora do arquivamento. A spec é acordo prévio, não registro do que
  foi feito; implementação que edita spec transforma uma coisa na outra.
- Não marque tarefa como concluída sem evidência: comando executado ou arquivo alterado.
- Ambiguidade não se resolve por suposição. Liste as perguntas e pare.
- Não crie, renomeie nem apague nada fora de `.sdd/` durante planejamento e arquivamento. A
  única exceção é a leitura do briefing e do contexto adicional.