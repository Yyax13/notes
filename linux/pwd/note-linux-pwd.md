## NOME

**pwd** - exibe o diretório de trabalho atual

## SINOPSE

`pwd [OPÇÃO]`

---

## DESCRIÇÃO

O `pwd` (print working directory) mostra o caminho absoluto da pasta atual no terminal.

É muito útil para confirmar contexto antes de executar comandos de cópia, remoção ou scripts.

---

## OPÇÕES MAIS USADAS

- **`-P`**: mostra caminho físico real (resolvendo links simbólicos).
- **`-L`**: mostra caminho lógico (padrão em muitos shells, mantendo symlinks no caminho).

---

## EXEMPLOS

- Mostrar diretório atual:

`pwd`

- Mostrar caminho físico:

`pwd -P`

- Mostrar caminho lógico:

`pwd -L`

---

## ERROS COMUNS

- **Executar comandos destrutivos sem confirmar pasta atual**.
- **Confundir caminho lógico com físico em ambientes com symlink**.

---

## CÓDIGO DE SAÍDA

- **0**: execução com sucesso.
- **> 0**: erro no ambiente/shell.

---
