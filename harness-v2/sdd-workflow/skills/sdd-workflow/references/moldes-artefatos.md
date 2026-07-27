# Moldes de artefatos

## proposta.md

Quatro secoes, nesta ordem:

| Secao | Conteudo | Tamanho |
|---|---|---|
| Intencao | problema real e para quem; ticket, se houver | duas a quatro frases |
| Escopo | duas listas: dentro e fora do escopo | itens observaveis |
| Restricoes | o que nao pode ser feito, transcrito do briefing | uma linha cada |
| Criterios de aceite | ver formato abaixo | um por comportamento |

A lista de fora do escopo nao e opcional. Escopo que nao foi negado por escrito volta como
retrabalho na revisao.

A secao de restricoes existe porque o briefing costuma declarar limites que nao viram
requisito, como o que nao pode ser tocado ou o que deve permanecer compativel. Perder essa
informacao entre o briefing e o plano e a falha mais cara do fluxo.

## Criterios de aceite

Cada criterio e um item numerado com uma frase normativa usando MUST, SHOULD ou MAY,
seguida de uma a tres condicoes de verificacao no formato dado, quando, entao.

Um criterio descreve comportamento observavel. Se voce precisou citar nome de classe,
arquivo ou biblioteca, moveu detalhe de implementacao para dentro do criterio. Corrija.

Cobertura minima por criterio: um caminho feliz e um caminho de erro. Acrescente condicao
de borda sempre que houver limite numerico, temporal ou de permissao.

Sintomas de criterio ruim: afirma que algo foi processado corretamente, em vez do resultado
visivel; comeca direto na acao, sem estado inicial; afirma que um metodo foi chamado, em
vez da consequencia percebida; encadeia varios comportamentos em uma frase, quando deveria
ser mais de um criterio.

## design.md

Obrigatorio apenas no rigor Full. Tres secoes: abordagem tecnica em prosa, no maximo uma
pagina; decisoes; e arquivos afetados, cada caminho marcado como novo, alterado ou removido.

Cada decisao registra quatro coisas: a restricao que a forcou, a escolha adotada, as
alternativas descartadas com o motivo de cada uma, e a consequencia aceita.

Decisao sem alternativa descartada nao e decisao, e narrativa. Se a mudanca cria artefato
compartilhado de forma rigida entre camadas, justifique explicitamente ou recuse a
abordagem.

## tarefas.md

Agrupamentos numerados, cada um com itens de checklist em dois niveis de numeracao. O
ultimo agrupamento chama-se Verificacao e e obrigatorio.

Formato do item, sem excecao: hifen, espaco, `[ ]` para pendente ou `[x]` para concluida,
espaco, numero da tarefa, espaco, descricao.

Conteudo minimo do agrupamento de verificacao: lint e checagem de tipos sem erro; testes
cobrindo os criterios de aceite; cada criterio mapeado para ao menos um teste.

Regras:

- Uma tarefa e uma unidade concluivel em uma sessao. Se precisa de tres commits, quebre.
- Toda tarefa tem criterio observavel. Ajustar o servico nao e tarefa; adicionar
  revalidacao de token no cliente HTTP tratando resposta nao autorizada e tarefa.
- A numeracao e a ordem de execucao sugerida.
- Todo criterio de aceite aparece em ao menos uma tarefa. Criterio sem tarefa significa
  plano incompleto.
