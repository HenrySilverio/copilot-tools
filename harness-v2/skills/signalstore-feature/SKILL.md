---
name: signalstore-feature
description: Criacao e revisao de stores com NgRx SignalStore, o pacote @ngrx/signals - composicao de estado, valores derivados, metodos, ganchos, colecoes de entidades e metodos reativos. Use SEMPRE que aparecerem os termos signal store, ngrx signals, atualizacao parcial de estado, feature de store, colecao de entidades, ou quando o pedido envolver onde guardar determinado estado, criar store, ou gerenciamento de estado em Angular.
---

# NgRx SignalStore

A superficie da API e pequena, mas idiossincratica. Modelos confundem com o NgRx Store
classico e geram redutores, efeitos, seletores e despacho de acoes. Nada disso existe aqui.

## Escopo

Modelagem de estado com o pacote de signals do NgRx. Nao cobre APIs do framework Angular,
HTTP, carregamento remoto de modulos nem testes.

## Dependencias

Nenhuma.

---

## Passo 0 - Confirmar versao e pacotes

Leia o package.json e confirme a versao do pacote de signals do NgRx, alem da existencia
dos subpacotes de entidades e de interoperabilidade com RxJS. Nao importe subpacote sem
confirmar que ele existe na versao instalada.

Se o pacote nao estiver instalado, pare e diga isso. Nao proponha instalar por conta
propria.

---

## 1. Decisao anterior ao codigo: precisa de store?

Nem todo estado merece uma store. Ordem de escalada:

| Situacao | Solucao |
|---|---|
| estado usado por um unico componente | signal no proprio componente |
| valor derivado de uma entrada do componente | valor derivado, ou signal vinculado se precisar de escrita local |
| estado compartilhado entre um componente e seus filhos | store provida no proprio componente |
| estado compartilhado entre rotas ou entre features | store provida na raiz da aplicacao |
| dados de servidor sem interacao complexa | recurso HTTP declarativo, sem store |

Criar store para estado local e custo sem retorno. Se voce so precisa de um booleano
indicando que um dialogo esta aberto, use um signal.

O escopo importa mais do que parece. Store provida na raiz vive enquanto a aplicacao viver.
Store de tela deve ser provida no componente da tela, para morrer junto com ela. Store
global usada por uma unica tela e vazamento de estado entre navegacoes, e o sintoma aparece
tarde: o usuario volta para a tela e ve dados da visita anterior.

## 2. Anatomia obrigatoria

A ordem de composicao das features e canonica e nao deve ser invertida:

1. Estado inicial, declarado com tipo explicito e constante nomeada.
2. Valores derivados, que recebem o estado ja montado.
3. Metodos, que recebem o estado e os valores derivados ja montados.
4. Ganchos de ciclo de vida, que recebem tudo.

Cada etapa enxerga apenas o que foi composto antes dela. Inverter a ordem produz erro de
tipo cuja mensagem nao aponta para a causa.

Elementos obrigatorios de uma store bem formada:

| Elemento | Regra |
|---|---|
| tipo do estado | declarado explicitamente, nunca inferido de um literal |
| estado inicial | constante nomeada e separada da declaracao da store |
| campos de erro e de carregamento | modelados desde o inicio, nao adicionados depois |
| dependencias | obtidas na assinatura da fabrica de metodos, como parametro com valor padrao |
| metodos | unica porta de entrada para alteracao de estado |

## 3. Regras duras

1. A atualizacao de estado so acontece dentro dos metodos ou dos ganchos da store.
   Componente que atualiza o estado diretamente transforma a store em saco de variaveis
   globais e destroi o encapsulamento. O componente chama metodos; a store decide como o
   estado muda.
2. Estado sai como signal somente leitura. Nao exponha signal gravavel nem o objeto de
   estado bruto.
3. Tudo que e derivavel vai em valor derivado. Se existe um metodo cujo unico proposito e
   gravar um valor calculado a partir de outros campos, era um valor derivado.
4. Injecao de dependencia acontece na assinatura da fabrica, como parametro com valor
   padrao. Chamar injecao dentro do corpo de um metodo falha, porque o contexto de injecao
   ja terminou.
5. Nao guarde no estado aquilo que da para derivar. Estado duplicado desincroniza, e a
   desincronizacao aparece em producao, nao em desenvolvimento.
6. Nao guarde objeto nao serializavel: instancia de classe com metodos, estrutura mutada
   por referencia, referencia a elemento de DOM.
7. Um agregado por store. Store que gerencia pedidos, usuario e tema ao mesmo tempo nao e
   store, e singleton de conveniencia.
8. Fluxo assincrono com composicao temporal, como atraso na digitacao, cancelamento da
   requisicao anterior ou nova tentativa, usa o metodo reativo do subpacote de
   interoperabilidade com RxJS. Chamada simples de um endpoint pode ser assincrona comum.
   Nao introduza RxJS por ritual.

## 4. Colecoes

Para colecao indexada por identificador, use o subpacote de entidades em vez de manipular
array a mao. Ele fornece o formato normalizado e os operadores de insercao, atualizacao e
remocao. Reimplementar isso com transformacoes de array gera bug de identidade e
renderizacao desnecessaria.

Confirme os nomes exatos dos operadores na versao instalada antes de gerar: eles mudaram
entre versoes maiores.

## 5. Reuso

Comportamento repetido em varias stores, como indicador de carregamento, tratamento de erro
ou paginacao, vira uma feature reutilizavel de store, nao copia e cola.

Criterio pratico: duplicar uma vez e aceitavel; a terceira store repetindo o mesmo par de
campos de carregamento e erro e o gatilho para extrair a feature. Extrair antes disso
produz abstracao especulativa que nao encaixa no terceiro caso.

Veja `references/modelagem.md` para o roteiro de extracao e para a composicao com o restante
da store.

## 6. Anti-padroes

| Anti-padrao | Por que |
|---|---|
| redutor, efeito, seletor ou despacho de acao | API do NgRx Store classico; nao existe neste pacote |
| atualizacao de estado disparada do componente | quebra o encapsulamento e espalha regra de negocio pela UI |
| valor derivado que chama metodo da propria store | dependencia circular |
| efeito dentro de metodo para sincronizar estado | use valor derivado, ou metodo reativo |
| store global para estado de uma unica tela | vaza estado entre navegacoes |
| um campo de carregamento por operacao | modele um estado de status, ou aceite a duplicacao conscientemente |
| expor o objeto de estado inteiro para o template | acopla o template a forma interna do estado |
| espelhar cada campo de formulario dentro da store | duas fontes de verdade |

## 7. Auto-verificacao antes de responder

- Confirmei que o pacote esta instalado e em qual versao?
- O escopo da store, raiz ou componente, foi decidido conscientemente e justificado?
- A alteracao de estado acontece apenas dentro de metodos e ganchos?
- Todo valor derivavel esta declarado como valor derivado?
- A injecao esta na assinatura da fabrica, e nao no corpo do metodo?
- A store cuida de um unico agregado?
- Nenhuma API do NgRx Store classico apareceu?
