# Mapa legado para moderno, Angular 21 ou superior

Este arquivo e uma tabela de traducao, nao um tutorial. Consulte-o antes de gerar
componente ou template.

## 1. Membros de classe

| Legado | Moderno | Observacao |
|---|---|---|
| decorator Input em campo | funcao input, atribuida a campo readonly | vira signal, leitura por chamada |
| decorator Input com propriedade required | funcao input.required | nao pode ser lida no construtor |
| decorator Input com alias | funcao input com opcao de alias | |
| decorator Input com coercao manual | funcao input com opcao de transformacao | ha transformadores prontos para numero e booleano |
| decorator Output com EventEmitter | funcao output | emissao continua sendo por metodo emit |
| par de entrada e saida para two way | funcao model | habilita a sintaxe de binding bidirecional no consumidor |
| decorator ViewChild | funcao viewChild ou viewChild.required | vira signal; resolve apos a primeira renderizacao |
| decorator ViewChildren | funcao viewChildren | |
| decorator ContentChild e ContentChildren | funcoes contentChild e contentChildren | |
| dependencia no construtor | campo readonly com inject | permite heranca sem repassar dependencias |
| ngOnChanges | valor derivado sobre o signal de entrada | reage sozinho, sem gancho de ciclo de vida |
| ngOnDestroy para cancelar assinatura | efeito com funcao de limpeza, ou conversao para signal | limpeza automatica no destroy |

## 2. Template

| Legado | Moderno | Observacao |
|---|---|---|
| diretiva de condicional com asterisco | bloco de condicional embutido | suporta ramo alternativo e encadeamento, com captura de valor por alias |
| diretiva de repeticao com asterisco | bloco de repeticao embutido | a expressao de rastreio e obrigatoria |
| ngSwitch com casos | bloco de selecao embutido | inclui ramo padrao |
| verificacao manual de lista vazia | ramo de lista vazia do proprio bloco de repeticao | elimina a condicional que envolvia a lista |
| ngClass com objeto | binding de classe individual, ou binding de classe com objeto | |
| ngStyle | binding de estilo, com unidade opcional no proprio nome do binding | |
| carregamento manual sob demanda | bloco de carregamento adiado | oferece ramos de espera, carregamento e erro, e gatilhos como entrada em viewport |

Variaveis implicitas do bloco de repeticao: indice, primeiro, ultimo, par, impar e
contagem total. Use-as em vez de calcular no componente.

Sobre a expressao de rastreio: usar o indice so e aceitavel em lista imutavel e sem
reordenacao. Em qualquer outro caso use a chave estavel do item, ou o Angular recria os
nos do DOM e voce perde estado de formulario, foco e animacao.

## 3. Camada de dados

| Situacao | Escolha correta | Por que |
|---|---|---|
| leitura cuja URL ou parametros derivam de signals | recurso HTTP declarativo | refaz a busca sozinho quando a dependencia muda; expoe valor, carregamento, erro e recarga |
| comando com efeito colateral, como criacao, alteracao ou exclusao | cliente HTTP tradicional, consumido por promessa ou observable | nao e estado derivado, e acao pontual |
| fluxo com composicao temporal, como atraso, cancelamento ou nova tentativa | RxJS, convertendo o resultado para signal na borda | signals nao modelam tempo |
| estado de UI local | signal | |

Nao force o recurso declarativo no papel de comando, nem o contrario. O criterio e simples:
o valor e derivado de estado, ou e consequencia de uma acao do usuario?

## 4. Guard, interceptor e resolver

A forma moderna e funcional: uma funcao exportada, tipada pelo tipo correspondente do
Angular, que obtem dependencias por inject no proprio corpo. Registro por provider
funcional na configuracao da aplicacao.

Classes implementando interfaces de guard, e interceptors registrados por token de
multi-provider, sao legado. Nao gere. O motivo pratico e testabilidade: a forma funcional
e testavel executando a funcao dentro de um contexto de injecao, sem instanciar componente
nem modulo.

## 5. Armadilhas frequentes

Entrada obrigatoria nao pode ser lida no construtor nem em inicializacao sincrona de campo,
porque o valor ainda nao chegou. Leia dentro de valor derivado, de efeito, ou apos a
inicializacao do componente.

Entrada e signal somente leitura. Se o componente precisa de estado local que comeca a
partir da entrada mas pode ser alterado pelo usuario, use signal vinculado, nunca copia
manual em um gancho de ciclo de vida.

Consultas de view e de conteudo so resolvem apos a primeira renderizacao. Manipulacao
imperativa de DOM vai em gancho de pos renderizacao, nao no construtor.

Efeito so pode ser criado em contexto de injecao, ou seja, em inicializacao de campo ou no
construtor. Criar efeito dentro de um metodo de evento falha, a menos que voce passe o
injector explicitamente. Se voce esta tentando fazer isso, provavelmente queria um valor
derivado.

Efeito com recurso externo, como temporizador ou listener, precisa registrar a propria
limpeza pela funcao de limpeza que o efeito recebe. Sem isso, o recurso sobrevive ao
componente.

## 6. Interoperabilidade com RxJS

Converta observable para signal quando o valor for consumido pelo template, sempre
definindo o valor inicial. Converta signal para observable quando precisar aplicar
operadores de composicao temporal.

Use RxJS onde ele e superior: atraso, cancelamento de requisicao anterior, nova tentativa
com politica, e combinacao de multiplos fluxos reais. Use signals para estado de interface.
Converter tudo para um lado so e ideologia, nao engenharia.

## 7. Diferencas praticas do perfil zoneless

Deixam de disparar deteccao de mudanca automaticamente: callbacks de temporizador,
continuacao de promessa, callback de assinatura, e listener registrado manualmente.

Continuam disparando: alteracao de signal, evento vindo do template, pipe assincrono, e
marcacao explicita de verificacao.

Consequencia pratica: qualquer estado que a interface le precisa ser signal. Um campo de
classe comum, atualizado dentro de um callback de assinatura, simplesmente nao aparece na
tela, e o sintoma nao aponta para a causa.
