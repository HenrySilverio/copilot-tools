---
agent: agent
model: Claude Sonnet 5 (copilot)
tools: ['readFile', 'search', 'createFile', 'editFiles']
description: SDD - transforma um briefing em proposta, tarefas e deltas de especificação.
---

# /sdd-plan

Transformar um briefing em acordo escrito, antes de qualquer linha de código.

## Entradas

Briefing: ${input:briefing:Caminho do arquivo em docs/briefings/}

Contexto adicional: ${input:contexto:Caminhos separados por vírgula, ou vazio}

## Passo 0 - Contrato

Leia `.github/skills/sdd-workflow/SKILL.md`.

Se o briefing vier vazio ou apontar para arquivo inexistente, pare e peça o caminho. Não
invente o conteúdo do pedido.

## Passo 1 - Ler as entradas

Leia o briefing inteiro. Depois leia os caminhos de contexto adicional, se houver.

Não leia código nesta etapa. Código lido antes de o problema estar claro enviesa o plano
para o que já existe e queima contexto que a etapa seguinte vai precisar.

## Passo 2 - Extrair restrições

Liste o que o briefing declara como proibido, intocável ou obrigatório manter compatível.
Essa lista vira a seção de restrições da proposta, transcrita, não parafraseada.

Restrição perdida entre o briefing e a proposta é a falha mais cara do fluxo, porque só
aparece na revisão, quando o código já existe.

## Passo 3 - Estado atual

Leia `.sdd/specs/index.md`.

Decida quais capacidades do índice a mudança toca. Leia o `spec.md` apenas dessas. Nunca
leia `specs/` inteiro.

Se o índice estiver vazio, ou se a capacidade afetada não constar dele, isso significa
"não documentado", nunca "não existe". Nesse caso, e só nesse caso, leia o código dos
caminhos de contexto para entender o comportamento atual.

Antes de escrever qualquer delta, leia `.github/skills/sdd-workflow/references/specs-e-deltas.md`.

## Passo 4 - Histórico

Liste as pastas de `.sdd/changes/`, exceto `archive/`. Se alguma mudança aberta tocar a
mesma capacidade, declare o conflito na proposta em vez de planejar por cima dela.

Consulte `.sdd/changes/archive/` apenas se precisar do motivo de uma decisão anterior, e
só a pasta relevante. O archive é auditoria, não leitura de rotina.

## Passo 5 - Classificar rigor

Aplique a regra de rigor do SKILL.md e declare o resultado, Lite ou Full, com o gatilho
que o justificou. Alterar `specs/` não sobe o rigor.

## Passo 6 - Gerar

Leia `.github/skills/sdd-workflow/references/moldes-artefatos.md`.

Escolha o change-id e crie `.sdd/changes/<change-id>/` com:

1. `briefing.md` — cópia literal do arquivo de briefing, sem edição, sem resumo e sem
   reformatação.
2. `proposta.md` — intenção, escopo, restrições, critérios de aceite.
3. `design.md` — apenas em rigor Full.
4. `tarefas.md` — agrupamentos numerados, agrupamento de Verificação obrigatório.
5. `deltas.md` — apenas se a mudança alterar comportamento observável.

O texto de cada delta é final: ele será copiado para `specs/` no arquivamento sem
reescrita. Se você não consegue escrever o texto final agora, o critério de aceite
correspondente ainda está vago — corrija o critério, não adie o delta.

Não atribua número a requisito novo. O número é alocado na aplicação.

Antes de terminar, confira os portões de qualidade do SKILL.md, incluindo o de cobertura:
todo critério que descreve comportamento novo ou alterado tem delta, e todo delta tem
critério.

## Saída

No máximo quinze linhas: change-id; rigor e gatilho; arquivos criados; capacidades
consultadas; capacidades afetadas pelos deltas, com a contagem por operação; perguntas
em aberto. Não reproduza o conteúdo dos artefatos.

Se houver ambiguidade que impeça um critério de aceite verificável, não escreva nada:
liste as perguntas e pare.
