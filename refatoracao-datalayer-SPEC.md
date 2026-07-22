# Refatoração da camada de dados — especificação

**Status:** aprovado para implementação · **Escopo:** camada de dados (dto, mapper, service, entity) + impacto no `renegociacao.store.ts`

Este documento é a especificação de uma refatoração já analisada e priorizada. Ele diz **o que mudar, em que camada, com qual assinatura e por quê** — não traz implementação. Cada passo é independente e pode virar um PR próprio.

**Como usar:** leia as seções 1 e 2 (contexto e regra de camada) uma vez. Depois pegue o passo que você vai implementar na seção 3, e siga a ordem da seção 4 para não quebrar o build no meio.

---

## 1. O problema em uma página

A camada de dados tem um desvio estrutural repetido: **arquivos de DTO fabricando objeto em vez de só declarar formato.**

Um DTO deveria descrever o shape de um request ou response, e nada mais. Hoje, nas três cadeias que possuem corpo de request (Cliente, Ofertas, Confirmação), a função que monta o objeto mora dentro do próprio arquivo de DTO — em dois casos levando junto regra de negócio. As outras três cadeias (Contas, Dívidas, CEP) são somente-leitura e por isso não exibem o defeito: não é que estejam corretas por decisão, é que não têm onde o defeito apareceria.

O caso da Confirmação é o mais grave e concentra os outros dois problemas:

- não existe mapper nenhum — o arquivo de DTO faz reshape **e** decide regra de negócio (qual é o contrato principal, qual o código de operação, qual forma de pagamento está ativa);
- é a única cadeia que agrega quatro domínios (`ClienteEntity`, `ContaEntity`, `DividaEntity`, `OfertaEntity`);
- é a única chamada **irreversível** da aplicação (`POST /efetivar`) e a única sem contrato de resposta — hoje o app não consegue distinguir "renegociação efetivada" de "backend recusou e devolveu HTTP 200".

Um achado isolado em Dívidas: o `DividasMapper` importa tipo de componente de UI, o que inverte a dependência (dado passa a depender de apresentação).

<details>
<summary>Diagnóstico completo, com evidência por cadeia e classificação sistêmico/concentrado/pontual</summary>

#### Artefatos/camadas ausentes, por nº de cadeias afetadas

| #   | Ausência                                                                            | Cadeias afetadas                               | Evidência                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Direção Entity→DTO do mapper** (ou o mapper inteiro, no caso mais grave)          | **3** — Cliente, Ofertas, Confirmacao          | Cliente: `ClienteMapper` só tem `dtoParaEntity`; `criarClienteAtualizacaoRequest`+`mapearTelefoneParaDto` fazem a volta dentro do arquivo de DTO, com regra de negócio embutida. Ofertas: mesmo padrão em `criarOfertaPredefinidaRequest`/`criarOfertaPersonalizadaRequest`, sem regra de negócio. Confirmacao: agrava o mesmo defeito ao extremo — **não existe mapper nenhum**, `criarConfirmacaoRequest`/`montarPagamentoConfirmacao` fazem reshape + decisão de negócio dentro do DTO. |
| 2   | **Feature service de orquestração multi-domínio**                                   | 1 — Confirmacao                                | `criarConfirmacaoRequest` decide "contrato principal" (`.at(0)`), `codigoOperacao` e forma de pagamento ativa — decisão de negócio que agrega `ClienteEntity+ContaEntity+DividaEntity[]+OfertaEntity`, hoje dentro de um arquivo de DTO chamado pelo store.                                                                                                                                                                                                                                |
| 3   | **Contrato de resposta tipado + verificação de sucesso** (`ConfirmacaoResponseDto`) | 1 — Confirmacao                                | `ApiResponseDto<unknown>`; `tapResponse.next` nem declara parâmetro — `sucesso`/`mensagem` do envelope nunca são lidos. É a única chamada que muda estado real (irreversível) e a única sem esse checkpoint.                                                                                                                                                                                                                                                                               |
| 4   | **Cadeia "Histórico" completa** (service+DTO+mapper)                                | 0 das 6 mapeadas (é uma 7ª cadeia inexistente) | `HistoricoEntity` é interface vazia, mas referenciada em `store.historico: HistoricoEntity[]` — nenhuma cadeia da Seção 1 do mapa a popula. Não conto no ranking acima porque não é vazamento _para dentro_ de uma cadeia existente, é um buraco à parte.                                                                                                                                                                                                                                  |

Não incluo no ranking de "ausência" o achado de `OfertaEntity`/`ClienteEntity` com campos opcionais que o mapper sempre preenche (Cliente e Ofertas, 2 cadeias) — isso não é artefato faltando, é tipo mais fraco que a garantia real do próprio mapper já existente. Trato à parte no grupo 2.

Também não conto o interceptor de loading/message ausente em `HttpService` (existe padrão de interceptor de erro, mas loading/message ficam hardcoded no service, usado pelas 6 cadeias) — a própria análise da Fase 1 já desqualificou isso como _acoplamento de infraestrutura_, não de domínio ("fora do escopo desta análise de dataLayer"). Cito por transparência, mas não infla a contagem sistêmica.

#### Classificação: sistêmico / concentrado / pontual

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

#### Racional da ordem de refatoração

O critério do enunciado se confirma nos dados: o sistêmico aqui é _mecânico_ (mover função já-escrita para um mapper que já existe), enquanto o concentrado exige _criar_ dois artefatos do zero e extrair regra de negócio de um fluxo financeiro irreversível.

1. **Cliente → mover `criarClienteAtualizacaoRequest`+`mapearTelefoneParaDto` para `ClienteMapper.entityParaAtualizacaoRequest`.** Mapper já existe, é reshape+regra pequena, diff de 2 arquivos. Fecha 1/3 do sistêmico.
2. **Ofertas → mover `criarOfertaPredefinidaRequest`/`criarOfertaPersonalizadaRequest` para `OfertasMapper`.** Ainda mais barato que o passo 1 (sem regra de negócio, só shape). Fecha 2/3 do sistêmico.
3. **Confirmacao — criar `ConfirmacaoMapper` (parte reshape) + `ConfirmacaoFeatureService` (parte decisão: contrato principal, código de operação, forma de pagamento ativa) juntos.** Esse par precisa nascer na mesma mudança porque o mapper só pode receber dados já resolvidos — criar um sem o outro reintroduz o mesmo vazamento em outro arquivo. Fecha o 3/3 do sistêmico **e** resolve a ausência concentrada #2 na mesma tacada — é o ponto de maior alavancagem do diff total, mesmo sendo o mais caro isoladamente.
4. **Tipar `ConfirmacaoResponseDto` e mover a checagem de `sucesso`/`mensagem` para dentro do `ConfirmacaoFeatureService` criado no passo 3.** Depende do passo 3 existir — sem o feature service, a checagem cairia de volta no store (mesmo anti-padrão). É o de maior risco de negócio (chamada irreversível), por isso vem logo depois de haver onde colocá-lo corretamente, não antes.
5. **Dividas — extrair `entityParaGrupoView`/`entityParaView`/`viewParaEntity`/`ondeRenegociar` do `DividasMapper` para um mapper/adapter de apresentação na feature.** Independente dos passos 1–4, pode rodar em paralelo, mas fica por último na priorização porque é achado pontual: reduz acoplamento só dentro de 1 cadeia, não fecha um padrão repetido nem mitiga risco financeiro.

**Grátis, fazer em paralelo com qualquer passo acima** (diff zero-risco, sem depender de nada): deletar `core/services/api/conclusao.service.ts`, `enum-utils.service.ts` e `negociacao.entity.ts` (mortos, confirmados por `usages`), e corrigir a Seção 3 do mapa (vários "órfãos" listados estão ativos).

</details>

---

## 2. A regra de camada (leia antes de implementar)

Toda ficha da seção 3 aplica este contrato. Quando a ficha diz "camada: domain" ou "camada: feature", é por causa desta tabela.

| Camada | O que é dono | O que **nunca** faz |
|---|---|---|
| **DTO** (`models/dto`) | Declarar o shape de um request ou response de UMA fronteira | Fabricar objeto, decidir regra, importar entity |
| **Mapper** (`mappers`) | Traduzir DTO ↔ Entity, nas duas direções | Buscar dado, decidir regra de negócio, importar tipo de UI |
| **Entity** (`models/entities`) | Estrutura de domínio | I/O, formatação de apresentação |
| **Service de API** (`core/services/api`) | Acesso HTTP a um endpoint | Regra de negócio, composição entre domínios |
| **Service de feature** (`features/<nome>`) | Decisão de negócio e orquestração entre domínios | I/O direto |

Dois pontos que costumam gerar dúvida:

**Por que a decisão não pode ficar no mapper?** Mapper traduz o que já recebeu. Se ele decide *qual* contrato é o principal, passa a ter duas razões para mudar (o formato do payload e a regra de negócio) e deixa de ser testável sem mockar decisão.

**Por que a decisão não volta para o store?** As camadas de view e facade foram removidas e não voltam. Regra de negócio de uma jornada vive em service de feature — é o que substituiu a facade. O store guarda estado e chama quem decide.

---

## 3. Os cinco passos

Cada ficha segue o mesmo formato: camada e justificativa · responsabilidade · membros públicos (só assinatura) · dependências · de onde o código sai · por que a mudança é necessária. **Impacto colateral** lista arquivos que a ficha obriga a mexer e que não aparecem no título dela.

### Passo 1 — Cliente

#### cliente.mapper.ts — ALTERAR

- **Camada**: domain (mapper). É onde a tradução Entity↔DTO já vive (`dtoParaEntity`); a direção inversa completa o mesmo dono.
- **Responsabilidade**: dono único da tradução bidirecional `ClienteEntity` ↔ DTOs de cliente (leitura e escrita).
- **Membros públicos** (adicionar aos existentes):
  - `static entityParaAtualizacaoRequest(email: string, telefone: ClienteEntity['dadosPessoais']['telefone'], endereco: EnderecoClienteAtualizacaoEntrada): ClienteAtualizacaoRequestDto`
- **Membros privados** (adicionar):
  - `private static mapearTelefoneParaDto(telefone: ClienteEntity['dadosPessoais']['telefone']): ClienteAtualizacaoRequestDto['telefone']`
- **Dependências**: passa a importar `ClienteAtualizacaoRequestDto` e `EnderecoClienteAtualizacaoEntrada` de `@app/models/dto/cliente-atualizacao-request.dto`. Nenhuma dependência removida.
- **Sai de onde**: cliente-atualizacao-request.dto.ts — funções `criarClienteAtualizacaoRequest` e `mapearTelefoneParaDto`, corpo inalterado.
- **Por que**: fecha a Ausência #1 do vereditos-datalayer.md — "falta a direção inversa do mapper (entity→DTO para atualização), hoje vazada para dentro do arquivo de DTO". A regra de negócio (fixo vs. celular por `length`) passa a morar no mesmo artefato que já decide o resto da tradução de Cliente.

#### cliente-atualizacao-request.dto.ts — ALTERAR

- **Camada**: domain (DTO). Contrato de shape puro, sem função.
- **Responsabilidade**: descrever só o shape de `ClienteAtualizacaoRequestDto`.
- **Membros públicos**: `interface ClienteAtualizacaoRequestDto` (mantém como está) e `interface EnderecoClienteAtualizacaoEntrada` (mantém, vira tipo de suporte usado só pelo mapper).
- **Dependências**: remove o import de `ClienteEntity` (só era usado pela assinatura das funções removidas).
- **Sai de onde**: N/A — é remoção. `criarClienteAtualizacaoRequest` e `mapearTelefoneParaDto` saem deste arquivo (vão para o mapper acima).
- **Por que**: elimina o "DTO fazendo papel de mapper" (Ausência #1, Cliente) — o arquivo volta a só descrever formato de request.

**Impacto colateral**:

- renegociacao.store.ts — troca o import de `criarClienteAtualizacaoRequest` (de `@app/models/dto/cliente-atualizacao-request.dto`) por `ClienteMapper` (já importado na L8) e a chamada `criarClienteAtualizacaoRequest(email, telefone, endereco)` vira `ClienteMapper.entityParaAtualizacaoRequest(email, telefone, endereco)`. Motivo: é o único chamador da função movida; sem essa troca o build quebra.

---

### Passo 2 — Ofertas

#### ofertas.mapper.ts — ALTERAR

- **Camada**: domain (mapper). Mesma razão do Passo 1 — mapper já existente vira dono das duas direções.
- **Responsabilidade**: dono único da tradução `OfertaEntity` ↔ DTOs de oferta (leitura e escrita, predefinida e personalizada).
- **Membros públicos** (adicionar aos existentes):
  - `static entityParaPredefinidaRequest(numeroAcordo: string, conta: OfertaContaDto, contratos: OfertaContratoDto[], codigoEmpresa: string): OfertaPredefinidaRequestDto`
  - `static entityParaPersonalizadaRequest(numeroAcordo: string, contratos: OfertaContratoDto[], valorEntrada?: number, taxaJuros?: number, dataVencimentoParcela?: string, valorParcela?: number | null, quantidadeParcelas?: number | null): OfertaPersonalizadaRequestDto`
- **Dependências**: passa a importar `OfertaContaDto`, `OfertaPredefinidaRequestDto` de `@app/models/dto/oferta-predefinida-request.dto` e `ENUM_ACORDO_A_VISTA`, `OfertaPersonalizadaRequestDto` de `@app/models/dto/oferta-personalizada-request.dto` (o `OfertaContratoDto` de personalizada tem shape próprio, com `parcela?`, distinto do de predefinida — mantém os dois nomes/importações separados, sem unificar por simetria).
- **Sai de onde**: oferta-predefinida-request.dto.ts função `criarOfertaPredefinidaRequest`; oferta-personalizada-request.dto.ts função `criarOfertaPersonalizadaRequest`. Corpo inalterado nos dois casos.
- **Por que**: fecha a Ausência #1 nas duas cadeias de Ofertas (padrão A do fechamento de sessão) — mesmo desvio estrutural do Cliente, "só shape, sem regra".

#### oferta-predefinida-request.dto.ts — ALTERAR

- **Camada**: domain (DTO).
- **Responsabilidade**: descrever só o shape de `OfertaPredefinidaRequestDto` (+ `OfertaContaDto`, `OfertaContratoDto`).
- **Membros públicos**: `interface OfertaContaDto`, `interface OfertaContratoDto`, `interface OfertaPredefinidaRequestDto` — todas mantidas como estão.
- **Dependências**: nenhuma (a função removida não tinha import externo).
- **Sai de onde**: N/A — remoção de `criarOfertaPredefinidaRequest`.
- **Por que**: mesmo motivo do DTO de Cliente — arquivo de DTO não fabrica objeto, só declara shape.

#### oferta-personalizada-request.dto.ts — ALTERAR

- **Camada**: domain (DTO).
- **Responsabilidade**: descrever só o shape de `OfertaPersonalizadaRequestDto` (+ `ENUM_ACORDO_A_VISTA`, `OfertaContratoDto`).
- **Membros públicos**: `enum ENUM_ACORDO_A_VISTA`, `interface OfertaContratoDto`, `interface OfertaPersonalizadaRequestDto` — mantidas.
- **Dependências**: nenhuma.
- **Sai de onde**: N/A — remoção de `criarOfertaPersonalizadaRequest`.
- **Por que**: idem.

**Impacto colateral**:

- renegociacao.store.ts — `carregarOfertasPersonalizadas` troca o import de `criarOfertaPersonalizadaRequest` por `OfertasMapper` (já importado na L11) e a chamada vira `OfertasMapper.entityParaPersonalizadaRequest(...)` com os mesmos argumentos posicionais.
- renegociacao.store.ts (`carregarOfertasPredefinidas`) — **achado não listado no plano/vereditos, mesmo defeito em outro ponto**: a função `criarOfertaPredefinidaRequest` é importada (L12) mas nunca chamada; o store monta o objeto `OfertaPredefinidaRequestDto` inline por literal, duplicando o mesmo shape que a função (e agora o mapper) já resolve. Trocar o literal inline pela chamada a `OfertasMapper.entityParaPredefinidaRequest(...)` é necessário aqui — senão o mesmo vazamento de shape sobrevive num segundo lugar, e o import antigo fica morto. Root cause, não só o caminho que o plano citou.
- Remover o import não usado de `OfertaPredefinidaRequestDto`/`OfertaPersonalizadaRequestDto` como tipo solto no store, se a tipagem de retorno do mapper já cobrir a variável local.

---

### Passo 3 — Confirmação (mapper + feature service)

#### `src/app/mappers/confirmacao.mapper.ts` — CRIAR

- **Camada**: domain (mapper). Só reshape de dado já resolvido — mesmo papel que `ClienteMapper`/`OfertasMapper` exercem nas outras cadeias.
- **Responsabilidade**: traduzir dados já decididos (contrato principal, código de operação, forma de pagamento ativa) para o shape `ConfirmacaoRequestDto`. Não decide nada, só reformata.
- **Membros públicos**:
  - `static entidadesParaRequest(dados: ConfirmacaoDadosResolvidos): ConfirmacaoRequestDto`
  - `interface ConfirmacaoDadosResolvidos { contratoPrincipal: DividaEntity | undefined; contratosSelecionados: DividaEntity[]; ofertaSelecionada: OfertaEntity | null; cliente: ClienteEntity; codigoOperacao: string; grupoContratos: string; pagamentoAtivo: { aVista?: PagamentoResolvido; entrada?: PagamentoResolvido; parcela?: PagamentoResolvido }; autorizacoesSelecionadas: [TipoAutorizacao, boolean][] }`
  - `interface PagamentoResolvido { conta: ContaEntity; metodoPagamento: TipoMetodoPagamento | null }` — shape estrutural próprio do mapper, **não** importado do feature service (ver Ponto de atenção 1)
- **Dependências**: importa `ConfirmacaoRequestDto` de `@app/models/dto/confirmacao-request.dto`; `ClienteEntity`, `DividaEntity`, `OfertaEntity`, `TipoAutorizacao`. Não injeta nada (classe estática, como os demais mappers).
- **Sai de onde**: parte **(a)** de confirmacao-request.dto.ts (`criarConfirmacaoRequest`, só os campos de reshape: `proposta`, `cliente.idEndereco`, `divida`, `autorizacoes`) e parte **(a)** de `montarPagamentoConfirmacao` (L159-210: montagem de `aVista`/`entrada`/`parcela` e formatações — uppercase de método, `.replace(/\//g,'.')`), sem o `reduce` de decisão.
- **Por que**: fecha a Ausência #1 (grau mais grave, Confirmacao) e a metade "(a) montagem de payload" do achado misto de `criarConfirmacaoRequest`/`montarPagamentoConfirmacao` no vereditos-datalayer.md — "isso é trabalho de mapper", testável sem mockar decisão de negócio.

#### `src/app/features/confirmacao/confirmacao-feature.service.ts` — CRIAR

- **Camada**: feature. É o artefato de orquestração multi-domínio que o plano diz que "não existe hoje" — não pode ser core/domain porque decide regra de negócio específica da jornada de confirmação, e não é `shared` porque não é reutilizável fora desta feature.
- **Responsabilidade**: decidir contrato principal, código de operação e forma de pagamento ativa a partir do estado da renegociação, e produzir o `ConfirmacaoRequestDto` chamando o mapper só com dados já resolvidos.
- **Membros públicos**:
  - `prepararConfirmacao(parametros: CriarConfirmacaoRequestParametros): ConfirmacaoRequestDto`
  - `interface CriarConfirmacaoRequestParametros { contratosSelecionados: DividaEntity[]; ofertaSelecionada: OfertaEntity | null; cliente: ClienteEntity; metodoFormaPagamentoSelecionada: MetodoFormaPagamentoSelecionado[] | null; autorizacoesSelecionadas: [TipoAutorizacao, boolean][] }`
  - `interface MetodoFormaPagamentoSelecionado { conta: ContaEntity; formaPagamento: TipoFormaPagamento | null; metodoPagamento: TipoMetodoPagamento | null }`
- **Membros privados**:
  - `private resolverCodigoOperacao(ofertaSelecionada: OfertaEntity | null): string`
  - `private resolverFormaPagamentoAtiva(metodoFormaPagamentoSelecionada: MetodoFormaPagamentoSelecionado[] | null): { aVista?: MetodoFormaPagamentoSelecionado; entrada?: MetodoFormaPagamentoSelecionado; parcela?: MetodoFormaPagamentoSelecionado }`
- **Dependências**: injeta `ConfirmacaoMapper` (import estático, sem DI de fato) de `@app/mappers/confirmacao.mapper`. Não injeta `HttpService`/`ConfirmacaoService` — não faz I/O, só orquestra dado em memória.
- **Sai de onde**: parte **(b)** de `criarConfirmacaoRequest` (L86 `contratoPrincipal = contratosSelecionados.at(0)`; L91 `grupoContratos ?? 0`; L92-94 `codigoOperacao` por `tipoPrazo`) e parte **(b)** de `montarPagamentoConfirmacao` (L165-172, o `reduce` que decide qual forma está ativa). Também herda os tipos `interface MetodoFormaPagamentoSelecionado` (L65-69) e `interface CriarConfirmacaoRequestParametros` (L71-77) do mesmo arquivo.
- **Por que**: fecha a Ausência #2 do plano — "decisão de negócio que agrega ClienteEntity+ContaEntity+DividaEntity[]+OfertaEntity, hoje dentro de um arquivo de DTO chamado pelo store". É o par que precisa nascer junto com o mapper acima: "criar um sem o outro reintroduz o mesmo vazamento em outro arquivo".

#### confirmacao-request.dto.ts — ALTERAR

- **Camada**: domain (DTO).
- **Responsabilidade**: descrever só o shape de `ConfirmacaoRequestDto`.
- **Membros públicos**: `interface ConfirmacaoRequestDto` (mantém como está, única sobrevivente).
- **Dependências**: remove imports de `ClienteEntity`, `ContaEntity`, `DividaEntity`, `OfertaEntity`, `TipoAutorizacao`, `TipoFormaPagamento`, `TipoMetodoPagamento` (só serviam às funções/tipos removidos). Mantém `TipoOferta`/`TipoOperacao` só se ainda referenciados — não são, então também saem.
- **Sai de onde**: N/A — remoção de `criarConfirmacaoRequest`, `montarPagamentoConfirmacao`, `interface MetodoFormaPagamentoSelecionado`, `interface CriarConfirmacaoRequestParametros`.
- **Também deletado, não movido**: `obterValorAcordoPorFormaPagamento` (L133-157) — código morto confirmado (zero chamadores no repo), não migra para lugar nenhum.
- **Por que**: fecha a Ausência #1 (o caso mais grave) e deixa o arquivo com a única responsabilidade que um DTO deveria ter.

**Impacto colateral**:

- renegociacao.store.ts (`confirmarRenegociacao`) — troca o import de `criarConfirmacaoRequest` (de `@app/models/dto/confirmacao-request.dto`) por `ConfirmacaoFeatureService` injetado, e a chamada `criarConfirmacaoRequest({...})` vira `confirmacaoFeatureService.prepararConfirmacao({...})` com os mesmos 5 campos do objeto de parâmetro. `confirmarRenegociacao(store, confirmacaoService)` (função de nível de módulo) precisa receber a nova dependência como parâmetro adicional — motivo: é o único chamador da função/tipos movidos, e a assinatura da função de store precisa do novo service para orquestrar a chamada.

---

### Passo 4 — Contrato de resposta + checagem de sucesso

#### `src/app/models/dto/confirmacao-response.dto.ts` — CRIAR

- **Camada**: domain (DTO).
- **Responsabilidade**: nomear o envelope de resposta de `/efetivar`, hoje anônimo como `ApiResponseDto<unknown>` inline no service.
- **Membros públicos**:
  - `type ConfirmacaoResponseDto = ApiResponseDto<unknown>`
- **Dependências**: importa `ApiResponseDto` de `@app/models/dto/api-response.dto`.
- **Sai de onde**: não é código movido — é extração de um tipo hoje inline em `ConfirmacaoService.confirmarRenegociacao`.
- **Por que**: fecha a Ausência #3 do plano — dar nome de domínio ao contrato de resposta da única chamada irreversível, em vez de `unknown` genérico disperso pelo service e pelo store.

#### confirmacao.service.ts — ALTERAR

- **Camada**: core (services/api). Continua adaptador de I/O puro — não muda de camada, só de tipo de retorno.
- **Responsabilidade**: inalterada — só HTTP POST para `/efetivar`.
- **Membros públicos**:
  - `confirmarRenegociacao(apiRequest: ConfirmacaoRequestDto): Observable<ConfirmacaoResponseDto>`
- **Dependências**: troca o import de `ApiResponseDto` por `ConfirmacaoResponseDto` de `@app/models/dto/confirmacao-response.dto`. `HttpService` continua injetado, sem mudança.
- **Sai de onde**: N/A — só retipagem da assinatura existente (L14).
- **Por que**: parte 1 da Ausência #3 — dá nome ao envelope; sozinho ainda não resolve o risco, precisa do item abaixo.

#### `src/app/features/confirmacao/confirmacao-feature.service.ts` — ALTERAR (2ª alteração, acumula com o Passo 3)

- **Camada**: feature — mesmo motivo do Passo 3: é quem já orquestra a decisão de negócio desta cadeia, então é o dono natural de "isso foi de fato confirmado".
- **Responsabilidade** (adicionada): decidir se a resposta de `/efetivar` representa sucesso real de negócio, não só HTTP 2xx.
- **Membros públicos** (adicionar):
  - `verificarSucesso(resposta: ConfirmacaoResponseDto): boolean`
- **Dependências**: importa `ConfirmacaoResponseDto` de `@app/models/dto/confirmacao-response.dto`. Nenhuma dependência nova de I/O.
- **Sai de onde**: não é código movido — é checagem que hoje não existe em lugar nenhum (`tapResponse.next` não lê o corpo).
- **Por que**: fecha a Ausência #3 por completo — "o app não tem como distinguir renegociação efetivada de backend recusou mas devolveu 200". Depende do Passo 3 existir (é o mesmo service que resolve `codigoOperacao`/contrato principal que agora também resolve sucesso, evitando essa decisão cair de volta no store).

**Impacto colateral**:

- renegociacao.store.ts (`confirmarRenegociacao`, bloco `tapResponse`) — o `next` hoje não declara parâmetro (`next: () => {...}`). Passa a declarar `next: (resposta) => {...}`, chamar `confirmacaoFeatureService.verificarSucesso(resposta)` e só then fazer `patchState(store, { renegociacaoConfirmada: true, ... })` no caminho de sucesso; caminho `sucesso: false` precisa cair em `patchState(store, { erro: true, ... })` em vez de navegar para conclusão como hoje. Motivo: é a única forma de a tipagem do Passo 4 ter efeito observável — sem essa mudança no consumidor, `ConfirmacaoResponseDto` fica tipado mas ainda ignorado, reproduzindo o mesmo defeito.

---

### Passo 5 — Dividas

#### Critério de corte (o que fica e o que sai do `DividasMapper`)

**Fica no `DividasMapper`**: qualquer função cuja entrada e saída sejam tipos de contrato/domínio (`ListagemDividasResponseDto`, `DividaEntity`). Teste: se a função não importa nem `DividaView` nem `GrupoDividasView`, ela fica. Só sobra `dtoParaEntity`.

**Vai para o adapter de apresentação**: qualquer função que produza ou consuma `DividaView`/`GrupoDividasView` — são view-model de UI (o próprio `GrupoDividasView` vive dentro de um `.component.ts` em `shared/components/tabela-contratos`), não contrato de backend. Isso puxa `entityParaGrupoView`, `entityParaView` e `viewParaEntity` inteiras, e `ondeRenegociar` junto (está inline no corpo de `entityParaView`, não é chamada externa — move com a função).

**Não entra no escopo deste passo** (fica registrado, não corrigido agora): a formatação de `periodicidade` por regex, embutida no mesmo `entityParaView`, é formatação de string e candidata a pipe/util de shared segundo o veredito — mas o passo 5 do plano pede mover a função inteira para o adapter, não fatiar a formatação num terceiro artefato. Ela migra junto com `entityParaView` para o adapter e continua lá até (se um dia) virar pipe — não invento essa ficha agora porque o plano não pediu. Da mesma forma, o achado "reconstrução com perda de dado" (`viewParaEntity` fabricando zeros) move de local mas o corpo não muda — corrigir a fabricação de zeros é achado à parte, não pedido neste passo.

---

#### dividas.mapper.ts — ALTERAR
- **Camada**: domain (mapper). Critério: só o que traduz o contrato de backend (`ListagemDividasResponseDto`) para o domínio (`DividaEntity`) fica aqui.
- **Responsabilidade**: tradução `ListagemDividasResponseDto` → `DividaEntity[]`. Só isso.
- **Membros públicos**:
  - `static dtoParaEntity(dados: ListagemDividasResponseDto | null): DividaEntity[]`
- **Dependências**: mantém `GenerateSecureIdService`, `ListagemDividasResponseDto`, `DividaEntity`. Remove os imports de `DividaView` (`@app/models/view-model/divida.view.model`) e `GrupoDividasView` (`@app/shared/components/tabela-contratos/tabela-contratos.component`) — é a própria correção do achado: mapper de dado não deveria importar tipo de UI.
- **Sai de onde**: N/A para este arquivo — é o que resta depois da remoção de `entityParaGrupoView`, `entityParaView`, `viewParaEntity`.
- **Por que**: fecha o achado PONTUAL do vereditos-datalayer.md — "mapper da camada de dados importando tipo de componente é inversão de dependência — dado depende de UI, não o contrário".

#### `src/app/features/dividas/dividas-apresentacao.mapper.ts` — CRIAR
- **Camada**: feature. Não é `shared` porque precisa conhecer `DividaEntity` (tipo de domínio) — se fosse para shared, inverteria a dependência de novo (shared conhecendo entidade de domínio). Não é `domain/mappers` porque o par de tipos que produz/consome (`DividaView`, `GrupoDividasView`) é view-model de apresentação, não contrato de backend.
- **Responsabilidade**: traduzir `DividaEntity` ↔ view-model de apresentação (`DividaView`/`GrupoDividasView`) usado pela tabela de contratos, incluindo a regra de exibição "RECR antigo/novo".
- **Membros públicos**:
  - `static entityParaGrupoView(dados: DividaEntity[][]): GrupoDividasView[]`
  - `static entityParaView(dados: DividaEntity[]): DividaView[]`
  - `static viewParaEntity(dados: DividaView[]): DividaEntity[]`
- **Membros privados**:
  - `private static ondeRenegociar(restricoes: DividaEntity['restricoes']): string`
- **Dependências**: importa `DividaEntity` de `@app/models/entities/divida.entity`, `DividaView` de `@app/models/view-model/divida.view.model`, `GrupoDividasView` de `@app/shared/components/tabela-contratos/tabela-contratos.component`. Não importa `GenerateSecureIdService` nem `ListagemDividasResponseDto` — não traduz DTO, só view.
- **Sai de onde**: dividas.mapper.ts — `entityParaGrupoView`, `entityParaView` (incluindo a expressão inline de `ondeRenegociar`, extraída para o método privado acima, e a regex de `periodicidade`, que permanece inline dentro de `entityParaView` neste destino) e `viewParaEntity`, corpos inalterados.
- **Por que**: fecha o achado PONTUAL — "`DividasMapper` importa tipo de componente de UI, embute regra de negócio de exibição (`ondeRenegociar`) e reconstrói entity com valores zerados a partir de view (`viewParaEntity`)". Isolar em artefato de feature significa que mudança no componente `tabela-contratos` não obriga mexer no mapper de dado, e vice-versa.

**Impacto colateral**:
- dividas.service.ts (`obterListagemDividas`) — troca import de `DividasMapper` por `DividasApresentacaoMapper` nas três chamadas (`entityParaGrupoView` e as duas `entityParaView`). Motivo: é consumidor direto das funções movidas.
- dividas.component.ts (`selectedContratos`) — troca `DividasMapper.viewParaEntity(data)` por `DividasApresentacaoMapper.viewParaEntity(data)`. Motivo: único outro chamador de `viewParaEntity`.
- dividas.mapper.spec.ts — os testes de `entityParaView`/`viewParaEntity` (L277+) saem deste spec e migram para um spec novo do adapter (`dividas-apresentacao.mapper.spec.ts`); o spec de `DividasMapper` fica só com os casos de `dtoParaEntity`. Motivo: spec deve testar o artefato onde o código de fato mora.
- dividas.service.spec.ts — o mock `jest.spyOn(DividasMapper.entityParaGrupoView...)` precisa apontar para `DividasApresentacaoMapper`. Motivo: mock hoje aponta para o artefato de origem, que deixa de ter o método.

---

## 4. Ordem de execução

A ordem abaixo **não** é a ordem lógica dos passos — é a ordem em que o compilador aceita. Cada linha pode ser aplicada isoladamente sem quebrar o build.

Regra que gerou a ordem: **criar/adicionar método → trocar quem chama → só então apagar a origem.** Nunca apague uma função antes de zerar seus chamadores, nem troque um chamador antes de o destino existir.

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

---

## 5. Pontos de atenção

**1. Dependência circular no Passo 3 — já corrigida na spec, não reintroduza.**
O desenho inicial fazia `confirmacao.mapper.ts` importar `MetodoFormaPagamentoSelecionado` do `confirmacao-feature.service.ts`, enquanto o feature service importava o mapper de volta. A correção: o mapper declara seu próprio shape estrutural (`PagamentoResolvido`) e não importa nada do feature service. A dependência é de mão única — **feature service → mapper**. Se ao implementar surgir a tentação de reaproveitar o tipo do service no mapper, é o ciclo voltando.

**2. `ConfirmacaoResponseDto` nomeia o envelope, não tipa o payload.**
A spec define `type ConfirmacaoResponseDto = ApiResponseDto<unknown>`. Isso resolve o risco real (passa a existir um lugar para ler `sucesso`/`mensagem`, via `verificarSucesso`), mas o corpo da resposta continua `unknown`. Tipar o payload de fato depende de obter o contrato do endpoint `/efetivar` junto ao time do BFF — fica registrado como pendência, não como parte deste escopo.

**3. Passo 3 e Passo 4 mexem no fluxo irreversível.**
São os únicos passos que alteram o comportamento de `POST /efetivar`. O Passo 4 muda o caminho de erro: hoje o store navega para a tela de conclusão mesmo quando o backend recusa; depois, `sucesso: false` passa a cair em estado de erro. Isso é correção de bug, não refactor neutro — trate como mudança de comportamento em teste e homologação.

**4. Passo 2 tem um achado extra em relação ao plano.**
No `renegociacao.store.ts`, `carregarOfertasPredefinidas` importa `criarOfertaPredefinidaRequest` mas nunca a chama — monta o objeto inline por literal, duplicando o shape. Corrigir esse ponto faz parte do Passo 2; sem isso o vazamento sobrevive em outro lugar e o import fica morto.

---

## 6. Fora deste escopo

Registrado por transparência. Não implemente junto sem abrir discussão própria.

- **Interceptor de loading/message.** `LoadingService` e `MessageService` estão hardcoded nos seis services de dados — é feedback de UI dentro da camada de dados. É acoplamento de infraestrutura, não de domínio, e foi deliberadamente deixado fora desta análise.
- **Entities com opcionais mais fracos que a garantia do mapper.** `ClienteEntity` (`nome?`, `documento?`, `tipoDocumento?`, `razaoSocial?`) e `OfertaEntity` (`valorEntrada?`, `dataEntradaParcela?`) declaram opcional o que o mapper sempre preenche. Correção barata, mas não é vazamento entre camadas.
- **Cadeia "Histórico".** `HistoricoEntity` é interface vazia referenciada em `store.historico`, sem nenhuma cadeia que a popule. É lacuna, não acoplamento a reduzir.
- **`periodicidade` por regex** e **`viewParaEntity` fabricando zeros** — movem junto com as funções no Passo 5, corpo inalterado. Corrigi-los é trabalho à parte.

**Limpeza sem risco, pode ir em qualquer PR:** deletar `core/services/api/conclusao.service.ts`, `enum-utils.service.ts` e `negociacao.entity.ts` — mortos, confirmados por busca de referências.

---

## 7. Como verificar cada passo

1. **Compila isoladamente.** Aplique só as linhas daquele passo na ordem da seção 4; o build tem de passar em cada linha.
2. **O arquivo de origem ficou só com shape.** Depois dos passos 1, 2 e 3, os arquivos de DTO tocados não devem exportar nenhuma função — só `interface`/`type`/`enum`.
3. **Nenhum import de UI em mapper de dado.** Depois do passo 5, `dividas.mapper.ts` não importa `DividaView` nem `GrupoDividasView`.
4. **Os testes seguiram o código.** Spec testa o artefato onde o código passou a morar, não onde morava.
