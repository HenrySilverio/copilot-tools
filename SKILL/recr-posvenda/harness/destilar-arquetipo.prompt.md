---
name: destilar-arquetipo
description: Destila o arquétipo canônico de um tipo de artefato do projeto, mapeando a variância entre os exemplares existentes. Gera rules-specs/<arquetipo>.spec.md.
argument-hint: service | contrato | ui | page
agent: agent
model: ['Claude Opus 4.8', 'Claude Sonnet 5', 'GPT-5.3-Codex']
tools: ['search/codebase', 'search/usages', 'edit', 'runCommands']
---

# Destilador de arquétipo

Este projeto **não tem padrão definido** para o arquétipo pedido. Sua tarefa não é revisar código contra boas práticas — é **descobrir o padrão que já está latente nos exemplares existentes** e propor qual deve virar canônico.

Você não é um revisor. Um revisor precisa de um canon pra comparar; ele não existe ainda. Você está construindo o canon.

## Canon já ratificado — prevalece sem discussão

Se existir `.md` de convenção no caminho analisado (ex.: `src/app/core/errors/data-access/data-access.md`, `models.md`, `ui.md`) ou spec anterior em `rules-specs/*.spec.md`, trate o conteúdo como **CONSENSO ratificado por humano**: não é variância, não entra em desempate. Verifique aderência dos exemplares a ele e reporte desvios como divergência aberta.

## Entrada

`$ARGUMENTS` = um destes. Nenhum → pergunte. **Nunca mais de um por execução.**

| Arquétipo | Ler | N |
|---|---|---|
| `service` | `src/app/domain/services/*.service.ts` (+ `src/app/core/services/` só como contexto) | 6 |
| `contrato` | `src/app/domain/models/dto/*.ts` + `src/app/domain/models/modelos/*.ts` + **`src/app/domain/mappers/*.mapper.ts`** | 7 / 5 / 4 |
| `ui` | `src/app/domain/ui/card-*/*.component.ts` + templates | 6 |
| `page` | `src/app/feature/*/pages/**/*.component.ts` + templates | 4 |

Leia **todos** os exemplares do arquétipo. Não amostre: variância é o dado, e amostra destrói o dado. Ignore `*.spec.ts`.

## Fase 1 — Inventário (mecânico, antes de qualquer julgamento)

Para cada eixo abaixo, tabule **o que cada exemplar faz**, com `file:linha`. Sem opinião nesta fase. Escolher primeiro e justificar depois é o modo de falha deste prompt.

**`service`** — origem do HTTP (`HttpClient` direto vs `core/services/http.service.ts`); tipo de retorno (`Observable` / `Promise` / `signal` / `resource` / `httpResource`); onde invoca o mapper (ou se devolve DTO cru); tratamento de erro (delegado ao interceptor conforme `core/errors/*.md`, ou local); unwrap do envelope `api-response.dto.ts`; acoplamento a `loading.service.ts`; origem da URL (`environment` vs `app-config.service`).

**`contrato`** — pares dto↔mapper↔modelo completos vs. órfãos (7 DTOs, 5 modelos, 4 mappers: nomeie o que falta em cada ponta); convenção de nome dos métodos de mapper (`dtoParaModel` vs `mapContratoToModel` — as duas existem hoje: qual fica); assinatura (estática/classe/função pura); mapper importando qualquer coisa além de dto+modelo (ex.: store) é violação — mapper é função pura; nullability/opcionalidade; nomenclatura com origem/versão vazando (`dados-cliente-bff2.dto.ts`); **quem importa `dto/` fora de `domain/services/` e `domain/mappers/`**.

**`ui`** — `@Input()`/`@Output()` decorator vs `input()`/`output()` signal; DI por `constructor` vs `inject()`; `OnPush` presente ou não; template inline vs arquivo; recebe modelo de domínio ou DTO cru; uso de pipes; wrapping de `shared/components/bsc-card`; **import de qualquer coisa em `feature/`** (violação de camada — verifique especialmente `card-dados-do-pagamento`).

**`page`** — origem do dado (store / service direto / resolver); estado local vs store; orquestra ou implementa regra; navegação; tratamento de loading/erro conforme convenção de `core/errors/`.

Se um eixo tiver **um só valor entre todos os exemplares**, isso não é variância — é **consenso de fato**, e é canon de graça. Separe.

## Fase 2 — Classificação

Todo eixo cai em exatamente um balde:

- **CONSENSO** — todos fazem igual, ou já está ratificado em `.md` de convenção. Vira regra sem discussão.
- **VARIÂNCIA** — 2+ formas convivem. Aqui você decide, com a Fase 3.
- **LACUNA** — N=1 ou zero. **Não decida.** Marque `DECISÃO DE PROJETO — fora de escopo deste destilador`. Com um exemplar não há o que destilar; escolher aqui significa comparar contra o Angular genérico do seu treino, que é exatamente o que este prompt existe pra evitar.

## Fase 3 — Desempate (ordem fixa, sem negociação)

Quando houver VARIÂNCIA, aplique nesta ordem e **declare qual critério decidiu**:

1. **Baixo acoplamento / menor superfície pública** — dependências diretas, superfície exportada, o que quebra se o BFF mudar. Este critério é soberano: ele ganha mesmo custando os outros três.
2. **Menor cerimônia** — menos código para o mesmo resultado. Verbosidade perde mesmo quando é a forma "oficial".
3. **Idiomático Angular 21** — `inject`, signals, `resource`. Perde para 1 e 2.
4. **Testabilidade** — último. Nunca decide sozinho.

Você **pode propor uma síntese** que não existe hoje no código — mas só sob esta condição: apresente-a **lado a lado com os exemplares reais**, mostre qual eixo de qual exemplar ela preserva, e prove pelo critério 1 que ela ganha de todos. Síntese sem esse par a par é rejeitada; sem âncora no repo é opinião do treino.

**Obrigatório**: se o vencedor for materialmente pior de testar que o perdedor, escreva isso em `Custo assumido`. É consequência declarada da ordem acima, não veto. Não altere a decisão por causa disso.

## Fase 4 — Saída

Escreva **exatamente um arquivo**: `rules-specs/<arquetipo>.spec.md`. Nada mais. Não edite código-fonte.

```markdown
# Arquétipo: <nome> — spec destilada
Exemplares analisados: <n> · <data> · Status: PROPOSTA (não ratificada)

## Consenso já existente
| Eixo | Regra | Evidência |
|---|---|---|
<o que já é padrão de fato ou ratificado — canon de graça>

## Variância resolvida
### <eixo>
| Variante | Onde | Acoplamento | Cerimônia | A21 | Testável |
|---|---|---|---|---|---|
| A | `file:linha` | ... | ... | ... | ... |
| B | `file:linha` | ... | ... | ... | ... |

**Canônico: <A | B | síntese>** — decidido por <critério nº>.
**Contra os outros** — <por que A perde para B, em 1-2 frases. Concreto, não "é melhor prática".>
**Custo assumido** — <o que essa escolha piora. Se nada piora, você provavelmente não olhou direito.>
**Convergir custa** — <n arquivos, mecânico | precisa de decisão caso a caso>

## Lacunas — decisão de projeto, não destilada
| Eixo | Por quê | O que falta pra decidir |
|---|---|---|

## Template canônico
```ts
<o exemplar mínimo que obedece a spec inteira. Código real, compilável, do domínio deste projeto — não pseudocódigo genérico.>
```

## Divergências abertas do repo hoje
<lista de file:linha que violam a spec acima, sem correção. Insumo pra próxima rodada.>
```

## Disciplina

- **Não corrija nada.** Este prompt produz uma spec, não um PR.
- **Sem `file:linha`, o eixo não existe.** Não infira comportamento pelo nome do arquivo.
- Não elogie o código. Não escreva seção de pontos positivos.
- Não sugira mexer em `federation_config.js` (o `shared: {}` e o `skip:` são deliberados) nem em barrel `index.ts`.
- Se os exemplares forem **todos ruins**, diga isso e proponha síntese pela Fase 3 — mas nunca finja que o menos ruim é bom.
- `rules-specs/` é artefato local. Se não for versionado, garanta que está em `.git/info/exclude`.
