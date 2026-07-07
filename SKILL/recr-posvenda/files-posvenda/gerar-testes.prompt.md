---
description: 'Gera ou completa testes unitários Jest de alta cobertura (branches >= 90%) para arquivos/pastas Angular (services, mappers, SignalStores). Cobertura por comportamento, não por linha.'
agent: agent
model: ['Claude Sonnet 5', 'GPT-5.3-Codex']
tools: ['search/codebase', 'search/usages', 'editFiles', 'terminal']
---

# Objetivo
Gerar (ou completar) o `*.spec.ts` do **alvo** usando a MENOR quantidade de tokens necessária para atingir cobertura real de comportamento. Meta dura: **branches >= 90%** (functions/lines/statements >= 90% saem como consequência). Nunca escreva teste só para "pintar linha".

# Alvo
O alvo é o arquivo/pasta referenciado no contexto (`#file` / seleção) ou `${input:alvo:cole o caminho do .ts, .spec.ts ou pasta}`.

Detecte o tipo:
- **`*.ts` (fonte)** → crie o `*.spec.ts` colocalizado.
- **`*.spec.ts` (já existe)** → leia, entenda o que falta. **Complete** o que estiver faltando e **refatore por completo** apenas os testes fracos ou quebrados; **preserve** os testes bons e significativos.
- **Pasta** → use `#tool:search/codebase` para listar os `*.ts` (exceto `*.spec.ts`) e processe **um por vez**. Se houver muitos arquivos, avise e peça confirmação antes de seguir (orçamento de token).

# Processo (interno — não narre)
1. Leia o fonte. Se ajudar a derivar casos realistas, use `#tool:search/usages` para ver como a unidade é consumida.
2. Mapeie a **API pública** + **todos os ramos**: `if/else`, ternário, `?.`, `??`, `switch`, guard clauses, caminhos de erro e `error/complete` de streams RxJS.
3. Escreva o spec seguindo `angular-jest-testing.instructions.md` (carregado automaticamente ao editar `*.spec.ts`).
4. Garanta 1 teste por ramo. Cada método público: sucesso **e** falha.
5. **Não** rode a suíte por padrão (custo de token). Só rode o jest no arquivo alvo com `#tool:terminal` se eu pedir explicitamente "valide a cobertura".

# Saída (economia de token)
- Emita **apenas** o conteúdo do `*.spec.ts` (via edição de arquivo). Não reimprima o fonte nem explique o óbvio.
- Ao completar um spec existente, resuma as mudanças em **no máximo 3 bullets**.
- Respeite o estilo do projeto: aspas simples, `printWidth` 180.
