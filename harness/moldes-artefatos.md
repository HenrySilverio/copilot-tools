# Moldes de artefatos

## 1. proposta.md

Secoes obrigatorias, nesta ordem:

| Secao | Conteudo | Tamanho |
|---|---|---|
| Titulo de nivel um | Proposal, dois pontos, titulo curto da mudanca | uma linha |
| Intent | qual problema real esta sendo resolvido e para quem; referencia ao ticket, se houver | duas a quatro frases |
| Scope | duas listas: dentro do escopo e fora do escopo | itens observaveis |
| Approach | direcao escolhida, em prosa, sem codigo e sem nome de classe | um paragrafo |
| Risks | lista de risco, impacto e mitigacao | uma linha por risco |

A lista de fora do escopo nao e opcional. Escopo que nao foi negado por escrito volta como
retrabalho na revisao, normalmente no pior momento.

## 2. design.md

Obrigatorio apenas no rigor Full. Secoes, nesta ordem:

| Secao | Conteudo |
|---|---|
| Technical Approach | como sera construido, em prosa, no maximo uma pagina |
| Decisions | uma subsecao por decisao |
| Contracts | contratos afetados e como cada camada os consome de forma isolada |
| File Changes | lista de caminhos, cada um marcado como novo, alterado ou removido |

Cada decisao registra quatro coisas: o contexto ou restricao que a forcou, a escolha
adotada, as alternativas descartadas com o motivo de cada uma, e a consequencia aceita,
ou seja, a divida ou limitacao assumida conscientemente.

Decisao sem alternativa descartada nao e decisao, e narrativa. Se voce nao consegue nomear
a alternativa, provavelmente nao avaliou nenhuma.

Na secao de contratos, se a proposta cria um artefato compartilhado de forma rigida entre
camadas, justifique explicitamente ou recuse a abordagem. Contrato que vira recurso global
compartilhado transforma-se em ponto unico de falha.

## 3. tarefas.md

Estrutura:

- Titulo de nivel um chamado Tarefas.
- Um cabecalho de nivel dois por agrupamento, numerado a partir de um.
- Dentro de cada agrupamento, itens de checklist numerados em dois niveis, como um ponto um.
- Um agrupamento final obrigatorio chamado Verificacao.

O agrupamento de verificacao contem, no minimo:

- lint e checagem de tipos sem erro
- testes automatizados cobrindo os cenarios do delta
- cada cenario da especificacao mapeado para ao menos um teste

Regras de tarefa:

- Uma tarefa e uma unidade concluivel em uma sessao. Se precisa de tres commits, quebre.
- Toda tarefa tem criterio observavel. Ajustar o servico nao e tarefa. Adicionar
  revalidacao de token no cliente HTTP tratando resposta nao autorizada e tarefa.
- A numeracao e a ordem de execucao sugerida.
- Todo requisito adicionado ou modificado no delta aparece em pelo menos uma tarefa. Se
  sobrar requisito sem tarefa, o plano esta incompleto.

## 4. projeto.md

Opcional, no maximo uma pagina. Serve para dar contexto estavel que nao pertence a nenhuma
mudanca especifica: dominio de negocio, glossario de termos internos, fronteiras do sistema
e integracoes externas.

Nao coloque aqui padroes de codigo, versao de biblioteca nem instrucoes de build. Isso
pertence as instructions do projeto e envelhece em ritmo diferente.
