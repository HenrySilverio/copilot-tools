---
description: 'Gera mensagens de commit (Conventional Commits, PT-BR, por camada) a partir das alterações atuais do repositório.'
---

Analise as alterações do repositório e gere mensagens de commit.

1. Rode `git status --short` primeiro — é a fonte da verdade de quais arquivos mudaram (staged, unstaged e novos).
2. Para cada arquivo listado, pegue o diff certo conforme o status:
   - `M `/`A `/`D ` (staged) → `git diff --staged -- <arquivo>`
   - ` M` (modificado, não staged) → `git diff -- <arquivo>`
   - `??` (novo, não rastreado) → não tem diff; leia o conteúdo do arquivo direto.
   - Nunca confie só em `git diff` puro — ele ignora staged e untracked.
3. Agrupe os arquivos por camada: controller/api, service, repository, model/dto, testes, config, build, ci, docs, estilo, front-end. Uma mensagem por camada, não por arquivo.
4. Escolha o type pelo conteúdo real do diff: feat, fix, refactor, perf, style, test, docs, build, ci, chore.
5. Formato de cada commit, em português, imperativo:

```
tipo(escopo): resumo curto
- detalhe opcional (só se o título não bastar)
```

**Saída obrigatória:** responda direto no chat, em texto — nunca crie, edite ou salve nenhum arquivo. Apenas as mensagens de commit, uma por camada, sem introdução nem explicação antes/depois.
