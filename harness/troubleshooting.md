# Diagnostico de Native Federation

## 0. Roteiro de 5 minutos (execute na ordem)

1. **O remoteEntry responde?**
   Abra a URL do `remoteEntry.json` no navegador ou via `curl`. Confirme status 200,
   content-type JSON e que o corpo lista os `exposes` esperados.
2. **As versoes batem?**
   Compare `@angular/core`, `@angular/common`, `@angular/router`, `rxjs` e
   `@angular-architects/native-federation` no `package.json` do host e de cada remote.
3. **O bootstrap esta atrasado?**
   `src/main.ts` deve inicializar a federation e so depois fazer `import('./bootstrap')`.
4. **Quantas copias de `@angular/core` existem?**
   No navegador, inspecione o importmap resolvido e a aba Network. Mais de uma copia
   explica praticamente todos os erros de DI.
5. **Cache.**
   Hard reload sem cache. `remoteEntry.json` cacheado por CDN e uma fonte recorrente de
   "funciona local, quebra em homologacao".

Se os cinco passarem, ai sim investigue o codigo da feature.

## 1. Sintoma -> causa

| Sintoma | Causa mais provavel | Verificacao |
|---|---|---|
| Erro de contexto de injecao ao entrar na rota do remote | duas instancias de `@angular/core` | contar copias no importmap / Network |
| "Shared module is not available for eager consumption" (ou equivalente) | bootstrap nao atrasado | inspecionar `main.ts` |
| Remote carrega isolado, quebra dentro do host | dependencia singleton divergente | comparar versoes |
| `loadRemoteModule` lanca 404 | URL do manifest errada por ambiente | conferir `federation.manifest.json` do ambiente |
| Modulo carrega mas componente nao renderiza | chave de `exposes` aponta para o arquivo errado | abrir `remoteEntry.json` e conferir a chave |
| Rotas do remote nao ativam | rota do host nao delega o prefixo, ou falta `**` no remote | conferir tabela de rotas dos dois lados |
| Estilos vazam entre MFEs | encapsulamento desligado ou CSS global no remote | procurar `ViewEncapsulation.None` e estilos globais |
| Erro de importmap em navegador especifico | `es-module-shims` ausente ou carregado tarde | conferir o `index.html` do host |
| Funciona em dev, quebra em build de producao | `skip` ou `shared` diferente por configuracao de build | comparar as configuracoes do `angular.json` |
| Provider global do host indisponivel no remote | remote inicializa seu proprio injector raiz | revisar o desenho: contrato explicito, nao DI implicita |

## 2. Sinais de contrato mal desenhado

Se voce encontrar qualquer um destes, o problema nao e configuracao, e arquitetura:

- O host importa mais de um caminho do mesmo remote para montar uma tela.
- O remote expoe um service para o host injetar.
- Um tipo de dominio e importado via `paths` do TypeScript cruzando repositorios.
- Mudar um arquivo interno do remote quebra a compilacao do host.
- Host e remote precisam ser deployados juntos para funcionar.

O ultimo item e o teste definitivo: se o deploy tem que ser coordenado, os micro frontends
estao acoplados e a federation esta pagando custo sem entregar o beneficio.

## 3. Roteiro para adicionar um novo remote ao host

1. Confirmar versoes de dependencias singleton identicas as do host.
2. Publicar o remote e validar o `remoteEntry.json` em cada ambiente.
3. Registrar o remote no manifest do host, **por ambiente**.
4. Adicionar a rota no host com carregamento dinamico do modulo/rotas expostos.
5. Validar: navegar ate a rota, verificar que ha uma unica copia de `@angular/core`,
   e que voltar para outra rota do host nao deixa estado ou estilo residual.

## 4. Roteiro para mudar `exposes`

Mudanca em `exposes` e mudanca de API publica. Sequencia segura:

1. Adicionar a nova chave **mantendo a antiga**.
2. Publicar o remote.
3. Migrar os hosts para a nova chave, um a um.
4. Verificar que nenhum host consome mais a chave antiga.
5. So entao remover a antiga.

Remover na mesma entrega quebra qualquer host que ainda nao subiu. Se a organizacao nao
consegue coordenar isso, a resposta certa e versionar o remote, nao acelerar a remocao.
