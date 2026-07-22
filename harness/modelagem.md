# Modelagem de stores

## 1. Store de tela

Caracteristicas: provida no componente da tela, morre junto com ela, guarda o agregado que
a tela manipula e os indicadores de carregamento e erro daquela tela.

Composicao tipica, em ordem:

1. Estado com o agregado, o indicador de carregamento e o campo de erro.
2. Valores derivados que a tela consome diretamente, como um alerta calculado a partir do
   agregado.
3. Um metodo de abertura, que marca carregamento, busca os dados e trata o erro.
4. Um metodo de limpeza, para quando a tela precisa reiniciar sem ser destruida.

O componente injeta a store, lê os signals no template e chama os metodos. O template
ramifica entre carregando, erro e conteudo, nessa ordem, sempre com um ramo explicito para
cada estado. Estado de erro sem ramo no template e a origem mais comum de tela em branco.

## 2. Store compartilhada

Caracteristicas: provida na raiz, guarda estado que atravessa rotas, como sessao,
permissoes, preferencias ou carrinho.

Cuidados adicionais em relacao a store de tela:

- Precisa de metodo explicito de limpeza, chamado no encerramento de sessao. Estado global
  sem limpeza vaza entre usuarios em ambiente compartilhado.
- Nao deve conter estado de tela. Se um campo so faz sentido enquanto uma rota especifica
  esta ativa, ele nao pertence a store global.
- Mudanca nela afeta toda a aplicacao. Trate a lista de metodos publicos como contrato.

## 3. Fluxo assincrono com composicao temporal

Use o metodo reativo do subpacote de interoperabilidade com RxJS quando houver pelo menos
um destes: atraso na digitacao antes de disparar, cancelamento da requisicao anterior
quando uma nova chega, nova tentativa com politica, ou combinacao de mais de uma fonte.

Estrutura do pipeline, na ordem que funciona:

1. Atraso, para nao disparar a cada tecla.
2. Descarte de valores repetidos consecutivos.
3. Marcacao de carregamento e limpeza do erro anterior.
4. Troca para a nova requisicao, cancelando a anterior. E este operador que da o
   cancelamento; sem ele, respostas fora de ordem sobrescrevem o resultado correto.
5. Tratamento de sucesso e de erro no mesmo ponto, atualizando o estado nos dois casos.

O metodo reativo aceita valor direto, observable ou signal. Quando recebe um signal, ele
reexecuta a cada mudanca, o que dispensa efeito manual no componente.

Sem cancelamento e sem atraso, uma funcao assincrona comum e mais simples e igualmente
correta. Escolher RxJS por habito adiciona superficie de erro sem beneficio.

## 4. Colecao de entidades

Use o subpacote de entidades quando a colecao for indexada por identificador e sofrer
insercao, atualizacao ou remocao pontual.

Padrao de metodos:

| Operacao | Sequencia |
|---|---|
| carga inicial | busca a lista e substitui todas as entidades de uma vez |
| atualizacao | envia a alteracao ao servidor, e so entao aplica a alteracao no estado |
| remocao | envia a remocao ao servidor, e so entao remove do estado |
| insercao | envia a criacao, recebe o identificador gerado e insere com esse identificador |

A ordem importa. Aplicar a alteracao no estado antes da confirmacao do servidor e
atualizacao otimista, o que e valido, mas exige reversao explicita em caso de falha. Se
voce nao vai escrever a reversao, nao faca otimista.

Valores derivados sobre a colecao, como filtragens e contagens, vao em valor derivado,
nunca em campo de estado.

## 5. Extracao de feature reutilizavel

Roteiro:

1. Identifique o conjunto de campos e metodos repetido em pelo menos tres stores.
2. Extraia para uma funcao que devolve uma feature de store, contendo o proprio estado,
   os proprios valores derivados e os proprios metodos.
3. Componha a feature antes do estado especifico da store, para que os metodos da store
   possam chamar os metodos da feature.
4. Mantenha a feature ignorante do dominio. Uma feature de carregamento e erro nao pode
   saber que existe pedido, cliente ou conta.

Sinal de que a extracao foi longe demais: a feature precisa de parametro de tipo para cada
store que a usa, ou tem metodos que so uma store chama. Nesse caso, volte para duplicacao.

## 6. Convivencia com formularios

A store guarda o estado de dominio, nao o estado do controle de formulario. O formulario
mantem o proprio estado de validade, alteracao e toque, e entrega a store apenas o valor
final ja validado, por meio de um metodo.

Espelhar cada campo do formulario dentro da store cria duas fontes de verdade. O problema
nao aparece no caminho feliz: aparece em validacao assincrona, em reinicializacao do
formulario e em navegacao com alteracoes pendentes.

## 7. Fronteira com a camada de dados

A store nao faz requisicao diretamente. Ela injeta um colaborador responsavel pelo acesso
a dados e conhece apenas o modelo de dominio.

O mapeamento entre o formato da API e o modelo de dominio pertence a camada de dados. Se o
tipo do estado da store tem campos com o formato da API, o mapeamento vazou para dentro do
estado, e qualquer mudanca no contrato do servidor vai atravessar a aplicacao inteira.
