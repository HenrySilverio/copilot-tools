---
name: bff-contract
description: Consulta pontual ao contrato OpenAPI do BFF, um unico arquivo yaml com todos os endpoints, localizado em contracts/bff/. Use SOMENTE quando a tarefa pedir explicitamente para criar, revisar ou corrigir cliente HTTP contra uma rota do BFF, verificar formato de request ou de response, checar nome de campo de um schema, ou tirar duvida sobre contrato de endpoint especifico. Nao use para tarefas de componente, store, template, teste ou qualquer coisa que nao dependa diretamente do contrato do BFF. Nao carregue nem resuma o arquivo inteiro em nenhuma circunstancia.
---

# Contrato do BFF

## Escopo

Leitura pontual de um contrato OpenAPI existente. Nao cobre geracao automatizada de
cliente, nem modelagem de dominio, nem mapeamento DTO para modelo. Essas etapas, se
existirem no projeto, vem de outra fonte.

## Dependencias

Nenhuma. A fonte de verdade e o proprio arquivo em `contracts/bff/`, nao um resumo
mantido aqui. Esta skill descreve como consultar o arquivo, nao duplica o conteudo dele.

## Por que esta skill existe

O arquivo e um unico yaml com todos os endpoints de um BFF, nao dividido por rota. Sem uma
regra explicita de consulta, o comportamento padrao de um modelo de linguagem e ler o
arquivo inteiro para responder sobre um unico endpoint. Em um contrato com dezenas de rotas
isso custa uma fracao enorme do contexto disponivel para retornar uma fatia minima de
informacao util, e o custo se repete a cada pergunta.

## Regra central: nunca carregar o arquivo inteiro

Antes de abrir o arquivo, tenha clareza sobre qual endpoint, schema ou operacao a tarefa
exige. Se a tarefa nao deixar isso claro, pergunte antes de buscar, em vez de varrer o
arquivo inteiro em busca da secao certa.

Localize a secao relevante por busca textual, nao por leitura sequencial. Procure pelo
caminho da rota tal como aparece no cliente que vai consumi-la, pelo identificador da
operacao, ou pelo nome do schema mencionado no pedido. Restrinja a leitura a essa secao e
aos trechos que ela referencia diretamente.

Quando a secao de uma operacao referenciar um schema declarado em outro ponto do arquivo,
resolva essa referencia isoladamente: localize e leia apenas o schema referenciado, nao a
secao inteira de definicoes. Se esse schema por sua vez referenciar outros, resolva um
nivel de cada vez, e pare assim que tiver o suficiente para responder a tarefa. Expandir a
cadeia inteira de referencias de uma vez reproduz o mesmo problema que a busca pontual
deveria evitar.

Se a tarefa pedir uma visao ampla, como listar todos os endpoints de um recurso ou todos os
schemas relacionados a um dominio, isso e uma excecao explicita e deliberada, nao o
comportamento padrao. Mesmo nesse caso, traga apenas os nomes e as assinaturas, nao o
corpo completo de cada definicao.

## O que extrair de cada consulta

Para uma operacao de endpoint, o necessario costuma ser: o caminho e o metodo, os
parametros de entrada com seus tipos e obrigatoriedade, o formato do corpo de requisicao
quando existir, os codigos de resposta relevantes para o caso de uso e o formato do corpo
de cada resposta considerada.

Para um schema isolado, o necessario costuma ser: os campos, o tipo e a obrigatoriedade de
cada um, e quaisquer restricoes explicitas de valor, formato ou enumeracao.

Traga apenas o que a tarefa em questao precisa. Uma pergunta sobre o formato de resposta
nao exige detalhar os parametros de consulta da mesma operacao.

## Uso do resultado da consulta

O que sai desta consulta e informacao de contrato, para orientar a escrita de um tipo, de
um cliente ou de um mapeamento. Nao e para ser copiado como esta para dentro do codigo de
dominio da aplicacao. Se o projeto tiver uma convencao de mapeamento entre o contrato
externo e o modelo interno, ela continua valendo integralmente aqui: o formato do BFF e
tratado como fronteira externa, isolado atras de um mapeamento, e nunca vira o tipo de
dominio diretamente.

Divergencia entre o que o contrato descreve e o que o codigo existente assume e sinal para
reportar, nao para resolver por suposicao. Se o contrato e o codigo atual discordam sobre
um campo, um formato ou uma obrigatoriedade, aponte a divergencia e pergunte qual e a fonte
correta antes de prosseguir.

## Atualizacao do arquivo

Este arquivo e baixado do provedor de documentacao do BFF e substituido por inteiro quando
o contrato muda no backend. Nao edite o arquivo manualmente, nao remova endpoints dele para
organizar, e nao crie copia parcial em outro lugar do repositorio. Qualquer divisao manual
do arquivo fica obsoleta silenciosamente no proximo download e passa a ser uma segunda
fonte de verdade divergente da primeira.

## Auto-verificacao antes de responder

- A tarefa realmente exige consultar o contrato, ou pode ser resolvida sem ele?
- Identifiquei o endpoint, a operacao ou o schema antes de abrir o arquivo?
- Busquei pela secao especifica em vez de ler o arquivo inteiro?
- Resolvi apenas as referencias necessarias, uma de cada vez?
- O que estou devolvendo e o minimo suficiente para a tarefa, sem excesso de secoes vizinhas?
- Se houver divergencia entre contrato e codigo existente, eu reportei em vez de decidir sozinho?
