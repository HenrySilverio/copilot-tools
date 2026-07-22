> [!IMPORTANTE]

## Passo 1 — Cliente

### cliente.mapper.ts — ALTERAR

- **Camada**: domain (mapper). É onde a tradução Entity↔DTO já vive (`dtoParaEntity`); a direção inversa completa o mesmo dono.
- **Responsabilidade**: dono único da tradução bidirecional `ClienteEntity` ↔ DTOs de cliente (leitura e escrita).
- **Membros públicos** (adicionar aos existentes):
  - `static entityParaAtualizacaoRequest(email: string, telefone: ClienteEntity['dadosPessoais']['telefone'], endereco: EnderecoClienteAtualizacaoEntrada): ClienteAtualizacaoRequestDto`
- **Membros privados** (adicionar):
  - `private static mapearTelefoneParaDto(telefone: ClienteEntity['dadosPessoais']['telefone']): ClienteAtualizacaoRequestDto['telefone']`
- **Dependências**: passa a importar `ClienteAtualizacaoRequestDto` e `EnderecoClienteAtualizacaoEntrada` de `@app/models/dto/cliente-atualizacao-request.dto`. Nenhuma dependência removida.
- **Sai de onde**: cliente-atualizacao-request.dto.ts — funções `criarClienteAtualizacaoRequest` e `mapearTelefoneParaDto`, corpo inalterado.
- **Por que**: fecha a Ausência #1 do vereditos-datalayer.md — "falta a direção inversa do mapper (entity→DTO para atualização), hoje vazada para dentro do arquivo de DTO". A regra de negócio (fixo vs. celular por `length`) passa a morar no mesmo artefato que já decide o resto da tradução de Cliente.

### cliente-atualizacao-request.dto.ts — ALTERAR

- **Camada**: domain (DTO). Contrato de shape puro, sem função.
- **Responsabilidade**: descrever só o shape de `ClienteAtualizacaoRequestDto`.
- **Membros públicos**: `interface ClienteAtualizacaoRequestDto` (mantém como está) e `interface EnderecoClienteAtualizacaoEntrada` (mantém, vira tipo de suporte usado só pelo mapper).
- **Dependências**: remove o import de `ClienteEntity` (só era usado pela assinatura das funções removidas).
- **Sai de onde**: N/A — é remoção. `criarClienteAtualizacaoRequest` e `mapearTelefoneParaDto` saem deste arquivo (vão para o mapper acima).
- **Por que**: elimina o "DTO fazendo papel de mapper" (Ausência #1, Cliente) — o arquivo volta a só descrever formato de request.

**Impacto colateral**:

- renegociacao.store.ts — troca o import de `criarClienteAtualizacaoRequest` (de `@app/models/dto/cliente-atualizacao-request.dto`) por `ClienteMapper` (já importado na L8) e a chamada `criarClienteAtualizacaoRequest(email, telefone, endereco)` vira `ClienteMapper.entityParaAtualizacaoRequest(email, telefone, endereco)`. Motivo: é o único chamador da função movida; sem essa troca o build quebra.

---

## Passo 2 — Ofertas

### ofertas.mapper.ts — ALTERAR

- **Camada**: domain (mapper). Mesma razão do Passo 1 — mapper já existente vira dono das duas direções.
- **Responsabilidade**: dono único da tradução `OfertaEntity` ↔ DTOs de oferta (leitura e escrita, predefinida e personalizada).
- **Membros públicos** (adicionar aos existentes):
  - `static entityParaPredefinidaRequest(numeroAcordo: string, conta: OfertaContaDto, contratos: OfertaContratoDto[], codigoEmpresa: string): OfertaPredefinidaRequestDto`
  - `static entityParaPersonalizadaRequest(numeroAcordo: string, contratos: OfertaContratoDto[], valorEntrada?: number, taxaJuros?: number, dataVencimentoParcela?: string, valorParcela?: number | null, quantidadeParcelas?: number | null): OfertaPersonalizadaRequestDto`
- **Dependências**: passa a importar `OfertaContaDto`, `OfertaPredefinidaRequestDto` de `@app/models/dto/oferta-predefinida-request.dto` e `ENUM_ACORDO_A_VISTA`, `OfertaPersonalizadaRequestDto` de `@app/models/dto/oferta-personalizada-request.dto` (o `OfertaContratoDto` de personalizada tem shape próprio, com `parcela?`, distinto do de predefinida — mantém os dois nomes/importações separados, sem unificar por simetria).
- **Sai de onde**: oferta-predefinida-request.dto.ts função `criarOfertaPredefinidaRequest`; oferta-personalizada-request.dto.ts função `criarOfertaPersonalizadaRequest`. Corpo inalterado nos dois casos.
- **Por que**: fecha a Ausência #1 nas duas cadeias de Ofertas (padrão A do fechamento de sessão) — mesmo desvio estrutural do Cliente, "só shape, sem regra".

### oferta-predefinida-request.dto.ts — ALTERAR

- **Camada**: domain (DTO).
- **Responsabilidade**: descrever só o shape de `OfertaPredefinidaRequestDto` (+ `OfertaContaDto`, `OfertaContratoDto`).
- **Membros públicos**: `interface OfertaContaDto`, `interface OfertaContratoDto`, `interface OfertaPredefinidaRequestDto` — todas mantidas como estão.
- **Dependências**: nenhuma (a função removida não tinha import externo).
- **Sai de onde**: N/A — remoção de `criarOfertaPredefinidaRequest`.
- **Por que**: mesmo motivo do DTO de Cliente — arquivo de DTO não fabrica objeto, só declara shape.

### oferta-personalizada-request.dto.ts — ALTERAR

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

## Passo 3 — Confirmação (mapper + feature service)

### `src/app/mappers/confirmacao.mapper.ts` — CRIAR

- **Camada**: domain (mapper). Só reshape de dado já resolvido — mesmo papel que `ClienteMapper`/`OfertasMapper` exercem nas outras cadeias.
- **Responsabilidade**: traduzir dados já decididos (contrato principal, código de operação, forma de pagamento ativa) para o shape `ConfirmacaoRequestDto`. Não decide nada, só reformata.
- **Membros públicos**:
  - `static entidadesParaRequest(dados: ConfirmacaoDadosResolvidos): ConfirmacaoRequestDto`
  - `interface ConfirmacaoDadosResolvidos { contratoPrincipal: DividaEntity | undefined; contratosSelecionados: DividaEntity[]; ofertaSelecionada: OfertaEntity | null; cliente: ClienteEntity; codigoOperacao: string; grupoContratos: string; pagamentoAtivo: { aVista?: MetodoFormaPagamentoSelecionado; entrada?: MetodoFormaPagamentoSelecionado; parcela?: MetodoFormaPagamentoSelecionado }; autorizacoesSelecionadas: [TipoAutorizacao, boolean][] }`
- **Dependências**: importa `ConfirmacaoRequestDto` de `@app/models/dto/confirmacao-request.dto`; `MetodoFormaPagamentoSelecionado` de `@app/features/confirmacao/confirmacao-feature.service` (abaixo); `ClienteEntity`, `DividaEntity`, `OfertaEntity`, `TipoAutorizacao`. Não injeta nada (classe estática, como os demais mappers).
- **Sai de onde**: parte **(a)** de confirmacao-request.dto.ts (`criarConfirmacaoRequest`, só os campos de reshape: `proposta`, `cliente.idEndereco`, `divida`, `autorizacoes`) e parte **(a)** de `montarPagamentoConfirmacao` (L159-210: montagem de `aVista`/`entrada`/`parcela` e formatações — uppercase de método, `.replace(/\//g,'.')`), sem o `reduce` de decisão.
- **Por que**: fecha a Ausência #1 (grau mais grave, Confirmacao) e a metade "(a) montagem de payload" do achado misto de `criarConfirmacaoRequest`/`montarPagamentoConfirmacao` no vereditos-datalayer.md — "isso é trabalho de mapper", testável sem mockar decisão de negócio.

### `src/app/features/confirmacao/confirmacao-feature.service.ts` — CRIAR

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

### confirmacao-request.dto.ts — ALTERAR

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

## Passo 4 — Contrato de resposta + checagem de sucesso

### `src/app/models/dto/confirmacao-response.dto.ts` — CRIAR

- **Camada**: domain (DTO).
- **Responsabilidade**: nomear o envelope de resposta de `/efetivar`, hoje anônimo como `ApiResponseDto<unknown>` inline no service.
- **Membros públicos**:
  - `type ConfirmacaoResponseDto = ApiResponseDto<unknown>`
- **Dependências**: importa `ApiResponseDto` de `@app/models/dto/api-response.dto`.
- **Sai de onde**: não é código movido — é extração de um tipo hoje inline em `ConfirmacaoService.confirmarRenegociacao`.
- **Por que**: fecha a Ausência #3 do plano — dar nome de domínio ao contrato de resposta da única chamada irreversível, em vez de `unknown` genérico disperso pelo service e pelo store.

### confirmacao.service.ts — ALTERAR

- **Camada**: core (services/api). Continua adaptador de I/O puro — não muda de camada, só de tipo de retorno.
- **Responsabilidade**: inalterada — só HTTP POST para `/efetivar`.
- **Membros públicos**:
  - `confirmarRenegociacao(apiRequest: ConfirmacaoRequestDto): Observable<ConfirmacaoResponseDto>`
- **Dependências**: troca o import de `ApiResponseDto` por `ConfirmacaoResponseDto` de `@app/models/dto/confirmacao-response.dto`. `HttpService` continua injetado, sem mudança.
- **Sai de onde**: N/A — só retipagem da assinatura existente (L14).
- **Por que**: parte 1 da Ausência #3 — dá nome ao envelope; sozinho ainda não resolve o risco, precisa do item abaixo.

### `src/app/features/confirmacao/confirmacao-feature.service.ts` — ALTERAR (2ª alteração, acumula com o Passo 3)

- **Camada**: feature — mesmo motivo do Passo 3: é quem já orquestra a decisão de negócio desta cadeia, então é o dono natural de "isso foi de fato confirmado".
- **Responsabilidade** (adicionada): decidir se a resposta de `/efetivar` representa sucesso real de negócio, não só HTTP 2xx.
- **Membros públicos** (adicionar):
  - `verificarSucesso(resposta: ConfirmacaoResponseDto): boolean`
- **Dependências**: importa `ConfirmacaoResponseDto` de `@app/models/dto/confirmacao-response.dto`. Nenhuma dependência nova de I/O.
- **Sai de onde**: não é código movido — é checagem que hoje não existe em lugar nenhum (`tapResponse.next` não lê o corpo).
- **Por que**: fecha a Ausência #3 por completo — "o app não tem como distinguir renegociação efetivada de backend recusou mas devolveu 200". Depende do Passo 3 existir (é o mesmo service que resolve `codigoOperacao`/contrato principal que agora também resolve sucesso, evitando essa decisão cair de volta no store).

**Impacto colateral**:

- renegociacao.store.ts (`confirmarRenegociacao`, bloco `tapResponse`) — o `next` hoje não declara parâmetro (`next: () => {...}`). Passa a declarar `next: (resposta) => {...}`, chamar `confirmacaoFeatureService.verificarSucesso(resposta)` e só then fazer `patchState(store, { renegociacaoConfirmada: true, ... })` no caminho de sucesso; caminho `sucesso: false` precisa cair em `patchState(store, { erro: true, ... })` em vez de navegar para conclusão como hoje. Motivo: é a única forma de a tipagem do Passo 4 ter efeito observável — sem essa mudança no consumidor, `ConfirmacaoResponseDto` fica tipado mas ainda ignorado, reproduzindo o mesmo defeito.


## Critério de corte

**Fica no `DividasMapper`**: qualquer função cuja entrada e saída sejam tipos de contrato/domínio (`ListagemDividasResponseDto`, `DividaEntity`). Teste: se a função não importa nem `DividaView` nem `GrupoDividasView`, ela fica. Só sobra `dtoParaEntity`.

**Vai para o adapter de apresentação**: qualquer função que produza ou consuma `DividaView`/`GrupoDividasView` — são view-model de UI (o próprio `GrupoDividasView` vive dentro de um `.component.ts` em `shared/components/tabela-contratos`), não contrato de backend. Isso puxa `entityParaGrupoView`, `entityParaView` e `viewParaEntity` inteiras, e `ondeRenegociar` junto (está inline no corpo de `entityParaView`, não é chamada externa — move com a função).

**Não entra no escopo deste passo** (fica registrado, não corrigido agora): a formatação de `periodicidade` por regex, embutida no mesmo `entityParaView`, é formatação de string e candidata a pipe/util de shared segundo o veredito — mas o passo 5 do plano pede mover a função inteira para o adapter, não fatiar a formatação num terceiro artefato. Ela migra junto com `entityParaView` para o adapter e continua lá até (se um dia) virar pipe — não invento essa ficha agora porque o plano não pediu. Da mesma forma, o achado "reconstrução com perda de dado" (`viewParaEntity` fabricando zeros) move de local mas o corpo não muda — corrigir a fabricação de zeros é achado à parte, não pedido neste passo.

---

## Passo 5 — Dividas

### dividas.mapper.ts — ALTERAR
- **Camada**: domain (mapper). Critério: só o que traduz o contrato de backend (`ListagemDividasResponseDto`) para o domínio (`DividaEntity`) fica aqui.
- **Responsabilidade**: tradução `ListagemDividasResponseDto` → `DividaEntity[]`. Só isso.
- **Membros públicos**:
  - `static dtoParaEntity(dados: ListagemDividasResponseDto | null): DividaEntity[]`
- **Dependências**: mantém `GenerateSecureIdService`, `ListagemDividasResponseDto`, `DividaEntity`. Remove os imports de `DividaView` (`@app/models/view-model/divida.view.model`) e `GrupoDividasView` (`@app/shared/components/tabela-contratos/tabela-contratos.component`) — é a própria correção do achado: mapper de dado não deveria importar tipo de UI.
- **Sai de onde**: N/A para este arquivo — é o que resta depois da remoção de `entityParaGrupoView`, `entityParaView`, `viewParaEntity`.
- **Por que**: fecha o achado PONTUAL do vereditos-datalayer.md — "mapper da camada de dados importando tipo de componente é inversão de dependência — dado depende de UI, não o contrário".

### `src/app/features/dividas/dividas-apresentacao.mapper.ts` — CRIAR
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