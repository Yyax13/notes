## NOME

**apt** - gerencia pacotes em distribuições Debian/Ubuntu

## SINOPSE

`apt [OPÇÕES] COMANDO`

---

## DESCRIÇÃO

O `apt` instala, remove e atualiza pacotes a partir de repositórios.

É a interface principal de gerenciamento de software em sistemas baseados em Debian.

---

## COMANDOS MAIS USADOS

- **`apt update`**: atualiza índice de pacotes.
- **`apt upgrade`**: atualiza pacotes instalados.
- **`apt install pacote`**: instala pacote.
- **`apt remove pacote`**: remove pacote mantendo configs.
- **`apt purge pacote`**: remove pacote e configurações.
- **`apt autoremove`**: remove dependências não utilizadas.
- **`apt search termo`**: busca pacotes.
- **`apt show pacote`**: mostra detalhes do pacote.

---

## EXEMPLOS

- Atualizar lista e pacotes:

`sudo apt update && sudo apt upgrade -y`

- Instalar utilitário:

`sudo apt install curl`

- Remover pacote e limpar dependências:

`sudo apt remove nginx && sudo apt autoremove -y`

- Remover pacote com configurações:

`sudo apt purge nginx`

- Buscar pacote:

`apt search mysql-client`

---

## BOAS PRÁTICAS

- Execute `apt update` antes de `install/upgrade`.
- Revise pacotes que serão removidos antes de confirmar.
- Em servidores, planeje atualizações em janela de manutenção.

---

## ERROS COMUNS

- **Rodar sem `sudo` em ações que alteram sistema**.
- **Atualizar sem internet estável**.
- **Interromper instalação no meio do processo**.

---

## CÓDIGO DE SAÍDA

- **0**: operação concluída.
- **> 0**: erro de repositório, lock, dependência ou rede.

---
