# Inventário Liquid — MFE Angular

## 1. Web components JS interativos (`<brad-*>`)

| Tag                     | props/attrs usados                                         | eventos | chamada imperativa? | 1 arquivo:linha                                                                        |
| ----------------------- | ---------------------------------------------------------- | ------- | ------------------- | -------------------------------------------------------------------------------------- |
| `brad-tabs`             | id, brad-on-color, brad-indicator                          | —       | s                   | `src/app/features/dividas/dividas.component.html:63`                                   |
| `brad-tab-list`         | aria-labelledby                                            | —       | n                   | `src/app/features/dividas/dividas.component.html:65`                                   |
| `brad-tab`              | aria-controls, brad-icon, aria-disabled, aria-selected, id | —       | n                   | `src/app/features/dividas/dividas.component.html:66`                                   |
| `brad-tab-panels`       | class                                                      | —       | n                   | `src/app/features/dividas/dividas.component.html:78`                                   |
| `brad-tab-panel`        | id, aria-labelledby, class                                 | —       | n                   | `src/app/features/dividas/dividas.component.html:79`                                   |
| `brad-timeline-stepper` | id, brad-is-dot, brad-type, brad-on-color                  | —       | n                   | `src/app/shared/components/bsc-timeline-stepper/bsc-timeline-stepper.component.html:2` |

**Componentes presentes JS ignorados (contagem total): 7**
(`brad-card`, `brad-alert`, `brad-alert-icon`, `brad-alert-content`, `brad-alert-body`, `brad-alert-body-middle`, `brad-alert-title`)

---

## 2. Chamadas imperativas a serviços LiquidCorp (quebra em runtime)

| Serviço                      | método                              | 1 arquivo:linha                                                                              |
| ---------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `BradTabsService`            | `getInstance`                       | `src/app/features/dividas/dividas.component.ts:128`                                          |
| `BradTableService`           | `getInstance`                       | `src/app/shared/components/tabela-contratos/tabela-contratos.component.ts:130`               |
| `BradTableService`           | `addCheckbox`                       | `src/app/shared/components/tabela-contratos/tabela-contratos.component.ts:180`               |
| `BradTableService`           | `addExpansiveLine`                  | `src/app/shared/components/tabela-contratos/tabela-contratos.component.ts:121`               |
| `BradTableService`           | `addIconExpansiveLineTitle`         | `src/app/shared/components/tabela-contratos/tabela-contratos.component.ts:262`               |
| `BradTableService`           | `addIconExpansiveLine`              | `src/app/shared/components/tabela-contratos/tabela-contratos.component.ts:263`               |
| `BradTableService`           | `customResponsiveCollapseFormatter` | `src/app/shared/components/tabela-contratos/tabela-contratos.component.ts:169`               |
| `BradTableService`           | `customCollapse`                    | `src/app/features/conclusao/etapas-pendentes/etapas-pendentes.component.ts:98`               |
| `BradTableService`           | `iconLabel`                         | `src/app/features/dividas/historico/historico.component.ts:135`                              |
| `BradTextFieldSelectService` | `getInstance`                       | `src/app/features/pagamentos/card-pagamentos/card-pagamentos.component.ts:225`               |
| `BradCalendarService`        | `getInstance`                       | `src/app/shared/components/input-calendar/input-calendar.component.ts:55`                    |
| `BradHideTextService`        | `getInstance`                       | `src/app/features/confirmacao/autorizacoes-checkbox/autorizacoes-checkbox.component.html:16` |
| `BradOverlayServiceDefault`  | `getInstance`                       | `src/app/shared/components/loading/loading.component.ts:24`                                  |

---

## 3. CSS global (`class="brad-*"`)

**Total de ocorrências:** 593

**Padrões agrupados (amostra representativa):**

- **Layout:** `brad-flex`, `brad-flex-column`, `brad-flex-row`, `brad-flex-justify-content-*`, `brad-flex-align-items-*`, `brad-gap-*`, `brad-m-*`, `brad-p-*`
- **Tokens visuais:** `brad-bg-color-*`, `brad-text-color-*`, `brad-border-color-*`, `brad-font-*`, `brad-icon-size-*`
- **Componentes como classe:** `brad-btn`, `brad-btn-primary`, `brad-btn-secondary`, `brad-btn-text`, `brad-checkbox`, `brad-text-field`, `brad-text-field-select`, `brad-card`, `brad-modal`, `brad-modal--dialog*`, `brad-table`, `brad-loader`, `brad-alert`, `brad-tag-md`, `brad-tag__text`, `brad-timeline-stepper`
- **Utilitários:** `brad-shadow-0`, `brad-border-hairline*`, `brad-rounded-lg`, `brad-relative-full-w`, `brad-scrollbar`, `brad-tabs__is-hidden--js`, `brad-tab__focus--js`, `brad-text-link`, `brad-prevent-select`, `brad-theme-classic`, `brad-bg-overlay-80`

---

## 4. Resumo executivo

- **Componentes interativos declarativos em template:** 5 tags (`brad-tabs`, `brad-tab-list`, `brad-tab`, `brad-tab-panels`, `brad-tab-panel`) + 1 (`brad-timeline-stepper`) = **6**
- **Componentes presentes declarativos em template:** 7 (não quebram runtime, mas dependem do registro do customElement)
- **Serviços LiquidCorp chamados imperativamente:** **13 métodos** distintos
- **CSS classes Liquid:** **593 ocorrências** (independente de versão do Shell)

**Risco de quebra:** Os 13 métodos imperativos + 6 componentes interativos declarativos são os únicos pontos frágeis contra mudança de versão do Liquid no Shell. O CSS (593 ocorrências) não representa risco de versão.

## 2. Overlays fora do template

Não encontrado. Não há CDK Overlay, MatDialog, CdkPortal nem código de produção injetando elementos em `document.body`. Apenas referências a `BradOverlayServiceDefault` (serviço LiquidCorp) e `document.body` em specs de teste.

## 3. Veredito (só números + 2 frases)

- Tags `<brad-*>` distintas: 13 | dessas, interativas: 6 | presentacionais: 7
- Classes `class="brad-*"` distintas: 80
- ViewEncapsulation do AppComponent: `None` (`src/app/app.component.ts:42`)
- Onde CSS/JS do Liquid é carregado: `index.html` (linhas 13-16 e 21-22)
- Predominância: CSS-driven — o MFE depende majoritariamente de utilitários e tokens via classe CSS, enquanto os web components JS são pontuais e concentrados em tabs/stepper.
- Web components interativos que precisariam virar Angular nativo OU seguir a versão do Shell: `brad-tabs`, `brad-tab-list`, `brad-tab`, `brad-tab-panels`, `brad-tab-panel`, `brad-timeline-stepper`
