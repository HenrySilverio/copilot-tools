---
name: 'posvenda — Camada UI'
description: 'Regras para componentes apresentacionais e smart do posvenda.'
applyTo:
  - '**/domain/ui/**'
  - '**/feature/**'
  - '**/shared/components/**'
---

# UI — posvenda

- `changeDetection: OnPush` sempre.
- `domain/ui`: apresentacional puro — só `@Input`/`@Output`/`model`. **Zero** serviço, zero HTTP, nunca toca DTO (recebe modelo de domínio).
- `feature/**/pages`: componentes smart/rota — orquestram store e serviços; delegam apresentação para `domain/ui`.
- `shared/components`: transversais, prefixo `bsc-`.
- Control flow `@if`/`@for`/`@switch`; `inject()`; sem `NgModule`.
