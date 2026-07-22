# Playbook — RenegociacaoStore

Trilha completa, do mapeamento à spec compartilhável. Mesmo arco da camada de dados: mapear → analisar → sintetizar → especificar → consolidar.

**Artefatos produzidos, em ordem:**

| # | Arquivo | Fase | Produzido por |
|---|---|---|---|
| 1 | `mapa-store.md` | A | Kilo Code |
| 2 | `vereditos-store.md` | B | você, colando os blocos VEREDITO |
| 3 | `plano-refatoracao-store.md` | C | você, colando a síntese |
| 4 | `store-refactor.md` | D+E | você, colando as fichas e a tabela |
| 5 | `refatoracao-store-SPEC.md` | F | consolidação final para o time |

---

## ⚠️ Decida isto antes de começar

A refatoração da camada de dados **já altera o `renegociacao.store.ts` em quatro pontos** (linhas 2, 5, 10 e 15 da tabela de ordem de execução do `refatoracao-datalayer-SPEC.md`): trocas de import para `ClienteMapper`/`OfertasMapper`, injeção do `ConfirmacaoFeatureService`, e mudança do bloco `tapResponse` de `confirmarRenegociacao`.

Analisar a Store ignorando isso produz veredito que conflita com trabalho já aprovado.

**Duas opções:**

- **(a) Analisar agora, com a spec da dataLayer em contexto.** Mais rápido, e permite que as duas refatorações sejam planejadas juntas. Risco: parte dos vereditos vira "isso já sai no Passo 3 da dataLayer", ruído a filtrar.
- **(b) Executar a refatoração da dataLayer primeiro, depois analisar a Store.** Vereditos limpos, sem sobreposição. Custo: sequencial, e o `ConfirmacaoFeatureService` nasce sem que você saiba ainda o que mais deveria estar nele.

**Recomendação: (a).** O `ConfirmacaoFeatureService` do Passo 3 é justamente o candidato natural a receber regra que hoje mora na Store. Criá-lo sem essa informação significa mexer nele duas vezes. Este playbook assume (a) — a spec da dataLayer entra como anexo na Fase B.

---

# FASE A — Mapa da Store

> **Chat:** Kilo Code · **Modelo:** o mais barato · **Sessão:** própria
> **Saída:** `mapa-store.md`

```
/graphify

Mapeie RenegociacaoStore (NgRx SignalStore).

## Seção 1 — Consumidores
| arquivo | tipo (componente/service/store/função de módulo) | forma de consumo | membros acessados |

`forma de consumo`: inject direto, via facade residual, via outra store,
via função de nível de módulo.

## Seção 2 — Dependências
O que a Store injeta, importa e chama: services de API, mappers, DTOs, utils,
outras stores. Para cada um, quais membros da Store o utilizam.

## Seção 3 — Superfície
Todos os membros públicos (withState, withComputed, withMethods) e, para cada
um, quantos consumidores distintos o acessam. Marque com 0 os não usados.

## Seção 4 — Funções de nível de módulo
Funções declaradas fora do objeto da store mas que recebem `store` como
parâmetro (padrão `confirmarRenegociacao(store, service)`). Liste nome,
parâmetros e quem chama.

Separe explicitamente INFRAESTRUTURA (HttpService, AppConfigService,
AuthService, RouterService, ObjectUtilsService, LoadingService, MessageService,
TipoMessage) de DOMÍNIO em todas as seções.

Apenas dados. Zero análise.
```

**Revise o arquivo à mão antes de levar ao Copilot.** A Seção 4 existe porque a camada de dados revelou esse padrão no `confirmarRenegociacao` — função fora do objeto que muta o store. Se o Kilo não achar nenhuma, confirme manualmente antes de aceitar.

---

# FASE B — Revisão da Store

> **Chat:** Copilot · **Agente:** `revisao-signalstore` · **Modelo:** Claude Sonnet 5 · **Effort:** alto · **Context:** o menor disponível · **Sessão:** NOVA
> **Saída:** `vereditos-store.md`

## Turno 1 — ancoragem e critério

```
#readFile mapa-store.md
#readFile refatoracao-datalayer-SPEC.md

Não analise ainda.

Contexto: a refatoração da camada de dados já está aprovada e altera esta Store
em quatro pontos (ver seção 4 do SPEC). Trate essas alterações como JÁ FEITAS —
não as reporte como achado novo.

Critério para os próximos turnos:
- INFRAESTRUTURA (não conta como acoplamento de domínio): HttpService,
  AppConfigService, AuthService, RouterService, ObjectUtilsService,
  LoadingService, MessageService, TipoMessage.
- ESTADO DE UI: seleção atual, flags de carregamento/erro, dado assíncrono
  resolvido, passo do fluxo.
- REGRA DE DOMÍNIO: elegibilidade, cálculo, decisão de negócio, validação de
  contrato.

Confirme o critério e aponte, apenas do mapa:
- membros com 0 consumidores
- consumidores que acessam 5+ membros
- funções de nível de módulo que mutam o store
- qualquer resíduo de facade ainda vivo
```

## Turno 2 — veredito membro a membro

```
#readFile renegociacao.store.ts

Leia withState / withComputed / withMethods inteiros e trace o fluxo de estado
de ponta a ponta antes de opinar.

Tabela por membro:
| membro | tipo | veredito | justificativa | trade-off |

`veredito`: FICA / SAI → destino nomeado / DELETA
`justificativa`: por que é estado de UI vs. por que é regra de domínio

Regras:
- View e facade foram removidas e não voltam. Regra de negócio vai para service
  de feature.
- O `ConfirmacaoFeatureService` já será criado pelo Passo 3 da refatoração da
  camada de dados. Se um membro deve sair para ele, diga isso explicitamente em
  vez de propor um service novo.
- Não proponha service novo por simetria — só onde a regra não tem casa.

Encerre com um bloco VEREDITO em markdown, no máximo 20 linhas:
## Superfície da Store
- **Sai**: `membro → destino → princípio quebrado`, um por linha
- **Deleta**: membros sem consumidor
- **Fica**: resumo em uma linha do que sobra
Sem prosa. Esse bloco vai ser arquivado.
```

## Turno 3 — funções de nível de módulo

```
#readFile <arquivos das funções de nível de módulo, se estiverem fora do store.ts>

As funções que recebem `store` como parâmetro e o mutam (padrão
`confirmarRenegociacao(store, service)`) são membros da Store escritos fora
dela, ou orquestração que deveria ser service de feature?

Decida pelo critério: se a função só faz patchState e chama service, é método
da store escrito fora do lugar. Se ela decide algo, é regra e sai.

Mesmo formato de tabela e bloco VEREDITO.
```

## Turno 4 — regra vazada para os consumidores

```
#readFile <consumidores que acessam 5+ membros>

Esses consumidores acessam muitos membros da Store. Verifique se:
(a) reimplementam regra que deveria estar em service de feature
(b) compõem estado que a Store deveria expor pronto como computed
(c) apenas leem estado para renderizar — legítimo

Distinga composição de UI (fica no componente) de regra de domínio (sai).

Bloco VEREDITO ao final.
```

## Turno 5 — superfície pública

```
O que a Store expõe hoje que os consumidores não deveriam poder tocar
diretamente? Considere o que virou API pública por acidente, não por decisão.

Proponha a superfície mínima: o que precisa ser público para os consumidores
reais mapeados, e nada além.

Bloco VEREDITO ao final.
```

**Arquive os cinco blocos VEREDITO em `vereditos-store.md`**, em seções nomeadas: `## Superfície`, `## Funções de módulo`, `## Consumidores`, `## Superfície mínima`.

---

# FASE C — Síntese

> **Chat:** Copilot · **Agente:** `revisao-signalstore` · **Modelo:** Claude Sonnet 5 · **Effort:** alto · **Sessão:** NOVA, contexto limpo
> **Saída:** `plano-refatoracao-store.md`

```
#readFile mapa-store.md
#readFile vereditos-store.md
#readFile refatoracao-datalayer-SPEC.md

Consolide:

1. Qual regra hoje na Store deveria estar em service de feature? Agrupe por
   service de destino. Diga explicitamente o que vai para o
   `ConfirmacaoFeatureService` já previsto e o que exige service novo.

2. Classifique os achados:
   - SISTÊMICO: padrão que se repete em 3+ membros
   - CONCENTRADO: cluster de um único fluxo
   - PONTUAL: membro isolado

3. Qual a superfície mínima que a Store deveria expor?

4. Ordem de extração que mantém a aplicação funcionando a cada passo, e que
   não conflite com a ordem de execução da refatoração da camada de dados.
   Aponte qualquer passo que precise vir depois de um passo daquela.

Justifique por acoplamento ou responsabilidade vazada REAL observada.
Nada por simetria.
```

---

# FASE D — Fichas de refatoração

> **Chat:** Copilot · **Agente:** `revisao-signalstore` · **Modelo:** Claude Sonnet 5 · **Effort:** alto · **Sessão:** NOVA

## Turno 1

```
#readFile plano-refatoracao-store.md
#readFile vereditos-store.md
#readFile renegociacao.store.ts
#readFile refatoracao-datalayer-SPEC.md
#readFile <arquivos dos consumidores que sofrem alteração>

O plano já está decidido. Não reavalie prioridade nem proponha ordem
alternativa.

Produza a especificação: para cada ARQUIVO a criar, mover ou alterar, uma ficha
no formato abaixo.

### <caminho/do/arquivo.ts> — CRIAR | ALTERAR | DELETAR
- **Camada**: core | domain | feature | shared, e por que essa e não outra
- **Responsabilidade**: uma frase. O que este arquivo passa a ser dono.
- **Membros públicos**: nome e assinatura. Só assinatura, sem corpo.
- **Dependências**: o que injeta ou importa, e o que deixa de injetar
- **Sai de onde**: se é código movido, o arquivo e o membro de origem
- **Por que**: qual acoplamento ou responsabilidade vazada isso resolve. Cite o
  achado do plano, não princípio genérico.

Regras:
- Zero implementação.
- Não invente artefato que o plano não pediu.
- Alterações em arquivo que o plano não citou vão em "Impacto colateral", com
  motivo.
- Nomes em português, consistentes com a convenção da codebase.
- Se uma ficha alterar arquivo que a refatoração da camada de dados também
  altera, marque com ⚠️ e diga qual passo daquela spec precisa vir antes.

Agrupe por passo do plano.
```

## Turno 2 — checagem de ciclo

```
Antes da ordem de execução: verifique se alguma ficha cria dependência
circular entre artefatos.

Para cada par de arquivos novos ou alterados, confirme que a dependência é de
mão única. Se algum tipo ou interface for importado nos dois sentidos, corrija
agora declarando shape estrutural próprio no lado consumidor.

Liste explicitamente a direção de dependência de cada par.
```

## Turno 3 — ordem de execução

```
Encerre com uma tabela única de todos os arquivos das fichas:

| # | arquivo | ação | camada | passo | depende de |

Ordenada de forma que cada linha possa ser executada sem que a aplicação
quebre — pela ordem que o compilador aceita, não pela ordem lógica do plano.

Regra: criar/adicionar método → trocar quem chama → só então apagar a origem.

Se alguma linha depender de um passo da refatoração da camada de dados,
referencie explicitamente (ex.: "após dataLayer #9").
```

**Cole tudo em `store-refactor.md`.**

---

# FASE E — Documento final

> **Sem chat.** Montagem manual, ou peça a consolidação em sessão nova.

Estrutura do `refatoracao-store-SPEC.md`, espelhando o da camada de dados:

```markdown
# Refatoração da RenegociacaoStore — especificação

**Status** · **Escopo** · como usar

## 1. O problema em uma página
   Resumo em prosa + <details> com o diagnóstico completo do
   plano-refatoracao-store.md

## 2. A regra de camada (leia antes de implementar)
   Tabela: o que a Store é dona / o que nunca faz.
   As duas perguntas que vão aparecer:
   - por que a regra não fica no computed?
   - por que não volta para facade?

## 3. Os passos
   Fichas da Fase D, agrupadas por passo

## 4. Ordem de execução
   Tabela da Fase D turno 3 + a regra que gerou a ordem

## 5. Pontos de atenção
   Ciclos evitados, mudanças de comportamento, dependências da spec da dataLayer

## 6. Fora deste escopo
   O que ficou de fora e por quê

## 7. Como verificar cada passo
```

**Antes de publicar, confira três coisas** — foram exatamente os defeitos encontrados na consolidação da camada de dados:

1. **Contradição entre arquivos.** Se a Fase D corrigiu algo que a Fase C tinha decidido diferente, a versão corrigida é a que vale — e a armadilha vai em "Pontos de atenção", para ninguém reintroduzir.
2. **Seções fora de ordem.** Blocos colados de turnos diferentes tendem a aterrissar antes do passo a que pertencem.
3. **Meia-correção anunciada como completa.** Se uma ficha "fecha" uma ausência mas deixa parte do problema de pé, diga isso — não deixe o time achar que fechou.
