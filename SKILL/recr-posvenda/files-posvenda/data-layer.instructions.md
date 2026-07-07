---
name: 'posvenda — Data Layer'
description: 'Regras de DTO, mapper, model e serviços de domínio do posvenda.'
applyTo:
  - '**/domain/models/**'
  - '**/domain/mappers/**'
  - '**/domain/services/**'
  - '**/core/services/**'
---

# Data Layer — posvenda

- Fluxo: **DTO → mapper → modelo**. DTO é o formato de fio; modelo é o domínio. Nunca vaze DTO para fora desta camada.
- Gerar DTO/model/mapper/service → **use a skill `data-layer`** (`.github/skills/data-layer/templates`). Não invente shapes.
- 1 mapper por recurso em `domain/mappers`. Mapper é função pura (sem estado, sem DI).
- `domain/services`: serviços de negócio/API; RxJS só aqui na borda; encerre streams com `takeUntilDestroyed`.
- `core/services`: infra/singletons — único lugar com `@Injectable({ providedIn: 'root' })`.
- TypeScript strict. Sem `any`.
