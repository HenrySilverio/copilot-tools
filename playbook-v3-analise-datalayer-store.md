# Playbook v3 — Análise de dataLayer e SignalStore

Versão executável, com anexos resolvidos a partir do `mapa-integracoes.md` real e estado de progresso.

## Estado

| Fase | Status |
|---|---|
| 0 — Kilo, mapa de integrações | ✅ concluída |
| 1 · Turno 1 — ancoragem | ✅ concluída (agente devolveu pergunta pendente) |
| 1 · Turno 1B — resposta à pendência | ⬜ **próximo** |
| 1 · Turnos 2–6 — cadeias | ⬜ |
| 1B — Confirmacao | ⬜ |
| 2 — Lateral + fronteira | ⬜ |
| 3 — Fora de cadeia | ⬜ |
| 4 — Síntese dataLayer | ⬜ |
| 5A — Kilo, mapa da Store | ⬜ |
| 5B — Revisão da Store | ⬜ |
| 6 — Síntese Store | ⬜ |
| 7 — Cruzamento | ⬜ (condicional) |

---

## Convenções

**Infraestrutura — não conta como acoplamento de domínio:**
`HttpService`, `AppConfigService`, `AuthService`, `RouterService`, `ObjectUtilsService`, `ApiResponseDto`, `LoadingService`, `MessageService`, `TipoMessage`

Os três últimos entraram após questionamento do próprio agente. **Trilha separada:** eles são infra para efeito de contagem, mas a presença de `LoadingService`/`MessageService` nos 6 services de dados é achado próprio (feedback de UI dentro do data layer), avaliado por cadeia.

**Acoplamento de domínio real:**
- Entities + `TipoOferta`: cadeia própria + **Confirmacao**. Topologia em estrela — nenhuma cadeia de origem toca a entity de outra.
- `GenerateSecureIdService`: Contas, Dividas, Ofertas. Único compartilhamento lateral.

**Ordem obrigatória:** Cliente → Contas → Dividas → Ofertas → Cep → **Confirmacao por último**.

**Modelos:**
- **Kilo Code** (Fases 0 e 5A): extração mecânica. Modelo mais barato disponível.
- **Copilot** (demais): Claude Sonnet 5, o mesmo em todas as sessões. Troca dentro da sessão invalida o cache.

**Regras de sessão:** anexo cumulativo, nunca remova nem reordene · 4–6 cadeias por sessão · nunca misture dataLayer e Store.

---

# FASE 1 — Cadeias exclusivas

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Claude Sonnet 5 · **Effort:** médio · **Sessão:** a que já está aberta

## Turno 1 — ancoragem ✅ CONCLUÍDO

*(mantido para referência / reexecução em sessão nova)*

```
#file:mapa-integracoes.md

Não analise ainda.

Desconsidere como acoplamento os artefatos de infraestrutura:
HttpService, AppConfigService, AuthService, RouterService,
ObjectUtilsService, ApiResponseDto, LoadingService, MessageService,
TipoMessage.

Com esse critério, confirme: as cadeias Cliente, Contas, Dividas, Ofertas e
Cep compartilham artefatos de DOMÍNIO entre si, ou apenas com Confirmacao?
Liste as exceções.
```

## Turno 1B — resposta à pendência ⬜ PRÓXIMO

Sem anexo.

```
Trate LoadingService, MessageService e TipoMessage como infraestrutura para
efeito de contagem de acoplamento de domínio — eles não indicam que duas
cadeias compartilham domínio.

Mas registre separadamente: a presença deles nos 6 services de dados é
feedback de UI dentro da camada de dados. Isso é achado próprio, avaliado
por cadeia nos turnos seguintes, não acoplamento entre cadeias.

Confirmado o resto. Prossiga quando eu anexar os arquivos da primeira cadeia.
```

## Bloco de análise — reutilizado em todas as cadeias

Cole este bloco após os anexos de cada cadeia, trocando o nome:

```
Cadeia: <NOME>.

Trace o fluxo real de dados da cadeia inteira antes de opinar: o que entra do
BFF, o que é transformado, o que chega na feature.

Para CADA bloco com responsabilidade fora de lugar:
- classifique fica / sai / muda de camada
- diga qual princípio quebra
- nomeie o artefato de destino DENTRO desta cadeia, ou aponte que o destino
  não existe

Verifique especificamente:
1. Há mapeamento DTO→entity feito INLINE dentro do service em vez de mapper?
2. O service injeta LoadingService ou MessageService? Se sim, classifique como
   feedback de UI vazado para a camada de dados e aponte o destino correto
   (interceptor ou feature).
3. O shape do DTO corresponde ao contrato real do endpoint? Divergência é
   achado, não detalhe.

View e facade foram removidas e não voltam. Orquestração multi-domínio vai
para service de feature.

Se a cadeia está sã, diga "sã" e pare. Não proponha abstração que ninguém pediu.
```

---

## Turno 2 — Cliente

Anexos:
```
#file:cliente.service.ts
#file:cliente-atualizacao-request.dto.ts
#file:cliente-response.dto.ts
#file:cliente.entity.ts
#file:cliente.mapper.ts
#file:api-response.dto.ts
```
> `api-response.dto.ts` **só aqui** — wrapper das 6 cadeias, fica cacheado.
> `cliente.mapper.ts` está fora de cadeia; anexado de propósito.

Bloco de análise com `Cadeia: Cliente` + adendo:

```
Adendo: esta cadeia tem 2 endpoints (carregarCliente GET, atualizarCliente
POST) e 714 LOC. O mapa aponta que ClienteService NÃO usa mapper, mas existe
um cliente.mapper.ts fora de cadeia.

Determine: o mapper foi abandonado e substituído por mapeamento inline, ou
nunca foi plugado? Aponte qual dos dois caminhos é o correto a manter.
```

---

## Turno 3 — Contas

Anexos (GET — sem request DTO):
```
#file:contas.service.ts
#file:listagem-contas-response.dto.ts
#file:contas.mapper.ts
#file:conta.entity.ts
```

Bloco de análise com `Cadeia: Contas` + adendo:

```
Adendo: esta cadeia TEM mapper. Use-a como referência do padrão correto —
descreva em uma linha como o mapeamento está estruturado aqui, para comparação
com as cadeias que não têm mapper.
```

---

## Turno 4 — Dividas

Anexos (GET — sem request DTO):
```
#file:dividas.service.ts
#file:listagem-dividas-response.dto.ts
#file:dividas.mapper.ts
#file:divida.entity.ts
```

Bloco de análise com `Cadeia: Dividas` + adendo:

```
Adendo: 1160 LOC — a maior cadeia da camada, e tem mapper. Se o mapeamento
está no lugar certo, explique de onde vem o volume: regra de negócio no
service, tratamento de erro repetido, ou transformação legítima?
```

---

## Turno 5 — Ofertas

Anexos:
```
#file:ofertas.service.ts
#file:oferta-predefinida-request.dto.ts
#file:oferta-personalizada-request.dto.ts
#file:oferta-response.dto.ts
#file:ofertas.mapper.ts
#file:oferta.entity.ts
#file:tipo-oferta.ts
```

Bloco de análise com `Cadeia: Ofertas` + adendo:

```
Adendo: dois endpoints (predefinida e personalizada) com requests distintos e
o MESMO OfertaResponseDto.

Verifique se o response tem de fato o mesmo shape nos dois casos, ou se o DTO
foi alargado com campos opcionais para servir aos dois. Se for o segundo:
classifique como perda de contrato — o consumidor não consegue saber o que vem
preenchido — e proponha a separação.
```

---

## Turno 6 — Cep

Anexos (sem request DTO, sem mapper, sem entity):
```
#file:cep.service.ts
#file:cep-response.dto.ts
```

Bloco de análise com `Cadeia: Cep` + adendo:

```
Adendo: 563 LOC para um GET de consulta de CEP, sem mapper e sem entity.

Explique onde está esse volume. Candidatos: validação/formatação de CEP,
cache local, tratamento de erro, regra de endereço. Classifique cada bloco
encontrado — o que é responsabilidade legítima de um service de consulta e
o que deveria estar em util ou na feature.
```

---

## Turno 7 — Fechamento da sessão

```
Entre as 5 cadeias analisadas: qual defeito se REPETE?

Separe:
- defeito em 4+ cadeias → ausência estrutural, nomeie a ausência
- defeito em 2–3 cadeias → padrão parcial, diga o que as diferencia
- defeito em 1 cadeia → pontual

Consolide também o achado de LoadingService/MessageService: em quantas cadeias
apareceu e qual o destino único proposto.
```

---

# FASE 1B — Confirmacao

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Claude Sonnet 5 · **Effort:** **alto** · **Sessão:** NOVA

Effort alto: não é classificação contra rubric, é decidir a fronteira de um agregador.

## Turno 1 — contexto das cadeias fonte

```
#file:mapa-integracoes.md

[colar os vereditos da Fase 1]

Não analise ainda. Resuma em uma linha por cadeia o que cada uma PRODUZ
(qual entity, com qual shape) segundo os vereditos acima.
```

## Turno 2 — o agregador

```
#file:confirmacao.service.ts
#file:confirmacao-request.dto.ts
#file:cliente.entity.ts
#file:conta.entity.ts
#file:divida.entity.ts
#file:oferta.entity.ts

ConfirmacaoService: 973 LOC, consome ClienteEntity, ContaEntity, DividaEntity
e OfertaEntity, e não possui mapper.

O ConfirmacaoRequestDto contém blocos que montam informação de oferta, cliente,
contratos e forma de pagamento, além das interfaces próprias.

Para CADA bloco: fica / sai / muda de camada, princípio quebrado, artefato de
destino nomeado.

Distinga explicitamente:
(a) montagem de payload — legítima, mas pertence a mapper ou service de
    feature, não ao DTO
(b) regra de negócio — pertence a service de feature
(c) declaração de shape — única coisa que fica no DTO

View e facade foram removidas e não voltam.
```

## Turno 3 — o buraco de contrato

```
O endpoint POST /efetivar tem response tipado como `unknown`.

É a única cadeia da camada sem contrato de resposta, e é a ação que efetiva a
renegociação.

Avalie: o que o consumidor faz hoje com esse retorno, e qual o risco de não
haver contrato no ponto de maior consequência da aplicação.
```

---

# FASE 2 — Lateral e fronteira

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Claude Sonnet 5 · **Effort:** alto · **Sessão:** NOVA

## Turno 1 — GenerateSecureIdService

```
#file:generate-secure-id.service.ts
#file:contas.service.ts
#file:dividas.service.ts
#file:ofertas.service.ts

GenerateSecureIdService é o único compartilhamento lateral de domínio: usado
por Contas, Dividas e Ofertas — e NÃO por Cliente, Confirmacao ou Cep.

Decida entre:
(a) infraestrutura mal posicionada — deveria estar em core/shared e servir
    todas as cadeias
(b) regra de domínio genuína das três cadeias
(c) coincidência estrutural — três problemas diferentes resolvidos com a
    mesma ferramenta

Justifique pela razão de MUDANÇA, não pela semelhança de uso.
Explique por que Cliente, Confirmacao e Cep não precisam dele.
```

## Turno 2 — fronteira MFE ↔ BFF

```
Algum DTO desta camada é gerado a partir da mesma spec consumida pelo BFF, ou
importa tipos de pacote compartilhado com o backend?

Se sim: liste os arquivos e o caminho da dependência. Isso é ponto único de
falha entre MFE e BFF e trava deploy independente — reporte separado do resto.
```

---

# FASE 3 — Fora de cadeia

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Claude Sonnet 5 · **Effort:** **baixo** · **Sessão:** NOVA

Verificação de uso, não julgamento. "Fora de cadeia BFF" ≠ morto.

```
#file:mapa-integracoes.md

Para cada arquivo da Seção 3, use `usages` e classifique:

- MORTO: nenhum uso em lugar nenhum → deletar
- UI: consumido por componentes/features → fora do escopo desta análise
- RESÍDUO: sobra da camada de view/facade removida → deletar se nada usa
- FUTURO: existe para integração não implementada → confirmar com evidência

Atenção específica:
- `conclusao.service.ts` está em core/services/api mas nenhuma cadeia o
  alcança. É o único caso realmente suspeito — investigue primeiro.
- `cliente.mapper.ts` — já analisado na Fase 1; use aquele veredito.
- `negociacao.entity.ts` e `historico.entity.ts` são entities sem cadeia:
  domínio modelado e não integrado, ou resíduo?
- `historico.view.model.ts` e `timeline.stepper.view.model.ts` são candidatos
  fortes a resíduo da camada de view removida.
- Os enums em shared/enum provavelmente são UI. Confirme antes de classificar.
- `monitoramento-dynatrace.service.ts` e `monitoramento-gtm.service.ts` são
  telemetria: confirme se são chamados de componentes ou se estão realmente
  desligados.

Confirme com `usages` antes de marcar MORTO. Não assuma.
```

---

# FASE 4 — Síntese dataLayer

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Claude Sonnet 5 · **Effort:** alto · **Sessão:** NOVA, contexto limpo

```
#file:mapa-integracoes.md

[colar os vereditos das Fases 1, 1B, 2 e 3]

Consolide:

1. Quais artefatos/camadas estão AUSENTES e forçam lógica a vazar?
   Ordene por número de cadeias afetadas.

2. Separe os achados em três grupos:
   - SISTÊMICO (3+ cadeias) — ex.: feedback de UI no data layer, mapeamento
     inline
   - CONCENTRADO (só Confirmacao)
   - PONTUAL (uma cadeia, sem padrão)

3. Qual a ordem de refatoração que maximiza redução de acoplamento por diff?
   Considere que o sistêmico costuma ser mais barato de corrigir que o
   concentrado, mesmo afetando mais arquivos.

Justifique por ausência ou acoplamento REAL observado. Nada por simetria.
```

---

# FASE 5A — Mapa da Store

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

# FASE 5B — Revisão da Store

> **Chat:** Copilot · **Agente:** `revisao-signalstore` · **Modelo:** Claude Sonnet 5 · **Effort:** alto · **Sessão:** NOVA

## Turno 1 — mapa de consumo

```
#file:mapa-store.md

Não analise ainda. Aponte:
- membros com 0 consumidores
- consumidores que acessam 5+ membros (sinal de que a regra mora no consumidor)
- qualquer resíduo de facade ainda vivo
```

## Turno 2 — veredito membro a membro

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

## Turno 3 — regra vazada para os consumidores

```
#file:<consumidores que acessam 5+ membros>

Esses consumidores acessam muitos membros da Store. Verifique se reimplementam
regra que deveria estar em service de feature, ou se compõem estado que a Store
deveria expor pronto como computed.

Distinga: composição de UI (legítima no componente) vs. regra de domínio
(deve sair).
```

## Turno 4 — superfície pública

```
O que a Store expõe hoje que os consumidores não deveriam poder tocar
diretamente? Considere o que virou API pública por acidente, não por decisão.
```

---

# FASE 6 — Síntese Store

> **Chat:** Copilot · **Agente:** `revisao-signalstore` · **Modelo:** Claude Sonnet 5 · **Effort:** alto · **Sessão:** MESMA da 5B (cache quente)

```
Consolide:

1. Qual service de feature está ausente e deveria absorver a regra que hoje
   mora na Store?
2. Qual a superfície mínima que a Store deveria expor?
3. Ordem de extração que mantém a aplicação funcionando a cada passo.

Não crie service novo por simetria — só onde a regra não tem casa.
```

---

# FASE 7 — Cruzamento

> **Chat:** Copilot · **Agente:** `analise-dataLayer` · **Modelo:** Claude Sonnet 5 · **Effort:** alto · **Sessão:** NOVA
> Só execute se as Fases 4 e 6 propuserem services de feature que se sobrepõem.

```
[colar as conclusões da Fase 4 e da Fase 6]

Os services de feature propostos pelas duas análises se sobrepõem?

Se sim: são o mesmo service ou services distintos que compartilham dependência?
Decida pela razão de mudança, não pela semelhança de nome.

Atenção: a Store é de Renegociacao e a cadeia mais problemática é Confirmacao.
Verifique se a regra que sai da Store e a regra que sai do ConfirmacaoRequestDto
são a mesma regra vista de dois lugares.
```
