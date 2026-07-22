---
name: sdd-workflow
description: Fluxo de desenvolvimento guiado por especificacao (SDD) sobre a pasta .sdd/ do repositorio. Use SEMPRE que o pedido envolver planejar, propor, especificar, implementar, revisar, verificar ou arquivar uma mudanca, e sempre que aparecerem os termos proposta, delta, requisito, cenario, tarefas, especificacao, ou os comandos /sdd-plan, /sdd-implement, /sdd-review, /sdd-archive. Use tambem quando alguem pedir "cria a feature X" sem que exista especificacao: a resposta correta e abrir a proposta antes de escrever codigo.
---

# SDD - Contrato de fluxo

Fonte unica de verdade do fluxo spec-driven deste toolkit. Os prompts /sdd-plan,
/sdd-implement, /sdd-review e /sdd-archive sao apenas invocadores finos deste contrato.

## Escopo

Cobre processo e artefatos. Nao cobre stack, framework, padroes de codigo nem testes.
Regras tecnicas vem das instructions do projeto e de outras skills, nunca daqui.

## Dependencias

Nenhuma. O fluxo e autocontido: pastas e arquivos markdown, sem CLI, sem instalacao,
sem ferramenta externa. Ninguem no time precisa aprender nada alem dos quatro comandos.

---

## 1. Estrutura canonica

Raiz do repositorio, pasta `.sdd/`:

- `.sdd/projeto.md` - contexto do projeto. Opcional, no maximo uma pagina.
- `.sdd/specs/` - fonte de verdade: como o sistema se comporta hoje.
  - `.sdd/specs/<dominio>/spec.md` - um arquivo por dominio.
- `.sdd/changes/` - mudancas em andamento.
  - `.sdd/changes/<change-id>/proposta.md` - por que e o que.
  - `.sdd/changes/<change-id>/specs/<dominio>/spec.md` - delta da mudanca.
  - `.sdd/changes/<change-id>/design.md` - como. Opcional, so em rigor Full.
  - `.sdd/changes/<change-id>/tarefas.md` - checklist de implementacao.
- `.sdd/changes/archive/AAAA-MM-DD-<change-id>/` - mudancas concluidas.

Invariantes:

- `.sdd/specs/` descreve o comportamento atual. Nunca e editado por /sdd-plan nem por
  /sdd-implement. So muda no archive.
- `.sdd/changes/<id>/specs/` contem delta, nunca a especificacao inteira.
- Cada mudanca e autocontida. Duas mudancas podem tocar o mesmo dominio em paralelo desde
  que alterem requisitos diferentes.
- Tudo em `.sdd/` e versionado no git, no mesmo commit da implementacao correspondente.

## 2. Identificador da mudanca

Chamado de change-id. Formato kebab-case, comecando por verbo, no maximo quatro palavras.

Aceitavel: adicionar-segundo-fator, corrigir-timeout-sessao, refatorar-cliente-pagamento.
Recusado: feature-1, chave de ticket como id, melhorias, ajustes-do-time.

Se existir chave de issue ou ticket, ela vai dentro de `proposta.md`, nunca no id.

## 3. Artefatos e suas fronteiras

| Artefato | Contem | Nunca contem |
|---|---|---|
| proposta.md | intencao, escopo dentro e fora, abordagem em um paragrafo | codigo, nome de classe, cronograma |
| specs/<dominio>/spec.md | requisitos e cenarios observaveis | nome de arquivo, biblioteca, passo a passo |
| design.md | decisoes tecnicas com alternativas descartadas | requisitos de negocio |
| tarefas.md | checklist numerado e verificavel | justificativa, que pertence a proposta |

Teste rapido de especificacao: se a implementacao pode mudar sem alterar o texto, o texto
esta no lugar certo. Se voce precisou citar um nome de classe, moveu detalhe de design
para dentro da especificacao. Corrija.

## 4. Rigor progressivo

Padrao e o rigor Lite: requisitos curtos, escopo claro, poucos cenarios de aceite, sem
`design.md`.

Suba para o rigor Full, com `design.md` obrigatorio, apenas quando houver pelo menos um:

- mudanca de contrato entre camadas
- migracao de dados ou operacao irreversivel
- requisito regulatorio, de seguranca ou de privacidade
- mais de um time ou repositorio envolvido

Cerimonia acima do risco e desperdicio de token e de tempo do time.

## 5. Formato de requisitos e deltas

Leia `references/formato-spec.md` antes de escrever qualquer `spec.md`.
Leia `references/moldes-artefatos.md` antes de escrever proposta, design ou tarefas.

Resumo minimo, que nao substitui a leitura:

- Cada requisito e um cabecalho de nivel tres iniciado por Requirement, seguido de uma
  frase normativa com SHALL, MUST, SHOULD ou MAY.
- Cada requisito tem pelo menos um cenario, em cabecalho de nivel quatro iniciado por
  Scenario, no formato GIVEN, WHEN, THEN.
- No delta, os requisitos ficam sob uma das tres secoes de nivel dois: adicionados,
  modificados ou removidos, com os rotulos exatos definidos na referencia.

## 6. Portoes de qualidade

Antes de encerrar qualquer etapa, verifique:

- Todo requisito tem no minimo um cenario.
- Todo cenario e verificavel, ou seja, daria para escrever um teste automatizado a partir dele.
- O delta so referencia dominios que existem em `.sdd/specs/` ou que estao sendo criados
  nesta mudanca.
- Requisito modificado esta reescrito por inteiro, no estado final, e nao apenas na parte
  que mudou.
- Nenhuma tarefa sem criterio de conclusao observavel.

## 7. Limites de comportamento

- Nao escreva codigo de producao durante /sdd-plan.
- Nao edite proposta ou especificacao durante /sdd-implement sem declarar explicitamente
  que a implementacao revelou premissa errada. Nesse caso, pare e reporte antes de seguir.
- Nao marque tarefa como concluida sem evidencia: comando executado ou arquivo alterado.
- Ambiguidade nao se resolve por suposicao. Liste as perguntas e pare.
- Nao crie, renomeie nem apague nada fora de `.sdd/` durante planejamento e arquivamento.
