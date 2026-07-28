# Moldes de artefatos

Referência de formato. Leia antes de escrever qualquer artefato de `.sdd/changes/`.

## proposta.md

Quatro seções, nesta ordem:

| Seção | Conteúdo | Tamanho |
|---|---|---|
| Intenção | problema real e para quem; ticket, se houver | duas a quatro frases |
| Escopo | duas listas: dentro e fora do escopo | itens observáveis |
| Restrições | o que não pode ser feito, transcrito do briefing | uma linha cada |
| Critérios de aceite | ver formato abaixo | um por comportamento |

A lista de fora do escopo não é opcional. Escopo que não foi negado por escrito volta como
retrabalho na revisão.

A seção de restrições existe porque o briefing costuma declarar limites que não viram
requisito, como o que não pode ser tocado ou o que deve permanecer compatível. Perder essa
informação entre o briefing e o plano é a falha mais cara do fluxo.

Se a mudança não altera comportamento observável, declare isso em uma linha ao final da
intenção. Ausência explícita de delta é informação; ausência implícita é dúvida para o revisor.

## Critérios de aceite

Cada critério é um item numerado com uma frase normativa usando MUST, SHOULD ou MAY,
seguida de uma a três condições de verificação no formato dado, quando, então.

Um critério descreve comportamento observável. Se você precisou citar nome de classe,
arquivo ou biblioteca, moveu detalhe de implementação para dentro do critério. Corrija.

Cobertura mínima por critério: um caminho feliz e um caminho de erro. Acrescente condição
de borda sempre que houver limite numérico, temporal ou de permissão.

Sintomas de critério ruim: afirma que algo foi processado corretamente, em vez do resultado
visível; começa direto na ação, sem estado inicial; afirma que um método foi chamado, em
vez da consequência percebida; encadeia vários comportamentos em uma frase, quando deveria
ser mais de um critério.

## design.md

Obrigatório apenas no rigor Full. Três seções: abordagem técnica em prosa, no máximo uma
página; decisões; e arquivos afetados, cada caminho marcado como novo, alterado ou removido.

Cada decisão registra quatro coisas: a restrição que a forçou, a escolha adotada, as
alternativas descartadas com o motivo de cada uma, e a consequência aceita.

Decisão sem alternativa descartada não é decisão, é narrativa. Se a mudança cria artefato
compartilhado de forma rígida entre camadas, justifique explicitamente ou recuse a
abordagem.

## tarefas.md

Agrupamentos numerados, cada um com itens de checklist em dois níveis de numeração. O
último agrupamento chama-se Verificação e é obrigatório.

Formato do item, sem exceção: hífen, espaço, `[ ]` para pendente ou `[x]` para concluída,
espaço, número da tarefa, espaço, descrição.

Conteúdo mínimo do agrupamento de verificação: lint e checagem de tipos sem erro; testes
cobrindo os critérios de aceite; cada critério mapeado para ao menos um teste.

Regras:

- Uma tarefa é uma unidade concluível em uma sessão. Se precisa de três commits, quebre.
- Toda tarefa tem critério observável. Ajustar o serviço não é tarefa; adicionar
  revalidação de token no cliente HTTP tratando resposta não autorizada é tarefa.
- A numeração é a ordem de execução sugerida.
- Todo critério de aceite aparece em ao menos uma tarefa. Critério sem tarefa significa
  plano incompleto.

## briefing.md

Cópia literal do arquivo de briefing informado na invocação do `/sdd-plan`, sem edição,
sem resumo e sem reformatação. Existe para que o archive guarde o pedido original ao lado
do acordo.

Não é fonte de verdade para nenhuma etapa posterior. Se algo do briefing importa para a
implementação, esse algo tinha que ter virado restrição ou critério na proposta.

## deltas.md

Formato definido em `specs-e-deltas.md`. Só existe quando a mudança altera comportamento
observável.
