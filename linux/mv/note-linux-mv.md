## NOME

**mv** - move ou renomeia arquivos e diretórios

## SINOPSE

`mv [OPÇÕES]... ORIGEM DESTINO`

`mv [OPÇÕES]... ORIGEM... DIRETORIO`

---

## DESCRIÇÃO

O `mv` move arquivos/pastas entre caminhos e também renomeia itens.

É amplamente usado em organização de projeto e fluxo de deploy.

---

## OPÇÕES MAIS USADAS

- **`-v`**: mostra operações realizadas.
- **`-i`**: pede confirmação antes de sobrescrever.
- **`-n`**: não sobrescreve arquivos existentes.
- **`-u`**: move apenas se a origem for mais nova.
- **`-f`**: força sobrescrita sem perguntar.

---

## EXEMPLOS

- Renomear arquivo:

`mv antigo.txt novo.txt`

- Mover arquivo para pasta:

`mv app.log logs/`

- Mover múltiplos arquivos:

`mv *.md docs/`

- Mover diretório inteiro:

`mv projeto-antigo projeto-legacy`

- Evitar sobrescrever destino:

`mv -n config.php backup/`

---

## ERROS COMUNS

- **Sobrescrever destino por engano:** use `-i` ou `-n`.
- **Mover para caminho errado:** valide com `pwd` e `ls` antes.
- **Permissão negada:** falta de escrita no diretório de destino.

---

## CÓDIGO DE SAÍDA

- **0**: operação concluída com sucesso.
- **> 0**: erro de caminho/permissão/arquivo inexistente.

---
