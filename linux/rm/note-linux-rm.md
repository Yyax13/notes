## NOME

**rm** - remove arquivos e diretórios

## SINOPSE

`rm [OPÇÕES]... ARQUIVO...`

---

## DESCRIÇÃO

O `rm` remove permanentemente arquivos e, com opções, diretórios.

Use com atenção: em geral não há lixeira e a recuperação pode ser difícil.

---

## OPÇÕES MAIS USADAS

- **`-r` / `-R`**: remove diretórios recursivamente.
- **`-f`**: força remoção sem perguntar.
- **`-i`**: pede confirmação para cada remoção.
- **`-I`**: pede confirmação uma única vez em operações maiores.
- **`-v`**: exibe o que foi removido.

---

## EXEMPLOS

- Remover arquivo:

`rm arquivo.txt`

- Remover múltiplos arquivos:

`rm a.txt b.txt c.txt`

- Remover diretório com conteúdo:

`rm -r pasta/`

- Remover com confirmação:

`rm -ri pasta/`

- Remover sem confirmação:

`rm -rf build/`

---

## PRÁTICAS SEGURAS

- Listar antes de remover:

`ls pasta/`

- Confirmar caminho atual:

`pwd`

- Em scripts, validar variável antes de usar em `rm -rf`.

---

## ERROS COMUNS

- **Usar curingas amplos sem validar (`*`)**.
- **Executar `rm -rf` em caminho errado**.
- **Assumir que há lixeira no terminal**.

---

## CÓDIGO DE SAÍDA

- **0**: remoção concluída.
- **> 0**: erro de permissão, caminho inexistente ou argumento inválido.

---
