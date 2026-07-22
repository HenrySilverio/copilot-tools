Correção rápida antes do prompt: `graphify-out` não é uma pasta de saída do archify — é a saída de uma ferramenta diferente, **Graphify** (knowledge-graph builder de codebase, comando `/graphify`, gera `graph.json`, `graph.html` e `GRAPH_REPORT.md`). Archify desenha; Graphify mapeia. São dois passos de um pipeline, não a mesma coisa — bom eu não ter assumido isso errado nos prompts anteriores, mas vale deixar explícito agora porque muda o prompt: você precisa primeiro **extrair** as conexões da renegociacaoStore do grafo, e só depois mandar isso pro archify desenhar.

Segundo ponto: "uma camada e todas as suas conexões" não é lifecycle nem workflow — é o caso de uso central do tipo **architecture** do archify (componentes + como se conectam). Lifecycle é estado→estado, workflow é passo→passo de um processo. Uma store com N consumidores é grafo de dependência, então o tipo certo é architecture.

O prompt fica em duas etapas — e a etapa 1 é a que decide se o resultado presta ou não:

```
Etapa 1 — extrair do grafo (não desenhar ainda):
Leia graphify-out/graph.json (ou graphify-out/GRAPH_REPORT.md se for mais legível) e encontre o nó
correspondente a renegociacaoStore. Liste TODOS os vizinhos diretos (get_neighbors), com o tipo de
aresta de cada um (import, injeção de dependência, effect, selector, consumido-por-componente, etc).
Não resuma, não infira conexão que não esteja explicitamente no grafo. Se o nome do nó não bater
exatamente com "renegociacaoStore", me diga qual variação encontrou antes de continuar.
```

```
Etapa 2 — desenhar (só depois de validar a lista da etapa 1):
/archify architecture diagram:
Nó central: renegociacaoStore (NgRx Signals store).
Conexões: [cole aqui a lista EXATA de vizinhos + tipo de aresta que saiu da etapa 1 — não resuma de
novo, senão você perde exatamente o dado que a etapa 1 existia pra garantir].
Classes semânticas: a store em si = c-backend, componentes Angular que a consomem = c-frontend,
serviços HTTP/BFF fora do MFE = c-external, outras stores/effects que ela dispara = c-backend
com a-emphasis se for caminho crítico.

Salvar em: graphify-out/architecture-renegociacaostore.html
```

Por que separar em duas etapas em vez de um prompt só "desenha a store e suas conexões": se você deixar o modelo inferir as conexões a partir do que ele "acha" que uma store de renegociação normalmente teria, ele vai alucinar arestas plausíveis-mas-erradas — principalmente em modelo free-tier do Kilo, que já é o elo fraco na parte de julgamento estrutural, como vimos antes. Forçar a leitura do grafo primeiro e colar a lista literal na etapa 2 transforma um "desenho bonito de algo inventado" em um "desenho fiel do que está no `graph.json`". Se o Graphify já registrou os tools MCP (`get_neighbors`, `query_graph`) no Copilot/Kilo, prefira que a etapa 1 chame a tool diretamente em vez de pedir pro LLM ler e interpretar o JSON cru — é determinístico, não depende do modelo parsear certo um arquivo que pode ter milhares de linhas.