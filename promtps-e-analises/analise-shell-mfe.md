Boa, faz sentido — projetos/repositórios separados, cada um aberto numa janela do VSCode. Aqui vão os dois prompts independentes. O cabeçalho de regras é igual nos dois (é o que garante a sanitização e o baixo custo de token); o que muda é a lista de arquivos.

Use um modelo econômico, rode cada grupo numa rodada separada com no máximo 2–3 arquivos, e me cole o markdown de volta.

## PROMPT A — repositório do SHELL

```
Você é um EXTRATOR DE ARQUITETURA. Sua única tarefa é LER os arquivos que eu indicar e gerar um RELATÓRIO EM MARKDOWN. Regras absolutas:

- NÃO edite, crie ou apague arquivos. Somente leitura.
- Use SOMENTE o conteúdo dos arquivos que eu passar via #readFile. NÃO use @workspace nem #codebase.
- SANITIZE tudo antes de escrever: troque por placeholders qualquer host/URL interno (→ <HOST_INTERNO> ou <BFF_BASE_URL>), token/segredo/chave/api-key (→ <REDACTED>), nome de pessoa (→ <NOME>) e IP interno (→ <IP>). Mantenha nomes de libs, versões, chaves de configuração, nomes de métodos e a estrutura do código.
- Seja conciso: não repita o arquivo inteiro, extraia só o que importa.

Para CADA arquivo, produza:
### <caminho do arquivo>
- Propósito: 1 linha.
- Pontos-chave (só os que existirem no arquivo):
  - Federation (host): initFederation, manifest, remotes, shared (singleton/strictVersion).
  - Carregamento de MFE: loadRemoteModule, montagem do web-component, como o token é passado ao MFE (property/attribute/Input).
  - Rotas: Angular Router vs custom, hash location (withHashLocation), lazy/child routes, container que hospeda o MFE.
  - Token: como o Shell recebe o CIAM (query param da URL do iframe / postMessage), onde guarda (serviço/signal), como repassa ao MFE.
  - Bootstrap: initFederation, bootstrapApplication.
  - Versões relevantes (Angular, @angular-architects/native-federation).
- Trechos essenciais: só as linhas que importam, já sanitizadas (máx ~15 linhas).

Arquivos desta rodada:
#readFile <cole aqui o caminho do arquivo 1>
#readFile <cole aqui o caminho do arquivo 2>
```

Arquivos do Shell, em 3 rodadas (se o token acabar, o primeiro de cada rodada já me dá o essencial):

- **Rodada 1 (federação + bootstrap):** `federation.manifest.json`, o `main.ts` (e `bootstrap.ts`, se for separado).
- **Rodada 2 (rotas + loader do MFE):** `app.routes.ts` (ou `app-routing.module.ts`), o `app.config.ts`/`app.module.ts`, e o componente que faz o `loadRemoteModule` e monta o web-component passando o token.
- **Rodada 3 (token + versões):** o serviço que recebe/guarda o CIAM (ex.: `auth.service.ts` ou similar), o ponto onde o Shell lê o token da URL do iframe ou do `postMessage`, e o `package.json`.

## PROMPT B — repositório do MFE

```
Você é um EXTRATOR DE ARQUITETURA. Sua única tarefa é LER os arquivos que eu indicar e gerar um RELATÓRIO EM MARKDOWN. Regras absolutas:

- NÃO edite, crie ou apague arquivos. Somente leitura.
- Use SOMENTE o conteúdo dos arquivos que eu passar via #readFile. NÃO use @workspace nem #codebase.
- SANITIZE tudo antes de escrever: troque por placeholders qualquer host/URL interno (→ <HOST_INTERNO> ou <BFF_BASE_URL>), token/segredo/chave/api-key (→ <REDACTED>), nome de pessoa (→ <NOME>) e IP interno (→ <IP>). Mantenha nomes de libs, versões, chaves de configuração, nomes de métodos e a estrutura do código.
- Seja conciso: não repita o arquivo inteiro, extraia só o que importa.

Para CADA arquivo, produza:
### <caminho do arquivo>
- Propósito: 1 linha.
- Pontos-chave (só os que existirem no arquivo):
  - Federation (remote): name, exposes (qual arquivo é exposto), shared (singleton/strictVersion).
  - Exposição como web-component: createCustomElement, customElements.define, bootstrap-webcomponent, web-component.module.
  - Token: @Input() tokenCiam (ou equivalente), onde é guardado (serviço/signal), como vai para o header (Authorization: Bearer) no http.service/interceptor.
  - Comunicação com o Shell: CustomEvent/EventEmitter para sair/voltar ao menu, se existir.
  - Rotas internas: Angular Router, quantas telas, lazy/child routes.
  - Estado: NgRx (Store/ComponentStore/SignalStore) ou serviço com signals, se existir.
  - Versões relevantes (Angular, @angular-architects/native-federation).
- Trechos essenciais: só as linhas que importam, já sanitizadas (máx ~15 linhas).

Arquivos desta rodada:
#readFile <cole aqui o caminho do arquivo 1>
#readFile <cole aqui o caminho do arquivo 2>
```

Arquivos do MFE, em 3 rodadas:

- **Rodada 1 (exposição + bootstrap):** `federation.config.js`, `bootstrap-webcomponent.ts`, `web-component.module.ts`.
- **Rodada 2 (token + http):** o componente raiz com `@Input() tokenCiam`, o `auth.service.ts` (guarda o token) e o `http.service.ts` (e o interceptor, se houver).
- **Rodada 3 (rotas + estado + versões):** o `app.routes.ts` do MFE, o arquivo de estado se já existir (NgRx/service), e o `package.json`.

---

Dois lembretes rápidos para a extração render: no `#fileSearch`, se não achar o arquivo pelo nome exato, tente sem extensão ou por parte do nome (ex.: `fileSearch federation` acha tanto o `.config.js` quanto o `.manifest.json`). E confere de olho o markdown que o Copilot devolver antes de colar aqui — modelo econômico às vezes deixa passar um host ou nome; se aparecer algo sensível, é só trocar por `<REDACTED>` na mão.

Pode mandar as extrações na ordem que quiser, Shell ou MFE primeiro, tanto faz. Vou juntando tudo e, quando você disser que fechou, montamos o documento e o Mermaid.