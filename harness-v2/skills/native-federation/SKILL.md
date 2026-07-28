---
name: native-federation
description: Micro frontends Angular com @angular-architects/native-federation - configuracao de host e remote, contrato de exposes, dependencias compartilhadas, carregamento dinamico e diagnostico de falhas. Use SEMPRE que aparecerem os termos native federation, federation.config.js, remoteEntry, loadRemoteModule, exposes, shared, singleton, host, remote, shell, micro frontend, importmap, es-module-shims, ou quando houver erro de instancia duplicada, versao divergente ou modulo remoto que nao carrega.
---

# Native Federation (Angular)

Onde um palpite errado do modelo custa horas de depuracao. As falhas mais comuns nao sao
de sintaxe: sao de **contrato** (o que o remote expoe) e de **grafo de dependencias**
(quem compartilha o que, como singleton).

## Escopo

Configuracao, contrato e diagnostico de federation. Nao cobre APIs do framework Angular,
gerenciamento de estado, testes nem design system.

## Dependencias

Nenhuma.

---

## Passo 0 - Ler a configuracao real (obrigatorio)

Nunca gere config de memoria. Leia, na raiz de cada aplicacao envolvida:

| Arquivo | O que extrair |
|---|---|
| `federation.config.js` (ou `.manifest.json`) | papel (host/remote), `name`, `exposes`, `shared`, `skip` |
| `package.json` | versao de `@angular-architects/native-federation`, `@angular/core`, `es-module-shims` |
| `angular.json` | builder em uso; presenca de `esbuild`/`application` |
| `src/main.ts` e `src/bootstrap.ts` | se o bootstrap esta atrasado corretamente |
| `public/federation.manifest.json` (host) | mapa de remotes e URLs por ambiente |

Declare em uma linha: **HOST** ou **REMOTE**, e a versao do plugin.

---

## 1. Modelo mental

- **Remote**: publica um `remoteEntry.json` que descreve os modulos expostos e as
  dependencias compartilhadas com suas versoes.
- **Host**: no runtime, le os `remoteEntry.json`, resolve o grafo compartilhado, monta o
  importmap e so entao inicializa o Angular.
- **Nao ha resolucao em build time.** O que resolve o grafo e o navegador, via importmap
  (com `es-module-shims` como polyfill onde necessario).

Consequencia direta: **o bootstrap precisa ser atrasado**. `main.ts` inicializa a
federation e so depois importa `bootstrap.ts`. Um `main.ts` que faz
`bootstrapApplication` direto quebra em runtime, com erro que nao aponta para a causa.

## 2. Contrato de exposicao (a regra que mais economiza tempo)

Trate o bloco `exposes` como **API publica versionada** do micro frontend.

- Exponha o **menor** artefato util: rotas, um componente de entrada, ou um custom element.
  Nunca exponha service interno, store, util ou tipo de dominio.
- Uma vez publicada, uma chave de `exposes` nao muda de nome nem de forma sem versionar.
  Renomear chave e mudanca quebrante para todos os hosts.
- Tipos que atravessam a fronteira sao **contrato**. Ou sao duplicados intencionalmente
  dos dois lados, ou vem de um pacote versionado. Nunca por `paths` do TypeScript
  apontando para dentro de outro repositorio.
- O host **nao** conhece a estrutura interna do remote. Se o host precisa importar tres
  arquivos do remote para fazer algo funcionar, o contrato esta errado.

## 3. Dependencias compartilhadas

Regras:

1. `@angular/core`, `@angular/common`, `@angular/router`, `rxjs` e qualquer biblioteca
   que use DI ou estado global: **singleton com versao estrita**. Duas instancias de
   `@angular/core` no mesmo documento produzem erros de injecao aparentemente aleatorios.
2. Bibliotecas puras e sem estado (formatadores, geradores, utilitarios): compartilhar e
   opcional. Duplicar custa bytes; compartilhar errado custa horas.
3. `zone.js`, quando existir, e singleton. Em aplicacoes zoneless ele nao deve aparecer
   no grafo compartilhado.
4. Divergencia de versao entre host e remotes e o defeito numero um. Antes de investigar
   qualquer outra coisa, **compare as versoes**.

Nao copie blocos `shared` de um projeto para outro sem conferir as versoes reais no
`package.json` de cada aplicacao.

## 4. Angular Elements na fronteira

Quando o remote e consumido como custom element, a fronteira deixa de ser TypeScript e
passa a ser DOM. Isso muda o contrato:

- Atributos HTML chegam como **string**. Numero, booleano e objeto precisam de
  serializacao explicita ou de atribuicao via propriedade (`el.prop = valor`).
- Saidas viram `CustomEvent`. O consumidor escuta com `addEventListener`, e o payload
  fica em `event.detail`.
- Nao ha type-checking na fronteira. Documente o contrato do elemento (atributos,
  propriedades, eventos) junto do remote - o compilador nao vai proteger ninguem aqui.
- O ciclo de vida do elemento e do DOM, nao do Angular do host.

## 5. Diagnostico

Antes de propor qualquer mudanca de codigo, execute o roteiro de
`references/troubleshooting.md`. Ele mapeia sintoma -> causa provavel -> verificacao, e a
maioria dos casos termina em versao divergente ou bootstrap nao atrasado.

Ordem obrigatoria de investigacao:

1. O `remoteEntry.json` do remote responde na URL configurada?
2. As versoes das dependencias singleton batem entre host e remotes?
3. O bootstrap do host esta atrasado?
4. Quantas copias de `@angular/core` aparecem no importmap resolvido?
5. So entao olhe o codigo da feature.

Pular direto para o passo 5 e o erro classico e custa a maior parte do tempo perdido.

## 6. Limites de comportamento

- Nao altere `shared` "para ver se resolve". Mudanca no grafo compartilhado afeta todos os
  remotes; justifique antes.
- Nao adicione `paths` no `tsconfig` do host apontando para o codigo-fonte de um remote.
  Isso cria acoplamento em build time e anula o proposito da federation.
- Nao instale nem atualize `@angular-architects/native-federation` por conta propria.
- Se a solucao correta exigir mudanca coordenada em dois repositorios, diga isso
  explicitamente em vez de produzir um remendo em um lado so.

## 7. Auto-verificacao antes de responder

- [ ] Li o `federation.config.js` real de cada lado envolvido?
- [ ] Declarei papel (HOST/REMOTE) e versao do plugin?
- [ ] Confirmei as versoes das dependencias singleton nos dois lados?
- [ ] A mudanca proposta afeta o contrato publico de `exposes`? Se sim, avisei?
- [ ] A mudanca exige acao no outro repositorio? Se sim, deixei claro?
