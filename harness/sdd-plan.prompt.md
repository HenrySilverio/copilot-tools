---
mode: agent
description: SDD - cria ou refina uma proposta de mudanca (proposal, delta specs, design opcional, tasks) na pasta openspec/.
---

# /sdd-plan

Objetivo: transformar uma intencao em uma mudanca especificada e implementavel.
**Nao escreva codigo de producao nesta etapa.**

## Passo 0 - Carregar o contrato (obrigatorio)

Leia, nesta ordem, antes de qualquer acao:

1. `.github/skills/sdd-openspec/SKILL.md`
2. `.github/skills/sdd-openspec/references/delta-spec-format.md`
3. `.github/skills/sdd-openspec/references/artifact-templates.md`

Se algum desses arquivos nao existir, pare e informe que o toolkit SDD nao esta instalado
neste repositorio.

## Passo 1 - Reconhecer o terreno

- Verifique se `openspec/` existe. Se nao existir, crie `openspec/specs/` e
  `openspec/changes/` e siga em frente (nao rode `openspec init` sem autorizacao).
- Liste os dominios existentes em `openspec/specs/`.
- Verifique se ja existe uma mudanca em `openspec/changes/` relacionada ao pedido.
  Se existir, **refine a existente** em vez de criar outra, e diga isso ao usuario.

## Passo 2 - Entender a intencao

Intencao do usuario: **${input:intencao:O que precisa ser construido ou alterado?}**

Se a intencao nao permitir escrever cenarios verificaveis, faca ate 3 perguntas objetivas
e **pare**. Nao invente requisito para preencher lacuna.

Perguntas so sao aceitaveis sobre: regra de negocio ambigua, comportamento de erro nao
definido, limites (tempo, valor, permissao) e escopo fora. Nao pergunte sobre stack.

## Passo 3 - Classificar o rigor

Aplique a secao "Rigor progressivo" do contrato. Declare em uma linha se a mudanca e
**Lite** ou **Full** e por que. Full exige `design.md`.

## Passo 4 - Gerar os artefatos

Crie `openspec/changes/<change-id>/` com:

1. `proposal.md` - molde de `artifact-templates.md`.
2. `specs/<dominio>/spec.md` - um arquivo por dominio afetado, formato delta.
3. `design.md` - somente se Full.
4. `tasks.md` - checklist numerado, com o grupo final de verificacao.

Regra de mapeamento: todo requisito ADDED/MODIFIED precisa aparecer em pelo menos uma
tarefa de `tasks.md`. Se sobrar requisito sem tarefa, o plano esta incompleto.

## Passo 5 - Validar

- Se `openspec --version` funcionar, rode a validacao do CLI para a mudanca criada.
- Caso contrario, aplique o checklist manual de `delta-spec-format.md` secao 5.

## Saida

Responda no chat, em no maximo 20 linhas:

- change-id escolhido e rigor (Lite/Full)
- arvore de arquivos criados
- lista de requisitos por dominio (so os titulos)
- premissas assumidas (se houver) marcadas como **PREMISSA**
- perguntas em aberto, se houver

Nao cole o conteudo dos arquivos no chat. Eles estao em disco.
