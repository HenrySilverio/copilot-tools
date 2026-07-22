# Playbook — Análise de dataLayer e SignalStore

Sequência de prompts para análise arquitetural assistida. Fase 0 e Fase 5A rodam no **Kilo Code** (mapeamento, sem gastar tokens do Copilot). As demais rodam no **Copilot Chat** com agentes read-only.

**Regras de sessão que valem para todas as fases do Copilot:**
- Modelo pinado, o mesmo em todas as sessões. Troca de modelo invalida o cache inteiro.
- Anexo **cumulativo**: adicione `#file` a cada turno, nunca remova nem reordene.
- 4 a 6 cadeias por sessão. Além disso a auto-compactação degrada o julgamento.
- Não misture dataLayer e Store na mesma sessão.

---

## FASE 0 — Kilo Code · mapeamento das integrações

Saída: `mapa-integracoes.md`

```
/graphify

Enumere todos os pontos de integração com o BFF (chamadas HTTP nos services
da camada de dados).

Produza `mapa-integracoes.md`:

## Seção 1 — Pontos de integração
| service | método/endpoint | dtos usados | mappers | models/entities | LOC total da cadeia |

Uma linha por endpoint. `dtos usados` = request e response.
A cadeia é o fechamento transitivo a partir do service.

## Seção 2 — Artefatos compartilhados
Liste todo dto/mapper/model que aparece em 2+ cadeias, com a contagem.

## Seção 3 — Órfãos
Liste todo arquivo de dataLayer que NÃO aparece em nenhuma cadeia.

Apenas dados. Zero análise.
```

**Revise o arquivo à mão antes de levar ao Copilot.** Erro de mapeamento aqui se propaga pago.

---

## FASE 1 — Copilot · cadeias exclusivas

**Setup:** sessão nova · agente `analise-dataLayer` · effort **médio** · context default.

### Turno 1 — ancorar (repetir no início de toda sessão desta fase)

```
#file:mapa-integracoes.md

Este é o mapa de integrações da camada de dados. Não analise ainda.

Liste apenas as cadeias EXCLUSIVAS (cujos artefatos não aparecem na
Seção 2), ordenadas por LOC decrescente.
```

### Turno 2..N — uma cadeia por turno

```
#file:<service>.ts #file:<request>.dto.ts #file:<response>.dto.ts #file:<nome>.mapper.ts #file:<nome>.model.ts

Cadeia: <nome do endpoint>.

Trace o fluxo real de dados da cadeia inteira antes de opinar: o que entra
do BFF, o que é transformado, o que chega na feature.

Para CADA bloco com responsabilidade fora de lugar:
- classifique fica / sai / muda de camada
- diga qual princípio quebra
- nomeie o artefato de destino DENTRO desta cadeia, ou aponte que o
  destino não existe

Confira o shape dos DTOs contra o contrato real do endpoint. Divergência
entre DTO e contrato é achado, não detalhe.

View e facade foram removidas e não voltam. Orquestração multi-domínio vai
para service de feature.

Se a cadeia está sã, diga "sã" e pare. Não proponha abstração que ninguém
pediu.
```

### Turno de fechamento (último de cada sessão)

```
Entre as cadeias analisadas nesta sessão: qual defeito se REPETE?
Defeito recorrente indica ausência estrutural, não erro pontual.
Nomeie a ausência.
```

---

## FASE 2 — Copilot · artefatos compartilhados

Só depois de todas as cadeias exclusivas. Sessão nova.

**Setup:** agente `analise-dataLayer` · effort **alto** (a decisão é de fronteira, não de classificação).

### Turno 1

```
#file:mapa-integracoes.md

[colar os vereditos da Fase 1]

Não analise ainda. Para cada artefato da Seção 2, liste em quais cadeias
ele aparece e com qual papel em cada uma.
```

### Turno 2..N — um artefato compartilhado por turno

```
#file:<artefato compartilhado> #file:<cadeia A que o usa> #file:<cadeia B que o usa>

Artefato: <nome>. Usado por <N> cadeias.

Decida entre:
(a) pertence a `shared` — o shape é genuinamente o mesmo em todas as cadeias
(b) é coincidência estrutural — cada cadeia deveria ter o seu, e a
    unificação criou acoplamento entre domínios que não se conhecem

Justifique pela razão de MUDANÇA: se as cadeias mudam por motivos
diferentes, o artefato não é compartilhado, é acoplado.

Apresente o trade-off da separação (duplicação de shape vs. desacoplamento).
```

### Turno de fronteira MFE ↔ BFF

```
Algum DTO desta camada é gerado a partir da mesma spec consumida pelo BFF,
ou importa tipos de pacote compartilhado com o backend?

Se sim: liste os arquivos e o caminho da dependência. Isso é ponto único de
falha entre MFE e BFF e trava deploy independente — reporte separado do resto.
```

---

## FASE 3 — Copilot · órfãos

Sessão nova. **Setup:** agente `analise-dataLayer` · effort **baixo** (é verificação, não julgamento).

```
#file:mapa-integracoes.md

Para cada arquivo da Seção 3 (órfãos), classifique:
- MORTO: nenhum uso em lugar nenhum → deletar
- USO INDIRETO: alcançado por caminho que o mapa não cobriu → apontar o caminho
- FUTURO: existe para integração ainda não implementada → confirmar com evidência

Use `usages` para confirmar antes de classificar como MORTO. Não assuma.
```

---

## FASE 4 — Síntese dataLayer

Sessão nova, contexto limpo. **Setup:** agente `analise-dataLayer` · effort **alto**.

```
#file:mapa-integracoes.md

[colar os vereditos das Fases 1, 2 e 3]

Consolide:

1. Quais artefatos/camadas estão AUSENTES e forçam lógica a vazar?
   Ordene por número de cadeias afetadas.
2. Quais acoplamentos entre domínios são estruturais (aparecem em 3+ cadeias)
   e quais são pontuais?
3. Qual a ordem de refatoração que maximiza redução de acoplamento por diff?

Justifique cada item por ausência ou acoplamento REAL observado nas cadeias.
Nada por simetria de camadas.
```

Este output é a proposta de refatoração.

---

## FASE 5A — Kilo Code · mapeamento da Store

Saída: `mapa-store.md`

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
Liste todos os membros públicos (state, computed, methods) e, para cada um,
quantos consumidores distintos o acessam. Marque com 0 os não usados.

Apenas dados. Zero análise.
```

---

## FASE 5B — Copilot · revisão da Store

Sessão nova. **Setup:** agente `revisao-signalstore` · effort **alto** · mesmo modelo.

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

Esses consumidores acessam muitos membros da Store. Verifique se eles
reimplementam regra que deveria estar em service de feature, ou se compõem
estado que a Store deveria expor pronto como computed.

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

Mesma sessão da 5B (o contexto ainda é relevante e está cacheado).

```
Consolide:

1. Qual service de feature está ausente e deveria absorver a regra que hoje
   mora na Store?
2. Qual a superfície mínima que a Store deveria expor?
3. Ordem de extração que mantém a aplicação funcionando a cada passo.

Não crie service novo por simetria — só onde a regra não tem casa.
```

---

## FASE 7 — Cruzamento (opcional)

Só se as Fases 4 e 6 apontarem services de feature que se sobrepõem.

Sessão nova, agente `analise-dataLayer`, effort alto:

```
[colar as conclusões da Fase 4 e da Fase 6]

Os services de feature propostos pelas duas análises se sobrepõem?

Se sim: são o mesmo service ou services distintos que compartilham
dependência? Decida pela razão de mudança, não pela semelhança de nome.
```
