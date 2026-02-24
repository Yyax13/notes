## NOME

**cp** - copia arquivos e diretórios

## SINOPSE

`cp [OPÇÕES]... ORIGEM DESTINO`

`cp [OPÇÕES]... ORIGEM... DIRETORIO`

---

## DESCRIÇÃO

O comando `cp` copia arquivos e diretórios para outro local.

É usado para backup rápido, duplicação de estrutura e preparo de versões de arquivos.

---

## OPÇÕES MAIS USADAS

- **`-r` / `-R`**: copia diretórios recursivamente.
- **`-v`**: mostra o que está sendo copiado.
- **`-i`**: pede confirmação antes de sobrescrever.
- **`-n`**: não sobrescreve arquivos existentes.
- **`-u`**: copia apenas quando a origem é mais nova.
- **`-p`**: preserva permissões, dono e timestamps.
- **`-a`**: modo arquivo (preserva atributos e copia recursivamente).

---

## EXEMPLOS

- Copiar arquivo simples:

`cp origem.txt destino.txt`

- Copiar arquivo para diretório:

`cp config.env backup/`

- Copiar diretório inteiro:

`cp -r projeto projeto-backup`

- Copiar preservando atributos:

`cp -a projeto/ backup/projeto/`

- Evitar sobrescrever:

`cp -n *.md backup/`

---

## ERROS COMUNS

- **Esquecer `-r` ao copiar pasta:** resulta em erro.
- **Sobrescrever sem querer:** prefira `-i` ou `-n`.
- **Perder permissões originais:** use `-p` ou `-a`.

---

## CÓDIGO DE SAÍDA

- **0**: cópia concluída com sucesso.
- **> 0**: erro de leitura, escrita ou permissão.

---
