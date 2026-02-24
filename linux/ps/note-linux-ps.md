## NOME

**ps** - exibe processos em execução

## SINOPSE

`ps [OPÇÕES]`

---

## DESCRIÇÃO

O comando `ps` mostra informações sobre processos ativos.

É essencial para monitoramento básico, troubleshooting e identificação de PID para uso com `kill`.

---

## OPÇÕES MAIS USADAS

- **`aux`**: formato completo (todos usuários, incluindo sem terminal).
- **`-ef`**: formato estilo System V com mais campos.
- **`-u USUARIO`**: filtra processos de um usuário.
- **`-p PID`**: mostra processo específico.
- **`-o CAMPOS`**: customiza colunas de saída.

---

## EXEMPLOS

- Ver todos os processos:

`ps aux`

- Buscar processo pelo nome:

`ps aux | grep "nginx"`

- Ver processo por PID:

`ps -p 1234 -f`

- Mostrar campos específicos:

`ps -eo pid,ppid,%cpu,%mem,cmd --sort=-%cpu | head`

- Filtrar por usuário:

`ps -u felipe`

---

## CAMPOS IMPORTANTES

- **PID**: identificador do processo.
- **PPID**: processo pai.
- **%CPU**: uso de CPU.
- **%MEM**: uso de memória.
- **CMD**: comando que iniciou o processo.

---

## ERROS COMUNS

- **Confundir `ps` com atualização em tempo real:** `ps` é snapshot.
- **Encontrar o próprio `grep` no filtro:** comportamento normal em `ps | grep`.
- **Matar processo errado por PID incorreto:** sempre valide antes.

---

## CÓDIGO DE SAÍDA

- **0**: execução bem-sucedida.
- **> 0**: erro de argumento ou consulta inválida.

---
