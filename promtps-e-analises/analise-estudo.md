# Inventário de consumo do Design System "Liquid" — MFE `recr-fed-agc-posvenda`

Escopo: `src/app`. Sem alterações feitas (READ-ONLY).

## 1. Web components JS interativos (`<brad-*>` com estado/eventos/input)

Único grupo interativo encontrado: **tabs**. Sem bindings de evento (`(brad-*)`) e sem chamadas imperativas no `.ts` (nenhum `getElementById`/`querySelector`/`customElements` apontando para `brad-*`; `ViewChild` existentes são para `barcodeCanvas`/BscTable, não Liquid).

| Tag               | props/attrs usados                                       | eventos          | chamada imperativa? | 1 arquivo:linha                  |
| ----------------- | -------------------------------------------------------- | ---------------- | ------------------- | -------------------------------- |
| `brad-tabs`       | `brad-on-color="false"`, `brad-indicator="bottom"`, `id` | nenhum no código | n                   | menu-cabecalho.component.html:7  |
| `brad-tab-list`   | `aria-labelledby`, `class`                               | nenhum           | n                   | menu-cabecalho.component.html:9  |
| `brad-tab`        | `id`, `aria-selected`, `aria-controls`, `aria-disabled`  | nenhum no código | n                   | menu-cabecalho.component.html:10 |
| `brad-tab-panels` | `class`                                                  | nenhum           | n                   | menu-cabecalho.component.html:16 |
| `brad-tab-panel`  | `id`, `aria-labelledby`, `class`                         | nenhum           | n                   | menu-cabecalho.component.html:17 |

## 2. Web components presentacionais (contagem)

- **1** tag: `brad-card` — dashboard.component.html:4 (attr `brad-type="default"`, puramente estilístico).
- `brad-tab-list`/`brad-tab-panels`/`brad-tab-panel` contabilizados em (1) como parte do grupo tabs, não como ícone/badge/divider.

## 3. Consumo CSS (`class="brad-*"` — independe da versão do JS global)

Total: **~227** ocorrências de tokens `brad-*` em classes/templates:

- HTML: **165** linhas, **39** tokens únicos.
- TS (template-strings, ex.: `card-status-renegociacao`, `dashboard`, `card-segunda-via`): **49** linhas, **14** tokens.
- SCSS: **13** linhas (ex.: `app.component.scss:8`, `card-dados-cliente.component.scss:168`).

Principais famílias (1 exemplo:linha cada):

- Layout/flex: `brad-flex` — dashboard.component.html:1
- Tipografia: `brad-font-title-lg` — pagamento-da-entrada.component.html:6
- Botões: `brad-btn`, `brad-btn-primary` — assinatura-documentos.component.html:37
- Espaçamento: `brad-m-md-b` — detalhes-contrato.component.html:3
- Card/alert/theme: `brad-card`, `brad-alert`, `brad-theme-classic` — bsc-card.component.html:1
- Cores/logo/ícone: `brad-color-secondary-gradient-45`, `brad-logo`, `brad-text-color-cta` — menu-cabecalho.component.html:2
- Tabela/text-field: `brad-table`, `brad-text-field`, `brad-text-field-select` — bsc-table.component.html:1

### Fora do escopo (não são Design System)

- `x-brad-access-token-cliente`, `x-brad-centrocusto-versao` (http.service.ts:20-21) = headers HTTP.
- `brad-loader__container` (loading.service.ts:16) = string de classe CSS p/ loader; sem tag `<brad-loader>`.

## Veredito de dependência JS vs CSS

- **JS (runtime entre versões)**: mínima — só o grupo `brad-tabs` (5 tags, sem eventos nem API imperativa usada). Risco de quebra em Shell com Liquid diferente: **baixo e localizado** em `menu-cabecalho`.
- **CSS**: esmagadora maioria (~227 usos). Como classe `brad-*` não depende da versão do bundle JS global, **o MFE é altamente resiliente a divergência de versão do Liquid**, desde que o Shell carregue as mesmas folhas de estilo (ver `index.html`: CDN `design-system-3.1.0`).

## 2. Overlays fora do template

| o que abre                                            | arquivo:linha                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| CDK Overlay / MatDialog / CdkPortal / ComponentPortal | não encontrado (sem `OverlayModule`, `MatDialog`, `CdkPortal`, `ComponentPortal`) |

Notas (não são overlays):

- `LoadingService.overlay()` (loading.service.ts:26) injeta abstração `overlayService` (`open/close`); o host do overlay é externo (provável Shell), não cria elemento no `body` aqui.
- Única criação em `document.body`: `<a>` temporário p/ download — card-pagamento-das-parcelas.component.ts:178.

## 3. Veredito

- Tags `<brad-*>` distintas: 6 | dessas, interativas: 5 | presentacionais: 1 (`brad-card`)
- Classes `class="brad-*"` distintas: 51 (39 HTML + 14 TS + 13 SCSS, unificado; exclui headers HTTP `x-brad-*`)
- ViewEncapsulation do AppComponent: `Emulated` (default, não declarado) — app.component.ts:12
- Onde CSS/JS do Liquid é carregado: `index.html` (CDN `dsysliquid` `design-system-3.1.0`: `<link>` reset/design-system CSS + `<script>` JS no `body`); não há import em `angular.json` nem `*.ts`
- Predominância: CSS-driven — ~227 usos de classes `brad-*` vs apenas 6 tags, sendo 5 do grupo tabs sem eventos/API imperativa.
- Web components interativos que precisariam virar Angular nativo OU seguir a versão do Shell: `brad-tabs`, `brad-tab-list`, `brad-tab`, `brad-tab-panels`, `brad-tab-panel`
