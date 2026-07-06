Ótima pergunta, e a resposta muda de acordo com como o cache funciona. Como é **a mesma janela/thread** com GPT-5 mini, o ganho de cache vem de manter um **prefixo estável no topo** e ir só **anexando** coisas curtas embaixo. Isso favorece o modelo incremental, não o "tudo de uma vez".

## Veredito: lotes + relatório no final (não tudo num prompt só)

Ler tudo num único prompt é pior aqui por três motivos: (1) num único turno **não existe cache** para reaproveitar — você paga cheio, e se precisar refazer, paga cheio de novo; (2) o GPT-5 mini tem teto de saída, e uma extração de ~15 arquivos de uma vez **trunca o relatório**; (3) com muito arquivo junto o modelo dilui atenção e pula detalhe ("lost in the middle").

O incremental na mesma thread trabalha **a favor** do cache: o bloco de regras entra **uma vez** no topo e vira prefixo cacheado; cada lote seguinte é uma mensagem minúscula (só os `#readFile`), então o modelo relê o prefixo via cache-read (barato) e só paga o novo lote. No final, o "gerar relatório" é baratíssimo porque tudo já está no contexto.

O segredo para extrair o máximo de cache é **não repetir as regras a cada lote**. Por isso o desenho abaixo separa em três fases.

## Protocolo de 3 fases (por janela)

**Fase 1 — mensagem de setup (uma vez):** regras + sanitização + o schema + o combinado de "vou mandar em lotes, só extraia e guarde, NÃO gere o relatório até eu escrever `GERAR RELATÓRIO`" + o primeiro lote. Isso fixa o prefixo cacheado.

**Fase 2 — lotes (mensagens minúsculas):** só `Lote N:` e os `#readFile`. Nada mais. O modelo já tem as regras.

**Fase 3 — consolidação:** só `GERAR RELATÓRIO` + a estrutura final.

### Setup — janela do SHELL (mande uma vez)

```
Você é um EXTRATOR DE ARQUITETURA nesta thread. Vou te enviar arquivos em LOTES ao longo de várias mensagens. Protocolo:

- A cada lote, apenas EXTRAIA e guarde um resumo sanitizado. NÃO gere o relatório final até eu escrever exatamente: GERAR RELATÓRIO.
- Responda a cada lote de forma curta: só a extração daquele lote.
- NÃO edite/crie/apague arquivos. Somente leitura.
- Use SOMENTE o conteúdo dos arquivos que eu passar via #readFile. NUNCA use @workspace nem #codebase.
- SANITIZE sempre: host/URL interno → <HOST_INTERNO> ou <BFF_BASE_URL>; token/segredo/chave → <REDACTED>; nome de pessoa → <NOME>; IP → <IP>. Mantenha libs, versões, nomes de config/métodos e estrutura.
- Não repita o arquivo inteiro; extraia só o essencial (máx ~15 linhas de trecho por arquivo).

Schema por arquivo:
### <caminho>
- Propósito (1 linha)
- Federation (host): initFederation, manifest, remotes, shared (singleton/strictVersion)
- Carregamento de MFE: loadRemoteModule, montagem do web-component, como o token vai ao MFE (property/attribute/Input)
- Rotas: Angular Router vs custom, withHashLocation, lazy/child, container do MFE
- Token: como o Shell recebe o CIAM (query param do iframe / postMessage), onde guarda (serviço/signal), como repassa
- Bootstrap: initFederation, bootstrapApplication
- Versões (Angular, @angular-architects/native-federation)
- Trechos essenciais (sanitizados)

Lote 1:
#readFile <federation.manifest.json>
#readFile <main.ts>
```

Depois é só mandar os lotes seguintes assim:
```
Lote 2:
#readFile <app.routes.ts>
#readFile <componente-que-faz-loadRemoteModule>
```
```
Lote 3:
#readFile <servico-que-recebe-o-CIAM>
#readFile <package.json>
```

### Setup — janela do MFE (mande uma vez)

Igual ao de cima, trocando só o schema pelo do remote:

```
Você é um EXTRATOR DE ARQUITETURA nesta thread. Vou te enviar arquivos em LOTES. Protocolo:

- A cada lote, apenas EXTRAIA e guarde. NÃO gere o relatório até eu escrever exatamente: GERAR RELATÓRIO.
- Resposta curta por lote. Somente leitura, sem editar nada.
- SOMENTE #readFile. NUNCA @workspace nem #codebase.
- SANITIZE: host/URL → <HOST_INTERNO>/<BFF_BASE_URL>; token/segredo/chave → <REDACTED>; nome → <NOME>; IP → <IP>. Mantenha libs, versões, config, métodos, estrutura.
- Máx ~15 linhas de trecho por arquivo.

Schema por arquivo:
### <caminho>
- Propósito (1 linha)
- Federation (remote): name, exposes (qual arquivo), shared (singleton/strictVersion)
- Web-component: createCustomElement, customElements.define, bootstrap-webcomponent, web-component.module
- Token: @Input() tokenCiam, onde guarda (serviço/signal), como vai ao header (Authorization: Bearer) no http.service/interceptor
- Comunicação com o Shell: CustomEvent/EventEmitter para sair/voltar ao menu, se houver
- Rotas internas: Angular Router, nº de telas, lazy/child
- Estado: NgRx (Store/ComponentStore/SignalStore) ou serviço com signals, se houver
- Versões (Angular, @angular-architects/native-federation)
- Trechos essenciais (sanitizados)

Lote 1:
#readFile <federation.config.js>
#readFile <bootstrap-webcomponent.ts>
#readFile <web-component.module.ts>
```

Lotes seguintes: componente raiz com `@Input() tokenCiam` + `auth.service.ts` + `http.service.ts` (lote 2); `app.routes.ts` do MFE + arquivo de estado + `package.json` (lote 3).

### Fase final (nas duas janelas)

```
GERAR RELATÓRIO

Consolide TUDO que você extraiu nesta thread num único relatório markdown, agrupado por tema:
1. Federação (host/remote, shared, versões)
2. Fluxo do token CIAM (entrada → guarda → header)
3. Rotas (Router/hash/lazy)
4. Comunicação Shell↔MFE (eventos de sair/voltar ao menu)
5. Estado (NgRx/signals), se houver
6. Pontos de atenção / lacunas que você notou

Regras de sanitização continuam valendo. Não invente o que não estava nos arquivos; se algo não apareceu, escreva "não encontrado nos arquivos lidos".
```

## Dois detalhes importantes

Como Shell e MFE são **repos separados**, na prática são **duas janelas** (dois workspaces) e, portanto, **dois caches independentes** — não dá para os `#readFile` de um enxergarem o outro, a menos que você abra os dois como *multi-root workspace* na mesma janela do VSCode. Não precisa: rode cada thread, gere os dois relatórios e cole os dois aqui. Quem "faz eles conversarem" na hora de montar o documento final e o Mermaid sou eu.

E segue de pé aquela única pergunta que a extração não responde (é do time novo, não dos seus repos): o **Portal consegue mandar o CIAM por `postMessage`** para o iframe do Shell, ou ele **só monta o `src`** como a Salesforce faz hoje? Como você disse que o token é criptografado, dá para seguir com ele na URL do iframe sem drama — mas a resposta define como eu trato o **F5/refresh** no documento. Pode me mandar as extrações antes de responder isso, não trava nada.