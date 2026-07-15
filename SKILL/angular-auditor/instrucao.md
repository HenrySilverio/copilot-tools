Vou desmontar a premissa antes de entregar arquivo.

## 1. O pedido, como está, é um anti-padrão

"Um agente que analisa o código + acha vulnerabilidades + sugere melhorias" são **três jobs com três contratos de saída e três necessidades de contexto diferentes**. Empacotados num artefato só, o modelo faz os três de forma rasa e devolve um muro de findings que ninguém aciona. Três problemas concretos:

- **LLM não é SAST.** Você já tem `eslint@9` + `angular-eslint@21` + `@ngrx/eslint-plugin` + `npm audit`. Pedir "ache vulnerabilidades" genericamente para um MFE Angular gera boilerplate de OWASP Top 10 alucinado sobre uma superfície que não tem SQL nem servidor. O LLM só paga o token onde a ferramenta determinística é cega: fluxo de PII, fronteira de camada, contrato federado, semântica de estado.
- **Auditor com permissão de `edit` não audita.** Ele começa a "consertar" no meio da varredura, estoura contexto e você perde o relatório. Auditoria é read-only por construção.
- **Sem contrato de saída, não há SDD.** Se o findings não sai como artefato estruturado (rule-id, severidade, file:line, evidência, fix), não dá pra diffar entre execuções, nem alimentar um segundo agente, nem medir regressão.

## 2. Decisão arquitetural

| Opção | Veredito |
|---|---|
| Prompt file único | Rejeitado. Não restringe tools, não separa persona, catálogo de regras vira monólito de contexto. |
| `.instructions.md` com `applyTo: **/*.ts` | **Rejeitado por poluição.** Carregaria 200 linhas de regras de segurança toda vez que você pedir pra renomear uma variável. |
| **Agent (persona + tools read-only) + Skills (catálogos de regra em `context: fork`)** | **Escolhido.** |

Por quê: o **agent** carrega só a persona e o contrato de saída (~80 linhas sempre). Os **skills** usam disclosure progressivo — só `name` + `description` ficam em contexto; o corpo só entra quando o eixo é acionado. E com `context: fork` cada módulo roda em subagente dedicado: lê os arquivos, e devolve **só a tabela de findings** pro pai. Os 40 arquivos lidos nunca sujam a conversa principal.

Ambos vivem em `.github/agents/` e `.github/skills/` — detecção automática por workspace, **zero registro em settings**. Bate com sua restrição de distribuição por cópia.

## 3. Os artefatos

Ancorei as regras no *seu* código (`shared: {}`, os dois `exposes`, `dto/` vs `modelos/`, GTM + pipes de CPF, `jsbarcode`, aliases `@core/`/`@shared/`).## 4. Instalação e riscos

Copie a árvore `.github/` inteira. Detecção é automática, sem settings.

```
.github/
├── agents/{auditor-angular,remediador-angular}.agent.md
└── skills/{auditoria-seguranca-mfe,auditoria-arquitetura-mfe,auditoria-estado-angular}/SKILL.md
```

Uso: selecione **Auditor Angular MFE** no dropdown de agents → `diff` ou `src/app/domain/store`. O botão de handoff aparece no fim.

Três coisas que vão te morder:

- **`context: fork` é experimental.** Exige `github.copilot.chat.skillTool.enabled`. Sem ele, os skills carregam inline no contexto do pai — funciona, mas você perde exatamente a economia de token que motivou o design. Ligue antes de julgar o resultado.
- **Nomes de tool variam por versão.** Usei `search/codebase`, `search/usages`, `runCommands`, `edit`. Confira no seu VS Code — tool inexistente é **silenciosamente ignorada**, e um auditor sem `runCommands` vira gerador de opinião.
- **O `name` do skill tem que bater com o nome da pasta.** Divergiu, o skill não carrega e ninguém te avisa.

## 5. O trade-off que você está aceitando

Esta arquitetura tem **cinco arquivos e três lugares para drift acontecer**. Um `prompt.md` único teria um. Você paga manutenção em troca de: escopo de tools por persona (auditor não edita), disclosure progressivo do catálogo, e um contrato de saída diffável.

Isso só se paga se a auditoria for **recorrente** (pre-PR, por sprint). Se for análise pontual de uma feature, é over-engineering — use um `.prompt.md` com o corpo do auditor e pronto.

Alternativa que eu defenderia acima desta se o volume justificar: mover as regras determinísticas (`ARQ-01` matriz de camadas, `SEC-02` storage, `SEC-03` bypass, `EST-07` any) para **regras ESLint custom + `eslint-plugin-boundaries`**. Elas são estruturais — o LLM é a ferramenta errada e mais cara para o que um AST resolve com zero variância. Aí o agent fica só com o que é irredutivelmente semântico: SEC-01 (PII em telemetria), SEC-04 (validação de fronteira), ARQ-02/03 (contrato), EST-03/05 (intenção). O catálogo cai pela metade e a precisão sobe.