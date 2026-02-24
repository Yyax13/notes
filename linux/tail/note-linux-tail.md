## NOME

**tail** - exibe a parte final de arquivos

## SINOPSE

`tail [OPÇÃO]... [ARQUIVO]...`

---

## DESCRIÇÃO

O `tail` mostra, por padrão, as últimas 10 linhas de um arquivo.

É muito usado para logs, monitoramento de aplicações e depuração em tempo real.

---

## OPÇÕES MAIS USADAS

- **`-n NUM`**: mostra as últimas `NUM` linhas.
- **`-c NUM`**: mostra os últimos `NUM` bytes.
- **`-f`**: acompanha atualizações do arquivo em tempo real.
- **`-F`**: como `-f`, mas tenta reabrir o arquivo se ele for recriado (útil em rotação de logs).
- **`-q`**: suprime cabeçalho quando há múltiplos arquivos.
- **`-v`**: sempre mostra cabeçalho com nome do arquivo.

---

## EXEMPLOS

- Ver últimas 10 linhas:

`tail app.log`

- Ver últimas 50 linhas:

`tail -n 50 app.log`

- Acompanhar log em tempo real:

`tail -f app.log`

- Acompanhar log com rotação:

`tail -F /var/log/nginx/access.log`

- Ver últimos bytes de arquivo binário/texto:

`tail -c 100 arquivo.txt`

- Acompanhar mais de um arquivo:

`tail -f api.log worker.log`

---

## WORKFLOWS COMUNS

- Ver apenas erros em tempo real:

`tail -f app.log | grep "ERROR"`

- Acompanhar logs do sistema:

`tail -f /var/log/syslog`

- Observar requisições HTTP recentes:

`tail -f /var/log/nginx/access.log`

- Inspecionar fim de arquivo de deploy:

`tail -n 100 deploy.log`

---

## DIFERENÇA ENTRE `-f` E `-F`

- **`-f`**: segue o descritor aberto; pode perder continuidade em rotação de logs.
- **`-F`**: segue por nome e reabre o arquivo se ele for recriado.

Para logs em produção com rotação, normalmente `-F` é mais confiável.

---

## ERROS COMUNS

- **Achar que travou:** com `-f`, o comando fica aguardando novas linhas (comportamento normal).
- **Não encerrar acompanhamento:** use `Ctrl + C`.
- **Arquivo sem permissão de leitura:** execute com usuário adequado.
- **Confundir linhas e bytes:** `-n` (linhas) vs `-c` (bytes).

---

## CÓDIGO DE SAÍDA

- **0**: execução com sucesso.
- **> 0**: erro de leitura/arquivo/permissão.

---

## BOAS PRÁTICAS

- Comece com `tail -n 50` antes de usar `-f` para obter contexto.
- Combine com `grep` para filtrar sinais relevantes de logs grandes.
- Em ambientes com logrotate, prefira `tail -F`.

---
