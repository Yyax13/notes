## NOME

**apk** - gerencia pacotes no Alpine Linux

## SINOPSE

`apk [OPÇÕES] COMANDO [PACOTE]`

---

## DESCRIÇÃO

O `apk` é o gerenciador de pacotes do Alpine Linux.

É leve, rápido e comum em imagens de container.

---

## COMANDOS MAIS USADOS

- **`apk update`**: atualiza índice de pacotes.
- **`apk upgrade`**: atualiza pacotes instalados.
- **`apk add pacote`**: instala pacote.
- **`apk del pacote`**: remove pacote.
- **`apk search termo`**: busca pacotes.
- **`apk info`**: lista informações/pacotes instalados.

---

## EXEMPLOS

- Atualizar índice:

`sudo apk update`

- Atualizar sistema:

`sudo apk upgrade`

- Instalar utilitário:

`sudo apk add curl`

- Remover utilitário:

`sudo apk del curl`

- Buscar pacote:

`apk search openssh`

---

## ERROS COMUNS

- **Usar repositório incompatível com versão Alpine**.
- **Esquecer `update` antes de instalar em imagem recém-criada**.
- **Rodar sem privilégios para alterar sistema**.

---

## CÓDIGO DE SAÍDA

- **0**: operação concluída.
- **> 0**: erro de índice, rede, pacote não encontrado ou permissão.

---
