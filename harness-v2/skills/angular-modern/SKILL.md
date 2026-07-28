---
name: angular-modern
description: Padroes obrigatorios de Angular 21 ou superior - signals, input, output, model, inject, controle de fluxo embutido, standalone, zoneless, defer e httpResource. Use SEMPRE que for criar, alterar, revisar ou migrar qualquer arquivo Angular, seja componente, diretiva, pipe, service, guard, interceptor, resolver, template ou configuracao da aplicacao. Use tambem quando o pedido mencionar modernizar, migrar versao, API antiga, NgModule, ngIf, ngFor, decorator de entrada ou saida, subscribe em componente, ou estrategia de deteccao de mudanca.
---

# Angular Moderno, versao 21 ou superior

Modelos de linguagem foram treinados majoritariamente em Angular 15 a 17. Sem esta skill o
codigo gerado sai com decorators de entrada e saida, diretivas estruturais com asterisco,
modulos e injecao por construtor. Esta skill existe para impedir isso.

## Escopo

Apenas APIs do framework Angular. Nao cobre gerenciamento de estado, module federation,
testes, design system nem arquitetura de pastas. Se o pedido envolver esses temas, trate-os
por outra fonte.

## Dependencias

Nenhuma.

---

## Passo 0 - Detectar o perfil do projeto

Nunca assuma. Antes de escrever codigo, leia:

| Arquivo | O que extrair |
|---|---|
| package.json | versao exata de @angular/core e presenca de zone.js |
| configuracao da aplicacao | qual provider de deteccao de mudanca esta registrado |
| angular.json | se os polyfills incluem zone.js |
| tsconfig.json | se strict e strictTemplates estao ativos |

Classifique e declare em uma linha no inicio da resposta:

- PERFIL-ZL, zoneless: sem zone.js. Padrao em projetos criados a partir da versao 21.
- PERFIL-Z, com zone.js: comum em projetos migrados de versoes anteriores.

O perfil muda o codigo gerado. Em PERFIL-Z, temporizadores e callbacks de assinatura ainda
disparam deteccao de mudanca. Em PERFIL-ZL nao disparam: o estado precisa ser signal, ou o
evento precisa vir do template.

---

## 1. Regras nao negociaveis

| Nunca gere | Sempre gere |
|---|---|
| NgModule, declarations, imports de modulo | componente standalone; nao escreva a propriedade standalone, ela ja e o padrao |
| decorator Input | funcao input, ou input.required quando obrigatorio |
| decorator Output com EventEmitter | funcao output |
| entrada mais saida para simular two-way | funcao model |
| decorators ViewChild e ContentChild | funcoes viewChild, viewChildren, contentChild, contentChildren |
| dependencia declarada no construtor | campo com inject, marcado como readonly |
| diretivas estruturais com asterisco e ngSwitch | blocos embutidos de condicional, repeticao e selecao |
| ngClass e ngStyle | binding de classe e de estilo, individual ou por objeto |
| chamada de subscribe dentro de componente | conversao de observable para signal, recurso HTTP declarativo, ou pipe assincrono no template |
| ngOnChanges para reagir a entrada | valor derivado com computed, ou efeito quando houver saida imperativa |
| campo mutavel com marcacao manual de verificacao | signal |
| estrategia de deteccao padrao | OnPush, obrigatorio; em PERFIL-ZL e o unico modo coerente |
| tipo any | tipo explicito, ou unknown com estreitamento |

## 2. Status das APIs na versao 21

Estavel, use livremente: signal, computed, effect, linkedSignal, input, output, model,
viewChild, contentChild, inject, conversao entre signal e observable nos dois sentidos,
blocos embutidos de controle de fluxo, bloco de carregamento adiado, ganchos de pos
renderizacao, provider de deteccao sem zona, e recurso HTTP declarativo.

Pre-visualizacao para desenvolvedores, use apenas se o projeto ja usar, e sinalize:
biblioteca de primitivas acessiveis do Angular.

Experimental, nao use sem autorizacao explicita do usuario: formularios baseados em
signals. A API pode mudar antes de estabilizar. Para formularios, mantenha a abordagem
reativa tipada ate que o time decida migrar.

Quando houver duvida sobre o status de uma API na versao exata do projeto, consulte o
servidor MCP oficial do Angular, que filtra a documentacao pela versao instalada. Nao
responda com base em memoria: a diferenca entre estavel e experimental muda a decisao.

## 3. Regras de reatividade

1. Use valor derivado para qualquer coisa calculavel a partir de outros signals. Se voce
   escreveu um efeito cujo unico trabalho e atribuir a outro signal, era um valor derivado
   ou um signal vinculado.
2. Efeito serve apenas para saida do sistema reativo: log, armazenamento, integracao
   imperativa com API de terceiro, foco de elemento. Nunca para orquestrar fluxo de dados.
3. Signal exposto por service e somente leitura para fora. Guarde o signal gravavel como
   privado e exponha a versao somente leitura ou um valor derivado.
4. Use signal vinculado quando o estado local precisa ser reinicializado por uma fonte
   externa, preservando a possibilidade de escrita local.
5. Leitura sem criar dependencia existe, mas se voce precisa dela com frequencia o desenho
   da reatividade esta errado. Trate como sinal de alerta, nao como ferramenta cotidiana.

## 4. Protocolo de migracao

Ao modernizar codigo existente, prefira o schematic oficial ao rewrite manual. Os
disponiveis no pacote @angular/core cobrem: controle de fluxo em template, migracao de
entradas para signal, migracao de saidas, migracao de consultas de view e de conteudo,
migracao de injecao por construtor, conversao para standalone e limpeza de imports nao
utilizados.

O schematic e deterministico, cobre o repositorio inteiro e nao consome token. Rewrite
manual arquivo a arquivo e mais caro e introduz erro. Reescreva a mao apenas o que o
schematic nao cobre, e diga explicitamente o que foi feito manualmente.

Para migracao a zoneless, o servidor MCP oficial expoe uma ferramenta que produz um plano
por componente. Use-a antes de propor a migracao, em vez de estimar o esforco no olho.

## 5. Erros frequentes

Leia `references/api-map.md` antes de gerar componente ou template. Ele contem o mapa
legado para moderno, simbolo a simbolo, e as armadilhas de repeticao com rastreio, de
entrada obrigatoria, de contexto de injecao e de recurso HTTP declarativo.

## 6. Auto-verificacao antes de responder

- Declarei o perfil, PERFIL-Z ou PERFIL-ZL?
- Zero ocorrencias de diretiva estrutural com asterisco, ngClass, ngStyle, NgModule e
  decorators de entrada ou saida?
- Toda repeticao declara a expressao de rastreio?
- Todo componente usa deteccao OnPush?
- Nenhuma chamada de subscribe dentro de componente?
- Nenhum efeito cujo unico trabalho e escrever em outro signal?
- Nenhuma API experimental usada sem autorizacao?
