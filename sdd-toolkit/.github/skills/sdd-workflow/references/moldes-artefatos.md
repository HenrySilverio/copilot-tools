# Moldes de artefatos

Referência de formato. Leia antes de escrever qualquer artefato de `.sdd/changes/`.

## proposta.md

Quatro seções obrigatórias, nesta ordem, mais uma opcional ao final:

| Seção | Conteúdo | Tamanho |
|---|---|---|
| Intenção | problema real e para quem; ticket, se houver | duas a quatro frases |
| Escopo | duas listas: dentro e fora do escopo | itens observáveis |
| Restrições | o que não pode ser feito, transcrito do briefing | uma linha cada |
| Critérios de aceite | ver formato abaixo | um por comportamento |
| Divergências | opcional; ver formato abaixo | duas linhas por item |

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
arquivo ou biblioteca, moveu detalhe de implementação para dentro do critério. Corrija —
salvo no caso da subseção abaixo.

Cobertura mínima por critério: um caminho feliz e um caminho de erro. Acrescente condição
de borda sempre que houver limite numérico, temporal ou de permissão.

Sintomas de critério ruim: afirma que algo foi processado corretamente, em vez do resultado
visível; começa direto na ação, sem estado inicial; afirma que um método foi chamado, em
vez da consequência percebida; encadeia vários comportamentos em uma frase, quando deveria
ser mais de um critério.

### Mudança sem alteração de comportamento

Refactor puro não tem comportamento novo para descrever. Aqui, e só aqui, critério
estrutural é legítimo: quais símbolos um artefato exporta, quais imports ele não tem,
onde um teste mora, que o build passa em cada etapa isolada.

A exigência não desaparece, muda de forma — o critério continua tendo que ser
mecanicamente verificável. "A tela renderiza igual" não é critério, porque não diz
contra o quê. "Para a fixture de entrada gravada como linha de base, o resultado é igual,
campo a campo, ao valor esperado commitado junto" é.

A linha de base é gravada contra o código atual e commitada antes do primeiro commit da
mudança; sua gravação é o primeiro agrupamento de `tarefas.md`. Linha de base gerada
depois do refactor grava o resultado, não a referência.

O mecanismo da linha de base segue as instructions de teste do projeto, não uma escolha
livre do plano. Se elas proíbem snapshot automático como única verificação de lógica —
caso comum, porque snapshot aceito às cegas em `git add` não prova nada — a linha de base
é fixture explícita: entrada de builder pequeno, saída esperada escrita à mão, comparada
com `toEqual`. O valor tem que estar legível na revisão.

Critério estrutural que um lint ou um grep de CI consegue verificar deve virar lint ou
grep. Regra em markdown é cobrada em token toda vez que carrega; regra em código custa
zero e ainda pega o humano.

Quando isso valer, a intenção da proposta declara que não há mudança de comportamento
observável, e a mudança não gera deltas.

## Divergências

Opcional. Registra contradição encontrada no planejamento entre um documento de entrada e a
realidade do código — briefing que listou menos chamadores do que existem, molde que impede
escrever um critério verificável, restrição que o código já viola.

Só entra divergência que **mudou** escopo, restrição ou critério. Cada entrada diz qual
documento estava errado, o que a leitura encontrou, e o que foi feito. Duas linhas por
entrada. Divergência que não mudou nada não vem para cá — vira issue ou some. Sem essa
trava a seção vira caderno de anotações e toda proposta engorda.

Existe porque desvio silencioso destrói o valor do fluxo mesmo quando o desvio está certo:
o revisor compara o plano com a entrada, encontra diferença e reprova algo correto.

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

Escope lint, checagem de tipos e teste aos arquivos desta mudança, não ao repositório
inteiro — a lista de `design.md` ou a de escopo da proposta é a fonte. Comando de
repositório inteiro reprova mudança correta por dívida pré-existente que não é dela.

Se a suíte completa do projeto for longa o bastante para não concluir no terminal de um
agente, não peça ao agente para rodá-la: peça o resultado de uma execução manual do
desenvolvedor, registrado aqui como evidência. Comando que sempre é morto por timeout não
é verificação, é ritual.

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