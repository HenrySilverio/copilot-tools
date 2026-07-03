---
description: 'Gera mensagens de commit (Conventional Commits, PT-BR, por camada) a partir das alterações atuais do repositório.'
applyTo: '**'
---

# Gerador de commits

Quando eu pedir mensagem de commit ("gera o commit", "commit message", "commit dessas alterações"):

1. Rode `git status --short` primeiro — é a fonte da verdade de quais arquivos mudaram (staged, unstaged e novos).
2. Para cada arquivo listado, pegue o diff certo conforme o status:
   - `M `/`A `/`D ` (staged) → `git diff --staged -- <arquivo>`
   - ` M` (modificado, não staged) → `git diff -- <arquivo>`
   - `??` (novo, não rastreado) → não tem diff; leia o conteúdo do arquivo direto para entender o que foi adicionado.
   - Nunca confie só em `git diff` puro — ele ignora staged e untracked, por isso perde arquivo.
3. Agrupe os arquivos alterados por camada: controller/api, service, repository, model/dto, testes, config, build, ci, docs, estilo, front-end. Não crie uma mensagem por arquivo — agrupe por camada.
4. Para cada camada, escolha o type pelo conteúdo real do diff: feat, fix, refactor, perf, style, test, docs, build, ci, chore.
5. Escreva cada commit assim, em português, imperativo:

```
tipo(escopo): resumo curto
- detalhe opcional (só se o título não bastar)
```

**Saída obrigatória:**
- Responda direto no chat, em texto — nunca crie, edite ou salve nenhum arquivo (nem `.txt`, nem `COMMIT_EDITMSG`) para entregar a mensagem.
- Apenas as mensagens de commit, uma por camada, sem introdução nem explicação antes/depois.
