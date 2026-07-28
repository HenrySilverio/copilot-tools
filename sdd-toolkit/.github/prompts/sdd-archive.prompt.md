---
agent: agent
model: Claude Sonnet 5 (copilot)
tools: ['readFile', 'search', 'createFile', 'editFiles', 'runCommands']
description: SDD - aplica os deltas em specs/ e move a mudança concluída para o archive.
---

# /sdd-archive

Fechar a mudança: absorver o que ela alterou no estado do sistema e tirá-la das mudanças
abertas. Etapa mecânica, sem julgamento.

## Entradas

Mudança: ${input:changeId:change-id, ou vazio para listar as abertas}

## Passo 0 - Contrato

Leia `.github/skills/sdd-workflow/SKILL.md`.

Se a mudança vier vazia ou inexistente, liste as pastas de `.sdd/changes/`, exceto
archive, e pare.

## Passo 1 - Precondições

Confira, e pare no primeiro que falhar:

1. A mudança recebeu veredito APROVADO no `/sdd-review`. Sem aprovação, não arquive.
2. Todas as tarefas estão marcadas `[x]`.
3. `proposta.md` existe.

Tarefa pendente com trabalho já feito não é motivo para arquivar: é motivo para voltar ao
`/sdd-implement` e marcar.

## Passo 1.5 - Aplicar os deltas

Só quando `deltas.md` existir. Antes de aplicar, leia
`.github/skills/sdd-workflow/references/specs-e-deltas.md`.

Leia `.sdd/specs/index.md` e o `spec.md` de cada capacidade citada. Depois, para cada
entrada:

- `ADICIONAR`: acrescente o requisito ao fim da capacidade, alocando o próximo número da
  sequência. Número nunca é reaproveitado, mesmo que haja lacuna. Se a capacidade não
  existir, crie a pasta, o `spec.md` e a linha no índice.
- `SUBSTITUIR`: troque o corpo do requisito alvo pelo texto do delta, mantendo o
  identificador.
- `REMOVER`: apague o requisito alvo e seus cenários. O número fica vago.

O texto do delta é copiado literalmente. Não reescreva, não reinterprete, não ajuste
estilo, não corrija concordância.

Se qualquer alvo não existir, pare antes de escrever qualquer arquivo e reporte. Aplicação
parcial deixa `specs/` num estado que não corresponde a nenhuma mudança.

Não toque em nada além dos `spec.md` citados e do índice. Não reordene requisitos, não
reformate o que não foi tocado.

## Passo 2 - Mover

Crie `.sdd/changes/archive/AAAA-MM-DD-<change-id>/` com a data de hoje e mova a pasta
inteira da mudança para lá, incluindo `briefing.md` e `deltas.md`. Nada é apagado nem
reescrito na movimentação.

## Passo 3 - Conferir

Confira que a pasta original não existe mais em `.sdd/changes/` e que o destino contém os
mesmos arquivos.

## Saída

No máximo dez linhas: caminho de destino; arquivos movidos; capacidades alteradas;
contagem de operações por tipo, adicionar, substituir e remover; capacidades criadas, se
houver; pendências que impediram o arquivamento, se houver.
