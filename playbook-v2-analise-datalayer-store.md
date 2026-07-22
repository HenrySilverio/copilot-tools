# Playbook v2 — Análise de dataLayer e SignalStore

Revisado após o `mapa-integracoes.md` real. Correção principal: o critério de "cadeia exclusiva" da v1 era inválido porque a Seção 2 do Kilo mistura infraestrutura com domínio.

---

## Convenções

**Artefatos de INFRAESTRUTURA — nunca contam como acoplamento de domínio:**
`HttpService`, `AppConfigService`, `AuthService`, `RouterService`, `ObjectUtilsService`, `ApiResponseDto`

**Acoplamento de domínio real neste projeto:**
- Entities (`ClienteEntity`, `ContaEntity`, `DividaEntity`, `OfertaEntity`) e `TipoOferta`: cadeia própria + **Confirmacao**. Topologia em estrela, não emaranhado.
- `GenerateSecureIdService`: Contas, Dividas, Ofertas. Único compartilhamento lateral.

**Ordem obrigatória:** Cliente → Contas → Dividas → Ofertas → Cep → **Confirmacao por último**. Confirmacao consome as 4 entities; julgá-la antes de ver o que as cadeias produzem é decidir sem informação.

**Escolha de modelo:**
- **Kilo Code (Fases 0 e 5A):** extração mecânica, não julgamento. Use o modelo mais barato disponível. Não gasta token do Copilot.
- **Copilot (demais fases):** modelo de raciocínio, **o mesmo em todas as sessões**. Classe Claude Sonnet (fallback GPT-5.x reasoning). Troca de modelo entre sessões não quebra nada, mas troca **dentro** da sessão invalida o cache inteiro.
- Confirme os nomes no picker ao vivo — a lista muda e depende da política da sua org.

**Regras de sessão do Copilot:** anexo cumulativo (nunca remova nem reordene) · 4–6 cadeias por sessão · nunca misture dataLayer e Store.

---

## FASE 0 — Mapeamento das integrações

> **Chat:** Kilo Code · **Modelo:** o mais barato · **Sessão:** própria
> *(já executado — `mapa-integracoes.md` em mãos. Reexecutar só se a codebase mudar.)*

```
/graphify

Enumere todos os pontos de integração com o BFF (chamadas HTTP nos services
da camada de dados).

Produza `mapa-integracoes.md`:

## Seção 1 — Pontos de integração
| service | método/endpoint | dtos usados | mappers | models/entities | LOC total da cadeia |

## Seção 2 — Artefatos compartilhados
Todo dto/mapper/model/service que aparece em 2+ cadeias, com contagem.
Separe em duas subseções: INFRAESTRUTURA (http, config, auth, router, utils,
wrappers genéricos de resposta) e DOMÍNIO (entities, enums e services de negócio).

## Seção 3 — Fora de cadeia
Todo arquivo de dataLayer que não aparece em nenhuma cadeia BFF.
Marque com [VIEW] os que são view-model ou enum de UI.

Apenas dados. Zero análise.
```

---

## FASE 1 — Cadeias exclusivas

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Sonnet (pinado) · **Effort:** médio · **Context:** default · **Sessão:** nova

### Turno 1 — ancorar (repetir no início de cada sessão desta fase)

```
#file:mapa-integracoes.md

Não analise ainda.

Desconsidere como acoplamento os artefatos de infraestrutura:
HttpService, AppConfigService, AuthService, RouterService,
ObjectUtilsService, ApiResponseDto.

Com esse critério, confirme: as cadeias Cliente, Contas, Dividas, Ofertas e
Cep compartilham artefatos de DOMÍNIO entre si, ou apenas com Confirmacao?
Liste as exceções.
```

### Turnos 2..6 — uma cadeia por turno, na ordem definida

```
#file:<service>.ts #file:<request>.dto.ts #file:<response>.dto.ts #file:<nome>.mapper.ts #file:<nome>.entity.ts

Cadeia: <nome>.

Trace o fluxo real de dados da cadeia inteira antes de opinar: o que entra do
BFF, o que é transformado, o que chega na feature.

Para CADA bloco com responsabilidade fora de lugar:
- classifique fica / sai / muda de camada
- diga qual princípio quebra
- nomeie o artefato de destino DENTRO desta cadeia, ou aponte que o destino
  não existe

Verifique especificamente:
1. Há mapeamento DTO→entity feito INLINE dentro do service em vez de mapper?
   (a coluna "mappers" vazia no mapa com LOC alto é o marcador)
2. O service injeta LoadingService ou MessageService? Se sim, classifique como
   feedback de UI vazado para a camada de dados e aponte o destino correto
   (interceptor ou feature).
3. O shape do DTO corresponde ao contrato real do endpoint? Divergência é
   achado, não detalhe.

View e facade foram removidas e não voltam. Orquestração multi-domínio vai
para service de feature.

Se a cadeia está sã, diga "sã" e pare. Não proponha abstração que ninguém pediu.
```

**Notas por cadeia:**
- **Cliente** — `cliente.mapper.ts` existe mas está fora de cadeia. Pergunte por que não está plugado.
- **Cep** — 563 LOC para um GET simples. Confirme se é lógica a mais ou erro de contagem do Kilo.

### Turno de fechamento (último de cada sessão)

```
Entre as cadeias analisadas nesta sessão: qual defeito se REPETE?
Defeito recorrente indica ausência estrutural, não erro pontual.
Nomeie a ausência.
```

---

## FASE 1B — Confirmacao

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Sonnet (mesmo) · **Effort:** alto · **Sessão:** nova, só para esta cadeia

Effort alto porque aqui não é classificação contra rubric — é decidir a fronteira de um agregador.

### Turno 1 — contexto das cadeias fonte

```
#file:mapa-integracoes.md

[colar os vereditos da Fase 1]

Não analise ainda. Resuma em uma linha por cadeia o que cada uma PRODUZ
(qual entity, com qual shape) segundo os vereditos acima.
```

### Turno 2 — o agregador

```
#file:confirmacao.service.ts #file:confirmacao-request.dto.ts

ConfirmacaoService: 973 LOC, consome ClienteEntity, ContaEntity, DividaEntity
e OfertaEntity, e não possui mapper.

O ConfirmacaoRequestDto contém blocos que montam informação de oferta, cliente,
contratos e forma de pagamento, além das interfaces próprias.

Para CADA bloco: fica / sai / muda de camada, princípio quebrado, artefato de
destino nomeado.

Distinga explicitamente:
(a) montagem de payload — legítima, mas pertence a mapper ou service de feature,
    não ao DTO
(b) regra de negócio — pertence a service de feature
(c) declaração de shape — única coisa que fica no DTO

View e facade foram removidas e não voltam.
```

### Turno 3 — o buraco de contrato

```
O endpoint POST /efetivar tem response tipado como `unknown`.

É a única cadeia da camada sem contrato de resposta, e é a ação que efetiva a
renegociação.

Avalie o impacto: o que o consumidor faz hoje com esse retorno, e qual o risco
de não haver contrato no ponto de maior consequência da aplicação.
```

---

## FASE 2 — Compartilhamento lateral e fronteira

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Sonnet (mesmo) · **Effort:** alto · **Sessão:** nova

Reduzida a dois turnos: as entities compartilhadas com Confirmacao já saem resolvidas na Fase 1B.

### Turno 1 — GenerateSecureIdService

```
#file:generate-secure-id.service.ts #file:contas.service.ts #file:dividas.service.ts #file:ofertas.service.ts

GenerateSecureIdService é o único compartilhamento lateral de domínio: usado por
Contas, Dividas e Ofertas — e NÃO por Cliente, Confirmacao ou Cep.

Decida entre:
(a) infraestrutura mal posicionada — deveria estar em core/shared e ser usada
    por todas as cadeias
(b) regra de domínio genuína das três cadeias
(c) coincidência estrutural — as três resolvem problemas diferentes com a
    mesma ferramenta

Justifique pela razão de MUDANÇA, não pela semelhança de uso.
Explique por que Cliente, Confirmacao e Cep não precisam dele.
```

### Turno 2 — fronteira MFE ↔ BFF

```
Algum DTO desta camada é gerado a partir da mesma spec consumida pelo BFF, ou
importa tipos de pacote compartilhado com o backend?

Se sim: liste os arquivos e o caminho da dependência. Isso é ponto único de
falha entre MFE e BFF e trava deploy independente — reporte separado do resto.
```

---

## FASE 3 — Fora de cadeia

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Sonnet (mesmo) · **Effort:** baixo · **Sessão:** nova

Effort baixo: é verificação de uso, não julgamento. "Fora de cadeia BFF" ≠ morto.

```
#file:mapa-integracoes.md

Para cada arquivo da Seção 3, use `usages` e classifique:

- MORTO: nenhum uso em lugar nenhum → deletar
- UI: consumido por componentes/features, não pela camada de dados → não é
  órfão, está apenas fora do escopo desta análise
- RESÍDUO: sobra da camada de view/facade removida → deletar se nada usa
- FUTURO: existe para integração não implementada → confirmar com evidência

Atenção específica:
- `conclusao.service.ts` está em core/services/api mas nenhuma cadeia o alcança.
  É o único caso realmente suspeito — investigue primeiro.
- `cliente.mapper.ts` existe enquanto ClienteService não usa mapper. Verifique
  se foi substituído por mapeamento inline.
- `historico.view.model.ts` e `timeline.stepper.view.model.ts` são candidatos a
  resíduo da camada de view removida.
- Os enums em shared/enum provavelmente são UI. Confirme antes de classificar.

Confirme com `usages` antes de marcar MORTO. Não assuma.
```

---

## FASE 4 — Síntese dataLayer

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Sonnet (mesmo) · **Effort:** alto · **Sessão:** nova, contexto limpo

```
#file:mapa-integracoes.md

[colar os vereditos das Fases 1, 1B, 2 e 3]

Consolide:

1. Quais artefatos/camadas estão AUSENTES e forçam lógica a vazar?
   Ordene por número de cadeias afetadas.
2. Separe os achados em três grupos:
   - SISTÊMICO (afeta 3+ cadeias — ex.: feedback de UI no data layer,
     mapeamento inline)
   - CONCENTRADO (afeta só Confirmacao)
   - PONTUAL (uma cadeia, sem padrão)
3. Qual a ordem de refatoração que maximiza redução de acoplamento por diff?

Justifique por ausência ou acoplamento REAL observado. Nada por simetria de
camadas.
```

---

## FASE 5A — Mapeamento da Store

> **Chat:** Kilo Code · **Modelo:** o mais barato · **Sessão:** própria

```
/graphify

Mapeie RenegociacaoStore.

## Seção 1 — Consumidores
| arquivo | tipo (componente/service/store) | forma de consumo | membros acessados |

`forma de consumo`: inject direto, via facade residual, via outra store.

## Seção 2 — Dependências
O que a Store injeta e chama: services, outras stores, utils.
Para cada um, quais métodos da Store o utilizam.

## Seção 3 — Superfície
Todos os membros públicos (state, computed, methods) e, para cada um, quantos
consumidores distintos o acessam. Marque com 0 os não usados.

Apenas dados. Zero análise.
```

---

## FASE 5B — Revisão da Store

> **Chat:** Copilot · **Agente:** `revisao-signalstore` · **Modelo:** Sonnet (mesmo) · **Effort:** alto · **Sessão:** nova

### Turno 1 — mapa de consumo

```
#file:mapa-store.md

Não analise ainda. Aponte:
- membros com 0 consumidores
- consumidores que acessam 5+ membros (sinal de que a regra mora no consumidor)
- qualquer resíduo de facade ainda vivo
```

### Turno 2 — veredito membro a membro

```
#file:renegociacao.store.ts

Leia withState / withComputed / withMethods inteiros e entenda o fluxo de
estado antes de opinar.

Tabela por membro:
| membro | tipo | veredito | justificativa | trade-off |

`veredito`: FICA / SAI → destino / DELETA
`justificativa`: por que é estado de UI vs. por que é regra de domínio

Facade e view foram removidas e não voltam. Regra de negócio vai para service
de feature.
```

### Turno 3 — regra vazada para os consumidores

```
#file:<consumidores que acessam 5+ membros>

Esses consumidores acessam muitos membros da Store. Verifique se reimplementam
regra que deveria estar em service de feature, ou se compõem estado que a Store
deveria expor pronto como computed.

Distinga: composição de UI (legítima no componente) vs. regra de domínio
(deve sair).
```

### Turno 4 — superfície pública

```
O que a Store expõe hoje que os consumidores não deveriam poder tocar
diretamente? Considere o que virou API pública por acidente, não por decisão.
```

---

## FASE 6 — Síntese Store

> **Chat:** Copilot · **Agente:** `revisao-signalstore` · **Modelo:** Sonnet (mesmo) · **Effort:** alto · **Sessão:** mesma da 5B (cache quente)

```
Consolide:

1. Qual service de feature está ausente e deveria absorver a regra que hoje
   mora na Store?
2. Qual a superfície mínima que a Store deveria expor?
3. Ordem de extração que mantém a aplicação funcionando a cada passo.

Não crie service novo por simetria — só onde a regra não tem casa.
```

---

## FASE 7 — Cruzamento

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Sonnet (mesmo) · **Effort:** alto · **Sessão:** nova
> *Só execute se as Fases 4 e 6 propuserem services de feature que se sobrepõem.*

```
[colar as conclusões da Fase 4 e da Fase 6]

Os services de feature propostos pelas duas análises se sobrepõem?

Se sim: são o mesmo service ou services distintos que compartilham dependência?
Decida pela razão de mudança, não pela semelhança de nome.

Atenção: a Store é de Renegociacao e a cadeia mais problemática é Confirmacao.
Verifique se a regra que sai da Store e a regra que sai do ConfirmacaoRequestDto
são a mesma regra vista de dois lugares.
```
