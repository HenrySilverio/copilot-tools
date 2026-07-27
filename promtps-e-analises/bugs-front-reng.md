Não. Rodar `/sdd-plan` para o item 1 seria gerar spec para algo que você ainda não diagnosticou — spec sem causa raiz confirmada é o mesmo erro que você já apontou no fix do `brad-btn`: primeiro achar o "porquê", documentar depois. Divido em duas trilhas:

## Trilha A — Item 1 (investigação, sem spec ainda)

Não usa `/sdd-plan`. Usa um agente read-only (`codebase`, `search`, `usages`) para levantar hipótese antes de qualquer plano.

**Prompt 1 — Diagnóstico de paridade de ambiente:**
```
Investigue por que o bsc-footer.component renderiza corretamente em local mas
perde espaçamento/posicionamento de componentes em HOM. NÃO proponha fix ainda.

Compare, entre os dois ambientes:
1. federation.config.js: shared config do host vs remote em HOM — há alguma
   dependência de estilo (@bradesco/dsys-fed-liquid) marcada como shared que
   deveria ser isolada?
2. Ordem de carregamento dos remotes no manifest de HOM vs local
3. Se algum CSS do footer depende de custom properties (--liquid-*) definidas
   globalmente pelo shell, e se essas variáveis existem no build de HOM
4. Versão do @bradesco/dsys-fed-liquid resolvida em HOM vs local (lockfile
   drift entre ambientes)

Retorne apenas: causa raiz confirmada + evidência (arquivo:linha ou log).
Não edite nada.
```

Só depois de ter a causa raiz confirmada você decide: é bug pontual (correção direta) ou é decisão arquitetural (aí sim vira spec). Rodar `/sdd-plan` antes disso é planejar em cima de um sintoma, não de uma causa.

## Trilha B — Itens 2, 3, 4 (contrato de layout do footer)

Esses três são a mesma responsabilidade (onde vive o controle de dimensão/posição do footer no MFE), então cabem num único `/sdd-plan` — mas com escopo explícito para não deixar o spec ambíguo.

**Prompt 2 — `/sdd-plan`:**
```
/sdd-plan

Escopo: contrato de layout do bsc-footer.component dentro do MFE reneg/posvenda,
isolado do shell.

Requisitos a especificar:
1. Footer deve permanecer ao final da página independente da altura do
   conteúdo (quantidade de dívidas renderizadas) — sem sobrepor ou empurrar
   o último card. Especifique via contrato flex/grid (ex: sticky footer
   pattern com min-height: 100vh no container pai + margin-top: auto),
   não via cálculo JS de posição.
2. style.scss do footer não é aplicado quando o componente é consumido via
   Native Federation pelo shell. Diagnostique se é ViewEncapsulation.Emulated
   vs estilo esperado como global, e especifique onde o estilo deve viver
   para respeitar o isolamento do remote (não introduzir estilo global no
   shell como solução).
3. Largura máxima dos componentes: especifique um token de design escopado
   por feature (não uma variável global compartilhada entre MFEs) —
   avalie CSS custom property com fallback local vs Angular Elements attr.

Restrição arquitetural: nenhuma das três soluções pode introduzir
acoplamento entre o shell e o remote (sem CSS global injetado pelo shell,
sem shared config novo no federation.config.js). Cada MFE deve resolver
seu próprio contrato de estilo.

Gere o spec em .sdd/, não implemente ainda.
```

**Prompt 3 — `/sdd-implement`** (só depois de você ratificar o spec):
```
/sdd-implement

Implemente o spec gerado para o contrato de layout do bsc-footer.
Siga Clean Architecture: qualquer lógica de posicionamento fica em
shared/ui, nada em core ou domain. Rode a suite Jest do bsc-footer
existente antes e depois — os 11 testes atuais não podem quebrar
(data-testid intocado).
```

**Prompt 4 — `/sdd-review`:**
```
/sdd-review

Valide implementação contra o spec: confirme isolamento (nenhum CSS
global novo no shell, nenhum shared novo no federation.config.js),
confirme que a suite Jest passa integralmente, e sinalize qualquer
desvio do contrato especificado.
```

**Trade-off de juntar 2+3+4 num spec só:** ganha velocidade e visão consolidada do "contrato do footer", mas se a causa raiz de um deles vazar para os outros (ex: o fix do item 3 exigir mudar a estratégia do item 1 no shell), você tem retrabalho de spec inteiro. Alternativa mais conservadora: rodar `/sdd-plan` separado para o item 3 (é o único que mexe em encapsulamento/isolamento, os outros são CSS puro) — mais overhead de sessão, mas spec mais limpo e arquivavel isoladamente se decisões divergirem depois.


----

Sim, consome muito mais — e o motivo técnico é importante, não é só "mais chars processados".

**Sem `#readFile` explícito**, o Copilot Chat (ou o agente) precisa primeiro descobrir onde procurar. Isso significa:

1. **Chamadas de tool de busca antes de qualquer resposta** — `codebase`/`search`/`usages` rodam glob + grep + ranking semântico sobre o workspace inteiro. Cada resultado candidato (ainda que não usado na resposta final) entra no contexto para o modelo decidir relevância. Isso é token gasto em *triagem*, não em trabalho.
2. **Falso positivo custa retrabalho** — numa mono-repo com micro-frontends (seu caso: reneg/posvenda + outros remotes no mesmo host), buscar "footer" sem escopo pode trazer `bsc-footer` de outro MFE, componentes de terceiros do `@bradesco/dsys-fed-liquid`, ou até o BFF YAML se ele mencionar footer em algum schema. O modelo lê tudo isso para descartar — token pago, zero valor.
3. **Efeito colateral pior que custo:** para o item 3 dos seus bugs (encapsulamento CSS vazando pelo shell), busca ampla sem escopo tem alta chance de o agente "corrigir" o arquivo errado — por exemplo, aplicar um fix de estilo no host em vez do remote, exatamente o tipo de acoplamento que você está tentando evitar.

**Comparação de custo real:**

| Abordagem | Tool calls prévias | Contexto injetado | Risco arquitetural |
|---|---|---|---|
| `#readFile` explícito nos arquivos do plan/diagnóstico | 0 (direto) | Só o necessário | Baixo — você controla o blast radius |
| Deixar buscar livre | 3–8+ (grep/rank/re-rank) | Todo candidato ranqueado, incluindo descartes | Alto — pode tocar arquivo fora do MFE alvo |

Isso é literalmente o seu princípio de **on-demand over always-on** aplicado à sessão de chat, não só às skills: contexto sempre-ligado (busca livre) tem custo de token que precisa ser justificado, e aqui não é — você já sabe exatamente quais arquivos o diagnóstico e o spec tocam.

**Recomendação prática para os prompts que te dei:** referencie explicitamente com `#file` ou `#readFile`:

- Prompt 1 (diagnóstico): `#readFile federation.config.js` (host e remote, se forem arquivos separados), `#readFile bsc-footer.component.ts/html/scss`, e se existir, o manifest de HOM.
- Prompt 2 (`/sdd-plan`): os mesmos + qualquer `*.instructions.md` de layout que já exista, para não duplicar convenção.

Se o agente `test-auditor` ou o `sdd-workflow` já tiver path-scoping configurado nos `.instructions.md`, isso ajuda mas não substitui — instruction files restringem *quando* o contexto é injetado automaticamente, não impedem uma tool call de busca livre disparada pelo próprio prompt do usuário.