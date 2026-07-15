---
name: auditoria-arquitetura-mfe
description: Catálogo de regras de Clean Architecture e contrato federado para micro-frontend Angular com Native Federation. Use ao auditar imports entre camadas (core/domain/feature/shared), mudanças em federation_config.js ou exposes, separação DTO vs modelo de domínio, e acoplamento entre features.
context: fork
user-invocable: false
---

# Arquitetura — Clean Architecture + Native Federation

Fronteiras deste repo: `core` → `domain` → `feature` → `shared`. Aliases: `@app/`, `@core/`, `@shared/`.

## ARQ-01 · Fluxo de dependência invertido — `ALTO`

Matriz. Qualquer import fora dela é finding, com o caminho exato do import.

| De ↓ / Pode importar → | core | domain | feature | shared |
|---|---|---|---|---|
| `core` | — | ❌ | ❌ | ✅ |
| `domain` | ✅ | mesma camada | ❌ | ✅ |
| `feature/X` | ✅ | ✅ | ❌ **outra feature** | ✅ |
| `shared` | ❌ | ❌ | ❌ | — |

`shared/` importando `domain/` é o mais grave: transforma o kit reutilizável em refém do domínio.
`feature/acompanhamento` importando de `feature/renegociacao` → extraia para `domain/` ou duplique. Nunca cruze.

## ARQ-02 · DTO vazando para a UI — `ALTO`

O repo separa `domain/models/dto/` (contrato do BFF) de `domain/models/modelos/` (domínio). A separação existe para que mudança de campo no BFF não vire refactor de 12 componentes.

Finding se: um `*.dto.ts` é importado por `feature/**`, `shared/**` ou `domain/ui/**`. O mapeamento DTO→modelo pertence ao `*.service.ts`.
Finding se: `*.dto.ts` e `*.model.ts` do mesmo conceito são idênticos — ou o mapeamento sumiu, ou o DTO foi copiado. Aponte qual.

## ARQ-03 · Contrato federado alterado — `BLOQUEANTE`

`federation_config.js` expõe exatamente `./component` e `./bootstrap-webcomponent`. Isso é API pública consumida pelo shell.

Finding se o diff: adiciona/remove/renomeia entrada em `exposes`; altera assinatura de `@Input()`/`@Output()` de `AppComponent`; muda o nome do custom element em `bootstrap-webcomponent.ts`.
Nenhuma delas é mudança "interna". Exige versionamento e coordenação com o shell — marque `precisa de ADR`.

## ARQ-04 · Quebra do isolamento — `BLOQUEANTE`

`shared: {}` é deliberado: ilha isolada, o remote bundla o próprio Angular/rxjs, nada é negociado com o shell.

Qualquer PR que popule `shared` em `federation_config.js` reintroduz acoplamento de versão entre MFE e shell — o exato ponto único de falha que a config evita. Nunca aprove sem ADR. O array `skip:` de `@app/`/`@core/`/`@shared/` também não se mexe sem justificativa.

Trade-off que o autor do finding deve reconhecer: isolamento custa bundle duplicado. Se o pedido for por peso, a resposta é budget (`initial: 2mb` no `angular.json`), não `shared`.

## ARQ-05 · Lógica de negócio no componente — `MEDIO`

`domain/ui/**` e `feature/**/pages/**` são camada de apresentação. Cálculo de juros, regra de elegibilidade, decisão de fluxo dentro de `*.component.ts` → mova para service ou store. Formatação e binding, não.

## ARQ-06 · Deriva de configuração — `MEDIO`

Divergência entre `package.json` e `angular.json`. Exemplo já presente: `package.json.name = recr-fed-agc-posvenda`, mas o projeto em `angular.json` é `fed-node-npm-template` (template não renomeado). Reporte uma vez, não por ocorrência.

## Falsos positivos — não reporte

- `*.spec.ts` importando o arquivo sob teste — atravessar camada é o trabalho dele.
- "Falta interface para o service": injeção por classe concreta é idiomático em Angular. Só é finding se houver múltipla implementação real.
- Sugerir barrel `index.ts`: o `skip:` do federation existe justamente para barrar isso.
