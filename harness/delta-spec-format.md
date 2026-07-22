# Formato de specs e delta specs

## 1. Spec completa (openspec/specs/<dominio>/spec.md)

```markdown
# <Dominio> Specification

## Purpose
Uma frase sobre o que este dominio cobre.

## Requirements

### Requirement: Autenticacao do Usuario
O sistema SHALL emitir um token de sessao apos login valido.

#### Scenario: Credenciais validas
- GIVEN um usuario com credenciais validas
- WHEN o formulario de login e submetido
- THEN um token de sessao e retornado
- AND o usuario e redirecionado para a area logada

#### Scenario: Credenciais invalidas
- GIVEN credenciais invalidas
- WHEN o formulario de login e submetido
- THEN uma mensagem de erro generica e exibida
- AND nenhum token e emitido
```

## 2. Palavras-chave RFC 2119

| Palavra | Significado | Quando usar |
|---|---|---|
| MUST / SHALL | obrigatorio absoluto | regra que, violada, e defeito |
| SHOULD | recomendado | existe excecao legitima e documentavel |
| MAY | opcional | comportamento permitido, nao esperado |

Nao use "deve", "poderia", "idealmente". Nao misture duas obrigacoes na mesma frase:
dois MUST significam dois requisitos.

## 3. Delta spec (openspec/changes/<id>/specs/<dominio>/spec.md)

```markdown
# Delta: <Dominio>

## ADDED Requirements

### Requirement: Autenticacao em Dois Fatores
O sistema MUST suportar segundo fator baseado em TOTP.

#### Scenario: Ativacao do segundo fator
- GIVEN um usuario sem 2FA ativo
- WHEN ele ativa 2FA nas configuracoes
- THEN um QR code de provisionamento e exibido
- AND a ativacao so conclui apos validacao de um codigo

## MODIFIED Requirements

### Requirement: Expiracao de Sessao
O sistema MUST expirar a sessao apos 15 minutos de inatividade.
(Anterior: 30 minutos)

#### Scenario: Timeout por inatividade
- GIVEN uma sessao autenticada
- WHEN passam 15 minutos sem interacao
- THEN a sessao e invalidada

## REMOVED Requirements

### Requirement: Manter Conectado
(Removido em favor de 2FA. O usuario reautentica a cada sessao.)
```

### Regras do delta

1. **Um arquivo por dominio afetado.** Nao junte dominios no mesmo `spec.md`.
2. **`MODIFIED` reescreve o requisito completo no estado final.** Nao escreva
   "mudar 30 para 15". O merge do archive substitui o bloco inteiro; bloco parcial
   corrompe a spec.
3. **`MODIFIED` exige que o requisito exista** com o mesmo `### Requirement:` na spec atual.
   Nome diferente = `ADDED` + `REMOVED`, nao `MODIFIED`.
4. **`REMOVED` nao leva cenarios**, apenas o titulo e a justificativa entre parenteses.
5. **Nao inclua secao vazia.** Se nada foi removido, `## REMOVED Requirements` nao existe.

## 4. Qualidade de cenario

Um cenario ruim nao vira teste. Cheque:

| Sintoma | Exemplo ruim | Correcao |
|---|---|---|
| Nao observavel | THEN o servico processa corretamente | THEN a resposta tem status 201 e corpo com o id gerado |
| Sem estado inicial | WHEN o usuario clica em salvar | GIVEN um formulario com todos os campos obrigatorios preenchidos |
| Detalhe de implementacao | THEN o metodo salvar() e chamado | THEN o registro fica disponivel na listagem |
| Multiplos comportamentos | THEN salva, notifica e audita | tres cenarios, ou tres requisitos |

Cobertura minima por requisito: 1 caminho feliz + 1 caminho de erro. Adicione borda quando
houver limite numerico, temporal ou de permissao.

## 5. Checklist de validacao manual (quando nao ha CLI)

- [ ] Todo arquivo delta comeca com `# Delta: <Dominio>`
- [ ] Toda secao usa exatamente `## ADDED Requirements` / `## MODIFIED Requirements` / `## REMOVED Requirements`
- [ ] Todo requisito usa exatamente `### Requirement: <Nome>`
- [ ] Todo cenario usa exatamente `#### Scenario: <Nome>`
- [ ] Nenhum requisito ADDED/MODIFIED sem cenario
- [ ] Nenhum nome de classe, arquivo ou biblioteca dentro de `spec.md`
