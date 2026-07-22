## 1. Artefatos/camadas ausentes, ordenados por nº de cadeias afetadas

| #   | Ausência                                                                            | Cadeias afetadas                               | Evidência                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Direção Entity→DTO do mapper** (ou o mapper inteiro, no caso mais grave)          | **3** — Cliente, Ofertas, Confirmacao          | Cliente: `ClienteMapper` só tem `dtoParaEntity`; `criarClienteAtualizacaoRequest`+`mapearTelefoneParaDto` fazem a volta dentro do arquivo de DTO, com regra de negócio embutida. Ofertas: mesmo padrão em `criarOfertaPredefinidaRequest`/`criarOfertaPersonalizadaRequest`, sem regra de negócio. Confirmacao: agrava o mesmo defeito ao extremo — **não existe mapper nenhum**, `criarConfirmacaoRequest`/`montarPagamentoConfirmacao` fazem reshape + decisão de negócio dentro do DTO. |
| 2   | **Feature service de orquestração multi-domínio**                                   | 1 — Confirmacao                                | `criarConfirmacaoRequest` decide "contrato principal" (`.at(0)`), `codigoOperacao` e forma de pagamento ativa — decisão de negócio que agrega `ClienteEntity+ContaEntity+DividaEntity[]+OfertaEntity`, hoje dentro de um arquivo de DTO chamado pelo store.                                                                                                                                                                                                                                |
| 3   | **Contrato de resposta tipado + verificação de sucesso** (`ConfirmacaoResponseDto`) | 1 — Confirmacao                                | `ApiResponseDto<unknown>`; `tapResponse.next` nem declara parâmetro — `sucesso`/`mensagem` do envelope nunca são lidos. É a única chamada que muda estado real (irreversível) e a única sem esse checkpoint.                                                                                                                                                                                                                                                                               |
| 4   | **Cadeia "Histórico" completa** (service+DTO+mapper)                                | 0 das 6 mapeadas (é uma 7ª cadeia inexistente) | `HistoricoEntity` é interface vazia, mas referenciada em `store.historico: HistoricoEntity[]` — nenhuma cadeia da Seção 1 do mapa a popula. Não conto no ranking acima porque não é vazamento _para dentro_ de uma cadeia existente, é um buraco à parte.                                                                                                                                                                                                                                  |

Não incluo no ranking de "ausência" o achado de `OfertaEntity`/`ClienteEntity` com campos opcionais que o mapper sempre preenche (Cliente e Ofertas, 2 cadeias) — isso não é artefato faltando, é tipo mais fraco que a garantia real do próprio mapper já existente. Trato à parte no grupo 2.

Também não conto o interceptor de loading/message ausente em `HttpService` (existe padrão de interceptor de erro, mas loading/message ficam hardcoded no service, usado pelas 6 cadeias) — a própria análise da Fase 1 já desqualificou isso como _acoplamento de infraestrutura_, não de domínio ("fora do escopo desta análise de dataLayer"). Cito por transparência, mas não infla a contagem sistêmica.

## 2. Três grupos

**SISTÊMICO (3+ cadeias)**

- Ausência #1 (DTO fazendo papel de mapper / mapper incompleto): Cliente + Ofertas + Confirmacao = 3/3 das cadeias elegíveis. É sistêmico de verdade, não por simetria: Contas, Dividas e Cep são somente-leitura (GET, sem request body) — estruturalmente não têm onde esse defeito poderia aparecer. Das 3 cadeias que _têm_ corpo de request, 100% delas o exibem. Confirmacao é o caso mais grave (zero mapper, regra de negócio embutida), Cliente é intermediário (regra de negócio + shape), Ofertas é o mais brando (só shape).

**CONCENTRADO (só Confirmacao)**

- Ausência #2 — feature service de orquestração multi-domínio.
- Ausência #3 — contrato de resposta tipado + leitura de `sucesso`/`mensagem`.
- Ambas nascem do mesmo fato estrutural: Confirmacao é a única cadeia que agrega 4 domínios e a única com efeito irreversível, e é a única sem nenhum artefato de orquestração dedicado.

**PONTUAL (uma cadeia, sem padrão)**

- `DividasMapper` fazendo Entity↔View + regra de negócio de exibição (`ondeRenegociar`, regex de periodicidade) e reconstrução de entity zerada a partir da view — só em Dividas, não se repete em nenhuma outra cadeia. Proporcional ao tamanho da cadeia (1160 LOC), não generalizável.

**Não classificado nos três grupos (não force por simetria)**

- Entity com opcionais mais fracos que a garantia do mapper (Cliente: `nome?`, `documento?`, `tipoDocumento?`, `razaoSocial?`; Ofertas: `valorEntrada?`, `dataEntradaParcela?`) — atinge 2/6 cadeias. Abaixo do limiar de 3 para SISTÊMICO, mas é mais de 1 cadeia com o mesmo padrão, então chamá-lo de PONTUAL também seria impreciso. É um "padrão parcial" real, correção barata (apertar tipo, o mapper já preenche sempre), mas não entra na priorização de acoplamento porque não é vazamento entre camadas — é tipagem fraca sem consumidor problemático hoje.
- Ausência #4 (cadeia Histórico) — não vaza lógica para nenhuma cadeia existente, é lacuna isolada no store. Fica fora da priorização de "redução de acoplamento por diff" porque não há acoplamento a reduzir, só um gap a preencher quando/se a feature de histórico for implementada.

## 3. Ordem de refatoração (máxima redução de acoplamento por diff)

O critério do enunciado se confirma nos dados: o sistêmico aqui é _mecânico_ (mover função já-escrita para um mapper que já existe), enquanto o concentrado exige _criar_ dois artefatos do zero e extrair regra de negócio de um fluxo financeiro irreversível.

1. **Cliente → mover `criarClienteAtualizacaoRequest`+`mapearTelefoneParaDto` para `ClienteMapper.entityParaAtualizacaoRequest`.** Mapper já existe, é reshape+regra pequena, diff de 2 arquivos. Fecha 1/3 do sistêmico.
2. **Ofertas → mover `criarOfertaPredefinidaRequest`/`criarOfertaPersonalizadaRequest` para `OfertasMapper`.** Ainda mais barato que o passo 1 (sem regra de negócio, só shape). Fecha 2/3 do sistêmico.
3. **Confirmacao — criar `ConfirmacaoMapper` (parte reshape) + `ConfirmacaoFeatureService` (parte decisão: contrato principal, código de operação, forma de pagamento ativa) juntos.** Esse par precisa nascer na mesma mudança porque o mapper só pode receber dados já resolvidos — criar um sem o outro reintroduz o mesmo vazamento em outro arquivo. Fecha o 3/3 do sistêmico **e** resolve a ausência concentrada #2 na mesma tacada — é o ponto de maior alavancagem do diff total, mesmo sendo o mais caro isoladamente.
4. **Tipar `ConfirmacaoResponseDto` e mover a checagem de `sucesso`/`mensagem` para dentro do `ConfirmacaoFeatureService` criado no passo 3.** Depende do passo 3 existir — sem o feature service, a checagem cairia de volta no store (mesmo anti-padrão). É o de maior risco de negócio (chamada irreversível), por isso vem logo depois de haver onde colocá-lo corretamente, não antes.
5. **Dividas — extrair `entityParaGrupoView`/`entityParaView`/`viewParaEntity`/`ondeRenegociar` do `DividasMapper` para um mapper/adapter de apresentação na feature.** Independente dos passos 1–4, pode rodar em paralelo, mas fica por último na priorização porque é achado pontual: reduz acoplamento só dentro de 1 cadeia, não fecha um padrão repetido nem mitiga risco financeiro.

**Grátis, fazer em paralelo com qualquer passo acima** (diff zero-risco, sem depender de nada): deletar `core/services/api/conclusao.service.ts`, `enum-utils.service.ts` e `negociacao.entity.ts` (mortos, confirmados por `usages`), e corrigir a Seção 3 do mapa (vários "órfãos" listados estão ativos).

> [!IMPORTANTE] Spec de Refatoração:

Antes da tabela, uma correção que essa própria pergunta expôs: no passo 3, eu tinha desenhado `confirmacao.mapper.ts` importando `MetodoFormaPagamentoSelecionado` de `confirmacao-feature.service.ts`, e o feature service importando `ConfirmacaoMapper` de volta — **dependência circular entre os dois arquivos novos**. Correção: `ConfirmacaoDadosResolvidos.pagamentoAtivo` no mapper passa a usar um shape estrutural próprio (`{ conta: ContaEntity; metodoPagamento: TipoMetodoPagamento | null }` inline, sem importar `MetodoFormaPagamentoSelecionado`), então o mapper não depende do feature service — só o inverso. Isso é o que a tabela abaixo já reflete.

| #   | arquivo                                                      | ação    | camada  | passo | depende de         |
| --- | ------------------------------------------------------------ | ------- | ------- | ----- | ------------------ |
| 1   | cliente.mapper.ts                                            | ALTERAR | domain  | 1     | —                  |
| 2   | renegociacao.store.ts                                        | ALTERAR | feature | 1     | #1                 |
| 3   | cliente-atualizacao-request.dto.ts                           | ALTERAR | domain  | 1     | #2                 |
| 4   | ofertas.mapper.ts                                            | ALTERAR | domain  | 2     | —                  |
| 5   | renegociacao.store.ts                                        | ALTERAR | feature | 2     | #4                 |
| 6   | oferta-predefinida-request.dto.ts                            | ALTERAR | domain  | 2     | #5                 |
| 7   | oferta-personalizada-request.dto.ts                          | ALTERAR | domain  | 2     | #5                 |
| 8   | src/app/mappers/confirmacao.mapper.ts                        | CRIAR   | domain  | 3     | —                  |
| 9   | src/app/features/confirmacao/confirmacao-feature.service.ts  | CRIAR   | feature | 3     | #8                 |
| 10  | renegociacao.store.ts                                        | ALTERAR | feature | 3     | #8, #9             |
| 11  | confirmacao-request.dto.ts                                   | ALTERAR | domain  | 3     | #10                |
| 12  | src/app/models/dto/confirmacao-response.dto.ts               | CRIAR   | domain  | 4     | —                  |
| 13  | confirmacao.service.ts                                       | ALTERAR | core    | 4     | #12                |
| 14  | src/app/features/confirmacao/confirmacao-feature.service.ts  | ALTERAR | feature | 4     | #12                |
| 15  | renegociacao.store.ts                                        | ALTERAR | feature | 4     | #13, #14           |
| 16  | src/app/features/dividas/dividas-apresentacao.mapper.ts      | CRIAR   | feature | 5     | —                  |
| 17  | src/app/features/dividas/dividas-apresentacao.mapper.spec.ts | CRIAR   | feature | 5     | #16                |
| 18  | dividas.service.ts                                           | ALTERAR | feature | 5     | #16                |
| 19  | dividas.component.ts                                         | ALTERAR | feature | 5     | #16                |
| 20  | dividas.service.spec.ts                                      | ALTERAR | feature | 5     | #18                |
| 21  | dividas.mapper.spec.ts                                       | ALTERAR | domain  | 5     | #17, #18, #19      |
| 22  | dividas.mapper.ts                                            | ALTERAR | domain  | 5     | #18, #19, #20, #21 |

Regra que gerou a ordem dentro de cada passo: **criar/adicionar método → trocar quem chama → só então apagar a origem**. Nunca apagar uma função/tipo antes de zerar seus chamadores, nem trocar um chamador antes do destino existir — é isso que faz cada linha compilar isoladamente, mesmo que o commit seja aplicado parado nela.
