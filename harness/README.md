# AI Toolkit - Angular

Artefatos compartilhados para GitHub Copilot (VS Code) e, com adaptacao, Kilo Code.
Nada aqui e especifico de um projeto: as regras de projeto continuam nas `*.instructions.md`
de cada repositorio.

## Conteudo

```
.github/
  agents/
    test-auditor.agent.md              # auditor de testes, somente leitura
  prompts/
    sdd-plan.prompt.md                 # /sdd-plan
    sdd-implement.prompt.md            # /sdd-implement
    sdd-review.prompt.md               # /sdd-review
    sdd-archive.prompt.md              # /sdd-archive
    auditar-testes.prompt.md           # /auditar-testes
  skills/
    sdd-openspec/                      # contrato do fluxo SDD (fonte unica de verdade)
    angular-modern/                    # Angular 21+
    angular-jest-testing/              # Jest + jest-preset-angular
    native-federation/                 # micro frontends
    signalstore-feature/               # @ngrx/signals
```

## Independencia

Cada skill declara escopo e dependencias. Nenhuma exige outra. Os pontos de contato
inevitaveis (testar uma store, testar um componente federado) sao tratados como secoes
**opcionais** que degradam com elegancia quando a outra tecnologia nao existe no projeto.

Consequencia pratica: um projeto Angular 21 sem federation e sem NgRx instala apenas
`angular-modern` e `angular-jest-testing` e nada quebra.

## Instalacao (Copilot / VS Code)

Copie a pasta `.github/` para a raiz do repositorio alvo. Depois:

- os prompts aparecem no chat como `/sdd-plan`, `/sdd-implement`, `/sdd-review`,
  `/sdd-archive` e `/auditar-testes`;
- o agente aparece no seletor de agentes como `test-auditor`;
- as skills sao carregadas sob demanda pela descricao do frontmatter.

Se a sua versao do VS Code usar nomes de campo diferentes no frontmatter (`agent:` em vez
de `mode:`, ou outra lista de `tools`), ajuste apenas o frontmatter - o corpo dos arquivos
nao muda. Use `Chat: Open Customizations` na paleta de comandos para conferir os nomes
validos na versao instalada.

## Uso com Kilo Code

As skills sao o formato portavel: copie `.github/skills/` para `.agents/skills/`
(ou crie um link simbolico). Prompts e agentes usam formato proprio de cada ferramenta e
precisam de um adaptador fino - o conteudo, porem, ja esta todo nas skills, entao o
adaptador e curto.

## Fluxo SDD sem OpenSpec instalado

Os quatro comandos `/sdd-*` implementam a convencao `openspec/` em markdown puro.
O CLI e opcional: se estiver presente, e usado para validar e arquivar; se nao estiver,
o agente executa o mesmo fluxo manualmente e o resultado em disco e identico.
Ninguem no time precisa aprender ou instalar o OpenSpec.

## Manutencao

Estes arquivos sao copiados para dentro de cada repositorio. Copia manual gera drift:
depois de alguns meses ninguem sabe qual projeto esta com qual versao. Assim que o numero
de repositorios passar de dois ou tres, empacote este diretorio e distribua com um CLI de
sync que grave um lockfile com hash.
