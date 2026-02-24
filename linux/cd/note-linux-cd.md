## NOME

**cd** - altera o diretório de trabalho atual

## SINOPSE

`cd [DIRETORIO]`

---

## DESCRIÇÃO

O `cd` muda o diretório atual da sessão de shell.

É comando base de navegação para qualquer fluxo de trabalho no terminal.

---

## USOS MAIS COMUNS

- **`cd NOME_DIRETORIO`**: entra em um diretório.
- **`cd ..`**: volta para o diretório pai.
- **`cd ~`**: vai para a HOME do usuário.
- **`cd -`**: volta para o último diretório visitado.
- **`cd`**: sem argumentos, normalmente vai para a HOME.

---

## EXEMPLOS

- Entrar em pasta de projeto:

`cd ~/projetos/notes`

- Voltar um nível:

`cd ..`

- Alternar entre duas pastas:

`cd -`

- Entrar em caminho com espaço:

`cd "Minha Pasta"`

---

## ERROS COMUNS

- **Esquecer aspas em caminhos com espaço**.
- **Digitar caminho relativo errado sem validar com `pwd`/`ls`**.
- **Confundir `cd -` com retorno de comando**.

---

## CÓDIGO DE SAÍDA

- **0**: diretório alterado com sucesso.
- **> 0**: caminho inexistente ou sem permissão de acesso.

---
