# Como juntar a camada de specs aos prompts existentes

Arquivo de instrução, não é artefato do toolkit. Não copie para `.github/`.

## 1. Colocar a referência

Salve `specs-e-deltas.md` em `.github/skills/sdd-workflow/references/specs-e-deltas.md`.

Crie `.sdd/specs/index.md` com um cabeçalho e uma tabela vazia de três colunas: capacidade,
descrição, arquivo. Sem isso, o primeiro `/sdd-plan` não tem o que ler e vai parar.

## 2. Uma linha no SKILL.md

No SKILL.md do `sdd-workflow`, na seção que lista as referências disponíveis, acrescente uma
entrada apontando `references/specs-e-deltas.md` e dizendo que ela é lida apenas quando a
mudança consulta ou altera comportamento registrado. O SKILL.md não deve descrever o formato de
delta — isso duplicaria a referência.

## 3. sdd-plan.prompt.md

Substitua o Passo 3 inteiro (Consultar o historico) por este texto:

---

## Passo 3 - Consultar o estado atual e o historico

Leia `.sdd/specs/index.md`. Identifique quais capacidades esta mudanca toca e leia o
`spec.md` apenas dessas. Nao leia capacidade que a mudanca nao altera nem consulta.

Se o indice nao existir, informe que a camada de specs nao foi inicializada e siga sem ela;
nao crie o indice por conta propria no meio de um plano.

Liste `.sdd/changes/`, exceto archive. Se ja houver mudanca aberta relacionada, refine a
existente em vez de criar outra, e diga isso na primeira linha da resposta.

Depois, apenas se houver archive, verifique nomes de pasta em `.sdd/changes/archive/` que
citem o mesmo dominio desta mudanca, e leia somente a proposta dessas. Nao abra o archive
inteiro e nao leia mudanca cujo nome nao tenha relacao obvia. Se o archive estiver vazio ou
sem correspondencia de nome, pule este passo sem ler nada.

O `specs/` diz como o sistema se comporta hoje; o archive diz por que chegou nesse ponto. Se
voce so precisa saber o comportamento atual, o indice e as capacidades bastam, e o archive
pode ser pulado inteiro.

---

No Passo 6 (Gerar), acrescente ao final, antes do paragrafo sobre criterios verificaveis:

---

Se a mudanca altera comportamento observavel, crie tambem `deltas.md` seguindo
`.github/skills/sdd-workflow/references/specs-e-deltas.md`. Escreva o texto final de cada
requisito, nao um resumo da intencao: quem aplica o delta e um modelo barato que copia
literalmente, sem reinterpretar.

Todo criterio de aceite que descreve comportamento novo ou alterado precisa ter delta
correspondente. Mudanca puramente interna, como refatoracao sem efeito observavel, nao gera
delta — e declarar isso em uma linha na proposta e melhor do que deixar a ausencia implicita.

---

Na Saida, acrescente ao final da lista: capacidades lidas e capacidades afetadas por delta.

## 4. sdd-review.prompt.md

No Passo 0, troque a linha de leitura por: leia o SKILL.md, depois a proposta, as tarefas e,
se existir, `deltas.md` da mudanca.

Acrescente um passo novo entre o Passo 2 (Higiene) e o Passo 3 (Verificacoes disponiveis):

---

## Passo 2.5 - Conferir os deltas

Se a mudanca tem `deltas.md`, confira nos dois sentidos:

Todo criterio de aceite que descreve comportamento observavel novo ou alterado tem delta
correspondente. Criterio sem delta significa comportamento que sera esquecido no proximo
plano, porque nao vai existir em `specs/`.

Todo delta corresponde a um criterio de aceite. Delta sem criterio e escopo entrando pela
porta dos fundos, sem ter passado por aprovacao.

Confira tambem que cada alvo `REQ-...` citado em operacao de substituir ou remover existe hoje
no `spec.md` da capacidade. Alvo inexistente significa que o delta foi escrito contra um estado
que ja mudou, e a aplicacao vai falhar no arquivamento.

Isto e verificacao de consistencia entre documentos, nao de codigo. Nao altere nenhum dos dois.

---

Na regra final, acrescente delta ausente ou com alvo inexistente à lista do que resulta em
REPROVADO.

## 5. sdd-archive.prompt.md

Acrescente um passo entre o Passo 1 (Pre-condicoes) e o Passo 2 (Mover):

---

## Passo 1.5 - Aplicar os deltas

Se a mudanca tem `deltas.md`, leia
`.github/skills/sdd-workflow/references/specs-e-deltas.md` e aplique cada operacao.

Copie o texto do delta literalmente para o `spec.md` da capacidade. Nao reescreva, nao ajuste
estilo, nao renumere requisito que voce nao tocou. Para adicionar, atribua o proximo numero
livre da sequencia daquela capacidade. Para capacidade nova, crie a pasta, o arquivo e a linha
no indice.

Se um alvo de substituir ou remover nao existir, pare e reporte sem arquivar e sem aplicar
nenhuma outra operacao. Aplicacao parcial deixa o `specs/` num estado que ninguem consegue
reconstruir.

---

No Passo 1, acrescente uma pre-condicao: a mudanca recebeu veredito aprovado no `/sdd-review`.
Aplicar delta de mudanca reprovada registra como verdade um comportamento que foi rejeitado.

Na Saida, acrescente: capacidades alteradas e quantidade de operacoes aplicadas por tipo.
