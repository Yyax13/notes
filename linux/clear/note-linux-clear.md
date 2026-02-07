## NOME

**clear** - limpa a tela do terminal

## SINOPSE

`clear [-x] [-T terminal-type]`

`clear -V`

---

## DESCRIÇÃO

O comando `clear` limpa a tela do seu terminal e o seu buffer de rolagem (_scrollback buffer_), se houver. O `clear` obtém o tipo de terminal a partir da variável de ambiente `TERM` e, em seguida, consulta o banco de dados de capacidades de terminal **terminfo** para determinar como realizar essas ações.

As capacidades para limpar a tela e o buffer de rolagem são nomeadas como “clear” e “E3”, respectivamente. A última é uma capacidade definida pelo usuário, aplicando um mecanismo de extensão introduzido no **ncurses 5.0 (1999)**.

---

## OPÇÕES

O `clear` reconhece as seguintes opções:

- **-T tipo**: Produz instruções adequadas para o tipo de terminal especificado. Normalmente, esta opção é desnecessária, pois o tipo é inferido pela variável `TERM`. Se especificada, o `clear` também ignora as variáveis `LINES` e `COLUMNS`.
- **-V**: Reporta a versão do ncurses associada ao programa e sai com status de sucesso.
- **-x**: Impede que o `clear` tente limpar o buffer de rolagem (mantém o histórico acima da tela visível).

---

## PORTABILIDADE

Nem o IEEE Std 1003.1 (POSIX.1-2008) nem o X/Open Curses Issue 7 documentam o comando `clear`.

O último documenta o `tput`, que poderia ser usado para substituir este utilitário através de um script de shell ou um alias (como um link simbólico) para executar `tput` como `clear`.

---

## HISTÓRICO

- **1979 (2BSD):** Um comando `clear` usando o banco de dados e biblioteca `termcap` apareceu no 2BSD.
- **1985 (Eighth Edition Unix):** Incluiu o comando posteriormente.
- **Unix Comercial (AT&T):** Adaptou um programa BSD diferente (`tset`) para criar o comando `tput` e substituiu o programa `clear` por um script de shell que chamava `tput clear`.
- **1989:** Keith Bostic revisou o `tput` do BSD para torná-lo semelhante ao da AT&T e adicionou um script `clear` (executando `exec tput clear`).
- **1995:** O `clear` do ncurses começou adaptando o comando original do BSD para usar `terminfo`.

### A Extensão E3

- **Junho de 1999:** O **xterm** forneceu uma extensão para a sequência de controle padrão. Em vez de limpar apenas a parte visível (`printf '\033[2J'`), passou-se a permitir a limpeza do buffer de rolagem com `printf '\033[3J'`.
- **2006:** O PuTTY adotou o recurso.
- **2011 (Linux 3.0):** O driver de console do Linux foi modificado para suportar o mesmo recurso.
- **2013/2016:** O programa `clear` do ncurses incorporou a extensão em 2013. Em 2016, a lógica foi compartilhada com o `tput` para que `tput clear` também limpasse o buffer.

---
