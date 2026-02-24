## NOME

**zypper** - gerencia pacotes em openSUSE e SUSE Linux

## SINOPSE

`zypper [OPÇÕES] COMANDO [PACOTE]`

---

## DESCRIÇÃO

O `zypper` é o gerenciador de pacotes da família SUSE.

Permite instalar/remover pacotes, atualizar sistema e administrar repositórios.

---

## COMANDOS MAIS USADOS

- **`zypper refresh`**: atualiza metadados dos repositórios.
- **`zypper update`**: atualiza pacotes instalados.
- **`zypper install pacote`**: instala pacote.
- **`zypper remove pacote`**: remove pacote.
- **`zypper search termo`**: busca pacotes.
- **`zypper info pacote`**: mostra detalhes.
- **`zypper repos`**: lista repositórios configurados.

---

## EXEMPLOS

- Atualizar metadados:

`sudo zypper refresh`

- Atualizar sistema:

`sudo zypper update`

- Instalar pacote:

`sudo zypper install git`

- Remover pacote:

`sudo zypper remove git`

- Buscar pacote:

`zypper search nginx`

---

## ERROS COMUNS

- **Repositórios desatualizados sem `refresh`**.
- **Conflitos de dependência sem revisar proposta de solução**.
- **Executar operações administrativas sem privilégios suficientes**.

---

## CÓDIGO DE SAÍDA

- **0**: operação concluída com sucesso.
- **> 0**: erro de repositório, dependência, lock ou rede.

---
