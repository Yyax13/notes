## NOME

**dnf** - gerencia pacotes em Fedora, RHEL e derivados modernos

## SINOPSE

`dnf [OPÇÕES] COMANDO [PACOTE]`

---

## DESCRIÇÃO

O `dnf` é o gerenciador de pacotes padrão em Fedora e versões recentes de RHEL/CentOS Stream.

Resolve dependências, instala, remove e atualiza pacotes com suporte a repositórios.

---

## COMANDOS MAIS USADOS

- **`dnf check-update`**: verifica atualizações disponíveis.
- **`dnf upgrade`**: atualiza pacotes do sistema.
- **`dnf install pacote`**: instala pacote.
- **`dnf remove pacote`**: remove pacote.
- **`dnf search termo`**: busca pacotes.
- **`dnf info pacote`**: mostra informações do pacote.
- **`dnf list installed`**: lista pacotes instalados.
- **`dnf autoremove`**: remove dependências órfãs.

---

## EXEMPLOS

- Ver atualizações:

`sudo dnf check-update`

- Atualizar sistema:

`sudo dnf upgrade -y`

- Instalar utilitário:

`sudo dnf install htop`

- Remover pacote:

`sudo dnf remove httpd`

- Buscar pacote:

`dnf search nginx`

---

## ERROS COMUNS

- **Executar ações de sistema sem `sudo`**.
- **Misturar repositórios de versões diferentes**.
- **Interromper transação de atualização no meio**.

---

## CÓDIGO DE SAÍDA

- **0**: operação concluída.
- **> 0**: erro de repositório, dependência, lock ou rede.

---
