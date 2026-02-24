## NOME

**journalctl** - consulta logs do systemd journal

## SINOPSE

`journalctl [OPÇÕES]`

---

## DESCRIÇÃO

O `journalctl` visualiza logs de serviços e do sistema gerenciados pelo `systemd`.

É fundamental para diagnóstico de falhas de inicialização e serviços.

---

## OPÇÕES MAIS USADAS

- **`-u SERVICO`**: filtra por unidade/serviço.
- **`-f`**: acompanha logs em tempo real.
- **`-n N`**: mostra últimas `N` linhas.
- **`-b`**: logs desde o boot atual.
- **`-p NIVEL`**: filtra por prioridade (ex.: `err`, `warning`).
- **`--since` / `--until`**: filtra por período.

---

## EXEMPLOS

- Ver logs recentes do sistema:

`journalctl -n 100`

- Ver logs do boot atual:

`journalctl -b`

- Ver logs de um serviço:

`journalctl -u nginx`

- Acompanhar logs em tempo real:

`journalctl -u nginx -f`

- Filtrar erros desde hoje:

`journalctl -p err --since today`

---

## ERROS COMUNS

- **Saída muito grande sem filtro**.
- **Esquecer `-u` e analisar logs de todo sistema sem necessidade**.
- **Não usar `-f` quando precisa de monitoramento em tempo real**.

---

## CÓDIGO DE SAÍDA

- **0**: consulta executada com sucesso.
- **> 0**: erro de permissão, filtro inválido ou journal indisponível.

---
