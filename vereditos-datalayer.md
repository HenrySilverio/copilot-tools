> [!NOTE] FASE 1 — Cadeias exclusivas CADEIA: Cliente

## Fluxo real da cadeia Cliente

**Leitura**: `ClienteService.carregarCliente()` → GET → unwrap `ApiResponseDto` → devolve `ClienteResponseDto` cru → (fora do service, no renegociacao.store.ts) `ClienteMapper.dtoParaEntity()` → `ClienteEntity` → state do store.

**Escrita**: form da feature monta `email/telefone/endereco` → store chama `criarClienteAtualizacaoRequest(...)` (dentro do arquivo de DTO) → gera `ClienteAtualizacaoRequestDto` → `ClienteService.atualizarCliente()` → POST → `ApiResponseDto<ClienteResponseDto>` cru devolvido → store chama `ClienteMapper.dtoParaEntity(result.dados)` de novo e faz merge manual dos campos `telefone`/`endereco` com o estado anterior.

## Respostas às 3 perguntas

1. **Mapeamento DTO→entity inline no service?** Não. `ClienteService` só faz HTTP + unwrap de `ApiResponseDto`. Quem chama `ClienteMapper.dtoParaEntity` é o store, não o service — correto quanto a isso.
2. **Service injeta `LoadingService`/`MessageService`?** Não. `ClienteService` injeta só `HttpService`. Isso contradiz o que o mapa-integracoes.md generalizou para "todas as 6 cadeias" — aqui não se confirma. Vou sinalizar essa divergência para revisão quando as outras cadeias chegarem.
3. **Shape do DTO bate com o contrato real?** Sem o contrato do BFF em mãos não dá pra afirmar divergência; nada nos dados é obviamente incoerente (é achado pendente, não descarto).

## Blocos com responsabilidade fora de lugar

**Bloco**: `criarClienteAtualizacaoRequest()` + `mapearTelefoneParaDto()` em cliente-atualizacao-request.dto.ts

- **Classificação**: muda de camada.
- **Por que está errado**: é mapeamento Entity→DTO com regra de negócio embutida (decidir fixo vs. celular pelo tamanho da string). Um arquivo de DTO virou também mapper — quebra responsabilidade única do contrato de shape.
- **Onde deveria estar**: `ClienteMapper` (já existe nesta cadeia). Hoje o mapper só tem `dtoParaEntity` (leitura); falta o método simétrico, ex. `ClienteMapper.entityParaAtualizacaoRequest(entity)`.
- **Trade-off**: mover fecha o mapper como único dono da tradução bidirecional (fácil de testar as duas direções juntas). Alternativa: mapper receber a `ClienteEntity` inteira em vez de `email/telefone/endereco` soltos — elimina a necessidade do tipo auxiliar abaixo, mas obriga o chamador (store) a montar/copiar a entity primeiro.

**Bloco**: `EnderecoClienteAtualizacaoEntrada` em cliente-atualizacao-request.dto.ts

- **Classificação**: sai (junto com o bloco acima).
- **Por que está errado**: é um shape de conveniência para a função de mapeamento, não um contrato de request/response. Não pertence ao arquivo de DTO.
- **Onde deveria estar**: some se o mapper passar a receber `ClienteEntity` direto; senão, migra para dentro de cliente.mapper.ts como tipo interno de suporte.
- **Trade-off**: nenhum custo real — é só puxar o tipo junto com a função que o usa.

## Observação, não diagnóstico fechado (fica para o turno da Store)

O merge de `telefoneAtualizado`/`enderecoAtualizado` em renegociacao.store.ts (linhas ~213/320+) combina entity atual + resultado do mapper campo a campo. Isso é lógica de tradução/composição de estado, hoje na store. Não vou classificar agora porque a store é artefato compartilhado por todas as cadeias e você disse que cada cadeia é avaliada isoladamente primeiro — mas fica registrado como candidato a método do `ClienteMapper` (ex. `mergeAtualizacao(atual, parcial)`) quando chegarmos lá.

## Correção factual sobre o mapa

cliente.mapper.ts está listado como **órfão** na Seção 3 do mapa-integracoes.md, mas é usado ativamente pelo store (2 chamadas) e tem spec próprio. Não é órfão — o mapa precisa ser corrigido nesse ponto.

**Não é "sã"**: a cadeia tem um achado real (DTO fazendo papel de mapper). Pronto para a próxima cadeia quando você anexar.

Nenhum dos dois. O mapper não foi abandonado nem está desconectado — ele está ativo e plugado, só que **não dentro do service**, e sim no consumidor da cadeia.

**Evidência**: renegociacao.store.ts chama `ClienteMapper.dtoParaEntity(result)` na leitura (linha ~213) e `ClienteMapper.dtoParaEntity(result.dados)` na atualização (linha ~320). Não há mapeamento manual/inline duplicando essa lógica em nenhum lugar da cadeia — conferi cliente.service.ts de novo, ele só faz unwrap de `ApiResponseDto`, zero transformação de shape.

**Por que o mapa e a Seção 3 erraram ao mesmo tempo**: a coluna "mappers" da Seção 1 está vazia para `ClienteService` porque é literal — o _service_ não chama mapper. Mas isso foi lido (por mim, no turno anterior) e pela Seção 3 do mapa como "o mapper não é usado em lugar nenhum", o que é falso: o dono da chamada é o store, não o service. É um problema de granularidade do mapa (ele documenta service→mapper, não cadeia→mapper), não um problema no código.

**Caminho correto a manter**: o atual. `ClienteService` continua um adaptador de I/O puro (sem mapper dentro dele) e `ClienteMapper.dtoParaEntity` continua sendo chamado por quem consome o resultado (hoje o store; amanhã, se existir, o service de feature). Não plugar o mapper dentro do `ClienteService` não é um débito — é a divisão correta: service não deveria decidir para que shape de domínio o dado vira, isso é responsabilidade de quem orquestra o uso do dado.

O achado real desta cadeia continua sendo o do turno anterior: falta a direção inversa do mapper (`entity→DTO` para atualização), hoje vazada para dentro do arquivo de DTO — isso sim é lacuna, não o "sem mapper" do mapa.

> [!NOTE] Contas

**Padrão de referência (Contas)**: service devolve o DTO cru (sem unwrap nem mapeamento), o DTO é shape puro de lista, e todo o DTO→Entity — inclusive a geração de `id` sintético via `GenerateSecureIdService` — fica isolado em `ContasMapper.dtoParaEntity`, sem nenhuma lógica de tradução vazando para service, DTO ou store.

Diferença-chave para a cadeia Cliente: aqui não existe direção inversa (Entity→DTO) nesta cadeia — é só leitura —, então não há onde a "regra de negócio disfarçada de mapeamento" (tipo o `mapearTelefoneParaDto`) pudesse vazar. Contas está estruturalmente mais simples que Cliente, não necessariamente "mais correta"; ela só não tem o caso de uso (update) que expôs o problema na outra cadeia.

> [!NOTE] Dividas

**De onde vem o volume**: não é o service (17 linhas, puro I/O, sem mapper chamado, sã) nem o DTO (grande mas é shape real do contrato — dívida com contrato/débito/juros/encargos aninhados, sem lógica). O volume está concentrado no `DividasMapper`, que faz mais do que DTO↔Entity.

**Blocos fora de lugar dentro do mapper**:

**Bloco**: `entityParaGrupoView`, `entityParaView`, `viewParaEntity` em dividas.mapper.ts

- **Classificação**: sai do mapper de dados.
- **Por que está errado**: `DividaView`/`GrupoDividasView` são view-model de apresentação (o próprio import vem de `@app/shared/components/tabela-contratos/...`, um componente de UI). Um mapper da camada de dados importando tipo de componente é inversão de dependência — dado depende de UI, não o contrário.
- **Onde deveria estar**: lógica de Entity↔View pertence à feature (um mapper/adapter de apresentação dentro da feature, perto do componente `tabela-contratos`), não ao `DividasMapper` que deveria conhecer só DTO↔Entity.
- **Trade-off**: separar cria um segundo mapper (feature-level), mais um arquivo; mas remove o vazamento de UI para dentro da camada de dados e evita que qualquer mudança no componente de tabela obrigue mexer no mapper de dado.

**Bloco**: regra `ondeRenegociar` (índices fixos `restricoes[1]`/`restricoes[2]`) e regex de `periodicidade` dentro de `entityParaView`

- **Classificação**: sai.
- **Por que está errado**: é regra de negócio de exibição ("RECR antigo" vs "RECR novo") e formatação de texto, não tradução de shape. Também é frágil — indexa array por posição sem checar tamanho antes (o guard `restricoes.length > 1` só cobre parte do acesso, `restricoes[2]` pode estourar).
- **Onde deveria estar**: regra de negócio de apresentação → feature (mesmo destino do bloco acima); formatação de string é candidata a pipe/util de shared, não de mapper de dado.
- **Trade-off**: mover resolve o vazamento mas não corrige a fragilidade do índice fixo — isso é bug latente independente de camada, vale registrar separado.

**Bloco**: `viewParaEntity` fabricando zeros (`valorCorrigido: 0`, `parcelas: {0,0,0}`, `cartao: null`, etc.)

- **Classificação**: achado, não é só "fora de lugar" — é reconstrução com perda de dado.
- **Por que está errado**: reconstrói uma `DividaEntity` a partir de uma `DividaView` que nunca carregou esses campos — produz uma entity "fake" com valores zerados que não refletem a dívida real. Sinal de que a View virou fonte de verdade para mutação, quando deveria ser só leitura/exibição.
- **Onde deveria estar**: se a feature precisa mutar seleção/estado da dívida, deveria mutar a `DividaEntity` original (guardada em algum lugar) e só then regenerar a view — não reconstituir a entity a partir da view.
- **Trade-off**: corrigir exige a feature manter a entity original acessível durante a seleção (mais estado a carregar), mas elimina o risco de persistir dado zerado por engano em qualquer fluxo que use essa entity reconstruída adiante (ex.: Confirmacao).

**Resumo**: a maior cadeia é grande porque o mapper acumulou 3 responsabilidades (DTO↔Entity, Entity↔View, regra de negócio de exibição) em vez de 1. Tirando os blocos View/regra de negócio, o mapeamento real DTO↔Entity (`dtoParaEntity`) é enxuto e correto — é a mesma estrutura do padrão de referência (Contas), só que ofuscado pelo resto.

> [!NOTE] Ofertas

## Resposta direta à pergunta

**Não é o caso.** O `OfertaResponseDto` tem só **um** campo opcional (`juros?`) em dez campos do item de oferta — e essa opcionalidade está amarrada ao _tipo_ de oferta (`tipoPrazo: A_VISTA` normalmente não tem juros aplicável), não à _origem_ do endpoint (predefinida vs. personalizada). Não há um segundo conjunto de campos "só preenchido por um dos dois" — `valorAcordo`, `parcelas`, `total`, `valorDesconto`, os três `valorMinimoEntrada*` são obrigatórios nos dois fluxos. Não classifico como perda de contrato no response.

O que **de fato** está alargado sem justificativa é a **Entity**, não o DTO — o inverso do que a hipótese previa:

**Bloco**: `valorEntrada?` e `dataEntradaParcela?` em oferta.entity.ts

- **Classificação**: muda de camada (correção de tipo, não de local do código).
- **Por que está errado**: no DTO, `valorMinimoEntradaMinima` e `parcelas.dataVencimento` são **obrigatórios**. O mapper (`OfertasMapper.dtoParaEntidade`) sempre os preenche — não há caminho onde fiquem `undefined`. Marcar como opcional na entity é o inverso do achado que você suspeitava: aqui a camada de domínio _perdeu_ garantia que o DTO já dava, obrigando toda a feature a fazer guarda defensiva (`entity.valorEntrada ?? 0`) contra um caso que nunca ocorre.
- **Onde deveria estar**: `OfertaEntity.valorEntrada: number` e `dataEntradaParcela: string`, sem `?`, refletindo o que o `OfertasMapper` de fato garante.
- **Trade-off**: apertar o tipo é diff pequeno e sem risco (o mapper já preenche sempre); único custo é revisar se algum consumidor da entity depende do `?` para lógica condicional hoje morta.

**Achado paralelo** (mesmo padrão da cadeia Cliente): `criarOfertaPredefinidaRequest` e `criarOfertaPersonalizadaRequest` em oferta-predefinida-request.dto.ts e oferta-personalizada-request.dto.ts são funções fábrica dentro do arquivo de DTO — de novo DTO fazendo papel de mapper (aqui é mais inócuo, só monta o objeto sem regra de negócio como o telefone de Cliente, mas é o mesmo desvio estrutural repetido).

- **Onde deveria estar**: `OfertasMapper` ganharia os métodos simétricos `entityParaPredefinidaRequest` / `entityParaPersonalizadaRequest`.
- **Trade-off**: baixo — são funções puras de shape, mover é mecânico; o ganho é ter as duas direções (request/response) no mesmo artefato, em vez de metade no mapper e metade espalhada em dois arquivos de DTO.

**Sem discriminador de origem**: nem o DTO nem a Entity guardam de qual endpoint (`simulacao` vs `simulacao-personalizada`) a oferta veio. Hoje não é problema porque o `tipoPrazo` já distingue os casos de uso na prática, mas registre como risco latente se a feature um dia precisar tratar as duas origens de forma diferente — não proponho campo novo agora porque nada no código atual precisa disso.

> [!NOTE] Cep

O cep.service.ts tem 18 linhas e o cep-response.dto.ts tem 6. Juntos, ~24 LOC — nada perto de 563. **A cadeia declarada no mapa está sã em si mesma**, mas o número de LOC do mapa está contando volume que não está nesses dois arquivos.

Rastreei quem consome `CepService`: é card-dados-cliente.component.ts, um container **shared**, não a cadeia core/data listada. É ali que mora o volume real (formulário, GTM, regras de visibilidade de campo, formatação). Ou seja: **o mapa mediu a cadeia errado** — atribuiu a `CepService` o peso do consumidor, não do artefato de dado.

## Classificação dos blocos encontrados no consumidor

**Bloco**: `observerPreenchimentoCep()` + `consultarCep()` (dispara a chamada ao `CepService` quando o CEP tem 8 dígitos, faz patch do formulário, seta `cepNotFound`)

- **Classificação**: fica.
- **Por quê**: é orquestração de efeito colateral de UI (reagir a input do usuário, popular formulário) — responsabilidade legítima de um container de feature, não de service de dado.

**Bloco**: `formatarTelefone()` (regex de máscara de telefone)

- **Classificação**: sai.
- **Por que está errado**: é formatação de apresentação reimplementada dentro do componente, enquanto o próprio componente já importa `TelefonePipe` para o mesmo domínio. É duplicação — dois caminhos formatando telefone de formas potencialmente diferentes.
- **Onde deveria estar**: usar o `TelefonePipe` existente (ou um método utilitário nele), eliminando o método privado.
- **Trade-off**: remoção pura, sem custo — só exige garantir que o pipe cobre o caso dos 10/11 dígitos igual ao método atual.

**Bloco**: `camposEnderecoVisibilidade` (Map) + `tratarVisibilidadeCamposEndereco()` (decide se logradouro/bairro ficam editáveis conforme vierem vazios do CEP)

- **Classificação**: fica.
- **Por quê**: é regra de apresentação condicional ("mostrar campo se backend não retornou valor"), pertence à feature/UI. Não é regra de domínio nem de dado.

**Bloco**: `monitoramentoGtm.logBusiness(...)` repetido em `ngOnInit`, `alterar`, `cancelar`, `salvar`, `rastrearFocoInput` (5 pontos de chamada, cada um com objeto literal quase idêntico)

- **Classificação**: fica (é telemetria de UI, lugar certo), mas é **repetição estrutural**, não vazamento de camada.
- **Por que está sinalizado mesmo assim**: cada chamada repete `product: 'reneg'`, `location: 'jornada_reneg/dados_cliente'` na mão — não é erro de camada, é boilerplate que poderia ser um helper local (`logCard(flow, label, action)`), mas não vou propor essa abstração agora porque ninguém pediu e o ganho é cosmético.

**Bloco**: `salvar()` monta `ClienteEntity` diretamente com regex de telefone inline (`this.formularioEdicao?.value.telefone.replace(/\D/g, '')...`) antes de chamar `renegociacaoStore.atualizarCliente(...)`

- **Classificação**: fica funcionalmente, mas é o mesmo tipo de mistura vista na cadeia Cliente (regra de shape de telefone reaparecendo, agora no componente em vez do DTO). Não é da cadeia Cep, é reincidência do achado do turno 4.

## Resumo

Nada na cadeia Cep propriamente dita (`CepService`/`CepResponseDto`) tem responsabilidade fora de lugar — está **sã**. O "peso" que o mapa atribuiu a ela pertence ao consumidor (`CardDadosClienteComponent`), que tem 1 duplicação real (telefone reimplementado ignorando `TelefonePipe`) e nenhuma violação grave de camada — é volume de feature, não débito de arquitetura de dado.

> [!NOTE] Fechamento da sessão

## Defeito que se repete

**Nenhum defeito aparece em 4+ cadeias.** Não há "ausência estrutural" a nomear desta vez — os problemas encontrados se concentram em no máximo 2 das 5 cadeias. Reportar isso como se fosse sistêmico seria forçar um padrão que os dados não sustentam.

### Padrão parcial (2 cadeias) — Cliente e Ofertas

**Defeito A: lógica de tradução Entity→DTO dentro do arquivo de DTO, em vez do mapper.**

- Cliente: `criarClienteAtualizacaoRequest` + `mapearTelefoneParaDto` em cliente-atualizacao-request.dto.ts
- Ofertas: `criarOfertaPredefinidaRequest` / `criarOfertaPersonalizadaRequest` em seus respectivos DTOs de request

**O que diferencia essas duas das outras três**: Contas, Dividas e Cep são cadeias **somente leitura** (GET), não têm request body para montar — logicamente não têm onde esse defeito aparecer. O defeito não é acaso de qualidade de código isolado; está correlacionado com a _forma_ do endpoint (tem POST com corpo → tem DTO de request → alguém colocou a função de montagem ali). Cliente ainda agrava com regra de negócio real embutida (decidir fixo/celular); Ofertas é só shape, sem regra.

**Defeito B: Entity com campos opcionais que o mapper sempre preenche (contrato mais fraco do que a garantia real).**

- Cliente: `nome?`, `documento?`, `tipoDocumento?`, `razaoSocial?` em `ClienteEntity`, todos preenchidos sempre por `ClienteMapper`
- Ofertas: `valorEntrada?`, `dataEntradaParcela?` em `OfertaEntity`, sempre preenchidos por `OfertasMapper`

**O que diferencia**: mesmas duas cadeias do Defeito A — o mesmo par de arquivos que teve DTO alargado também teve Entity enfraquecida. Contas e Dividas mantêm Entity com tipagem estrita e fiel ao que o mapper garante (Dividas usa `| null` corretamente para campos que o backend de fato pode omitir — não é o mesmo erro).

### Pontual (1 cadeia)

**Mapper fazendo mais que DTO↔Entity** — só Dividas: `DividasMapper` importa tipo de componente de UI (`GrupoDividasView` de `@app/shared/components/tabela-contratos`), embute regra de negócio de exibição (`ondeRenegociar`) e reconstrói entity com valores zerados a partir de view (`viewParaEntity`). É o único caso onde o mapper vaza para fora do par DTO↔Entity — proporcional ao fato de ser a maior cadeia (1160 LOC), não generalizável às outras.

### Cadeia limpa

Contas é a única das 5 sem nenhum achado — serviu de fato como referência do padrão correto (service enxuto, DTO puro, mapper só DTO↔Entity).

## Consolidação LoadingService/MessageService

Apareceu em **0 das 5 cadeias analisadas diretamente**. Verifiquei os 5 arquivos de service (`ClienteService`, `ContasService`, `DividasService`, `OfertasService`, `CepService`) — nenhum injeta `LoadingService` ou `MessageService`. A afirmação do mapa-integracoes.md de que esses artefatos acoplam "todas as cadeias" está errada por granularidade: o acoplamento real é indireto, via `HttpService` (já classificado como infra e excluído do nosso critério), que injeta os dois e chama `show()`/`hide()`/`clear()`/`addMessage()` internamente em `get()` e `post()`.

**Destino único proposto**: nenhuma mudança nas 5 cadeias de dados — elas já estão no lugar certo, sem tocar em `LoadingService`/`MessageService`. A observação vale para o próprio `HttpService`: ele já tem um interceptor dedicado a erro (http-error.interceptor.ts), mas loading/message ainda estão hardcoded dentro do service em vez de seguirem o mesmo padrão de interceptor que o projeto já usa. Não é acoplamento de domínio — é um ponto de melhoria do artefato de infraestrutura em si, fora do escopo desta análise de dataLayer.

> [!NOTE] FASE 1B — Confirmacao
> contexto das cadeias fonte

Com base nos vereditos, uma linha por cadeia sobre o que ela **produz**:

- **Cliente** → `ClienteEntity` (via `ClienteMapper.dtoParaEntity`, chamado pelo store, não pelo service); shape com `nome?`, `documento?`, `tipoDocumento?`, `razaoSocial?` marcados opcionais mesmo sendo sempre preenchidos pelo mapper.
- **Contas** → `ContaEntity` (via `ContasMapper.dtoParaEntity`, incluindo `id` sintético gerado por `GenerateSecureIdService`); shape estrito, sem opcionais indevidos — cadeia de referência.
- **Dividas** → `DividaEntity` (via `DividasMapper.dtoParaEntity`, enxuto e correto, com `| null` legítimo nos campos que o backend pode omitir); mesmo mapper também produz `DividaView`/`GrupoDividasView` (view-model de UI) e reconstrói `DividaEntity` zerada a partir da view — esse segundo produto não deveria existir aqui.
- **Ofertas** → `OfertaEntity` (via `OfertasMapper.dtoParaEntidade`); shape com `valorEntrada?` e `dataEntradaParcela?` opcionais indevidamente, já que o mapper sempre os preenche.
- **Cep** → nada de entity própria; `CepService`/`CepResponseDto` são consumidos in natura pelo componente `CardDadosClienteComponent`, que é quem produz efeitos (patch de formulário, `ClienteEntity` parcial montada ali com telefone via regex inline).

**Confirmacao** não tem veredito no arquivo — ainda não foi analisada isoladamente (mapa-integracoes.md lista que ela consome `ClienteEntity`, `ContaEntity`, `DividaEntity`, `OfertaEntity`, mas nenhuma seção do veredito cobre o que ela produz).

> [!NOTE] O agregador confirmacao

## Onde vem o volume real

`ConfirmacaoService` (17 LOC) + `ConfirmacaoRequestDto` (~210 LOC) = ~227 LOC. Longe das 973 do mapa — mesmo padrão do Cep e do Cliente: o mapa mediu peso de quem consome (renegociacao.store.ts, que chama `criarConfirmacaoRequest` na linha 474), não do artefato de dado. E aqui o problema é pior que Cliente/Ofertas: **não existe mapper nenhum** — toda a tradução Entity→DTO, incluindo regra de negócio, mora dentro do arquivo de DTO e é chamada direto pelo store.

## Bloco por bloco

**Bloco**: `interface ConfirmacaoRequestDto` (linhas ~11–63)

- **Classificação**: fica.
- **Categoria**: (c) declaração de shape.
- **Por quê**: é o único bloco do arquivo que só descreve o formato do request. Sem lógica, sem fetch, sem conhecimento de outro domínio.

---

**Bloco**: `interface MetodoFormaPagamentoSelecionado` (linhas ~65–69)

- **Classificação**: muda de camada.
- **Por que está errado**: não é shape de request/response — é um tipo de composição interna (`ContaEntity` + dois enums de seleção do usuário) que só existe para servir de parâmetro da função de montagem. Não pertence a um arquivo de DTO.
- **Onde deveria estar**: junto da função que o consome, no destino de `criarConfirmacaoRequest` abaixo — feature service ou `ConfirmacaoMapper`.
- **Trade-off**: nenhum custo real, migra junto com a função.

---

**Bloco**: `interface CriarConfirmacaoRequestParametros` (linhas ~71–77)

- **Classificação**: muda de camada.
- **Por que está errado**: é a assinatura de uma função de orquestração multi-domínio (agrega `ClienteEntity` + `ContaEntity` + `DividaEntity[]` + `OfertaEntity` + seleção de pagamento) — exatamente o tipo de artefato que "conhece N domínios" e devia estar isolado num único ponto, não solto num arquivo de DTO.
- **Onde deveria estar**: feature service de confirmação (ex. `ConfirmacaoFeatureService`), que hoje não existe.
- **Trade-off**: nenhum, migra com a função.

---

**Bloco**: `criarConfirmacaoRequest()` (linhas ~79–131)

- **Classificação**: sai — mas é misto, precisa ser dividido em duas categorias antes de mover:
  - **(a) montagem de payload** (legítima, shape errado de lugar): `proposta.valorAcordo`, `proposta.juros`, `cliente.idEndereco`, `divida.empresa`, `divida.contratos.map(...)`, `autorizacoes.map(...)` — puro reshape de campo→campo, sem decisão. Isso é trabalho de mapper: `ConfirmacaoMapper.entidadesParaRequest(...)`.
  - **(b) regra de negócio embutida** (não é reshape, é decisão):
    - `codigoOperacao = tipoPrazo === A_VISTA ? ACORDO_A_VISTA : ACORDO_A_PRAZO` — decide o código de operação a partir do tipo de oferta;
    - `contratoPrincipal = contratosSelecionados.at(0)` — decide que "o primeiro contrato selecionado" é o principal (fonte de `numeroAcordo`, `carteira`, `empresa`) — isso é regra de negócio de qual contrato lidera o acordo, não tradução de shape;
    - `grupoContratos: String(ofertaSelecionada?.grupoContratos ?? 0)` — fallback que decide semântica de "sem grupo = 0", não é conversão neutra.
- **Por que está errado**: DTO virou orquestrador — mistura reshape com decisão de negócio, e ainda agrega 4 entidades de domínios diferentes num único arquivo de contrato.
- **Onde deveria estar**: a parte (a) vai para `ConfirmacaoMapper`; a parte (b) vai para o **feature service** que hoje não existe — ele decide "qual é o contrato principal" e "qual código de operação", e então chama o mapper só com os dados já resolvidos.
- **Trade-off**: separar (a)/(b) custa dois artefatos novos (mapper + feature service) em vez de um arquivo só; o ganho é que mudança de regra de negócio (ex. outro critério de "contrato principal") não obriga mexer no arquivo de contrato de request, e teste de regra fica isolado de teste de shape.

---

**Bloco**: `obterValorAcordoPorFormaPagamento()` (linhas ~133–157)

- **Classificação**: sai (e é código morto — zero chamadores no repo, nem `criarConfirmacaoRequest` nem `montarPagamentoConfirmacao` a invocam).
- **Categoria**: (b) regra de negócio (o valor do acordo muda conforme a forma de pagamento: à vista/entrada usam `valorAcordo`, parcelado usa `total`).
- **Por que está errado**: além de fora de camada, é uma regra de negócio duplicada e nunca executada — risco de decisão divergente se um dia for religada por engano.
- **Onde deveria estar**: se a regra ainda for necessária, pertence ao feature service (mesma decisão de "qual forma de pagamento está ativa" do bloco abaixo); senão, remover.
- **Trade-off**: remover é diff zero-risco (nada depende dela hoje); manter "por segurança" só acumula débito.

---

**Bloco**: `montarPagamentoConfirmacao()` (linhas ~159–210)

- **Classificação**: sai — também misto:
  - **(a) montagem de payload**: montar os objetos `aVista`/`entrada`/`parcela` com os campos já resolvidos, `metodoPagamento?.toLocaleUpperCase()`, formatação de data `.replace(/\//g, '.')` — reshape e formatação de contrato de saída, trabalho de mapper.
  - **(b) regra de negócio**: o `reduce` que decide **qual forma de pagamento está ativa** (`formasPagamento[tipo] = item`) e portanto qual bloco (`aVista`/`entrada`/`parcela`) vai `null` — essa decisão de "o que o usuário escolheu" é lógica de orquestração da confirmação, não tradução de shape.
- **Por que está errado**: mesma mistura do bloco anterior, mais uma linha de código morto comentada (`// valor: String(parcelasOferta?.valor || 0),`) que deveria ser deletada independente de camada.
- **Onde deveria estar**: (a) para o mapper; (b) para o feature service, que passa ao mapper já sabendo qual forma está ativa.
- **Trade-off**: mesmo custo/benefício do bloco anterior — dois artefatos em vez de um, mas regra de "forma de pagamento ativa" testável isoladamente da formatação de payload.

## O que falta hoje e deveria existir

A cadeia Confirmacao é a única das 6 sem **nenhum mapper** — e é justo a que mais precisava, por agregar 4 domínios. Faltam dois artefatos:

1. **`ConfirmacaoMapper`** — só (a): recebe dados já resolvidos (contrato principal, código de operação, forma de pagamento ativa) e produce o `ConfirmacaoRequestDto`. Shape puro, testável sem mockar 4 entidades inteiras.
2. **Feature service de confirmação** — só (b): decide contrato principal, código de operação e forma de pagamento ativa a partir do estado (hoje isso está no store via `criarConfirmacaoRequest`, repetindo o padrão da cadeia Cliente — orquestração vazando para dentro do arquivo de DTO em vez de um service de feature). View e facade não voltam; é este service novo que assume o papel que a regra de negócio de composição exige, chamado pelo store no lugar da função solta hoje importada de dentro do DTO.

> O buraco de contrato

## O que o consumidor faz hoje com o retorno

renegociacao.store.ts (linha ~479) chama `service.confirmarRenegociacao(...)` e usa `tapResponse`:

```ts
next: () => {
  patchState(store, { renegociacaoConfirmada: true, ... });
},
```

O parâmetro do `next` nem é declarado — o corpo da resposta é **descartado por completo**. `renegociacaoConfirmada: true` é disparado só pelo HTTP 2xx chegar, não por nenhum campo do payload. Nenhum consumidor (store, `ConfirmacaoComponent`, tela de conclusão) lê `dados`, `sucesso` ou `mensagem` da resposta de `/efetivar`.

E a tela que segue (`/conclusao`) mostra `numeroAcordo` vindo de `store.ofertaSelecionada()?.numeroAcordo` — dado que **já existia no cliente antes da chamada** (da etapa de simulação), não algo devolvido pelo backend como confirmação daquele acordo específico. `ConclusaoService` é órfão vazio: não há nenhum artefato que busque ou exiba um protocolo/id emitido pelo backend na efetivação.

## Risco de não haver contrato no ponto de maior consequência

**O quê**: `ApiResponseDto<unknown>` em `ConfirmacaoService.confirmarRenegociacao`.

- **Por que está errado**: o envelope `ApiResponseDto<T>` já carrega `sucesso: boolean` e `mensagem: string` nas outras 5 cadeias — isso significa que o backend pode responder HTTP 200 com `sucesso: false` (falha de negócio dentro de um envelope tecnicamente "ok"). Como o `dados` é `unknown` e ninguém lê nenhum campo do envelope tampouco, **o app não tem como distinguir "renegociação efetivada" de "backend recusou a efetivação mas devolveu 200"**. `tapResponse.next` dispara `renegociacaoConfirmada: true` para os dois casos. É o pior lugar possível para esse gap existir: é a chamada que compromete financeiramente o cliente.
- **Onde deveria estar**: `ConfirmacaoResponseDto` tipado (mesmo que hoje `dados` seja de fato pouco usado pelo backend, o envelope `sucesso`/`mensagem` já dá o suficiente para o service ou o feature service decidirem sucesso real vs. aparente). O ponto de decisão — "isso foi de fato confirmado?" — pertence ao feature service que vai orquestrar essa cadeia (o mesmo que falta hoje para `criarConfirmacaoRequest`), não ao store consumir cegamente.
- **Trade-off**: tipar o contrato não resolve sozinho — exige também que alguém *leia* `sucesso`/`mensagem` no `tapResponse` (mudança de poucas linhas, mas muda o comportamento observável: hoje um `sucesso: false` do backend navega o cliente para a tela de conclusão como se tivesse dado certo). Alternativa mínima sem mexer no fluxo: mesmo mantendo `unknown`, ao menos checar `response.sucesso` no `next` — mas isso é o remendo, não a correção; sem tipo, qualquer checagem futura é feita via cast/`any`, sem segurança de compilação.

**Segundo achado, dependente do primeiro**: se o backend algum dia passar a devolver um protocolo/id de confirmação em `dados`, hoje não há nenhum artefato pronto para capturá-lo — `numeroAcordo` exibido na conclusão é 100% pré-existente no cliente, nunca confrontado com o que o backend efetivamente registrou. Isso é auditoria/rastreabilidade ausente no ponto de maior consequência: se o usuário contestar "eu confirmei mas não foi processado" (ou o contrário), não há campo no app que amarre a tela de conclusão a uma resposta do backend daquela chamada específica.

**Fechamento**: o "sem contrato" aqui não é só um `unknown` incômodo de tipagem — é a ausência de um ponto de verificação de sucesso de negócio (`sucesso`/`mensagem` do envelope) na única chamada que muda estado real no backend. As outras 5 cadeias são leitura ou atualização reversível; esta é irreversível, e é exatamente a que trata "HTTP 200 = sucesso" sem checar o próprio envelope que o backend já fornece para dizer o contrário.

> [!NOTE] FASE 2 — Lateral e fronteira
> GenerateSecureIdService

## Decisão: (a) infraestrutura — mas já corretamente posicionada; o erro é conceitual, não de pasta

**Teste pela razão de mudança**: pra que `GenerateSecureIdService` mudasse, o motivo seria "a estratégia de geração de número único colide/precisa trocar de algoritmo" (ex.: trocar `crypto.getRandomValues` por UUID). Esse motivo é **inteiramente alheio** a Contas, Dividas ou Ofertas — nenhuma regra de negócio dessas três cadeias jamais forçaria uma mudança nesse serviço, e nenhuma mudança de regra de Contas/Dividas/Ofertas jamais forçaria mudança nele. Isso já descarta (b): não é regra de domínio genuína, porque as três cadeias não têm nada em comum em termos de *significado* de identidade — é a mesma ferramenta técnica emprestada, não um conceito de negócio compartilhado.

**Evidência que descarta (c) coincidência isolada — mas revela um uso indevido paralelo**: se fosse coincidência (três problemas diferentes resolvidos pela mesma ferramenta por acaso), eu esperaria usos com propósitos distintos. E de fato existe um quarto uso, em card-oferta.component.ts (`id = 'card-oferta-${generateSecureId()}'`), que é **DOM id de template**, não identidade de entidade — prova que o serviço é genérico o bastante para ser reaproveitado para algo sem nenhuma relação com Contas/Dividas/Ofertas. Isso reforça (a): é utilitário técnico neutro, não amarrado a domínio nenhum.

**O que de fato une as 3 cadeias (Contas/Dividas/Ofertas) não é regra de negócio, é uma característica estrutural do contrato**: as três recebem **arrays de itens sem chave estável usável no cliente**:
- `ContaDto` — nenhum campo de id.
- `OfertaItemDto` — nenhum campo de id (só `tipoPrazo`, que se repete).
- `ListagemDividasResponseDto.contratos[]` — tem `codigo`/`numeroControleContrato`, uma chave natural real, mas o mapper ignora e gera sintético mesmo assim.

O `id` gerado nunca viaja de volta ao backend nem participa de regra alguma: em `criarConfirmacaoRequest`, os contratos selecionados são serializados por `contrato.codigo` (`numero: Number(contrato?.codigo)`), não por `contrato.id`. Ou seja, o id sintético serve só para identidade local (seleção em lista, `trackBy` de Angular) — nunca para lógica de negócio. Isso é a assinatura de infraestrutura, não de domínio.

## Por que Cliente, Confirmação e Cep não precisam dele

- **Cliente**: resposta é **um objeto único**, não uma lista — não existe "item dentro de array" para precisar de chave sintética de renderização. A identidade que existe (`endereco.id`) já vem do backend como dado real, não como placeholder de UI.
- **Confirmação**: não produz entidade alguma — resposta é `unknown` e descartada (achado do turno anterior). Sem entidade, não há "item de lista" para dar id.
- **Cep**: também não produz entidade persistente — o DTO é consumido direto pelo componente para popular formulário, não é renderizado em lista com seleção.

O denominador comum das 3 que usam o serviço não é "são o mesmo domínio", é "são as únicas 3 cadeias cujo contrato de resposta é um array de itens sem chave utilizável para estado de lista no cliente" — uma característica de shape do contrato, não uma regra de negócio.

## Veredito e ponto de atenção

`GenerateSecureIdService` **fica onde está** (`core/services/utils`) — já é infra corretamente posicionada, sem mover nada. O achado real não é de camada, é de **uso desnecessário em Dividas**: existe chave natural (`codigo`) e o mapper gera sintético mesmo assim, quando Contas e Ofertas genuinamente não têm alternativa. Vale registrar como oportunidade (não urgência): `DividasMapper` poderia usar `contrato.codigo` como `id` e dispensar a dependência do gerador — reduz uma dependência sem necessidade, mas não é bug hoje porque o id nunca vaza para payload de negócio.

> Fronteira MFE ↔ BFF

**Não há nenhum caso disso nesta camada.**

Verificado:
- **package.json**: nenhuma dependência aponta para um pacote de tipos/contratos compartilhado com o BFF (nem interno via workspace, nem npm). Só libs de terceiros de UI/infra (`@angular/*`, `rxjs`, `moment`, `ngx-mask` etc.) e nada como `@empresa/api-contracts`, `@empresa/bff-types` ou similar.
- **Scripts**: não existe nenhum script de geração (`openapi-generator`, `swagger-codegen`, `graphql-codegen` ou equivalente) no package.json.
- **Todos os 10 arquivos em dto**: cada `import` resolve para caminhos internos (`@app/...`, `@models/...`, `@core/...`) ou enums locais em `shared/enum`. Nenhum importa de um pacote npm/workspace externo.
- **Nenhum arquivo tem marcação de geração automática** (`@generated`, `do not edit`, cabeçalho de codegen) — todos são interfaces TypeScript escritas à mão.

**Conclusão**: os DTOs são 100% de autoria manual, desacoplados de qualquer pacote/spec compartilhado com o backend. Não há ponto único de falha entre MFE e BFF por essa via — deploy independente não está travado por essa causa.

**Ressalva à parte (não é o que foi perguntado, mas é o inverso do risco)**: por não haver *nenhum* contrato compartilhado nem geração a partir de spec, também não há verificação automática de que o shape do DTO ainda bate com o contrato real do BFF — divergência de contrato só é pega em runtime ou revisão manual. Isso já foi registrado como achado pendente na cadeia Cliente ("sem o contrato do BFF em mãos não dá pra afirmar divergência"), mas é um risco de tipo oposto ao que a pergunta cobre.

> [!TIP] FASE 3 — Fora de cadeia

## Classificação — Seção 3 (Órfãos)

### conclusao.service.ts — **MORTO** (mas cuidado: são dois arquivos com o mesmo nome, o mapa aponta para um só)

Existem **dois** `ConclusaoService` no repo:

- **O`core/services/api/conclusao.service.ts`**` (o que o mapa lista como órfão): classe vazia — só `constructor() {}`. `usages` mostra **apenas** o próprio spec (`conclusao.service.spec.ts` — 3 refs, todas internas ao teste). Nenhum componente, store ou outro service importa esse artefato pelo caminho `core/services/api`.
- **`features/conclusao/conclusao.service.ts`**: tem estado real (`isExibirModalPropostaEnviada`) e é usado por `conclusao.component.ts` (injeção real, linha 42) — este está vivo, mas é da camada **feature**, fora do escopo desta análise de dataLayer.

**O quê**: conclusao.service.ts.
**Por que está errado**: zero consumidores fora do próprio spec. É exatamente o "buraco de contrato" já identificado no vereditos-datalayer.md — a resposta de `/efetivar` é descartada e nunca existiu um artefato real para capturar retorno de confirmação; esse arquivo parece ter sido criado como placeholder para isso e nunca ligado a nada.
**Onde deveria estar**: nenhum lugar — deletar arquivo + spec.
**Trade-off**: nenhum custo real (nenhum import quebra). Se a intenção for reativar a evidência de confirmação (achado da Fase 1B), o service certo não é este casco vazio — é o `ConfirmacaoMapper`/feature service ainda a criar, com um método que de fato leia `sucesso`/`dados` do envelope.

Confirmado: **deletar** `core/services/api/conclusao.service.ts` e seu spec. Não mexer no de `features/conclusao` (é UI, vivo).

---

### date-utils.service.ts — **UI** (fora do escopo)

Usado por `card-leitura-dados-de-pagamento.component.ts` e `ofertas.component.ts` (injeção real, não só teste). Fora do escopo desta análise.

### enum-utils.service.ts — **RESÍDUO suspeito, mas não confirmável como morto sem checar chamador em runtime**

`usages` mostra só o próprio spec chamando o método estático `EnumUtilsService.obterTipoPrazoPorValor(...)`. Nenhum componente, mapper ou service de produção importa essa classe.

**O quê**: `EnumUtilsService.obterTipoPrazoPorValor`.
**Por que está errado**: método estático sem nenhum chamador fora do teste — típico de utilitário escrito para um caso de uso (provavelmente ligado a mapear string→`TipoOferta` vindo do BFF) que nunca foi plugado em nenhum mapper real (`OfertasMapper` faz esse mapeamento inline, sem usar este helper).
**Onde deveria estar**: se a necessidade é real, o lugar certo seria dentro de `OfertasMapper` (é conversão DTO→domínio de uma cadeia específica, não utilitário genérico de todas). Hoje está em `core/services/utils` como se fosse transversal, mas só serve a uma cadeia.
**Trade-off**: **MORTO por evidência de uso** (nenhum chamador de produção) — recomendo deletar arquivo + spec. Não é 100% "resíduo de view/facade" (não achei rastro de ter sido usado por eles), é mais provável **código nunca integrado** (a lógica real de `TipoOferta` foi resolvida de outra forma, e este ficou órfão desde a origem). Se quiser manter por precaução, converse antes — não há uso ativo hoje.

### monitoramento-dynatrace.service.ts — **UI/infra ativa, NÃO é órfão**

Usado por `global-error-handler.service.ts` e `http-error.interceptor.ts` (injeção real em produção, não só spec). O mapa está **errado** ao listar este arquivo em Seção 3 — está plugado no pipeline global de erro HTTP. Fora do escopo (telemetria/infra), mas definitivamente não é morto.

### monitoramento-gtm.service.ts — **UI ativa, NÃO é órfão**

90 usages, com injeções reais em `dividas.component.ts`, `confirmacao.component.ts`, `ofertas.component.ts`, `conclusao.component.ts`, `card-dados-cliente.component.ts`, etc. Amplamente consumido por componentes de feature. Fora do escopo (é telemetria de UI), mas o mapa errou ao classificá-lo como órfão.

---

### `cliente.mapper.ts` — veredito da Fase 1 mantido

Não é órfão — usado por `renegociacao.store.ts` (`ClienteMapper.dtoParaEntity`, 2 chamadas). O mapa precisa ser corrigido nesse ponto (já registrado no vereditos-datalayer.md).

---

### negociacao.entity.ts — **RESÍDUO/FUTURO não confirmado — recomendo MORTO**

`usages` retorna **só a própria definição**, nenhuma referência externa (nem em `renegociacao.store.ts`, nem em nenhum mapper/component). A interface importa `DividaEntity` e `OfertaEntity`, sugerindo que seria um agregado de negociação — mas nada no código monta ou consome esse shape.

**O quê**: `NegociacaoEntity` (`contratos?: DividaEntity[]`, `oferta?: OfertaEntity`).
**Por que está errado**: zero cadeia o alcança. Não é "domínio modelado e não integrado" com evidência de plano futuro (não há comentário, não há service esboçado, não há uso em nenhum teste) — é o padrão puro de resíduo: alguém modelou a entidade agregada antes de perceber que a composição já é feita ad-hoc dentro de `criarConfirmacaoRequest` (achado da Fase 1B, "DTO virou orquestrador").
**Onde deveria estar**: se a composição multi-domínio for formalizada (que é exatamente a lacuna apontada no veredito de Confirmação — falta o feature service), esse *seria* o tipo de retorno natural de um `ConfirmacaoFeatureService`. Mas como FUTURO exige evidência, e não há nenhuma (nenhum TODO, nenhum uso parcial), classifico como **RESÍDUO → deletar**, não FUTURO.
**Trade-off**: deletar é diff zero-risco hoje. Se decidirem criar o feature service de Confirmação depois, é mais barato recriar o tipo desenhado para a assinatura real da função do que manter um tipo desalinhado e sem uso agora.

### historico.entity.ts — **RESÍDUO estrutural, interface vazia mas referenciada — não é morto**

`usages` mostra uso real: `renegociacao.store.ts` linha 55, `historico: HistoricoEntity[]` — está no state do store.

**O quê**: `export interface HistoricoEntity {}` — corpo **vazio**.
**Por que está errado**: é referenciado (não é órfão de uso), mas é um contrato vazio — não modela nenhum campo. É pior que resíduo: é dívida ativa, porque o state do store declara um array tipado para nada (`any` disfarçado de tipo).
**Onde deveria estar**: fica em `models/entities`, mas precisa ganhar shape real. Hoje não há nenhum service/DTO de "histórico" na Seção 1 do mapa — ou seja, o dado que preenche `store.historico` nunca é populado por nenhuma cadeia mapeada (busca por origem: nenhum service em Seção 1 produz isso).
**Trade-off**: não é para deletar (quebraria o `store`), mas é **FUTURO sem evidência de integração real** — o campo existe na store esperando um dado que nenhuma cadeia hoje entrega. Vale reportar como o gap real: não é a entity que está errada, é a ausência de uma cadeia `HistoricoService`/`HistoricoResponseDto` que a alimente.

### historico.view.model.ts — **UI, não é resíduo — está ativo**

Usado por `historico.component.ts` (`@Input() listaHistorico?: HistoricoView[]`) com spec cobrindo múltiplos cenários. É view-model de apresentação genuíno e consumido — fora do escopo desta análise (view viva, não resíduo da camada removida).

### timeline.stepper.view.model.ts — **UI, não é resíduo — está ativo**

Usado por `bsc-timeline-stepper.component.ts` (`@Input({required:true}) timelineData?: TimelineStepperView[]`) e pela constante `TIMELINE_STEPPER_JND_RENEG` exportada do próprio arquivo. Fora do escopo (view viva).

---

### Enums em `shared/enum` — confirmados como **UI**, nenhum é órfão

Todos com uso real em componentes de feature (não só specs):

- `StatusHistorico` → `historico.component.ts` (switch/case real, linhas 85-89)
- `TipoDocumento` → `dividas.component.ts` (linha 49)
- `TipoLabelMetodoPagamento` → `card-leitura-dados-de-pagamento.component.ts` e `card-pagamentos.component.ts`
- `TipoIndexTimelineStepperReneg` → `confirmacao/ofertas/conclusao/pagamentos.component.ts` (todos os 4 steps do wizard)
- `TipoStepSimulacao` → `ofertas.component.ts` e `ofertas-personalizadas.component.ts` (uso extenso, 40 refs)
- tipo-tab-oferta.ts / tipo-timeline-stepper-state.ts → resultados grandes de `usages` confirmam múltiplos consumidores de produção (não só specs).

Nenhum enum de Seção 3 é órfão — todos consumidos por componentes. O mapa errou ao listá-los como órfãos; provavelmente por serem lidos só via caminho `shared/enum` sem cruzar com features.

---

## Resumo de ação

| Arquivo | Veredito | Ação |
|---|---|---|
| `core/services/api/conclusao.service.ts` | MORTO | deletar (+ spec) |
| `core/services/utils/enum-utils.service.ts` | MORTO (sem chamador de produção) | deletar (+ spec) — **confirmar com você antes**, já que não é 100% óbvio se substitui lógica ativa em `OfertasMapper` |
| `models/entities/negociacao.entity.ts` | RESÍDUO | deletar |
| `models/entities/historico.entity.ts` | vivo, mas contrato vazio — gap real | não deletar; sinalizar cadeia ausente |
| historico.view.model.ts, timeline.stepper.view.model.ts | UI ativa | fora de escopo |
| date-utils.service.ts | UI ativa | fora de escopo |
| monitoramento-dynatrace.service.ts, monitoramento-gtm.service.ts | infra/UI ativa — mapa errado ao listar como órfão | corrigir mapa |
| `cliente.mapper.ts` | vivo (Fase 1) | corrigir mapa |
| todos os 7 enums | UI ativa | corrigir mapa, fora de escopo |

**O que a camada não tem hoje e deveria ter**: uma cadeia real de "Histórico" (service + DTO + mapper) que alimente `HistoricoEntity`/`store.historico` — hoje esse campo do store existe e é tipado, mas nenhuma cadeia da Seção 1 o popula, e a entity está vazia. É a mesma lacuna já registrada para Confirmação (feature service ausente), só que aqui nem o mapper existe.
