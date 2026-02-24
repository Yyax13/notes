## NOME

**ssh** - conecta com segurança a máquinas remotas

## SINOPSE

`ssh [OPÇÕES] USUARIO@HOST`

---

## DESCRIÇÃO

O `ssh` cria sessão remota criptografada para administração de servidores e execução de comandos.

Também permite tunelamento, cópia segura (com `scp`) e autenticação por chave.

---

## OPÇÕES MAIS USADAS

- **`-p PORTA`**: define porta SSH.
- **`-i CHAVE`**: usa chave privada específica.
- **`-L`**: encaminhamento local de porta.
- **`-R`**: encaminhamento remoto de porta.
- **`-N`**: não executa comando remoto (útil em túnel).
- **`-T`**: desativa pseudo-terminal.
- **`-v`**: modo verboso para debug.

---

## EXEMPLOS

- Conectar ao servidor padrão:

`ssh usuario@192.168.1.10`

- Conectar em porta customizada:

`ssh -p 2222 usuario@host`

- Conectar usando chave privada:

`ssh -i ~/.ssh/id_ed25519 usuario@host`

- Executar comando remoto direto:

`ssh usuario@host "uptime"`

- Criar túnel local para banco remoto:

`ssh -L 5433:127.0.0.1:5432 usuario@host -N`

---

## BOAS PRÁTICAS

- Prefira autenticação por chave em vez de senha.
- Restrinja acesso com firewall e usuários específicos.
- Em produção, desabilite login root por SSH quando possível.

---

## ERROS COMUNS

- **Permissões incorretas de chave (`~/.ssh`)**.
- **Porta errada ou bloqueada por firewall**.
- **Host key alterada sem validação de segurança**.

---

## CÓDIGO DE SAÍDA

- **0**: conexão/comando concluído com sucesso.
- **> 0**: falha de autenticação, rede, chave ou host.

---
