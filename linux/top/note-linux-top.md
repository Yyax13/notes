## NOME

**top** - monitora processos e recursos do sistema em tempo real

## SINOPSE

`top [OPÇÕES]`

---

## DESCRIÇÃO

O `top` exibe dinamicamente processos em execução, uso de CPU, memória e carga do sistema.

É ideal para identificar processos pesados e diagnosticar lentidão.

---

## OPÇÕES MAIS USADAS

- **`-d N`**: define intervalo de atualização em segundos.
- **`-n N`**: executa `N` atualizações e encerra.
- **`-p PID`**: monitora apenas um processo específico.
- **`-u USUARIO`**: mostra processos de um usuário.
- **`-b`**: modo batch (útil para script/log).

---

## EXEMPLOS

- Abrir monitor padrão:

`top`

- Atualizar a cada 2 segundos:

`top -d 2`

- Capturar snapshot para arquivo:

`top -b -n 1 > top_snapshot.txt`

- Monitorar um PID específico:

`top -p 1234`

---

## ATALHOS DENTRO DO TOP

- **`P`**: ordenar por uso de CPU.
- **`M`**: ordenar por uso de memória.
- **`k`**: enviar sinal para processo (ex.: kill).
- **`r`**: alterar prioridade (renice).
- **`q`**: sair.

---

## ERROS COMUNS

- **Confundir snapshot com histórico:** `top` mostra estado atual.
- **Matar processo sem confirmar PID:** sempre valide comando e usuário.
- **Interpretar carga alta sem contexto:** compare com número de CPUs.

---

## CÓDIGO DE SAÍDA

- **0**: execução concluída.
- **> 0**: erro de parâmetro/permissão.

---
