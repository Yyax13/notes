## NOME

**history** - exibe histórico de comandos do shell

## SINOPSE

`history [N]`

---

## DESCRIÇÃO

O `history` lista comandos executados anteriormente na sessão/shell.

É útil para auditoria pessoal, repetição de comandos e ganho de produtividade.

---

## USOS MAIS COMUNS

- **`history`**: mostra histórico completo disponível.
- **`history 20`**: mostra últimos 20 comandos.
- **`!!`**: repete o último comando.
- **`!N`**: executa comando pelo número da lista.
- **`!texto`**: executa último comando iniciado com `texto`.

---

## EXEMPLOS

- Ver últimos comandos:

`history 30`

- Reexecutar comando específico:

`!245`

- Buscar no histórico por prefixo:

`!git`

---

## DICAS DE PRODUTIVIDADE

- Use `Ctrl + R` para busca reversa interativa no histórico.
- Revise comando antes de executar expansão `!` em ambientes críticos.

---

## ERROS COMUNS

- **Reexecutar comando perigoso sem revisar**.
- **Achar que histórico é global entre todos usuários/shells automaticamente**.

---

## CÓDIGO DE SAÍDA

- **0**: execução com sucesso.
- **> 0**: erro de shell ou expansão inválida.

---
