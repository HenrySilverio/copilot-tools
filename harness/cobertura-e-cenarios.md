# Cobertura e cenarios

## 1. Roteiro de enumeracao

Antes de escrever qualquer teste, percorra a implementacao e produza a lista de
ramificacoes. Ordem sugerida:

1. Entradas e pre-condicoes. Para cada parametro: valor valido tipico, valor no limite,
   valor invalido, ausencia de valor.
2. Decisoes explicitas. Cada condicional, ternario, selecao e operador de curto-circuito
   gera no minimo dois casos.
3. Decisoes implicitas. Coalescencia nula e acesso opcional sao decisoes: o caso do valor
   ausente precisa existir.
4. Saidas de erro. Excecao lancada pela propria unidade, excecao vinda de colaborador,
   resposta de rede fora da faixa de sucesso, tempo esgotado.
5. Estados assincronos. Carregando, sucesso com dados, sucesso vazio, erro, cancelamento
   por nova chamada.
6. Efeitos de limpeza. Temporizador cancelado, listener removido, assinatura encerrada.

Registre a lista antes de escrever o primeiro teste. Se voce comecar pelos testes, vai
escrever os que sao faceis de escrever, nao os que importam.

## 2. Exemplo de enumeracao

Considere uma funcao de calculo de tarifa com estas regras: cliente isento paga zero; valor
menor ou igual a zero e invalido; acima de dez mil aplica-se aliquota reduzida; cliente
premium paga metade da tarifa calculada.

Ramificacoes e casos minimos:

| Caso | Condicao | Resultado esperado |
|---|---|---|
| 1 | cliente isento | zero, sem avaliar o valor |
| 2 | valor igual a zero | erro de valor invalido |
| 3 | valor negativo | erro de valor invalido |
| 4 | valor exatamente no limite da faixa, cliente comum | aliquota da faixa inferior |
| 5 | valor um centavo acima do limite, cliente comum | aliquota da faixa superior |
| 6 | valor tipico, cliente premium | metade da tarifa calculada |
| 7 | valor acima do limite, cliente premium | metade da tarifa da faixa superior |

Sete casos, sete ramificacoes. Cobertura de linha atingiria cem por cento com tres. E por
isso que a meta e ramificacao.

## 3. Componente

Preparacao: configure o ambiente de teste importando o proprio componente, crie o fixture,
defina as entradas pela API de definicao de entrada da referencia do componente e dispare
a deteccao de mudanca. Extraia essa sequencia para uma funcao auxiliar que recebe os
valores do cenario, para nao repetir preparacao em cada caso.

Afirmacao: consulte o DOM renderizado por atributo dedicado a teste e afirme presenca,
ausencia ou conteudo. Para saidas, assine o emissor antes de disparar a interacao e afirme
sobre os valores acumulados.

Armadilhas: entradas baseadas em signal exigem a API de definicao de entrada; atribuicao
direta na instancia nao propaga. Selecionar elemento por classe de estilo acopla o teste ao
design. Nao afirme sobre estrutura interna de template, apenas sobre o que e observavel.

## 4. Service com HTTP

Preparacao: registre o service, o provider do cliente HTTP e o provider de teste do cliente
HTTP, e obtenha o controlador de requisicoes.

Execucao: dispare a chamada, capture a promessa ou o observable, use o controlador para
localizar a requisicao esperada e responda com o corpo do cenario.

Afirmacao: verifique o resultado mapeado, nao o corpo bruto da resposta. O valor do teste
esta em provar que o mapeamento entre o formato da API e o modelo de dominio esta correto.

Obrigatorio: verifique, ao final de cada caso, que nao restou requisicao pendente. Sem essa
verificacao, requisicao orfa passa despercebida e o teste da falsa confianca.

Cenarios minimos por endpoint: sucesso com mapeamento, resposta de erro tratada, resposta
vazia, e falha de rede.

## 5. Recurso HTTP declarativo

Preparacao: crie o recurso dentro de um contexto de injecao fornecido pelo ambiente de
teste, e force o processamento pendente.

Execucao: responda a requisicao pelo controlador e force o processamento novamente.

Afirmacao: verifique separadamente o valor, o indicador de carregamento e o erro. Sao tres
estados observaveis distintos e cada um merece um caso.

Atencao de versao: a API para forcar o processamento pendente variou entre versoes. Confirme
qual esta disponivel no projeto antes de gerar; se nao houver, use um componente hospedeiro
e aguarde a estabilizacao do fixture.

## 6. Guard, interceptor e resolver funcionais

Como sao funcoes e nao classes, o teste as executa dentro de um contexto de injecao
fornecido pelo ambiente de teste, com os colaboradores substituidos por providers de
cenario. Nao e necessario criar componente nem configurar rotas reais.

Guard: cenarios minimos sao permissao concedida, permissao negada com redirecionamento, e
erro na consulta da permissao. Afirme sobre o valor retornado, incluindo o destino do
redirecionamento quando houver.

Interceptor: capture a requisicao que chegou ao proximo manipulador e afirme sobre os
cabecalhos e a URL resultantes. Cenarios minimos: com credencial, sem credencial, e
requisicao que deve ser ignorada pela regra do interceptor.

Resolver: afirme sobre o valor resolvido e sobre o comportamento quando a fonte falha.

## 7. Pipe e funcao pura

Sao as unidades mais baratas de testar e as que mais se beneficiam de casos de limite.
Cubra: entrada tipica, entrada nula ou indefinida, colecao vazia, valor no limite exato,
valor fora do dominio esperado, e configuracao alternativa quando o pipe aceita parametros.

## 8. Controle de tempo

Congele o relogio na preparacao e restaure ao final. Teste que depende do relogio real e
uma falha esperando a virada do mes, do ano ou do horario de verao.

Cenarios minimos para regra baseada em data: antes do limite, exatamente no limite, e
depois do limite. O caso do limite exato e o que captura o erro de comparacao estrita
versus inclusiva, que e o defeito mais comum nessa categoria.

Para atrasos e intervalos, avance o tempo simulado explicitamente. Nunca aguarde tempo
real dentro de um teste.
