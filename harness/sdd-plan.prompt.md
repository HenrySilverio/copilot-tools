---
mode: agent
description: SDD - cria ou refina uma proposta de mudanca (proposta, delta de especificacao, design opcional, tarefas) na pasta .sdd/.
---

# /sdd-plan

Objetivo: transformar uma intencao em uma mudanca especificada e implementavel.
Nao escreva codigo de producao nesta etapa.

## Passo 0 - Carregar o contrato

Leia, nesta ordem, antes de qualquer acao:

1. `.github/skills/sdd-workflow/SKILL.md`
2. `.github/skills/sdd-workflow/references/formato-spec.md`
3. `.github/skills/sdd-workflow/references/moldes-artefatos.md`

Se algum desses arquivos nao existir, pare e informe que o toolkit SDD nao esta instalado
neste repositorio.

## Passo 1 - Reconhecer o terreno

- Verifique se `.sdd/` existe. Se nao existir, crie `.sdd/specs/` e `.sdd/changes/`.
- Liste os dominios existentes em `.sdd/specs/`.
- Verifique se ja existe uma mudanca em `.sdd/changes/` relacionada ao pedido. Se existir,
  refine a existente em vez de criar outra, e diga isso ao usuario logo no inicio.

## Passo 2 - Entender a intencao

Intencao do usuario: ${input:intencao:O que precisa ser construido ou alterado?}

Se a intencao nao permitir escrever cenarios verificaveis, faca ate tres perguntas
objetivas e pare. Nao invente requisito para preencher lacuna.

Perguntas aceitaveis: regra de negocio ambigua, comportamento de erro nao definido,
limites de tempo, valor ou permissao, e o que fica fora do escopo. Nao pergunte sobre
stack, biblioteca ou estrutura de pastas.

## Passo 3 - Classificar o rigor

Aplique a secao de rigor progressivo do contrato. Declare em uma linha se a mudanca e Lite
ou Full e por que. Full exige design.

## Passo 4 - Gerar os artefatos

Crie a pasta da mudanca em `.sdd/changes/<change-id>/` contendo:

1. `proposta.md`, no molde da referencia de artefatos.
2. `specs/<dominio>/spec.md`, um arquivo por dominio afetado, no formato de delta.
3. `design.md`, somente se o rigor for Full.
4. `tarefas.md`, checklist numerado, com o agrupamento final de verificacao.

Regra de mapeamento: todo requisito adicionado ou modificado precisa aparecer em pelo
menos uma tarefa. Se sobrar requisito sem tarefa, o plano esta incompleto e voce deve
completa-lo antes de responder.

## Passo 5 - Validar

Aplique o checklist de validacao da referencia de formato. Corrija o que estiver fora do
padrao antes de responder. Nao entregue delta invalido pedindo revisao humana do formato.

## Saida

Responda no chat, em no maximo vinte linhas:

- change-id escolhido e rigor, Lite ou Full
- arvore dos arquivos criados
- lista dos titulos de requisito, agrupados por dominio
- premissas assumidas, se houver, marcadas com a palavra PREMISSA
- perguntas em aberto, se houver

Nao reproduza o conteudo dos arquivos no chat. Eles estao em disco.
