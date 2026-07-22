## Seção 1 — Pontos de integração

| service            | método/endpoint                                             | dtos usados                                                                                     | mappers         | models/entities                                                | LOC total da cadeia |
| ------------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------- | ------------------- |
| ClienteService     | carregarCliente GET /consultar-dados-cliente                | response: `ClienteResponseDto` (wrap `ApiResponseDto`)                                          | —               | `ClienteEntity`                                                | 714                 |
| ClienteService     | atualizarCliente POST /atualizar-dados-cliente              | request: `ClienteAtualizacaoRequestDto`; response: `ClienteResponseDto` (wrap `ApiResponseDto`) | —               | `ClienteEntity`                                                | 714                 |
| ContasService      | carregarContas GET /contas                                  | response: `ListagemContasResponseDto` (wrap `ApiResponseDto`)                                   | `ContasMapper`  | `ContaEntity`                                                  | 617                 |
| DividasService     | carregarDividas GET /dividas                                | response: `ListagemDividasResponseDto` (wrap `ApiResponseDto`)                                  | `DividasMapper` | `DividaEntity`                                                 | 1160                |
| OfertasService     | carregarOfertasPredefinidas POST /simulacao                 | request: `OfertaPredefinidaRequestDto`; response: `OfertaResponseDto` (wrap `ApiResponseDto`)   | `OfertasMapper` | `OfertaEntity`                                                 | 829                 |
| OfertasService     | carregarOfertasPersonalizadas POST /simulacao-personalizada | request: `OfertaPersonalizadaRequestDto`; response: `OfertaResponseDto` (wrap `ApiResponseDto`) | `OfertasMapper` | `OfertaEntity`                                                 | 829                 |
| ConfirmacaoService | confirmarRenegociacao POST /efetivar                        | request: `ConfirmacaoRequestDto`; response: `unknown` (wrap `ApiResponseDto`)                   | —               | `ClienteEntity`, `ContaEntity`, `DividaEntity`, `OfertaEntity` | 973                 |
| CepService         | consultarCep GET /consultar-cep/:cep                        | response: `CepResponseDto` (wrap `ApiResponseDto`)                                              | —               | —                                                              | 563                 |

## Seção 2 — Artefatos compartilhados

| artefato                  | tipo    | cadeias                                             | contagem |
| ------------------------- | ------- | --------------------------------------------------- | -------- |
| `ApiResponseDto`          | dto     | Cliente, Contas, Dividas, Ofertas, Confirmacao, Cep | 6        |
| `HttpService`             | service | todas                                               | 6        |
| `AppConfigService`        | service | todas                                               | 6        |
| `AuthService`             | service | todas                                               | 6        |
| `RouterService`           | service | todas                                               | 6        |
| `LoadingService`          | service | todas                                               | 6        |
| `MessageService`          | service | todas                                               | 6        |
| `ObjectUtilsService`      | service | todas                                               | 6        |
| `TipoMessage`             | enum    | todas                                               | 6        |
| `ClienteEntity`           | entity  | Cliente, Confirmacao                                | 2        |
| `ContaEntity`             | entity  | Contas, Confirmacao                                 | 2        |
| `DividaEntity`            | entity  | Dividas, Confirmacao                                | 2        |
| `OfertaEntity`            | entity  | Ofertas, Confirmacao                                | 2        |
| `TipoOferta`              | enum    | Ofertas, Confirmacao                                | 2        |
| `GenerateSecureIdService` | service | Contas, Dividas, Ofertas                            | 3        |

## Seção 3 — Órfãos

- `src/app/core/services/api/conclusao.service.ts`
- `src/app/core/services/utils/date-utils.service.ts`
- `src/app/core/services/utils/enum-utils.service.ts`
- `src/app/core/services/utils/monitoramento-dynatrace.service.ts`
- `src/app/core/services/utils/monitoramento-gtm.service.ts`
- `src/app/mappers/cliente.mapper.ts`
- `src/app/models/entities/negociacao.entity.ts`
- `src/app/models/entities/historico.entity.ts`
- `src/app/models/view-model/historico.view.model.ts`
- `src/app/models/view-model/timeline.stepper.view.model.ts`
- `src/app/shared/enum/status-historico.ts`
- `src/app/shared/enum/tipo-documento.ts`
- `src/app/shared/enum/tipo-label-metodo-pagamento.ts`
- `src/app/shared/enum/tipo-index-timeline-stepper-reneg.ts`
- `src/app/shared/enum/tipo-step-simulacao.ts`
- `src/app/shared/enum/tipo-tab-oferta.ts`
- `src/app/shared/enum/tipo-timeline-stepper-state.ts`

