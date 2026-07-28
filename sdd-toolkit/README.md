# SDD para GitHub Copilot Chat

Fluxo guiado por especificação para VS Code, em markdown puro. Sem CLI, sem instalação
global, sem dependência de npm. Você copia duas pastas para o seu repositório e o fluxo
existe.

O objetivo é duplo e os dois lados são inegociáveis: **código pronto para produção** e
**economia de token**. Tudo neste toolkit existe porque paga um dos dois. O que não pagava
foi retirado.

---

## 1. O problema que isso resolve

Pedir código direto ao Copilot funciona bem para tarefas pequenas e falha de forma cara
em tarefas médias. A falha tem sempre a mesma forma: o modelo assume o que você não
disse, você só descobre na revisão, e a correção custa mais do que teria custado
escrever o acordo antes.

O fluxo separa julgamento de execução. O julgamento acontece uma vez, por escrito, num
modelo caro. A execução acontece muitas vezes, contra um documento, num modelo barato. A
revisão confere execução contra julgamento, sem reabrir o julgamento.

Efeito colateral que importa tanto quanto: o contexto que cada etapa carrega é conhecido
e pequeno. Você deixa de mandar o repositório inteiro para o modelo porque não sabe do
que ele precisa.

---

## 2. Instalação

Copie para a raiz do seu repositório:

```
.github/prompts/          os quatro comandos
.github/skills/           o contrato do fluxo
.sdd/                     onde as mudanças e as specs vivem
docs/briefings/           onde você escreve os pedidos
```

Não há passo dois. Não há build, não há `npm install`, não há binário.

No VS Code, confirme que os prompt files estão habilitados. Em `settings.json`:

```json
{
  "chat.promptFiles": true
}
```

Depois disso, digitar `/sdd-plan` no Copilot Chat funciona.

Versione as quatro pastas. `.sdd/` é documentação do projeto, não artefato de build:
entra no commit, entra no pull request, é revisado como código.

---

## 3. As duas camadas

Este é o conceito que mais gera confusão, e o único que você precisa entender antes de
usar. Três documentos falam do mesmo assunto em tempos verbais diferentes.

| Documento | Onde vive            | Tempo verbal                    | Quem escreve   | Vida útil    |
| --------- | -------------------- | ------------------------------- | -------------- | ------------ |
| briefing  | `docs/briefings/`    | "quero que **passe a** fazer X" | você, à mão    | descartável  |
| proposta  | `.sdd/changes/<id>/` | "**vamos fazer** X"             | `/sdd-plan`    | até arquivar |
| spec      | `.sdd/specs/`        | "o sistema **faz** X"           | `/sdd-archive` | permanente   |

O briefing é matéria-prima. Ele é lido uma vez, no planejamento, e suas restrições são
transcritas para a proposta. Depois disso ninguém mais o lê — uma cópia fica em
`briefing.md` dentro da mudança apenas para auditoria.

A proposta é o acordo. É contra ela que a implementação é feita e é contra ela que a
revisão julga.

A spec é o estado do sistema. Ela só muda no arquivamento, quando uma mudança aprovada é
absorvida. É por isso que a implementação tem proibição explícita de editá-la: spec
editada durante a implementação deixa de ser acordo prévio e vira diário do que foi
feito.

### Por que a camada de specs existe

Sem ela, o `archive/` é o único registro do que o sistema faz — e ninguém vai ler
quarenta mudanças arquivadas para descobrir o comportamento atual de um módulo. O archive
responde "o que mudou e por quê". A spec responde "como funciona hoje". São perguntas
diferentes.

### Cobertura parcial é o estado normal

Num repositório que já existe, `.sdd/specs/index.md` nasce vazio e cresce só pelo que o
fluxo tocar. Isso é esperado. A regra que impede o desastre está escrita no próprio
índice: **ausência de uma capacidade significa "não documentado", nunca "não existe"**.
Nenhuma etapa pode concluir que um comportamento não existe por não achá-lo na spec.

---

## 4. Os quatro comandos

### `/sdd-plan`

Entrada: caminho de um briefing em `docs/briefings/`, mais caminhos de contexto
opcionais.

Lê o briefing, extrai as restrições, consulta o índice de capacidades, lê só as
capacidades afetadas, olha as mudanças abertas para detectar conflito, classifica o
rigor, e escreve a pasta da mudança.

Saída em disco: `briefing.md` (cópia literal), `proposta.md`, `tarefas.md`, `design.md`
se rigor Full, e `deltas.md` se houver mudança de comportamento.

Se houver ambiguidade que impeça escrever um critério de aceite verificável, ele não
escreve nada — lista as perguntas e para. Isso é a feature, não um defeito.

### `/sdd-implement`

Entrada: change-id.

Lê proposta, design, tarefas — nessa ordem — e só depois lê código. Executa tarefa por
tarefa, roda a verificação de cada uma, marca `[x]` só depois que passou.

Não lê o briefing, não lê os deltas, não toca em `specs/`. Se um critério se revelar
errado, para e reporta em vez de ajustar a proposta em silêncio.

### `/sdd-review`

Entrada: change-id.

Audita e emite veredito. Confere critério contra código e teste, tarefa marcada contra
evidência, e faz a conferência bidirecional dos deltas: todo critério de comportamento
tem delta, todo delta tem critério.

APROVADO ou REPROVADO. Não existe "aprovado com ressalvas" — isso é reprovado com
educação.

### `/sdd-archive`

Entrada: change-id.

Etapa mecânica. Exige veredito aprovado, aplica os deltas em `specs/` copiando o texto
literalmente, aloca os números dos requisitos novos, atualiza o índice, e move a pasta
para `archive/AAAA-MM-DD-<change-id>/`.

Se um alvo de `SUBSTITUIR` ou `REMOVER` não existir, ele para antes de escrever qualquer
arquivo. Aplicação parcial deixaria `specs/` num estado que não corresponde a nenhuma
mudança.

---

## 5. O ciclo, do começo ao fim

```
docs/briefings/idempotencia-confirmacao.md      você escreve à mão
        │
        │  /sdd-plan
        ▼
.sdd/changes/adicionar-idempotencia-confirmacao/
        ├── briefing.md      cópia literal, auditoria
        ├── proposta.md      o acordo
        ├── tarefas.md       o checklist
        └── deltas.md        o que vai mudar em specs/
        │
        │  /sdd-implement    lê proposta + tarefas, escreve código
        ▼
        │  /sdd-review       APROVADO
        ▼
        │  /sdd-archive
        ▼
.sdd/specs/confirmacao-efetivacao/spec.md       atualizado
.sdd/specs/index.md                             atualizado
.sdd/changes/archive/2026-07-28-adicionar-idempotencia-confirmacao/
```

Um chat novo por etapa. Isso não é preciosismo — é a diferença entre carregar 8 mil
tokens e carregar 60 mil. Detalhes em `docs/guia-contexto-e-modelos.md`.

---

## 6. Roteamento de modelo

Os quatro prompts vêm com `model: Claude Sonnet 5 (copilot)` no front matter, que é um
padrão seguro. Mas as quatro etapas não têm a mesma dificuldade, e usar o mesmo modelo
nas quatro é desperdício de um lado e risco do outro.

| Comando          | Natureza do trabalho                                                     | Modelo indicado          |
| ---------------- | ------------------------------------------------------------------------ | ------------------------ |
| `/sdd-plan`      | julgamento aberto: decidir escopo, criar critérios, escrever delta final | o mais capaz disponível  |
| `/sdd-implement` | execução contra documento, com verificação a cada passo                  | intermediário            |
| `/sdd-review`    | achar o que está errado, ceticismo                                       | o mais capaz disponível  |
| `/sdd-archive`   | copiar texto e mover pasta, zero julgamento                              | o mais barato disponível |

Para trocar, edite a linha `model:` no front matter do prompt. Use exatamente o nome que
aparece no seletor de modelo do Copilot Chat na sua organização — um nome inválido
quebra o prompt para todo mundo que copiar a pasta.

O plan e o review pagam modelo caro porque erro nessas etapas se propaga: critério
mal-escrito vira código errado, revisão complacente vira dívida. O archive não paga,
porque cópia literal de texto não melhora com inteligência.

---

## 7. Rigor: Lite e Full

O padrão é **Lite**: proposta e tarefas, sem design.

Suba para **Full** — que exige `design.md` — quando houver ao menos um destes:

- mudança de contrato entre camadas;
- operação irreversível ou migração de dados;
- exigência regulatória ou de segurança;
- mais de um repositório envolvido.

Alterar `specs/` **não** sobe o rigor. Quase toda mudança útil altera comportamento
observável; se isso bastasse, o rigor Lite deixaria de existir na prática.

Cerimônia acima do risco é desperdício, e desperdício de cerimônia é o que faz equipe
abandonar processo.

---

## 8. Anti-padrões

**Escrever critério de aceite no briefing.** O briefing descreve o problema. Critério é
resultado do planejamento e precisa ser verificável, o que exige olhar o estado atual.

**Rodar as quatro etapas no mesmo chat.** Na quarta etapa o contexto carrega o lixo das
três anteriores, o custo por mensagem sobe e a qualidade cai.

**Deixar o implement "ajustar" a proposta.** No momento em que a proposta passa a
descrever o que foi feito, ela deixa de servir para revisar o que foi feito.

**Editar `.sdd/specs/` à mão.** A spec é resultado de mudança aprovada. Editá-la
diretamente cria comportamento documentado que ninguém revisou.

**Aceitar delta sem critério.** É escopo entrando pela porta dos fundos: comportamento
que ninguém negociou e ninguém testou.

**Ler `specs/` inteiro.** Existe um índice justamente para isso. `specs/` sempre-ativo é
regressão de economia de token disfarçada de organização.

**Backfill em massa da spec.** Documentar cinquenta capacidades de uma vez produz
cinquenta requisitos sem critério de aceite e sem revisão. A spec cresce pelo fluxo ou
não cresce.

---

## 9. Perguntas frequentes

**Preciso de briefing para tarefa de duas linhas?** Não. O fluxo é para mudança que
alguém vai revisar. Corrigir um typo não precisa de acordo escrito.

**Onde ficam as regras de stack, framework e padrão de código?** Fora daqui. Este fluxo
cobre processo e artefatos. Regras técnicas vêm de `copilot-instructions.md`, de
`.instructions.md` com `applyTo`, e de outras skills. Misturar as duas coisas faz você
carregar regra de Angular ao arquivar uma pasta.

**O que é uma "capacidade"?** Uma fatia de comportamento com dono claro, não uma pasta do
código. Teste: as duas coisas seriam descritas na mesma conversa com um analista de
negócio? Se sim, é a mesma capacidade.

**Duas mudanças abertas na mesma capacidade?** O `/sdd-plan` detecta e declara o conflito
na proposta. Resolver é decisão humana: sequenciar, mesclar ou cancelar.

**Posso usar isso com outra IDE ou outro assistente?** O conteúdo é markdown puro. O que
é específico do VS Code é o formato dos `.prompt.md` e o carregamento automático de
skills. O contrato em `SKILL.md` e as referências funcionam colados em qualquer chat.

**E se eu quiser validação automática?** É o próximo passo natural: um script Node de
arquivo único, sem dependência, invocado como `node .sdd/sdd.mjs validate`. Regra escrita
em markdown custa token toda vez que é carregada; regra escrita em código custa zero,
sempre. Não está incluído nesta versão.

---

## 10. Mapa dos arquivos

| Arquivo                                                      | Papel                                             |
| ------------------------------------------------------------ | ------------------------------------------------- |
| `.github/prompts/sdd-*.prompt.md`                            | os quatro comandos. Invocadores finos             |
| `.github/skills/sdd-workflow/SKILL.md`                       | contrato do fluxo. Fonte única de verdade         |
| `.github/skills/sdd-workflow/references/moldes-artefatos.md` | formato de cada artefato                          |
| `.github/skills/sdd-workflow/references/specs-e-deltas.md`   | contrato da camada de specs                       |
| `.sdd/specs/index.md`                                        | índice de capacidades. Mantido pelo archive       |
| `docs/briefings/EXEMPLO-briefing.md`                         | modelo de briefing                                |
| `docs/guia-contexto-e-modelos.md`                            | modelo, esforço de raciocínio, janela de contexto |

Os prompts são deliberadamente finos. Toda regra de fluxo mora no `SKILL.md`, que é
carregado uma vez por invocação. Regra duplicada em quatro arquivos é regra que vai
divergir em quatro arquivos.

| Name                     | Context Size | Capabilities  | In   | Out  | Cache Read | Cache Write |
| :----------------------- | :----------- | :------------ | :--- | :--- | :--------- | :---------- |
| Claude Fable 5           | 1M           | Tools, Vision | 1000 | 5000 | 100        | 1250        |
| Claude Haiku 4.5         | 200K         | Tools, Vision | 100  | 500  | 10         | 125         |
| Claude Opus 4.8          | 1M           | Tools, Vision | 500  | 2500 | 50         | 625         |
| Claude Opus 5            | 1M           | Tools, Vision | 500  | 2500 | 50         | 625         |
| Claude Sonnet 5          | 1M           | Tools, Vision | 200  | 1000 | 20         | 250         |
| Gemini 3 Flash (Preview) | 173K         | Tools, Vision | 50   | 300  | 5          | 0           |
| Gemini 3.1 Pro (Preview) | 1M           | Tools, Vision | 200  | 1200 | 20         | 0           |
| Gemini 3.5 Flash         | 1M           | Tools, Vision | 150  | 900  | 15         | 0           |
| Gemini 3.6 Flash         | 1M           | Tools, Vision | 150  | 750  | 15         | 0           |
| GPT-5 mini               | 192K         | Tools, Vision | 25   | 200  | 2          | 0           |
| GPT-5.3-Codex            | 400K         | Tools, Vision | 175  | 1400 | 17         | 0           |
| GPT-5.4                  | 1M           | Tools, Vision | 250  | 1500 | 25         | 0           |
| GPT-5.4 mini             | 400K         | Tools, Vision | 75   | 450  | 7          | 0           |
| GPT-5.5                  | 1M           | Tools, Vision | 500  | 3000 | 50         | 0           |
| GPT-5.6 Luna             | 1M           | Tools, Vision | 100  | 600  | 10         | 125         |
| GPT-5.6 Sol              | 1M           | Tools, Vision | 500  | 3000 | 50         | 625         |
| GPT-5.6 Terra            | 1M           | Tools, Vision | 250  | 1500 | 25         | 312         |
| Kimi K2.7 Code           | 256K         | Tools, Vision | 95   | 400  | 19         | 0           |
| MAI-Code-1-Flash         | 256K         | Tools         | 75   | 450  | 7          | 0           |
