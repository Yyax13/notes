## NOME

**pacman** - gerencia pacotes em Arch Linux e derivados

## SINOPSE

`pacman [OPÇÕES]`

---

## DESCRIÇÃO

O `pacman` é o gerenciador oficial do Arch Linux.

Ele sincroniza repositórios, instala/remova pacotes e gerencia cache local.

---

## COMANDOS MAIS USADOS

- **`pacman -Syu`**: sincroniza repositórios e atualiza sistema.
- **`pacman -S pacote`**: instala pacote.
- **`pacman -R pacote`**: remove pacote.
- **`pacman -Rs pacote`**: remove pacote e dependências não usadas.
- **`pacman -Ss termo`**: busca no repositório.
- **`pacman -Qi pacote`**: mostra pacote instalado.
- **`pacman -Q`**: lista pacotes instalados.
- **`pacman -Sc`**: limpa cache antigo.

---

## EXEMPLOS

- Atualização completa:

`sudo pacman -Syu`

- Instalar editor:

`sudo pacman -S neovim`

- Buscar pacote:

`pacman -Ss docker`

- Remover pacote com dependências órfãs:

`sudo pacman -Rs docker`

---

## ERROS COMUNS

- **Atualização parcial (evite):** no Arch, prefira sempre `-Syu`.
- **Interromper upgrade no meio:** pode quebrar consistência do sistema.
- **Esquecer de revisar conflitos/perguntas da transação**.

---

## CÓDIGO DE SAÍDA

- **0**: operação concluída.
- **> 0**: erro de sincronização, dependência, lock ou pacote inválido.

---
