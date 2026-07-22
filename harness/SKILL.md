---
name: sdd-openspec
description: Fluxo de desenvolvimento guiado por especificacao (SDD) sobre a estrutura de pastas openspec/. Use SEMPRE que o pedido envolver planejar, propor, especificar, implementar, revisar, verificar ou arquivar uma mudanca, e sempre que aparecerem os termos proposal.md, tasks.md, design.md, delta spec, requisito, cenario, openspec, ou os comandos /sdd-plan, /sdd-implement, /sdd-review, /sdd-archive. Use tambem quando alguem pedir "cria a feature X" sem que exista especificacao: a resposta correta e abrir a proposta antes de escrever codigo.
---

# SDD - Contrato OpenSpec

Fonte unica de verdade do fluxo spec-driven. Os prompts `/sdd-plan`, `/sdd-implement`,
`/sdd-review` e `/sdd-archive` sao apenas invocadores finos deste contrato.

## Escopo

Cobre **processo e artefatos**. Nao cobre stack, framework, padroes de codigo nem testes.
Regras tecnicas vem das instructions do projeto e de outras skills, nunca daqui.

## Dependencias

Nenhuma. O CLI `openspec` e **opcional** (ver secao "Politica de CLI").

---

## 1. Estrutura canonica

```
openspec/
  project.md                       # contexto do projeto (opcional, 1 pagina)
  specs/                           # FONTE DE VERDADE: como o sistema se comporta hoje
    <dominio>/spec.md
  changes/
    <change-id>/                   # uma mudanca em andamento
      proposal.md                  # por que e o que
      specs/<dominio>/spec.md      # delta: ADDED / MODIFIED / REMOVED
      design.md                    # como (opcional, so em risco alto)
      tasks.md                     # checklist de implementacao
    archive/
      YYYY-MM-DD-<change-id>/
```

**Invariantes:**

- `openspec/specs/` descreve o comportamento **atual**. Nunca e editado por `/sdd-plan`
  nem por `/sdd-implement`. So muda no archive.
- `openspec/changes/<id>/specs/` contem **delta**, nunca a spec inteira.
- Cada mudanca e autocontida. Duas mudancas podem tocar o mesmo dominio em paralelo
  desde que alterem requisitos diferentes.

## 2. Identificador da mudanca (change-id)

`kebab-case`, comecando por verbo, no maximo 4 palavras.
Bom: `add-2fa-login`, `fix-session-timeout`, `refactor-payment-client`.
Ruim: `feature-1`, `HU-4821`, `melhorias`, `ajustes-do-time`.

Se existir chave de issue/ticket, ela vai no `proposal.md`, **nao** no id.

## 3. Artefatos - regras duras

| Artefato | Contem | Nunca contem |
|---|---|---|
| `proposal.md` | intencao, escopo (in/out), abordagem em 1 paragrafo | codigo, nome de classe, cronograma |
| `specs/**/spec.md` | requisitos e cenarios observaveis | nome de arquivo, biblioteca, passo a passo |
| `design.md` | decisoes tecnicas com alternativas descartadas | requisitos de negocio |
| `tasks.md` | checklist numerado e verificavel | justificativa (isso e do proposal) |

**Teste rapido de spec:** se a implementacao pode mudar sem alterar o texto, o texto esta
no lugar certo. Se voce precisou citar um nome de classe, moveu detalhe de design para
dentro da spec - corrija.

## 4. Rigor progressivo

Padrao = **Lite**: requisitos curtos, escopo claro, poucos cenarios de aceite, sem `design.md`.

Suba para **Full** (com `design.md` obrigatorio) apenas quando houver pelo menos um:

- mudanca de contrato entre camadas (por exemplo MFE <-> BFF)
- migracao de dados ou operacao irreversivel
- requisito regulatorio, de seguranca ou de privacidade
- mais de um time ou repositorio envolvido

Cerimonia acima do risco e desperdicio de token e de tempo do time.

## 5. Formato de requisitos e delta specs

Leia `references/delta-spec-format.md` antes de escrever qualquer `spec.md`.
Leia `references/artifact-templates.md` para os moldes de proposal, design e tasks.

Resumo minimo (nao substitui a leitura):

- `### Requirement: <Nome>` seguido de uma frase com SHALL / MUST / SHOULD / MAY.
- Cada requisito tem **pelo menos um** `#### Scenario:` em GIVEN / WHEN / THEN.
- No delta, os requisitos ficam sob `## ADDED Requirements`, `## MODIFIED Requirements`
  ou `## REMOVED Requirements`.

## 6. Politica de CLI (importante)

O time **nao precisa** ter o OpenSpec instalado. Ordem de tentativa:

1. Verifique disponibilidade com `openspec --version`.
2. Se disponivel: use o CLI para validar e arquivar.
3. Se indisponivel: execute o fluxo **manualmente** seguindo este contrato - criar pastas,
   escrever markdown, mover diretorios. O resultado em disco deve ser identico.

Nunca instale o CLI por conta propria. Nunca falhe a tarefa por ausencia do CLI.
Nunca peca ao usuario que aprenda o OpenSpec: os comandos `/sdd-*` sao a interface.

## 7. Portoes de qualidade

Antes de encerrar qualquer etapa, verifique:

- [ ] Todo requisito tem no minimo um cenario.
- [ ] Todo cenario e verificavel (daria para escrever um teste automatizado a partir dele).
- [ ] O delta so referencia dominios que existem em `openspec/specs/` ou que estao sendo
      criados nesta mudanca.
- [ ] `MODIFIED` reescreve o requisito **inteiro** no estado final, nao so a parte alterada.
- [ ] `tasks.md` nao tem tarefa sem criterio de conclusao observavel.

## 8. Limites de comportamento

- Nao escreva codigo de producao durante `/sdd-plan`.
- Nao edite `proposal.md` ou `specs/` durante `/sdd-implement` sem declarar explicitamente
  que a implementacao revelou premissa errada - e nesse caso pare e reporte antes de seguir.
- Nao marque tarefa como concluida sem evidencia (comando executado, arquivo alterado).
- Ambiguidade nao se resolve por suposicao: liste as perguntas e pare.
