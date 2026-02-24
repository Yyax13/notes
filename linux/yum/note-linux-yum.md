## NOME

**yum** - gerencia pacotes em distribuições RHEL/CentOS legadas

## SINOPSE

`yum [OPÇÕES] COMANDO [PACOTE]`

---

## DESCRIÇÃO

O `yum` foi amplamente usado em versões antigas de CentOS/RHEL.

Em sistemas modernos, geralmente foi substituído pelo `dnf` (com compatibilidade em alguns cenários).

---

## COMANDOS MAIS USADOS

- **`yum check-update`**: verifica atualizações disponíveis.
- **`yum update`**: atualiza pacotes.
- **`yum install pacote`**: instala pacote.
- **`yum remove pacote`**: remove pacote.
- **`yum search termo`**: busca pacotes.
- **`yum info pacote`**: detalhes do pacote.
- **`yum list installed`**: lista pacotes instalados.

---

## EXEMPLOS

- Ver atualizações:

`sudo yum check-update`

- Atualizar sistema:

`sudo yum update -y`

- Instalar pacote:

`sudo yum install wget`

- Remover pacote:

`sudo yum remove postfix`

---

## OBSERVAÇÃO IMPORTANTE

Se o sistema tiver `dnf`, prefira `dnf` para recursos e resolução de dependências mais atuais.

---

## CÓDIGO DE SAÍDA

- **0**: operação concluída com sucesso.
- **> 0**: erro de dependência, repositório, lock ou rede.

---
