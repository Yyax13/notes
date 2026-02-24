## NOME

**alias** - cria atalhos para comandos no shell

## SINOPSE

`alias [NOME='COMANDO']`

`unalias NOME`

---

## DESCRIÇÃO

O `alias` permite definir atalhos para comandos longos ou frequentes.

É ótimo para produtividade no terminal e padronização de comandos pessoais.

---

## USOS MAIS COMUNS

- **Criar alias:** `alias ll='ls -la'`
- **Listar aliases:** `alias`
- **Ver alias específico:** `alias ll`
- **Remover alias:** `unalias ll`

---

## EXEMPLOS

- Atalho para listar com detalhes:

`alias ll='ls -lah'`

- Atalho para atualização no Debian/Ubuntu:

`alias update='sudo apt update && sudo apt upgrade'`

- Persistir no Bash (`~/.bashrc`):

`echo "alias ll='ls -lah'" >> ~/.bashrc`

---

## BOAS PRÁTICAS

- Use nomes curtos e intuitivos.
- Evite sobrescrever comandos críticos com comportamento inesperado.
- Documente aliases importantes no arquivo de configuração do shell.

---

## ERROS COMUNS

- **Criar alias na sessão e esquecer que não persiste sem `.bashrc`/`.zshrc`**.
- **Conflitar nome de alias com comando real**.

---

## CÓDIGO DE SAÍDA

- **0**: comando executado com sucesso.
- **> 0**: erro na definição/remoção.

---
