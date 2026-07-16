# Graph Report - .  (2026-07-16)

## Corpus Check
- Corpus is ~34,455 words - fits in a single context window. You may not need a graph.

## Summary
- 667 nodes · 1119 edges · 50 communities (40 shown, 10 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Router & Navigation Service
- HTTP Client Service
- Acompanhamento Mapper (DTO->Model)
- Angular Build Config
- App Config Service & Bootstrap
- Angular Core Dependencies
- CI/CD Reusable Workflows
- Postbuild Version Script
- Bsc Table Types & Formatters
- Lint/Test Tooling Dependencies
- BscTableComponent Logic
- Angular.json Build Targets
- Parcelas Mapper & Status Enum
- Contrato Mapper & DTOs
- Angular.json Project Config
- Domain Card & Page Components
- CardDadosCliente Component Logic
- Monitoramento Service
- AppComponent Bootstrap
- PagamentoDaEntrada & MenuCabecalho
- tree.js Script Utility
- InputSelect Component
- Feature Page Shell Templates
- ESLint Config
- postBuild.js
- tsconfig Base
- Techdocs Workflow
- Cherry Pick Workflow
- DAST Scan Workflow
- Native Federation Config
- UI Errors Folder Guide
- InputSelect Component Doc
- MenuCabecalho Component Doc

## God Nodes (most connected - your core abstractions)
1. `BscTableComponent` - 29 edges
2. `HttpService` - 21 edges
3. `StatusContratoEnum` - 17 edges
4. `RouterService` - 16 edges
5. `RenegociacaoStore` - 16 edges
6. `CardDadosClienteComponent` - 16 edges
7. `AppConfigService` - 15 edges
8. `ApiResponseDto` - 15 edges
9. `AuthService` - 14 edges
10. `DashboardComponent` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Global Error Handling Integrated with Dynatrace` --semantically_similar_to--> `Erro State Management Convention (ErroService/ErroStore naming)`  [INFERRED] [semantically similar]
  README.md → src/app/core/errors/data-access/data-access.md
- `Self Update Workflow` --references--> `README.md (fed-node-npm-template project doc)`  [INFERRED]
  .github/workflows/repo-self-update.yaml → README.md
- `Node FED Bugfix Workflow` --references--> `HOM App Config (recr-fed-agc-posvenda)`  [INFERRED]
  .github/workflows/cicd-bugfix.yaml → config/HOM/config.yaml
- `Node FED Bugfix Workflow` --references--> `PRD App Config (recr-fed-agc-posvenda)`  [INFERRED]
  .github/workflows/cicd-bugfix.yaml → config/PRD/config.yaml
- `Node FED Release Workflow` --references--> `HOM App Config (recr-fed-agc-posvenda)`  [INFERRED]
  .github/workflows/cicd-release.yaml → config/HOM/config.yaml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Shared fed-deploy-release Reusable Workflow Consumers** — github_workflows_cicd_bugfix_workflow, github_workflows_cicd_release_workflow, github_workflows_pr_check_workflow, github_workflows_rollback_workflow [EXTRACTED 1.00]
- **Erro Domain State & Contract Pattern** — src_app_core_errors_data_access_data_access_erroservice, src_app_core_errors_data_access_data_access_errostore, src_app_core_errors_models_models_erromodel [INFERRED 0.85]
- **Environment-Based App Config Injection Pattern** — config_dev_config_appconfig, config_hom_config_appconfig, config_prd_config_appconfig, readme_app_config_per_environment_pattern [INFERRED 0.95]
- **Detalhes Contrato Card Composition** — src_app_feature_acompanhamento_pages_detalhes_contrato_detalhes_contrato_component_detalhescontrato, src_app_domain_ui_card_status_renegociacao_card_status_renegociacao_component_cardstatusrenegociacao, src_app_domain_ui_card_dados_cliente_card_dados_cliente_component_carddadoscliente, src_app_domain_ui_card_valores_da_renegociacao_card_valores_da_renegociacao_component_cardvaloresdarenegociacao, src_app_domain_ui_card_dados_do_pagamento_card_dados_do_pagamento_component_carddadosdopagamento, src_app_domain_ui_card_pagamento_das_parcelas_card_pagamento_das_parcelas_component_cardpagamentodasparcelas, src_app_domain_ui_card_segunda_via_documentos_card_segunda_via_documentos_component_cardsegundaviadocumentos [EXTRACTED 1.00]
- **BscCard Wrapper Composition Pattern** — src_app_shared_components_bsc_card_bsc_card_component_bsccard, src_app_domain_ui_card_dados_cliente_card_dados_cliente_component_carddadoscliente, src_app_domain_ui_card_dados_do_pagamento_card_dados_do_pagamento_component_carddadosdopagamento, src_app_domain_ui_card_pagamento_das_parcelas_card_pagamento_das_parcelas_component_cardpagamentodasparcelas, src_app_domain_ui_card_segunda_via_documentos_card_segunda_via_documentos_component_cardsegundaviadocumentos, src_app_domain_ui_card_status_renegociacao_card_status_renegociacao_component_cardstatusrenegociacao, src_app_domain_ui_card_valores_da_renegociacao_card_valores_da_renegociacao_component_cardvaloresdarenegociacao, src_app_feature_acompanhamento_pages_assinatura_documentos_assinatura_documentos_component_assinaturadocumentos, src_app_feature_acompanhamento_pages_pagamento_da_entrada_pagamento_da_entrada_component_pagamentodaentrada [INFERRED 0.85]
- **BscTable Listing Pattern** — src_app_shared_components_bsc_table_bsc_table_component_bsctable, src_app_domain_ui_card_pagamento_das_parcelas_card_pagamento_das_parcelas_component_cardpagamentodasparcelas, src_app_domain_ui_card_segunda_via_documentos_card_segunda_via_documentos_component_cardsegundaviadocumentos, src_app_domain_ui_card_status_renegociacao_card_status_renegociacao_component_cardstatusrenegociacao, src_app_feature_acompanhamento_pages_assinatura_documentos_assinatura_documentos_component_assinaturadocumentos, src_app_feature_dashboard_pages_dashboard_dashboard_component_dashboard [INFERRED 0.80]

## Communities (50 total, 10 thin omitted)

### Community 0 - "Router & Navigation Service"
Cohesion: 0.05
Nodes (46): Route, RouterService, Injectable, DocumentoItemDto, StatusContratoEnum, BoletoModel, ContratoModel, DadosClienteModel (+38 more)

### Community 1 - "HTTP Client Service"
Cohesion: 0.10
Nodes (24): HttpService, Injectable, mapDadosClienteToModel(), mapListaDadosClienteToModel(), ApiResponseDto, BoletoEntradaRequestDto, BoletoEntradaResponseDto, DadosClienteBff2Dto (+16 more)

### Community 2 - "Acompanhamento Mapper (DTO->Model)"
Cohesion: 0.06
Nodes (26): AcompanhamentoMapper, AcompanhamentoAcordoDto, AcompanhamentoContaDto, AcompanhamentoContratoDto, AcompanhamentoDocumentoDto, AcompanhamentoDto, AcompanhamentoPagamentoDto, AcompanhamentoParcelasDto (+18 more)

### Community 3 - "Angular Build Config"
Cohesion: 0.05
Nodes (46): build, esbuild, extract-i18n, lint, serve, serve-original, builder, configurations (+38 more)

### Community 4 - "App Config Service & Bootstrap"
Cohesion: 0.07
Nodes (9): mockAppConfigService, AppConfigService, TAppConfig, Inject, Injectable, AuthService, Injectable, LoadingService (+1 more)

### Community 5 - "Angular Core Dependencies"
Cohesion: 0.05
Nodes (37): @angular/animations, @angular-architects/native-federation, @angular/cdk, @angular/common, @angular/compiler, @angular/core, @angular/elements, @angular/forms (+29 more)

### Community 6 - "CI/CD Reusable Workflows"
Cohesion: 0.08
Nodes (37): apache-http-server-rollback.yaml (reusable workflow), bex-status-send GitHub Action, BFF AGC Renegociação Pós-Venda Backend API (clientAPI/clientAPI2), Dynatrace Monitoring URL (urlMonitoramento), fed-angular-build-release.yaml (reusable workflow), fed-angular-build-sandbox.yaml (reusable workflow), fed-change-velocity.yaml (reusable workflow), fed-deploy-release.yaml (reusable workflow) (+29 more)

### Community 7 - "Postbuild Version Script"
Cohesion: 0.07
Nodes (26): keepOnlyLines(), { readFileSync, writeFileSync }, stripIndexComments(), { version }, browserslist, name, overrides, electron-to-chromium (+18 more)

### Community 8 - "Bsc Table Types & Formatters"
Cohesion: 0.12
Nodes (16): BscTableActionClickEvent, BscTableActionConfig, BscTableFormatter, BscTableRowClickEvent, BscTableSelectionEvent, BscTabulatorInstance, mockBradTableService, mockTableTabulator (+8 more)

### Community 9 - "Lint/Test Tooling Dependencies"
Cohesion: 0.07
Nodes (27): @angular/compiler-cli, @angular-devkit/build-angular, angular-eslint, eslint, jest, jest-environment-jsdom, jest-preset-angular, @ngrx/eslint-plugin (+19 more)

### Community 10 - "BscTableComponent Logic"
Cohesion: 0.12
Nodes (4): BscTableComponent, Component, Input, Output

### Community 11 - "Angular.json Build Targets"
Cohesion: 0.10
Nodes (22): test, options, allowedCommonJsDependencies, assets, browser, index, inlineStyleLanguage, outputPath (+14 more)

### Community 12 - "Parcelas Mapper & Status Enum"
Cohesion: 0.18
Nodes (11): mapParcelasToModel(), mapParcelaToModel(), ParcelaDto, getStatusParcelaLabel(), StatusParcelaEnum, ParcelaModel, ParcelasContratoModel, CardPagamentoDasParcelasComponent (+3 more)

### Community 13 - "Contrato Mapper & DTOs"
Cohesion: 0.15
Nodes (14): mapContratoListToModel(), mapContratoToModel(), ContratoDto, DadosClienteDto, DadosPagamentoDto, DetalheContratoDto, EnderecoDto, EntradaPagamentoDto (+6 more)

### Community 14 - "Angular.json Project Config"
Cohesion: 0.12
Nodes (16): analytics, schematicCollections, prefix, projectType, root, schematics, sourceRoot, cli (+8 more)

### Community 15 - "Domain Card & Page Components"
Cohesion: 0.25
Nodes (15): CardDadosCliente Component, CardDadosDoPagamento Component, CardPagamentoDasParcelas Component, CardSegundaViaDocumentos Component, CardStatusRenegociacao Component, CardValoresDaRenegociacao Component, AssinaturaDocumentos Page, DetalhesContrato Page (+7 more)

### Community 17 - "Monitoramento Service"
Cohesion: 0.23
Nodes (4): Optional, MonitoramentoService, Inject, Injectable

### Community 18 - "AppComponent Bootstrap"
Cohesion: 0.23
Nodes (5): AppComponent, Component, Input, appConfig, start()

### Community 19 - "PagamentoDaEntrada & MenuCabecalho"
Cohesion: 0.18
Nodes (5): PagamentoDaEntradaComponent, Component, MenuCabecalhoComponent, Component, ViewChild

### Community 20 - "tree.js Script Utility"
Cohesion: 0.27
Nodes (10): argFormat, argOut, fs, gerarArvoreMarkdown(), gerarArvoreTexto(), gerarMarkdown(), gerarTexto(), IGNORAR (+2 more)

### Community 21 - "InputSelect Component"
Cohesion: 0.31
Nodes (5): InputSelectComponent, ItemSelect, Component, Input, Output

### Community 22 - "Feature Page Shell Templates"
Cohesion: 0.33
Nodes (6): AppMenuCabecalho Component (selector app-menu-cabecalho), AppComponent Root Shell Template, AssinaturaDocumentosComponent (app-assinatura-documentos), DashboardComponent (app-dashboard), DetalhesRenegociacaoComponent (app-detalhes-contrato), PagamentoDaEntradaComponent (app-pagamento-da-entrada)

### Community 23 - "ESLint Config"
Cohesion: 0.50
Nodes (3): angular, eslint, tseslint

## Knowledge Gaps
- **191 isolated node(s):** `$schema`, `version`, `newProjectRoot`, `projectType`, `style` (+186 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `options` connect `Angular.json Build Targets` to `Angular Build Config`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Why does `jsbarcode` connect `Angular.json Build Targets` to `Router & Navigation Service`?**
  _High betweenness centrality (0.135) - this node is a cross-community bridge._
- **What connects `$schema`, `version`, `newProjectRoot` to the rest of the system?**
  _191 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Router & Navigation Service` be split into smaller, more focused modules?**
  _Cohesion score 0.05499316005471956 - nodes in this community are weakly interconnected._
- **Should `HTTP Client Service` be split into smaller, more focused modules?**
  _Cohesion score 0.09643605870020965 - nodes in this community are weakly interconnected._
- **Should `Acompanhamento Mapper (DTO->Model)` be split into smaller, more focused modules?**
  _Cohesion score 0.06471631205673758 - nodes in this community are weakly interconnected._
- **Should `Angular Build Config` be split into smaller, more focused modules?**
  _Cohesion score 0.04830917874396135 - nodes in this community are weakly interconnected._