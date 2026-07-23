# AI Toolkit - Angular

Artefatos compartilhados para GitHub Copilot no VS Code e, com adaptacao, para Kilo Code.
Nada aqui e especifico de um projeto: as regras de cada repositorio continuam nos arquivos
de instructions daquele repositorio.

Este README nao e copiado para o projeto alvo. Apenas o conteudo de `.github/` e.

## Estrutura de destino

Dentro do repositorio alvo, na pasta `.github/`:

- `.github/agents/test-auditor.agent.md`
- `.github/prompts/sdd-plan.prompt.md`
- `.github/prompts/sdd-implement.prompt.md`
- `.github/prompts/sdd-review.prompt.md`
- `.github/prompts/sdd-archive.prompt.md`
- `.github/prompts/auditar-testes.prompt.md`
- `.github/skills/sdd-workflow/SKILL.md`
- `.github/skills/sdd-workflow/references/moldes-artefatos.md`
- `.github/skills/angular-modern/SKILL.md`
- `.github/skills/angular-modern/references/api-map.md`
- `.github/skills/angular-jest-testing/SKILL.md`
- `.github/skills/angular-jest-testing/references/cobertura-e-cenarios.md`
- `.github/skills/native-federation/SKILL.md`
- `.github/skills/native-federation/references/troubleshooting.md`
- `.github/skills/signalstore-feature/SKILL.md`
- `.github/skills/signalstore-feature/references/modelagem.md`
- `.github/skills/bff-contract/SKILL.md`

```
<raiz-do-repo>/
└── .github/
    ├── agents/
    │   └── test-auditor.agent.md
    ├── prompts/
    │   ├── sdd-plan.prompt.md
    │   ├── sdd-implement.prompt.md
    │   ├── sdd-review.prompt.md
    │   ├── sdd-archive.prompt.md
    │   └── auditar-testes.prompt.md
    └── skills/
        ├── sdd-workflow/
        │   ├── SKILL.md
        │   └── references/moldes-artefatos.md
        ├── angular-modern/
        │   ├── SKILL.md
        │   └── references/api-map.md
        ├── angular-jest-testing/
        │   ├── SKILL.md
        │   └── references/cobertura-e-cenarios.md
        ├── signalstore-feature/
        │   ├── SKILL.md
        │   └── references/modelagem.md
        ├── native-federation/
        │   ├── SKILL.md
        │   └── references/troubleshooting.md
        └── bff-contract/
            └── SKILL.md
```

Em tempo de execucao, o fluxo SDD cria e mantem a pasta `.sdd/` na raiz do repositorio.
Ela e versionada junto com o codigo. O contrato do BFF fica em `contracts/bff/`, fora de
`src/`, tambem versionado junto com o codigo.

O briefing que alimenta o fluxo fica fora de `.sdd/`, em pasta escolhida pelo usuario, e e
informado por caminho a cada invocacao. O toolkit nao fixa essa pasta.

## Independencia entre skills

Cada skill declara escopo e dependencias. Nenhuma exige outra. Os pontos de contato
inevitaveis, como testar uma store ou testar um componente carregado remotamente, sao
tratados como secoes opcionais que degradam com elegancia quando a tecnologia nao existe no
projeto.

Consequencia pratica: um projeto Angular sem federation e sem biblioteca de estado instala
apenas as duas skills que lhe interessam e nada quebra. O mesmo vale para `bff-contract`:
ela so carrega quando a tarefa menciona endpoint, schema ou cliente HTTP do BFF, nunca em
tarefa de componente, store ou teste que nao dependa do contrato.

## Instalacao

Copie o conteudo de `.github/` para a raiz do repositorio alvo. Depois disso:

- os prompts aparecem no chat como comandos de barra, pelo nome do arquivo sem sufixo
- o agente aparece no seletor de agentes pelo nome declarado no frontmatter
- as skills sao carregadas sob demanda, a partir da descricao do frontmatter

Se a sua versao do VS Code usar nomes de campo diferentes no frontmatter, ajuste apenas o
frontmatter. O corpo dos arquivos nao muda. O comando de abertura das customizacoes de chat
na paleta de comandos mostra os nomes validos na versao instalada.

## Uso com Kilo Code

As skills sao o formato portavel. Copie a pasta de skills para o diretorio de skills
externas que o Kilo Code reconhece, ou crie um link simbolico. Prompts e agentes usam
formato proprio de cada ferramenta e precisam de um adaptador fino, mas o conteudo ja esta
todo nas skills, entao o adaptador fica curto.

## Fluxo SDD

Os quatro comandos implementam a convencao da pasta `.sdd/` inteiramente em markdown, sem
CLI, sem instalacao e sem ferramenta externa. Ninguem no time precisa aprender nada alem
dos quatro comandos.

Nao existe camada de especificacao viva do sistema. A fonte de verdade e o proprio codigo;
a entrada do fluxo e um briefing escrito a mao pelo usuario, informado por caminho no
planejamento. Consequencia direta: o arquivamento nao faz merge de nada, apenas move a
mudanca concluida, e por isso deixou de ser uma operacao destrutiva.

A memoria do que ja foi decidido fica no proprio archive. O planejamento varre
`.sdd/changes/archive/` atras de mudancas anteriores que tocaram os mesmos arquivos ou o
mesmo dominio, e le apenas as propostas que derem correspondencia.

Trade-off assumido: uma camada de especificacao acumulada daria consulta imediata ao
comportamento pretendido do sistema, mas exigiria manutencao manual e desincronizaria no
primeiro commit feito fora do fluxo. Consulta sob demanda ao archive custa uma varredura
por planejamento e nunca fica desatualizada, porque nao ha o que atualizar.

## Entradas de contexto e ferramentas externas

Os comandos de planejamento e de implementacao aceitam uma lista opcional de caminhos de
arquivo como contexto adicional. Eles tratam qualquer caminho informado como material de
leitura, sem assumir formato nem ferramenta de origem.

E por esse ponto que qualquer ferramenta externa de analise se integra ao fluxo: rode a
ferramenta quando julgar necessario, e informe o caminho da saida dela junto com o briefing.
O handoff acontece por arquivo em disco, nao por estado de conversa.

Trade-off assumido: o toolkit nao conhece nenhuma ferramenta externa, entao nao existe
acoplamento nem custo de contexto quando ela nao e usada. Em troca, a decisao de quando
rodar a analise e do usuario, e nenhum comando vai sugeri-la sozinho.

## Restricao de conteudo

Por decisao do projeto, nenhum arquivo deste toolkit contem bloco de codigo de exemplo. As
regras sao expressas em tabelas, listas e prosa, com nomes de API citados apenas de forma
inline.

Trade-off assumido: sem exemplo executavel, o modelo recebe menos ancoragem sintatica e a
skill depende mais da tabela de traducao e da precisao dos nomes citados. Isso e
compensado por descricoes de gatilho mais fortes e por checklists de auto-verificacao ao
final de cada skill. Se em algum momento a restricao deixar de valer, os pontos onde um
exemplo agregaria mais sao o mapa de API do Angular e o roteiro de cenarios de teste.

## Manutencao

Estes arquivos sao copiados para dentro de cada repositorio. Copia manual gera divergencia:
depois de alguns meses ninguem sabe qual projeto esta com qual versao. Assim que o numero
de repositorios passar de dois ou tres, empacote este diretorio e distribua com um comando
de sincronizacao que grave um arquivo de trava com hash por arquivo.
