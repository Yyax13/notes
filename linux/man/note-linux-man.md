## NOME

**man** - exibe manual de comandos e funções do sistema

## SINOPSE

`man [SEÇÃO] NOME`

---

## DESCRIÇÃO

O `man` abre páginas de manual locais com documentação oficial dos comandos.

É a principal referência nativa para sintaxe, opções e exemplos.

---

## USOS MAIS COMUNS

- **`man comando`**: abre manual padrão do comando.
- **`man 5 arquivo`**: abre seção específica (ex.: formatos de arquivo).
- **`man -k termo`**: busca por palavra-chave (aprox. `apropos`).
- **`man -f comando`**: descrição curta (aprox. `whatis`).

---

## EXEMPLOS

- Abrir manual do `grep`:

`man grep`

- Buscar comandos relacionados a rede:

`man -k network`

- Ver descrição curta de `tar`:

`man -f tar`

---

## NAVEGAÇÃO NO MAN

- **`/texto`**: buscar no documento.
- **`n`**: próxima ocorrência da busca.
- **`q`**: sair.
- **`h`**: ajuda do pager.

---

## CÓDIGO DE SAÍDA

- **0**: manual exibido com sucesso.
- **> 0**: página não encontrada ou erro de configuração.

---
