# Briefing - <assunto em uma linha>

Copie este arquivo, renomeie para o assunto e preencha. Escreva à mão, em português
comum. Não tente escrever critério de aceite aqui: isso é trabalho do `/sdd-plan`.

Um briefing bom cabe em uma página. Se passou disso, provavelmente são duas mudanças.

## Problema

O que está errado ou faltando hoje, e para quem. Descreva o sintoma, não a solução.

> Exemplo: o cliente que chega na tela de confirmação de renegociação consegue clicar em
> confirmar duas vezes quando a rede está lenta, e o backoffice recebe dois acordos para
> o mesmo contrato.

## O que se espera

O comportamento desejado, do ponto de vista de quem usa. Ainda sem detalhe técnico.

> Exemplo: uma segunda confirmação do mesmo contrato não deve gerar um segundo acordo.

## Restrições

O que não pode ser feito, o que não pode ser tocado, o que deve continuar funcionando.
Uma linha cada. Esta é a seção mais importante do arquivo, porque é a que o plano não
consegue inferir sozinho.

> Exemplos:
>
> - O contrato da API de efetivação não pode mudar nesta entrega.
> - Não alterar o fluxo de assinatura, que está em homologação regulatória.
> - Precisa funcionar em navegador sem suporte a armazenamento local.

## Fora do escopo

O que alguém poderia razoavelmente achar que faz parte, mas não faz. Escrever isso aqui
evita a discussão na revisão.

## Contexto útil

Caminhos de arquivo, links de ticket, nome do time dono, qualquer coisa que poupe o
planejamento de procurar. Opcional.

## Prazo e ticket

Se houver. A chave do ticket vai para dentro da proposta, nunca para o change-id.


### Mudança sem alteração de comportamento

Refactor puro não tem comportamento observável novo a descrever. Nesse caso — e só nesse
caso — o critério estrutural é legítimo, e citar arquivo, classe ou função é obrigatório,
porque a estrutura *é* o resultado negociado.

- A frase normativa descreve a propriedade estrutural, não o passo de execução: "o mapper
  de dados expõe apenas a tradução do contrato do BFF", nunca "mover as funções X e Y".
- A verificação tem de ser mecânica: inspeção de imports, ausência de ocorrência numa
  busca, membro público único, checagem de tipos. Verificação que depende de alguém olhar
  e concordar não é verificação.
- Exatamente um critério de preservação de comportamento é obrigatório, e ele exige linha
  de base concreta. "Igual a antes da mudança" não é verificável: no momento da revisão, o
  "antes" não existe mais na árvore de trabalho.
- Critério estrutural que um lint ou um grep de CI consegue verificar deve virar lint ou
  grep. Regra em markdown é cobrada em token toda vez que carrega; regra em código custa
  zero e ainda pega o humano.