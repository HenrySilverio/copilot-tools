---
description: Gera descrição de Pull Request a partir do git (à prova de parsing frágil)
mode: agent
model: GPT-5 mini
---
You are generating a Pull Request description from git output. Follow this protocol EXACTLY.

## Execution protocol (no improvisation allowed)
Run these commands ONE AT A TIME, each as a SEPARATE terminal call, and read each
command's own stdout directly:

1. git fetch origin --quiet
2. git log origin/${input:base=main}..HEAD --no-merges --pretty=tformat:"%h %s"
3. git diff origin/${input:base=main}...HEAD --stat
4. git diff origin/${input:base=main}...HEAD --diff-filter=d

Absolute rules:
- Do NOT chain these with && into one call. Run them separately.
- Do NOT redirect output to a file. Do NOT invent delimiters (like ---END---) and
  do NOT search a file for them. Read each command's stdout as-is.
- Do NOT open project files, run workspace-wide reads, or run any command not listed.
- Anything not present in the command output = "(confirmar)". Do not invent.

## Empty-state handling (prevents false stops)
- If step 2 returns commits: proceed normally.
- ABORT ONLY IF step 2 AND step 3 are BOTH empty — that means the branch is not ahead
  of the base (wrong base branch, or branch not pushed). Then stop and tell the user to
  confirm the base branch or run: git push origin <branch>.
- If step 2 is empty but step 3 has changes: proceed and note "commits não legíveis"
  instead of aborting.

## Output — Brazilian Portuguese, Markdown, in this chat ONLY
## Resumo
2-3 frases: o que mudou e por quê (use os commits do passo 2).

## Principais alterações
Bullets agrupados por área/funcionalidade (passos 3 e 4).

## Arquivos removidos  ← APENAS se o --stat mostrar deleções
UMA linha: quantos foram removidos + motivo INFERIDO só dos commits (ex.: "stop tracking",
"remove", "refactor remove obsolete"). Se os commits não explicarem:
"remoção de N arquivos (confirmar motivo)". NÃO liste arquivo por arquivo.
NÃO assuma "limpeza" sem evidência nos commits.

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