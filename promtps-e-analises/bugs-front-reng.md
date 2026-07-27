## 1. Modelo/modo para o `/compact`

Mantenha **Claude Sonnet 5, mesma sessão, reasoning effort baixo** (o que já está selecionado no seu print). Trocar de modelo ou subir o esforço de raciocínio pra rodar compactação é gasto de token sem retorno — é resumo mecânico guiado por instrução explícita, não trabalho de julgamento. Rode o `/compact` com a instrução de preservação que já te passei antes de fechar essa janela.

## 2. Próximos passos — e por que são 3 janelas, não 2

Com os arquivos reais em mãos, o quadro mudou: itens 2 e 4 já têm causa raiz confirmada por análise estática (`app.component.scss` não tem `flex-column`/`margin-top:auto`, `max-width:1016px` é global no `.app-shell`). O item 3 não tem causa raiz ainda — falta um arquivo crítico que você não me mandou: **`bootstrap-webcomponent.ts`**. É ele que decide como o Angular Elements bootstrapa o custom element, e é a peça que explica se o `style.scss` do footer está de fato sendo injetado no `<head>` do shell ou não. Sem isso, qualquer spec pro item 3 seria chute.

Isso quebra a divisão que te dei antes (2+3+4 juntos). Correção: **3 janelas**, porque item 3 tem risco arquitetural (isolamento) que os outros dois não têm — juntar geraria um spec que mistura "ajuste de CSS" com "decisão sobre encapsulamento", violando baixo acoplamento entre as próprias mudanças.

---

### Janela 1 — Diagnóstico item 1 (regressão em HOM)
**Modo:** Ask / agente read-only (`codebase`, `search`, `usages` apenas — sem edição)
**Modelo:** Sonnet 5, reasoning effort **médio-alto** — diagnóstico errado aqui custa retrabalho de spec inteiro, mesmo argumento que você já aplica pra não usar modelo barato em test-gen.

```
#file:src/app/app.component.scss
#file:src/styles.scss
#file:federation.config.js
#file:src/app/shared/components/bsc-footer/bsc-footer.component.scss

Investigue por que bsc-footer perde espaçamento/posicionamento em HOM mas
funciona local. NÃO proponha fix ainda.

Contrato confirmado: federation.config.js usa shareAll({singleton:true,
strictVersion:false}) — Angular/rxjs COMPARTILHADOS com o shell, não isolados.
Logo a hipótese de "isolamento quebrado" está descartada; investigue:

1. Se a versão de Angular resolvida como singleton em HOM diverge da local
   (lockfile drift) e se isso afeta timing de bootstrap do zone.js
2. Se app.component.scss (.app-shell, max-width:1016px, min-height:100dvh)
   depende de alguma custom property herdada do host que só existe no
   ambiente local
3. Ordem de carregamento dos remotes no manifest de HOM vs local

Preciso comparar computed styles renderizados (DevTools) de HOM vs local —
vou anexar screenshots/HTML computado na próxima mensagem se a análise
estática não for suficiente.

Retorne: causa raiz confirmada + evidência (arquivo:linha). Não edite nada.
```

---

### Janela 2 — Diagnóstico + spec do item 3 (encapsulamento via shell)
**Modo:** Ask primeiro (diagnóstico) → Plan depois (`/sdd-plan`), só após causa raiz confirmada
**Modelo:** Sonnet 5, reasoning effort **alto** — é decisão arquitetural (onde vive o estilo do componente federado), não CSS mecânico.

Antes de rodar, você precisa anexar `bootstrap-webcomponent.ts` — não está nos arquivos que mandou e é o arquivo central desse diagnóstico.

```
#file:src/bootstrap-webcomponent.ts
#file:src/app/shared/components/bsc-footer/bsc-footer.component.ts
#file:src/app/shared/components/bsc-footer/bsc-footer.component.scss
#file:federation.config.js

Diagnostique por que bsc-footer.component.scss não é aplicado quando o
componente é consumido pelo shell via este bootstrap-webcomponent.ts.

Confirme: qual ViewEncapsulation está em uso (BscFooterComponent não define
explicitamente — está no default Emulated). Verifique se createCustomElement
aqui usa Shadow DOM ou injeta <style> no <head> do document, e se
shareAll({singleton:true}) no federation.config.js afeta a ordem/timing
dessa injeção quando o shell já tem uma instância Angular rodando.

NÃO proponha fix ainda — apenas causa raiz + evidência.
```

Depois de confirmado, aí sim `/sdd-plan` escopado só nisso (Plan mode):
```
/sdd-plan

Escopo: contrato de encapsulamento de estilo do bsc-footer quando consumido
via Angular Elements pelo shell (causa raiz confirmada na diagnose anterior:
[cole aqui a conclusão]).

Restrição: solução não pode introduzir CSS global no shell nem estilo
compartilhado — deve resolver dentro do encapsulamento do próprio remote
recr-fed-agc-jrnd-reneg.

Gere spec em .sdd/, não implemente.
```

---

### Janela 3 — Spec + implementação itens 2 e 4 (layout contract)
**Modo:** Plan (`/sdd-plan`) → Agent com aprovação manual (não Autopilot — `app.component.scss` é usado pela app-shell inteira, blast radius alto)
**Modelo:** Sonnet 5, effort médio pro plan; pode manter default pro implement, já que uma vez o spec aprovado a mudança é mecânica (flex + custom property).

```
#file:src/app/app.component.scss
#file:src/app/shared/components/bsc-footer/bsc-footer.component.scss
#file:src/app/shared/components/bsc-footer/bsc-footer.component.html

/sdd-plan

Escopo: contrato de layout — footer sempre ao final da página, max-width
escopável por feature.

Causa raiz confirmada por análise estática:
1. .app-shell (app.component.scss) não usa flex-column nem margin-top:auto
   no footer — por isso ele sobe quando há pouco conteúdo renderizado.
2. max-width:1016px está fixo e global no .app-shell — não há mecanismo de
   override por feature.

Especifique:
1. .app-shell com display:flex, flex-direction:column, min-height:100dvh
   (já existe) + footer com margin-top:auto — ou main content com flex:1.
2. max-width como custom property (--app-max-width, default 1016px) com
   fallback local, permitindo cada feature sobrescrever no próprio escopo
   sem tocar app.component.scss.

Gere spec em .sdd/, não implemente.
```

---

**Confirme antes de rodar:** `paths.md` lista `dividas.component.html` (plural), mas o arquivo que você mandou é `divida.component.html` (singular). Um dos dois nomes está errado — se usar `#file` com o nome incorreto, ele falha silenciosamente e o agente cai em busca livre, o que você está tentando evitar desde o início.