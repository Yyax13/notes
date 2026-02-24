## NOME

**which** - localiza o executável de um comando no PATH

## SINOPSE

`which [OPÇÕES] NOME...`

---

## DESCRIÇÃO

O `which` mostra o caminho do executável que será chamado quando você digita um comando.

É útil para depuração de ambiente, múltiplas versões e validação de instalação.

---

## OPÇÕES MAIS USADAS

- **`-a`**: mostra todas as ocorrências encontradas no `PATH`.

---

## EXEMPLOS

- Localizar `python`:

`which python`

- Ver todas as versões no PATH:

`which -a node`

- Validar instalação do `git`:

`which git`

---

## ERROS COMUNS

- **Confundir alias/função de shell com executável real**.
- **Achar que ausência no `which` significa ausência total do comando (pode ser built-in)**.

---

## CÓDIGO DE SAÍDA

- **0**: comando encontrado.
- **> 0**: comando não encontrado no `PATH`.

---
