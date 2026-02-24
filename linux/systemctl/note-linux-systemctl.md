## NOME

**systemctl** - controla serviços e unidades do systemd

## SINOPSE

`systemctl [OPÇÕES] COMANDO [UNIDADE]`

---

## DESCRIÇÃO

O `systemctl` gerencia serviços do `systemd`: iniciar, parar, reiniciar, habilitar no boot e verificar status.

É comando central de administração em distribuições modernas Linux.

---

## COMANDOS MAIS USADOS

- **`status SERVICO`**: mostra status detalhado.
- **`start SERVICO`**: inicia serviço.
- **`stop SERVICO`**: para serviço.
- **`restart SERVICO`**: reinicia serviço.
- **`reload SERVICO`**: recarrega configuração sem reinício completo.
- **`enable SERVICO`**: habilita no boot.
- **`disable SERVICO`**: desabilita no boot.
- **`is-active SERVICO`**: verifica se está ativo.
- **`list-units --type=service`**: lista serviços carregados.

---

## EXEMPLOS

- Ver status do Nginx:

`systemctl status nginx`

- Reiniciar serviço:

`sudo systemctl restart nginx`

- Habilitar no boot:

`sudo systemctl enable nginx`

- Verificar se está ativo:

`systemctl is-active nginx`

- Listar falhas:

`systemctl --failed`

---

## ERROS COMUNS

- **Esquecer `sudo` para ações administrativas**.
- **Confundir `reload` com `restart`**.
- **Nome da unidade incorreto (ex.: faltando `.service`)**.

---

## CÓDIGO DE SAÍDA

- **0**: operação bem-sucedida.
- **> 0**: erro de unidade inexistente, permissão ou estado inválido.

---
