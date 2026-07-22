# Formato de especificacoes e deltas

## 1. Anatomia de uma especificacao

Arquivo `.sdd/specs/<dominio>/spec.md`, na ordem:

1. Titulo de nivel um com o nome do dominio.
2. Secao de nivel dois chamada Purpose, com uma frase sobre o que o dominio cobre.
3. Secao de nivel dois chamada Requirements.
4. Dentro dela, um cabecalho de nivel tres por requisito, no formato
   Requirement, dois pontos, nome do requisito.
5. Abaixo de cada requisito, uma unica frase normativa.
6. Abaixo da frase, um ou mais cabecalhos de nivel quatro no formato
   Scenario, dois pontos, nome do cenario.
7. Dentro de cada cenario, uma lista de itens iniciados por GIVEN, WHEN, THEN e AND.

Nomes de requisito e de cenario sao a chave de identidade usada no merge do arquivamento.
Trate-os como identificadores estaveis: renomear equivale a remover e adicionar.

## 2. Palavras-chave normativas

| Palavra | Significado | Quando usar |
|---|---|---|
| MUST ou SHALL | obrigatorio absoluto | regra que, violada, e defeito |
| SHOULD | recomendado | existe excecao legitima e documentavel |
| MAY | opcional | comportamento permitido, nao esperado |

Nao use deve, poderia, idealmente. Nao coloque duas obrigacoes na mesma frase: duas
obrigacoes sao dois requisitos.

## 3. Anatomia de um delta

Arquivo `.sdd/changes/<change-id>/specs/<dominio>/spec.md`, na ordem:

1. Titulo de nivel um no formato Delta, dois pontos, nome do dominio.
2. Até tres secoes de nivel dois, com estes rotulos exatos e em ingles:
   ADDED Requirements, MODIFIED Requirements, REMOVED Requirements.
3. Dentro de cada secao, os requisitos no mesmo formato da especificacao completa.

Regras do delta:

- Um arquivo por dominio afetado. Nao junte dominios no mesmo arquivo.
- Requisito modificado e reescrito por inteiro, no estado final: titulo, frase normativa e
  todos os cenarios. O arquivamento substitui o bloco inteiro, entao bloco parcial corrompe
  a especificacao. Registre o valor anterior entre parenteses logo abaixo da frase
  normativa, apenas como nota de revisao.
- Requisito modificado exige que exista, na especificacao atual, um requisito com
  exatamente o mesmo nome. Nome diferente significa adicionado mais removido, nao modificado.
- Requisito removido leva apenas o titulo e a justificativa entre parenteses, sem cenarios.
- Secao vazia nao existe. Se nada foi removido, a secao de removidos nao aparece no arquivo.

## 4. Qualidade de cenario

Cenario ruim nao vira teste. Sintomas e correcoes:

| Sintoma | Como aparece | Correcao |
|---|---|---|
| Nao observavel | o then afirma que algo foi processado corretamente | afirme o resultado visivel: status, mensagem, registro disponivel |
| Sem estado inicial | o cenario comeca direto na acao | descreva a pre-condicao no given |
| Detalhe de implementacao | o then afirma que um metodo foi chamado | afirme a consequencia percebida por quem consome |
| Multiplos comportamentos | o then encadeia salvar, notificar e auditar | separe em tres cenarios, ou em tres requisitos |
| Condicional dentro do cenario | o then contem se, entao, senao | dois cenarios, um por ramo |

Cobertura minima por requisito: um caminho feliz e um caminho de erro. Acrescente cenario
de borda sempre que houver limite numerico, temporal ou de permissao.

## 5. Checklist de validacao

Aplique antes de encerrar qualquer etapa que escreva especificacao:

- Todo arquivo de delta comeca com titulo no formato Delta, dois pontos, dominio.
- Toda secao de delta usa um dos tres rotulos exatos, sem traducao e sem variacao.
- Todo requisito usa o prefixo Requirement seguido de dois pontos.
- Todo cenario usa o prefixo Scenario seguido de dois pontos.
- Nenhum requisito adicionado ou modificado esta sem cenario.
- Nenhum nome de classe, arquivo, biblioteca ou endpoint aparece dentro de spec.md.
- Nenhum requisito duplicado dentro do mesmo dominio.
