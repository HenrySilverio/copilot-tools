---
name: angular-liquid-styling
description: Use sempre que o usuário for criar, estilizar ou corrigir um componente Angular (standalone, 21+) que consome o Liquid Design System (@bradesco/dsys-fed-liquid, CDN static.bradesco.com.br/dsysliquid). Aciona também para bugs visuais (classe Liquid não aplica, tema brad-theme-classic ausente, especificidade de CSS, Shadow DOM em Angular Elements), dúvidas sobre SCSS de componente vs. classes utilitárias Liquid, ou qualquer tarefa que mencione "design system", "liquid", "estilo quebrado", "componente não fica igual ao Figma/Storybook".
---

# Angular + Liquid Design System

Liquid é consumido como bundle CSS/JS carregado globalmente (CDN ou pacote), não como biblioteca de componentes Angular com typings. Isso muda onde o bug mora e onde a responsabilidade de estilo deve viver.

## Ponto de atenção antes de qualquer coisa

Existem dois modos de consumo possíveis no harness (o mesmo `.github` roda em múltiplos projetos Angular) — as respostas mudam conforme qual está em jogo:

- Tags `<link>`/`<script>` direto no `index.html` do host, apontando pro CDN (`reset.bundle`, `design-system.bundle`, `design-system.bundle.min.js`). **Confirmado como o modo real do recr-fed-agc-jrnd-reneg** (posvenda). Aqui o Liquid é um asset de runtime, sem type-safety, sem tree-shaking, e o JS registra custom elements.
- Pacote `@bradesco/dsys-fed-liquid` via npm, com Storybook publicado. Integração tende a ser via imports de estilo no `angular.json`, não via tag manual — relevante caso a skill seja usada em outro projeto do harness que consuma o Liquid dessa forma.

Se o projeto não for o posvenda, confirme qual dos dois modos está em jogo antes de aplicar o diagnóstico abaixo — ele assume consumo via CDN.

### Ordem de scripts no index.html (confirmado no projeto real)

No `index.html` do posvenda, `design-system.bundle.min.js` é carregado como `<script>` **síncrono** (sem `defer`/`async`), posicionado logo após `<app-root>` e antes dos bundles de bootstrap do Angular (que o CLI injeta como `type="module"`, já deferred por spec). Essa ordem é proposital: garante que os custom elements do Liquid estejam registrados no `customElements` registry antes do Angular montar a árvore de componentes.

Se alguém "otimizar" esse script adicionando `defer` (parece redundante à primeira vista, já que os module scripts do Angular já são deferred), abre uma race condition: o Angular pode tentar renderizar um componente que usa custom element do Liquid antes dele existir no registry. O sintoma é renderização quebrada ou ausente, sem erro no console — difícil de linkar à causa sem saber dessa ordem. Ao investigar bug visual "intermitente" ou "só na primeira renderização", cheque essa ordem antes de qualquer outra hipótese.

## Por que isso não fere baixo acoplamento entre MFEs

CSS/JS carregado por `<link>`/`<script>` é um asset de runtime, não uma dependência de build compartilhada — cada MFE aponta para a mesma URL de forma independente, sem passar pelo `shared: {}` do Native Federation. Isso é diferente de compartilhar o pacote npm como singleton entre remotes, que aí sim criaria acoplamento rígido. Não sugira registrar o Liquid como `shared` no `federation.config.js` — isso reintroduziria o single point of failure que o isolamento atual evita.

## Regra de composição (evita retrabalho e drift de versão)

Prioridade ao estilizar um componente novo:

1. Levante as classes Liquid existentes que já cobrem o padrão visual (grid, tipografia, botão, input, card) antes de escrever qualquer SCSS.
2. SCSS do componente só existe para: layout específico do host (posicionamento dentro do MFE), espaçamentos que a classe utilitária não cobre, estados que o Liquid não expõe como classe.
3. Nunca reimplemente em SCSS algo que já existe como classe Liquid — isso quebra na próxima major do design system (ver lição da migração 1.33→3.1 do bsc-table: o que foi feito ad-hoc por fora do catálogo virou débito na migração).

Se o Copilot Chat sugerir recriar um botão/input do zero em SCSS, isso é sinal de que a classe Liquid certa não foi identificada — pare e busque no catálogo antes de aceitar a sugestão.

## Encapsulation: o bug mais comum

Angular Elements frequentemente usa `ViewEncapsulation.ShadowDom` para isolamento do web component exportado. Shadow DOM bloqueia CSS global por definição — se o componente exportado via Angular Elements não estiver estilizado, a primeira suspeita é encapsulation, não classe errada. `ViewEncapsulation.Emulated` (padrão) não tem esse problema, pois as classes Liquid se aplicam normalmente ao DOM real.

Checklist de diagnóstico, nessa ordem:

- O componente usa `ViewEncapsulation.ShadowDom`? Se sim, o CSS global do Liquid não entra sem reinjeção explícita dentro do shadow root.
- A classe `brad-theme-classic` (ou equivalente) está presente em algum ancestral no DOM renderizado? Vários componentes Liquid são theme-scoped e não renderizam nada sem ela.
- A ordem de carregamento está correta? `reset.bundle` antes de `design-system.bundle`, e o CSS da aplicação depois de ambos — inversão de ordem causa o reset ganhar de estilos do design system pela cascata.
- Existe conflito de nome de classe entre SCSS do componente e uma classe Liquid homônima? Emulated encapsulation do Angular evita isso via atributo `_ngcontent`, mas classes aplicadas diretamente no template (fora do seletor do componente) não são protegidas.

## Quando não usar `::ng-deep` ou `!important`

Esses dois são sintoma, não solução. Antes de aceitar uma sugestão do Copilot com qualquer um dos dois, verifique se o componente Liquid expõe uma custom property CSS para o ajuste desejado — a maioria dos design systems maduros expõe tokens (`--brad-*` ou similar) exatamente para evitar overrides forçados. Se não expõe, documente como gap do design system em vez de calar o sintoma no código do consumidor.

## Prompt de referência para o Copilot Chat/CLI

Para criar componente novo: peça para listar as classes Liquid candidatas antes de gerar qualquer template, depois gerar o standalone component (signals, sem NgModule) usando essas classes no template e SCSS mínimo.

Para bug visual: peça para o Copilot inspecionar encapsulation mode, presença da classe de tema no DOM, e ordem de carregamento dos bundles antes de propor qualquer alteração de estilo — não aceitar patch de CSS sem esse diagnóstico anterior.

## Catálogo de classes (evita "recriar em SCSS" por não saber que a classe existe)

`scripts/extract-liquid-classes.mjs` baixa os bundles CSS e gera o índice num diretório de saída (criado automaticamente, não precisa existir antes): `node scripts/extract-liquid-classes.mjs 3.1.0 --out=../../liquid-catalog`, a partir de `skills/angular-liquid-styling/`. Gera `liquid-classes-index.json` (índice completo) + `liquid-classes-summary.md` (só grupos e contagem) dentro de `liquid-catalog/`. Rode uma vez por versão do Liquid, fora do fluxo do Copilot (é operação de rede, não de raciocínio) — esse diretório de saída fica fora da pasta da skill porque é dado específico do projeto/versão, não da ferramenta.

O script detecta `HTTP_PROXY`/`HTTPS_PROXY` no ambiente e monta o túnel `CONNECT` sozinho, usando só `http`/`https`/`tls` nativos do Node — zero dependência nova, roda igual em qualquer repo sem `npm install` e sem aparecer no scan do Mend. Isso existe porque o `fetch` nativo do Node não respeita essas variáveis (diferente do `curl`), e o objetivo é não precisar instalar nada por projeto pra distribuir isso pro time inteiro.

Para consultar, use sempre `scripts/query-liquid-classes.mjs <termo> --dir=../../liquid-catalog` via terminal — o Copilot deve ler a saída filtrada do comando, nunca abrir o `liquid-classes-index.json` inteiro. Um design system atômico tende a ter milhares de classes; carregar o índice inteiro no contexto é o mesmo erro que o `bff-contract` evita com o OpenAPI monolítico.

Antes de escrever SCSS novo para um padrão visual, rode a consulta pelo termo do componente (ex.: `btn`, `input`, `card`) e confirme que a classe não existe antes de assumir que precisa criar.

## Referência rápida

| Asset Liquid | Como é consumido | Cuidado Angular |
|---|---|---|
| reset.bundle.min.css | `<link>` antes do design-system | ordem de import no `angular.json`/`index.html` importa |
| design-system.bundle.min.css | `<link>` | fonte das classes utilitárias/componentes — nunca duplicar em SCSS |
| design-system.bundle.min.js | `<script>` com integrity/crossorigin | pode registrar custom elements; se sim, componentes host precisam de `CUSTOM_ELEMENTS_SCHEMA` |
| `brad-theme-classic` | classe em ancestral (body ou wrapper) | escopo de tema — confirmar presença no shell host ao trabalhar dentro de um remote MFE, não hardcodar em componente de feature |