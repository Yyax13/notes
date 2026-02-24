## NOME

**awk** - linguagem para processamento de texto por colunas

## SINOPSE

`awk [OPÇÕES] 'PROGRAMA' [ARQUIVO...]`

---

## DESCRIÇÃO

O `awk` lê entrada linha a linha, divide em campos e executa regras.

É excelente para relatórios rápidos, filtros tabulares e extração de dados.

---

## CONCEITOS ESSENCIAIS

- **`$1`, `$2`, ...**: campos da linha.
- **`$0`**: linha inteira.
- **`FS`**: separador de entrada.
- **`OFS`**: separador de saída.
- **`NR`**: número da linha atual.

---

## EXEMPLOS

- Mostrar primeira coluna:

`awk '{print $1}' arquivo.txt`

- Mostrar colunas 1 e 3:

`awk '{print $1, $3}' arquivo.txt`

- Definir separador `:`:

`awk -F ':' '{print $1, $3}' /etc/passwd`

- Filtrar linhas por condição numérica:

`awk '$3 > 100 {print $1, $3}' dados.txt`

- Somar valores da 2ª coluna:

`awk '{s+=$2} END {print s}' valores.txt`

- Exibir com cabeçalho e total:

`awk 'BEGIN{print "Inicio"} {print $1} END{print "Fim"}' arquivo.txt`

---

## ERROS COMUNS

- **Separador errado (`-F`) para o arquivo analisado**.
- **Confundir índice de campo (começa em `$1`)**.
- **Comparar número como texto sem perceber formato de entrada**.

---

## CÓDIGO DE SAÍDA

- **0**: execução com sucesso.
- **> 0**: erro de sintaxe do programa ou leitura de arquivo.

---
