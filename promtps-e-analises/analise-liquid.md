Você é um analisador estático READ-ONLY. NÃO altere, refatore, crie ou sugira código.
Sua única tarefa é INVENTARIAR como este MFE Angular consome o Design System "Liquid" do Bradesco.

CONTEXTO: O Liquid é entregue como (a) folhas de CSS globais e (b) web components nativos
com prefixo fixo `brad-` registrados no customElements global. O MFE roda dentro de um Shell
que carrega uma versão DIFERENTE do Liquid. Preciso saber o grau de dependência do MFE sobre
o BUNDLE JS (tags <brad-*> e sua API) versus apenas as CLASSES CSS (class="brad-*"), porque
tag JS depende da versão registrada globalmente e classe CSS não.

REGRAS:
- Cite sempre arquivo:linha. Se não encontrar algo, escreva "não encontrado". Não invente.
- Não conte ocorrências dentro de comentários ou código morto.
- Distinga rigorosamente: `<brad-x>` (web component JS) ≠ `class="brad-x"` (classe CSS).

PRODUZA EXATAMENTE ESTAS 7 SEÇÕES, em tabelas markdown:

## 1. Web components JS consumidos (tags <brad-*>)
Tabela: | Tag | Qtd usos | Arquivos:linha | Presentacional ou Interativo |
"Interativo" = tem estado, emite eventos, ou responde a input do usuário (ex: modal, dropdown,
input, accordion). "Presentacional" = só renderiza (ex: ícone, badge, divider).

## 2. Superfície de API acoplada à VERSÃO desses web components
Para cada <brad-*> da seção 1, liste TODO acoplamento à API do componente:
Tabela: | Tag | Property/attribute bindings ([x]="", attr.x) | Event bindings ((x)="") | Chamada imperativa (nativeElement.metodo(), @ViewChild pegando o elemento) | Arquivo:linha |
Este é o dado mais importante: property/evento/método que mude entre versões quebra em runtime.

## 3. Classes CSS do Liquid (class="brad-*")
Tabela: | Classe brad-* | Qtd usos | Amostra de 2 arquivos:linha |
Só precisa da lista das classes distintas e volume aproximado, não de todas as ocorrências.

## 4. Uso de design tokens / CSS custom properties do Liquid
Procure por `--brad-` (ou variáveis de tema do Liquid) em .scss/.css/.ts/.html.
Tabela: | Variável | Onde é lida/definida | Arquivo:linha |

## 5. Overlays que renderizam fora do componente (CDK)
Procure por @angular/cdk Overlay, MatDialog, CdkPortal, ou serviços que criam elementos no
document.body / fora do template (modais, tooltips, dropdowns). Liste arquivo:linha e o que abrem.

## 6. Configuração de encapsulation e schemas
- `ViewEncapsulation` atual do AppComponent e de qualquer componente que use <brad-*> (arquivo:linha).
- Presença de `CUSTOM_ELEMENTS_SCHEMA` (arquivo:linha).
- Onde o CSS/JS do Liquid é referenciado: index.html, angular.json (styles/scripts), imports em .ts.

## 7. VEREDITO (preencha os números)
- Total de tags <brad-*> distintas: N
- Dessas, quantas são Interativas: N
- Total de classes class="brad-*" distintas: N
- Estimativa: o MFE é predominantemente CSS-driven ou JS-web-component-driven? (uma frase, baseada nos números acima)
- Lista final dos web components JS INTERATIVOS que teriam que ou (a) ser substituídos por Angular nativo, ou (b) depender da versão do Shell: [...]

Se houver ferramenta de busca/grep no workspace, varra todo o src/. Caso contrário, analise
apenas os arquivos referenciados. Não ultrapasse o escopo de leitura.