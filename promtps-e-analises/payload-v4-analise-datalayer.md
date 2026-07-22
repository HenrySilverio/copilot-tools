## Fase 5 — Spec de refatoração

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Claude Sonnet 5 · **Effort:** alto · **Sessão:** NOVA

O plano decidiu *o quê* e *em que ordem*. Falta *qual arquivo, em qual camada, com qual responsabilidade*. Isso ainda precisa do código à vista — os vereditos têm achado, não assinatura.

**Turno 1 — anexos:**

```
#readFile plano-refatoracao-datalayer.md
#readFile vereditos-datalayer.md
#readFile cliente.mapper.ts
#readFile cliente-atualizacao-request.dto.ts
#readFile ofertas.mapper.ts
#readFile oferta-predefinida-request.dto.ts
#readFile oferta-personalizada-request.dto.ts
#readFile confirmacao-request.dto.ts
#readFile confirmacao.service.ts
```

Dividas fica de fora deste turno — é o passo 5, independente, e entra depois.

**Prompt:**

```
O plano de refatoração já está decidido. Não reavalie prioridade nem proponha
alternativa de ordem.

Produza a especificação dos passos 1 a 4: para cada ARQUIVO a criar, mover ou
alterar, uma ficha no formato abaixo.

### <caminho/do/arquivo.ts> — CRIAR | ALTERAR | DELETAR
- **Camada**: core | domain | feature | shared, e por que essa e não outra
- **Responsabilidade**: uma frase. O que este arquivo passa a ser dono.
- **Membros públicos**: nome e assinatura de cada método/tipo. Só assinatura —
  tipos de entrada e saída, sem corpo.
- **Dependências**: o que injeta ou importa, e o que deixa de injetar
- **Sai de onde**: se é código movido, o arquivo e o membro de origem
- **Por que**: qual acoplamento ou responsabilidade vazada isso resolve. Cite
  o achado do plano, não princípio genérico.

Regras:
- Zero implementação. Assinatura e contrato apenas.
- Não invente artefato que o plano não pediu.
- Se um passo exigir alterar arquivo que o plano não citou (store, consumidor),
  liste explicitamente em uma seção "Impacto colateral" com o motivo.
- Nomes em português, consistentes com a convenção já usada na codebase.

Agrupe por passo do plano (1 a 4), na ordem do plano.
```

**Turno 2 — passo 5:**

```
#readFile dividas.mapper.ts
#readFile divida.entity.ts

Mesmo formato de ficha, para o passo 5 (extração da parte de apresentação do
DividasMapper).

Deixe explícito o critério de corte: o que fica no DividasMapper (DTO↔Entity)
e o que vai para o adapter de apresentação na feature.
```

**Turno 3 — ordem de execução:**

```
Encerre com uma tabela única de todos os arquivos das fichas:

| # | arquivo | ação | camada | passo | depende de |

Ordenada de forma que cada linha possa ser executada sem que a aplicação
quebre — não pela ordem lógica do plano, mas pela ordem em que o compilador
aceita.
```

---

**Sobre não pedir código — está certo, e não é só economia.** Spec em nível de assinatura sobrevive à implementação; código colado em documento apodrece no primeiro ajuste e vira fonte concorrente da verdade. Você já tomou essa decisão antes ao fazer instruções apontarem para templates em vez de duplicá-los. Assinatura é contrato, corpo é detalhe.

**O turno 3 existe por um motivo específico:** a ordem do plano é por alavancagem de acoplamento, não por dependência de compilação. O passo 4 (tipar `ConfirmacaoResponseDto`) depende do `ConfirmacaoFeatureService` do passo 3 existir. Se você seguir a ordem do plano linha a linha sem esse mapa, vai encontrar estado intermediário que não compila — e aí o refactor irreversível do fluxo de efetivação fica pela metade, que é exatamente onde você menos quer isso.