---
name: auditoria-seguranca-mfe
description: Catálogo de regras de segurança e LGPD para micro-frontend Angular bancário. Use ao auditar código que manipula PII (CPF, CNPJ, contrato, boleto), envia evento para GTM/dataLayer, grava em localStorage/sessionStorage, renderiza HTML dinâmico, chama bypassSecurityTrust, ou carrega recurso de origem externa.
context: fork
user-invocable: false
---

# Segurança — MFE Angular bancário

Aplique **só** as regras abaixo. Não gere OWASP Top 10 genérico: não há SQL nem servidor neste código. Todo finding precisa de `file:linha` e trecho real.

## SEC-01 · PII em telemetria — `BLOQUEANTE`

O projeto usa `angular-google-tag-manager`. Qualquer CPF/CNPJ, número de contrato, valor de parcela, nome ou linha digitável empurrado para `dataLayer`, `pushTag`, `gtmService.*` sai do perímetro do banco. Incidente de LGPD, não bug de estilo.

Procure: chamadas a GTM cujo payload referencie campo de `*.dto.ts` / `*.model.ts` de cliente ou contrato. Objeto inteiro (`{ ...contrato }`) é finding automático.
Fix: allowlist explícita de chaves não-identificáveis. Nunca denylist.

## SEC-02 · PII em storage / URL / log — `BLOQUEANTE`

`localStorage`, `sessionStorage`, `document.cookie`, query param de rota, ou `console.*` contendo PII. `localStorage` não expira e sobrevive ao logout.

Fix: estado sensível vive no SignalStore em memória. Se precisa sobreviver a reload, é responsabilidade do BFF, não do MFE.

## SEC-03 · XSS via bypass do sanitizer — `BLOQUEANTE`

`bypassSecurityTrustHtml|Url|ResourceUrl|Script|Style`, `[innerHTML]`, `ElementRef.nativeElement.innerHTML`, `Renderer2.setProperty(..., 'innerHTML', ...)`.

Cada ocorrência exige prova de que a fonte é constante literal do próprio bundle. Vindo de resposta HTTP ou de `@Input()` → BLOQUEANTE.
Contexto local: `jsbarcode` renderiza em `<svg>`/`<canvas>`. Se alguém injetar a linha digitável como string HTML em vez de passar ao `JsBarcode()`, é finding.

## SEC-04 · Superfície do Custom Element não validada — `ALTO`

`federation_config.js` expõe `./component` e `./bootstrap-webcomponent`. Todo `@Input()` de `AppComponent` é **entrada não-confiável**: vem do shell, atravessa a fronteira como atributo DOM string.

Regra: `@Input()` da fronteira sem validação/parse é finding. `@Input() contrato: Contrato` recebendo objeto cru do shell sem guard de tipo → `ALTO`.

## SEC-05 · Origem externa não fixada — `ALTO`

URL de API, CDN ou `remoteEntry` hardcoded, montada por concatenação de input, ou apontando para host não-`environment`. `withNativeFederation` carregando remote de origem dinâmica.

## SEC-06 · Mock vazando para produção — `ALTO`

Existem `mocks/backend.js`, `mocks/scripts/postbuild.js` e `start:mock`. Qualquer import de `mocks/` a partir de `src/`, ou flag de mock que não seja eliminada por `optimization: true`, é finding.

## SEC-07 · Dependência vulnerável — `MEDIO` (só se `npm audit` confirmar)

**Não invente CVE.** Reporte apenas o que a saída de `npm audit --omit=dev --audit-level=high` mostrar, e só se a dependência for de runtime. `overrides` de `electron-to-chromium` e `http-proxy-middleware` são build-time — ignore.

## Falsos positivos — não reporte

- `cpf-cnpj.pipe.ts`, `telefone.pipe.ts`, `cep.pipe.ts`: **formatar PII para exibição é o trabalho deles.** Só é finding se logarem ou persistirem.
- Ausência de CSRF token: o BFF é dono disso.
- "Falta rate limiting": não é responsabilidade do MFE.
