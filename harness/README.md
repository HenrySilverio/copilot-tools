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
- `.github/skills/sdd-workflow/references/formato-spec.md`
- `.github/skills/sdd-workflow/references/moldes-artefatos.md`
- `.github/skills/angular-modern/SKILL.md`
- `.github/skills/angular-modern/references/api-map.md`
- `.github/skills/angular-jest-testing/SKILL.md`
- `.github/skills/angular-jest-testing/references/cobertura-e-cenarios.md`
- `.github/skills/native-federation/SKILL.md`
- `.github/skills/native-federation/references/troubleshooting.md`
- `.github/skills/signalstore-feature/SKILL.md`
- `.github/skills/signalstore-feature/references/modelagem.md`

Em tempo de execucao, o fluxo SDD cria e mantem a pasta `.sdd/` na raiz do repositorio.
Ela e versionada junto com o codigo.

## Independencia entre skills

Cada skill declara escopo e dependencias. Nenhuma exige outra. Os pontos de contato
inevitaveis, como testar uma store ou testar um componente carregado remotamente, sao
tratados como secoes opcionais que degradam com elegancia quando a tecnologia nao existe no
projeto.

Consequencia pratica: um projeto Angular sem federation e sem biblioteca de estado instala
apenas as duas skills que lhe interessam e nada quebra.

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
