# Separar apresentação do mapper de dados de Dividas

## Intenção

`DividasMapper`, artefato da camada de dados, importa tipo declarado dentro de um componente
de UI (`GrupoDividasView`, em `tabela-contratos.component.ts`) e concentra tanto a tradução do
contrato do BFF (`DTO -> Entity`) quanto a produção de view-model da apresentação
(`Entity -> View`). A dependência está invertida: mudança no componente da tabela obriga a mexer
no mapper que traduz o contrato do BFF, e vice-versa. Esta mudança separa o mapper em dois — o
de dados, que permanece em `mappers/`, e o de apresentação, que passa a viver na feature de
dívidas.

Refactor puro de organização: nenhum comportamento observável muda, portanto esta mudança não
tem `deltas.md`.

## Escopo

### Dentro do escopo

- Criação de um mapper de apresentação na feature de dívidas, com as funções
  `entityParaGrupoView`, `entityParaView` e `viewParaEntity` movidas com corpo inalterado.
- Extração da expressão inline de `ondeRenegociar` como método privado do novo mapper, sem
  alterar a lógica.
- Remoção dessas três funções e dos imports de `DividaView` e `GrupoDividasView` do mapper de
  dados, que fica só com `dtoParaEntity`.
- Atualização de todos os chamadores das funções movidas: serviço de dívidas, componente de
  dívidas e a store de renegociação.
- Migração dos casos de teste de view para o spec do novo mapper e atualização dos specs que
  espionam as funções movidas: dívidas (serviço e componente), store de renegociação, conclusão
  e garantias.
- Gravação de uma linha de base de caracterização, contra o código atual, antes do primeiro
  commit de movimentação.

### Fora do escopo

- Corrigir a formatação de `periodicidade` por regex, que migra inline dentro de
  `entityParaView` e continua lá.
- Corrigir a fabricação de valores zerados em `viewParaEntity` (reconstrução com perda de dado).
- Alterar a tradução `DTO -> Entity`, o DTO de listagem de dívidas ou o contrato do BFF.
- Interceptor de loading/message: `LoadingService` e `MessageService` hardcoded nos seis
  serviços de dados.
- Entities com opcionais mais fracos que a garantia do mapper (`ClienteEntity`, `OfertaEntity`).
- Cadeia "Histórico" (`HistoricoEntity`) vazia, referenciada em `store.historico`.
- Exclusão dos arquivos mortos `core/services/api/conclusao.service.ts`,
  `core-utils.service.ts` e `negociacao.entity.ts` — permitida pelo briefing em qualquer PR,
  mas mantida fora desta diff.
- Passos 1 a 4 da refatoração da camada de dados.

## Restrições

- "Muda comportamento? Nenhuma. Refactor puro da organização — as funções movem de arquivo com
  corpo inalterado."
- "Este passo não altera a tradução DTO-Entity; o contrato serve de baliza para garantir que
  nada dela foi movido por engano."
- "Critério de corte, em uma frase: se a função importa `DividaView` ou `GrupoDividasView`, ela
  sai; se não importa, fica. Aplique o teste função a função, não por intuição."
- "`ondeRenegociar` está inline dentro de `entityParaView`, não é chamada externa. Move junto,
  extraída como método privado do adapter."
- "Dois achados que movem sem correção — registrados, não consertados agora: a formatação de
  `periodicidade` por regex (candidata a pipe/util, mas o passo pode mover a função inteira) e
  `viewParaEntity` fabricando zeros (reconstrução com perda de dado). Corpos inalterados.
  Corrigi-los é trabalho à parte; não amplie o escopo aqui."
- "Os testes seguem o código. Os casos de `entityParaView`/`viewParaEntity` caem do
  `dividas.mapper.spec.ts` e vão para o spec novo do adapter. O spec do `DividasMapper` fica só
  com `dtoParaEntity`."
- "A ordem é a que o compilador aceita, não a ordem lógica. Cada linha pode ser aplicada
  isoladamente sem quebrar o build. Regra que gerou a ordem: criar/adicionar método -> trocar
  quem chama -> só então apagar a origem."
- "Mapper de dados (origem) não deve conhecer regra de negócio, importar tipo de UI."
- "O novo mapper não é `shared` porque precisa conhecer `DividaEntity` (tipo de domínio) — se
  fosse para shared, inverteria a dependência de novo."
- "As camadas de view e facade foram removidas e não voltam."
- "Não amplie o PR com estes itens", referente à seção 8 do briefing.

## Critérios de aceite

Esta é uma mudança estrutural sem efeito visível para o usuário; por isso os critérios abaixo
citam artefatos deliberadamente — o objeto da mudança é a organização do código.

1.  O mapper de dados de dívidas MUST expor apenas a tradução do contrato do BFF para o domínio.
    - Dado o arquivo `src/app/mappers/dividas.mapper.ts` após a mudança, quando ele é inspecionado,
      então o único membro público é `dtoParaEntity`.
    - Dado o mesmo arquivo, quando seus imports são inspecionados, então não há import de
      `DividaView` nem de `GrupoDividasView`.
    - Dado o mesmo arquivo, quando `dtoParaEntity` é comparada com a versão anterior, então o
      corpo é idêntico.

2.  O mapper de apresentação de dívidas MUST traduzir entre domínio e view-model sem conhecer o
    contrato do BFF.
    - Dado o arquivo `src/app/features/dividas/dividas-apresentacao.mapper.ts`, quando ele é
      inspecionado, então expõe `entityParaGrupoView`, `entityParaView` e `viewParaEntity` como
      membros públicos e `ondeRenegociar` como membro privado.
    - Dado o mesmo arquivo, quando seus imports são inspecionados, então não há import de
      `ListagemDividasResponseDto` nem de `GenerateSecureIdService`.
    - Dado um `DividaEntity` com `restricoes` vindo da primeira, quando `entityParaView` é
      chamada, então o resultado é igual ao produzido pelo mapper de dados antes da mudança,
      incluindo `ondeRenegociar` e a `periodicidade` formatada.

3.  Todo consumidor das funções movidas MUST passar a chamá-las no mapper de apresentação.
    - Dado o projeto após a mudança, quando se busca por `DividasMapper.entityParaGrupoView`,
      `DividasMapper.entityParaView` ou `DividasMapper.viewParaEntity`, então não há nenhuma
      ocorrência, em código de produção ou de teste.
    - Dado o serviço de dívidas, quando `obterListagemDividasBanco` ou
      `obterListagemDividasCartao` é chamada com a mesma entrada de antes da mudança, então o
      grupo de view retornado é idêntico, incluindo os campos `bloqueado` e `selecionado`.
    - Dado a store de renegociação com contratos selecionados, quando `obterGrupoContratos` é
      lido, então o grupo retornado é idêntico ao de antes da mudança.

4.  A suíte de testes MUST cobrir cada função no arquivo onde ela passou a morar.
    - Dado `src/app/mappers/dividas.mapper.spec.ts` após a mudança, quando ele é executado, então
      apenas os casos de `dtoParaEntity` rodam e passam.
    - Dado `src/app/features/dividas/dividas-apresentacao.mapper.spec.ts`, quando ele é
      executado, então os casos de `entityParaGrupoView`, `entityParaView` e `viewParaEntity`
      migrados da spec original passam sem alteração de asserção.
    - Dada a suíte completa, quando ela é executada, então nenhum teste falha e nenhum caso de
      teste existente foi removido sem ter sido migrado.

5.  A apresentação de dívidas MUST permanecer idêntica à gravada na linha de base.
    - Dado o snapshot de agrupamento por agência, valores e texto de "onde renegociar",
      gravado contra o código atual e commitado antes do primeiro commit desta mudança, quando
      a suíte de caracterização é executada após a mudança, então ela passa sem nenhuma linha
      de snapshot atualizada.
    - Dado um contrato selecionado na tabela, quando a seleção é propagada para a
      renegociação, então o conjunto registrado é idêntico ao gravado na linha de base.

6.  Cada passo da ordem de execução MUST deixar o projeto compilável isoladamente.
    - Dado o repositório em qualquer um dos commits desta mudança, quando a checagem de tipos é
      executada, então ela termina sem erro.

## Divergências

- O briefing lista como chamadores das funções movidas apenas `dividas.service.ts`,
  `dividas.component.ts`, `dividas.mapper.spec.ts` e `dividas.service.spec.ts`. A leitura do
  código encontrou outros quatro que também quebram sem atualização:
  `store/renegociacao.store.ts` (usa `entityParaView` em `obterGrupoContratos`),
  `store/renegociacao.store.spec.ts`, `features/dividas/dividas.component.spec.ts` e os specs
  de conclusão e garantias, que espionam `entityParaView`. Todos entram no escopo desta
  mudança, sob a restrição de que a atualização é troca de referência, sem alteração de lógica
  nem de asserção.
- O molde de critérios de aceite proíbe citar nome de arquivo, classe ou função. Refactor puro
  não tem comportamento observável novo a descrever, então critério estrutural é o único que
  existe; os critérios 1, 2, 3, 4 e 6 citam artefato por necessidade, conforme exceção
  registrada em `moldes-artefatos.md`.
