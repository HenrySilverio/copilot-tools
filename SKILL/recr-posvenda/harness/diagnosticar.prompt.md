---
name: diagnosticar
description: Diagnostica um problema (erro de runtime, teste quebrando, comportamento errado, build falhando) e propõe correção verificada na documentação oficial das tecnologias do projeto. Não corrige de memória.
argument-hint: <sintoma: mensagem de erro, teste que falha, ou comportamento observado vs esperado>
agent: agent
model: ['Claude Opus 4.8', 'Claude Sonnet 5', 'GPT-5.3-Codex']
tools: ['search/codebase', 'search/usages', 'runCommands', 'fetch']
---

# Diagnóstico dirigido por sintoma

Stack: Angular 21 standalone + signals · NgRx SignalStore · Native Federation (remote isolado, `shared: {}`) · Jest + jest-preset-angular · Angular Elements · `bsc-table` (Tabulator por baixo).

Sua memória de treino sobre essas tecnologias está **desatualizada ou contaminada por versões antigas** (Angular pré-signals, NgRx clássico com actions/reducers). Por isso a regra central deste prompt:

> **Nenhuma correção é válida sem citar a seção da documentação oficial, buscada NESTA execução via `#fetch`, que a justifica.** O mapa de URLs está em [rules-specs/docs-map.md](../../rules-specs/docs-map.md). Resposta de memória sem fetch = diagnóstico rejeitado.

## Entrada

`$ARGUMENTS` = o sintoma: mensagem de erro completa, nome do teste que falha, ou "esperado X, observado Y". Sem sintoma → pergunte. Não aceite "revisa tudo": este prompt diagnostica UM problema por execução.

## Fase 1 — Reproduzir (determinístico primeiro, sempre)

Antes de qualquer hipótese, colete evidência mecânica. Rode o que for pertinente ao sintoma:

```bash
npx tsc -p tsconfig.app.json --noEmit        # erro de tipo
npx eslint <arquivos-suspeitos> -f compact    # violação já catalogada
npx jest <spec-relacionado> --no-coverage     # teste quebrando
```

- Erro `NG0xxx` no sintoma → o código do erro É o ponto de partida: busque `https://angular.dev/errors/NG<código>` imediatamente.
- Erro `TS<n>` → idem no handbook do TypeScript.
- Se o determinístico já explica o problema por completo, **pule para a Fase 4**. Não teorize sobre o que o compilador já cravou.

## Fase 2 — Localizar

Use `search/codebase` e `search/usages` a partir do sintoma. Delimite o raio: arquivo onde o sintoma se manifesta + quem ele importa + quem o importa. **Não abra o projeto inteiro.**

Regra de camada para a busca: sintoma na UI pode ter causa no mapper (`domain/mappers/`), no store (`domain/store/`), no service (`domain/services/`) ou no contrato (`domain/models/dto|modelos`). Siga o dado, não o stack trace superficial.

## Fase 3 — Hipóteses ranqueadas

Formule no máximo **3 hipóteses**, ordenadas por probabilidade, cada uma com:
- o mecanismo (como esse código produz esse sintoma),
- o teste que a confirma ou mata (um comando, um log, uma leitura de arquivo).

Execute os testes na ordem. **Mate hipóteses explicitamente** — escreva "descartada porque <evidência>". Hipótese que sobrevive sem teste executado não vira diagnóstico.

Padrões recorrentes deste repo para calibrar as hipóteses (verifique, não assuma):
- Cast `as unknown as` em leitura de store → tipagem do estado/`withState` frouxa na origem, não no consumidor.
- Formatter do `bsc-table` → contrato `any` em `shared/components/bsc-table` + HTML string fora do sanitizer.
- Teste Jest que passa isolado e falha em suite → estado de store singleton vazando entre specs (ver doc de testing do SignalStore).
- Tela não atualiza → mutação in-place de estado (referência não muda) ou `effect` fazendo trabalho de `rxMethod`.
- Falha só quando embarcado no shell → fronteira do custom element: `@Input()` chegando como string de atributo DOM, ou ciclo de bootstrap do Angular Elements.

## Fase 4 — Verificar na doc e corrigir

1. Identifique a(s) área(s) da causa raiz no [docs-map](../../rules-specs/docs-map.md).
2. `#fetch` a(s) URL(s) — **máximo 3 fetches por diagnóstico**; se precisar de mais, o problema está mal localizado, volte à Fase 2.
3. Confirme que a correção proposta é o que a doc atual prescreve. Se a doc contradisser sua hipótese de treino, **a doc ganha** — registre a divergência.
4. Convenção interna (`core/errors/*.md`, `rules-specs/*.spec.md`) prevalece sobre estilo da doc externa; doc externa prevalece sobre memória.

## Saída (contrato)

```markdown
## Diagnóstico — <sintoma resumido> — <data>

**Evidência determinística**: <saída relevante de tsc/eslint/jest, ou "n/a">

**Causa raiz**: <arquivo:linha> — <mecanismo em 2-3 frases>

**Hipóteses descartadas**: <lista com a evidência que matou cada uma>

**Correção**
```diff
<diff mínimo — só o necessário para a causa raiz>
```
**Fundamentação**: <URL#seção buscada> — <1 frase: o que a doc diz que sustenta o fix>

**Verificação**: <comando que prova que o sintoma sumiu>

**Efeitos colaterais**: <o que mais esse diff toca; "nenhum" exige justificativa>
```

## Disciplina

- Corrija a **causa**, não o sintoma. Silenciar erro (try/catch vazio, `any`, `@ts-ignore`, `skip` em teste) é proibido como fix.
- Diff mínimo. Refactor oportunista fora da causa raiz não entra.
- Se a causa raiz for **decisão de arquitetura** (ex.: contrato do `bsc-table`, tipagem do estado do store), entregue o fix local E aponte a correção estrutural separadamente — sem executá-la.
- Se após as 3 hipóteses o problema seguir aberto, diga isso. Relatório honesto de "não localizado, próximos passos: X" vale mais que fix especulativo.
