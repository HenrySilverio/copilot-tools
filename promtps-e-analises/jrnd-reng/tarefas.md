# Tarefas

## 1. Gravar a linha de base

- [ ] 1.1 Antes de qualquer movimentação de código, criar fixture explícita de linha de
  base: builders pequenos de entrada para `entityParaGrupoView`, `entityParaView` e para a
  propagação de seleção de contrato à renegociação, com o objeto de saída esperado escrito
  à mão (agrupamento por agência, valores, texto de "onde renegociar") e comparado via
  `toEqual`. Não usar `toMatchSnapshot` — proibido pelas instructions de teste do projeto
  como única verificação de lógica. Commitar este teste isoladamente, antes do primeiro
  commit de movimentação de código. Conclusão: a fixture passa contra o código atual e
  está commitada em commit próprio. (Critério 5)

## 2. Criar o mapper de apresentação

- [ ] 2.1 Criar `src/app/features/dividas/dividas-apresentacao.mapper.ts` com a classe
  `DividasApresentacaoMapper` contendo `entityParaGrupoView`, `entityParaView` e
  `viewParaEntity` copiadas de `DividasMapper` com corpo inalterado, importando apenas
  `DividaEntity`, `DividaView` e `GrupoDividasView`. Conclusão: o arquivo compila e não
  importa `ListagemDividasResponseDto` nem `GenerateSecureIdService`. (Critério 2)
- [ ] 2.2 Extrair a expressão inline de `ondeRenegociar` de `entityParaView` para
  `private static ondeRenegociar(restricoes: DividaEntity['restricoes']): string` no novo
  arquivo, mantendo a mesma condição e os mesmos textos de retorno, e manter a regex de
  `periodicidade` inline em `entityParaView`. Conclusão: `entityParaView` chama o método
  privado e produz o mesmo objeto de antes. (Critérios 2, 5)
- [ ] 2.3 Criar `src/app/features/dividas/dividas-apresentacao.mapper.spec.ts` com os blocos
  `describe` de `entityParaGrupoView`, `entityParaView` e `viewParaEntity` recortados de
  `src/app/mappers/dividas.mapper.spec.ts`, alterando somente import e nome da classe sob
  teste. Conclusão: o spec novo passa com as asserções originais. (Critério 4)

## 3. Trocar os chamadores

- [ ] 3.1 Em `src/app/features/dividas/dividas.service.ts`, apontar as três chamadas de
  `obterListagemDividas` (`entityParaGrupoView` e as duas `entityParaView`) para
  `DividasApresentacaoMapper`. Conclusão: o arquivo não importa mais `DividasMapper` e o
  spec do serviço continua verde. (Critérios 3, 5)
- [ ] 3.2 Em `src/app/features/dividas/dividas.component.ts`, apontar `selectedContratos` para
  `DividasApresentacaoMapper.viewParaEntity`. Conclusão: o arquivo não importa mais
  `DividasMapper`. (Critérios 3, 5)
- [ ] 3.3 Em `src/app/store/renegociacao.store.ts`, apontar o computed `obterGrupoContratos`
  para `DividasApresentacaoMapper.entityParaView`, mantendo `DividasMapper` apenas para
  `dtoParaEntity`. Conclusão: a store compila com os dois imports e o computed retorna o
  mesmo grupo. (Critérios 3, 5)
- [ ] 3.4 Atualizar os `jest.spyOn` de funções movidas em `dividas.service.spec.ts`,
  `dividas.component.spec.ts`, `renegociacao.store.spec.ts`,
  `conclusao.component.spec.ts` e `garantias.component.spec.ts` para
  `DividasApresentacaoMapper`, sem alterar valores mockados nem asserções. Conclusão: os
  cinco specs passam. (Critérios 3, 4)

## 4. Esvaziar a origem

- [ ] 4.1 Remover `entityParaGrupoView`, `entityParaView` e `viewParaEntity` de
  `src/app/mappers/dividas.mapper.ts`, junto com os imports de `DividaView` e
  `GrupoDividasView`, deixando `dtoParaEntity` com corpo idêntico. Conclusão: o arquivo tem
  um único membro público e nenhum import de UI. (Critério 1)
- [ ] 4.2 Remover de `src/app/mappers/dividas.mapper.spec.ts` os blocos já migrados na tarefa
  2.3, deixando apenas os casos de `dtoParaEntity` e removendo imports que ficaram sem uso.
  Conclusão: o spec passa e não referencia nenhuma função movida. (Critério 4)

## 5. Verificação

- [ ] 5.1 Executar lint e checagem de tipos restritos aos arquivos desta mudança (a lista de
  arquivos afetados do design.md); ambos terminam sem erro novo introduzido por esta
  mudança. Erro pré-existente em arquivo fora dessa lista não bloqueia esta tarefa —
  registrar em Divergências se for relevante ao contexto da revisão. (Critério 6)
- [ ] 5.2 Executar com `npx jest --runInBand` os specs dos arquivos desta mudança:
  `dividas.service.spec.ts`, `dividas.component.spec.ts`, `dividas.mapper.spec.ts`,
  `dividas-apresentacao.mapper.spec.ts`, `dividas-apresentacao.baseline.spec.ts`,
  `renegociacao.store.spec.ts`, `conclusao.component.spec.ts`,
  `garantias.component.spec.ts`; nenhum falha e a contagem de casos de dívidas é igual ou
  maior que a de antes da mudança. Executar a suíte completa do projeto separadamente —
  fora do terminal do agente, pela duração — e registrar aqui o resultado (comando,
  contagem de passou/falhou) como evidência complementar. (Critérios 4, 5)
- [ ] 5.3 Buscar no projeto por `DividasMapper.entityParaGrupoView`,
  `DividasMapper.entityParaView` e `DividasMapper.viewParaEntity`; a busca não retorna
  ocorrência em produção nem em teste. (Critério 3)
- [ ] 5.4 Conferir, commit a commit da série desta mudança, que cada commit isolado passa na
  checagem de tipos. (Critério 6)
- [ ] 5.5 Executar a fixture de linha de base gravada na tarefa 1.1 contra o código após a
  mudança; o resultado bate campo a campo com o valor esperado commitado, sem edição do
  valor esperado. (Critério 5)
- [ ] 5.6 Conferir que `dtoParaEntity`, a regex de `periodicidade` e a fabricação de zeros em
  `viewParaEntity` estão com corpo idêntico ao original, por diff. (Critérios 1, 2)
- [ ] 5.7 Rodar a suíte com cobertura (`jest --coverage`) e confirmar que
  `dividas.mapper.ts` e `dividas-apresentacao.mapper.ts` atingem branches >= 90%, incluindo
  os ramos de `ondeRenegociar` e da regex de `periodicidade`. (Critérios 2, 4)