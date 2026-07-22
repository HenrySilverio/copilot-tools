---
name: angular-jest-testing
description: Testes unitarios Angular com Jest e jest-preset-angular, orientados a comportamento e alta cobertura de ramificacao. Use SEMPRE que o pedido envolver criar, corrigir, completar ou revisar arquivos de especificacao de teste, quando aparecerem os termos teste unitario, cobertura, mock, spy, fixture, ambiente de teste do Angular, ou quando um teste estiver falhando. Use tambem quando alguem pedir para escrever os testes de um service, componente, guard, interceptor ou pipe.
---

# Testes Angular com Jest

## Escopo

Testes unitarios e de componente com Jest. Nao cobre teste de ponta a ponta, teste de
contrato, performance nem regras de codigo de producao.

## Dependencias

Nenhuma obrigatoria. Se o projeto usar biblioteca de estado ou carregamento remoto de
modulos, veja a secao de casos especiais: o tratamento e opcional e degrada com elegancia
quando a tecnologia nao existe no projeto.

---

## Passo 0 - Ler a configuracao real

Nao assuma a configuracao. Leia:

| Arquivo | O que confirmar |
|---|---|
| package.json | versao de jest, do preset do Angular e do proprio Angular; qual e o script de teste |
| configuracao do jest | preset, arquivos de setup, ambiente de teste, limites de cobertura |
| arquivo de setup | qual ponto de entrada do preset esta sendo importado |
| configuracao da aplicacao | se o projeto e zoneless ou usa zone.js |

O ponto de entrada do preset mudou entre versoes maiores. Copie o padrao do arquivo de
setup existente no projeto. Nao gere esse import de memoria: e a causa mais comum de suite
que nao sobe.

Se o projeto for zoneless, os utilitarios de tempo simulado do Angular dependem do modulo
de teste do zone.js e podem nao estar disponiveis. Prefira aguardar a estabilizacao do
fixture.

Nota de trade-off, diga uma vez e siga em frente: a partir da versao 21 o runner padrao do
Angular deixou de ser Jest e o ecossistema esta migrando. Manter Jest e escolha legitima,
por estabilidade e base instalada, mas e nadar contra a corrente e o custo tende a subir a
cada versao maior. Isso e decisao do time, nao motivo para recusar a tarefa.

---

## 1. Principio: comportamento, nao implementacao

O teste descreve o que o usuario ou o chamador observa. Se um refactor interno que preserva
o comportamento quebra o teste, o teste estava errado.

| Nao teste | Teste |
|---|---|
| que um metodo privado foi chamado | que o efeito observavel aconteceu |
| que um colaborador recebeu determinado argumento | que a saida correspondente foi produzida |
| a existencia de uma propriedade | o valor que ela produz sob cada condicao |
| comportamento do framework | a sua regra que decide o comportamento |

O nome do teste descreve o comportamento e a condicao, nunca o nome do metodo. Preferir
"aplica juros de mora quando o vencimento ja passou" a "deve chamar calcularJuros".

## 2. Meta de cobertura

O alvo e cobertura de ramificacao, nao de linha. Cobertura de linha alta com ramificacao
baixa e falsa seguranca, e e exatamente o que uma suite gerada sem criterio produz.

Para cada unidade, enumere as ramificacoes antes de escrever qualquer teste:

- cada condicional, operador ternario, coalescencia nula, acesso opcional e operador
  logico de curto-circuito
- cada caso de selecao, incluindo o caso padrao
- cada caminho de erro: excecao lancada, excecao capturada, promessa rejeitada, resposta
  HTTP fora da faixa de sucesso
- cada limite numerico, temporal ou de permissao: valor minimo, valor maximo, data de
  corte, expiracao
- cada estado de operacao assincrona: carregando, sucesso, vazio, erro, cancelamento
- cada recurso que exige limpeza: temporizador, listener, assinatura

Escreva um teste por ramificacao. Um teste com tres afirmacoes sobre coisas distintas
esconde qual delas quebrou.

## 3. Estrutura obrigatoria de arquivo

Um bloco de agrupamento externo com o nome da unidade. Dentro dele, um agrupamento por
comportamento ou por metodo publico. Dentro de cada agrupamento, um caso de teste por
ramificacao.

Dentro de cada caso: bloco de preparacao, bloco de acao, bloco de afirmacao, separados por
linha em branco. Sem comentarios rotulando as fases: a separacao visual basta.

Uma unica afirmacao logica por caso. Multiplas afirmacoes sobre o mesmo objeto de saida sao
aceitaveis, porque descrevem um unico resultado.

Setup compartilhado deve ser minimo. Preparacao especifica de cenario vai em funcao
auxiliar de fabrica chamada dentro do proprio caso, nao em gancho global.

## 4. Estrategia de dubles

Ordem de preferencia, do melhor para o pior:

1. Objeto real, quando for puro e barato: mapeador, validador, funcao utilitaria.
2. Substituto tipado, um objeto simples que satisfaz a interface. Preferido para services.
3. Funcao simulada registrada como provider no ambiente de teste, quando for necessario
   verificar interacao.
4. Espiao sobre instancia real, com moderacao.
5. Simulacao de modulo inteiro. Ultimo recurso. Nunca aplique a modulos do proprio Angular.

Nunca simule aquilo que voce esta testando. Se o teste precisa de cinco dubles para rodar,
o problema e acoplamento na unidade, nao no teste. Reporte isso explicitamente em vez de
absorver a complexidade no arquivo de teste.

Para HTTP, use sempre os providers de teste do cliente HTTP do Angular e o controlador de
requisicoes que eles fornecem. Nunca simule o modulo HTTP do framework.

## 5. Anti-padroes que reprovam a entrega

| Anti-padrao | Por que |
|---|---|
| afirmacao tautologica, que compara um valor com ele mesmo | nao verifica nada |
| verificar apenas que um espiao foi chamado | verifica a chamada, nao o resultado |
| caso de teste sem nenhuma afirmacao | passa sempre, inclusive com a implementacao quebrada |
| comparador permissivo em campo relevante | mascara regressao |
| captura de estado de template inteiro | quebra a cada mudanca cosmetica |
| temporizador real dentro do teste | instavel |
| dependencia da ordem de execucao entre casos | instavel |
| gancho de preparacao longo que a maioria dos casos nao usa | acoplamento; use fabrica por cenario |
| simular o proprio objeto sob teste | teste vazio |
| selecionar elemento por classe de estilo | quebra quando o design muda; use atributo dedicado a teste |

## 6. Casos especiais

Componente com entradas baseadas em signal: defina os valores pela API de definicao de
entrada da referencia do componente no fixture. Atribuir diretamente na instancia nao
propaga, e o teste passa a exercitar o valor padrao sem que ninguem perceba.

Projeto zoneless: aguarde a estabilizacao do fixture em vez de usar utilitarios de tempo
simulado do Angular.

Biblioteca de estado de terceiros: teste pela API publica exposta pela store, ou seja, os
metodos e os valores publicados. Nunca pelo objeto de estado interno. Se o projeto usar uma
biblioteca especifica, a fonte de verdade e a documentacao dessa biblioteca; esta skill nao
a define.

Componente carregado dinamicamente a partir de outro pacote ou aplicacao: teste o
componente diretamente, importando-o. Nao tente exercitar o mecanismo de carregamento
dinamico em teste unitario, porque voce estaria testando infraestrutura, nao regra.

## 7. Receitas

Leia `references/cobertura-e-cenarios.md` para o roteiro de enumeracao de ramificacoes e as
receitas por tipo de unidade: componente, service com HTTP, recurso declarativo, guard,
interceptor, pipe e controle de tempo.

## 8. Auto-verificacao antes de responder

- Li a configuracao real de Jest, em vez de assumir?
- Enumerei as ramificacoes antes de escrever os testes?
- Existe um caso para cada ramificacao, incluindo erro e colecao vazia?
- Algum caso sem afirmacao real, ou com afirmacao tautologica?
- Usei a API correta para definir entradas baseadas em signal?
- Usei o controlador de requisicoes HTTP em vez de simular o cliente?
- Os nomes descrevem comportamento, e nao nome de metodo?
