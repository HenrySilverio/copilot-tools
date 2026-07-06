---
description: Gera descrição de Pull Request a partir do git
mode: agent
model: GPT-5 mini
---
You are generating a Pull Request description. Work ONLY from git output.

Run EXACTLY these commands, in order, and nothing else:
1. git fetch origin
2. git log origin/${input:base=main}..HEAD --pretty=format:"%h %s"
3. git diff origin/${input:base=main}...HEAD --stat
4. git diff origin/${input:base=main}...HEAD --diff-filter=d

Hard constraints:
- Do NOT explore the repo, open files, or do workspace-wide reads. Only the 4 commands above.
- Do NOT create, write, or edit any file. Output ONLY in this chat.
- Base everything strictly on command output. If something isn't there, do not invent it — mark "(confirmar)".
- If step 2 returns empty, STOP and warn: branch may not be pushed or base branch is wrong.

Write in **Brazilian Portuguese**, Markdown:

## Resumo
2-3 frases: o que mudou e por quê (use os commits do passo 2).

## Principais alterações
Bullets agrupados por área/funcionalidade (use --stat + diff do passo 4).

## Arquivos removidos  ← APENAS se o --stat mostrar deleções
UMA linha: quantos foram removidos + motivo INFERIDO só dos commits.
Se os commits não explicarem: "remoção de N arquivos (confirmar motivo)".
NÃO assuma "limpeza" sem evidência. NÃO liste arquivo por arquivo.

## Impacto e atenção para o revisor
Riscos, breaking changes, pontos de atenção.


```bash
git fetch origin
git log origin/main..HEAD --no-merges --pretty=format:"%h %s" > pr-context.txt
printf "\n\n---STAT---\n" >> pr-context.txt
git diff origin/main...HEAD --stat >> pr-context.txt
printf "\n\n---DIFF---\n" >> pr-context.txt
git diff origin/main...HEAD --diff-filter=d >> pr-context.txt
```