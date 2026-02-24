# 🐧 Guia Rápido de Comandos Essenciais do Linux

## 🗺️ Navegação de Conteúdo

### 🧱 Básico (terminal e arquivos)

- [Comando `clear` (documentação detalhada)](./clear/note-linux-clear.md)
- [Comando `pwd` (documentação detalhada)](./pwd/note-linux-pwd.md)
- [Comando `cd` (documentação detalhada)](./cd/note-linux-cd.md)
- [Comando `history` (documentação detalhada)](./history/note-linux-history.md)
- [Comando `man` (documentação detalhada)](./man/note-linux-man.md)
- [Comando `which` (documentação detalhada)](./which/note-linux-which.md)
- [Comando `alias` (documentação detalhada)](./alias/note-linux-alias.md)
- [Comando `ls` (documentação detalhada)](./ls/note-linux-ls.md)
- [Comando `mkdir` (documentação detalhada)](./mkdir/note-linux-mkdir.md)
- [Comando `cp` (documentação detalhada)](./cp/note-linux-cp.md)
- [Comando `mv` (documentação detalhada)](./mv/note-linux-mv.md)
- [Comando `rm` (documentação detalhada)](./rm/note-linux-rm.md)

### 🔎 Busca e texto

- [Comando `find` (documentação detalhada)](./find/note-linux-find.md)
- [Comando `grep` (documentação detalhada)](./grep/note-linux-grep.md)
- [Comando `tail` (documentação detalhada)](./tail/note-linux-tail.md)
- [Comando `sed` (documentação detalhada)](./sed/note-linux-sed.md)
- [Comando `awk` (documentação detalhada)](./awk/note-linux-awk.md)

### 🛡️ Permissões e compactação

- [Comando `chmod` (documentação detalhada)](./chmod/note-linux-chmod.md)
- [Comando `tar` (documentação detalhada)](./tar/note-linux-tar.md)

### ⚙️ Sistema e rede

- [Comando `ps` (documentação detalhada)](./ps/note-linux-ps.md)
- [Comando `top` (documentação detalhada)](./top/note-linux-top.md)
- [Comando `df` (documentação detalhada)](./df/note-linux-df.md)
- [Comando `du` (documentação detalhada)](./du/note-linux-du.md)
- [Comando `ip` (documentação detalhada)](./ip/note-linux-ip.md)
- [Comando `ping` (documentação detalhada)](./ping/note-linux-ping.md)
- [Comando `curl` (documentação detalhada)](./curl/note-linux-curl.md)
- [Comando `wget` (documentação detalhada)](./wget/note-linux-wget.md)
- [Comando `systemctl` (documentação detalhada)](./systemctl/note-linux-systemctl.md)
- [Comando `journalctl` (documentação detalhada)](./journalctl/note-linux-journalctl.md)
- [Comando `ssh` (documentação detalhada)](./ssh/note-linux-ssh.md)

### 📦 Gerenciadores de pacotes por distro

- [Comando `apt` (Debian/Ubuntu)](./apt/note-linux-apt.md)
- [Comando `dnf` (Fedora/RHEL moderno)](./dnf/note-linux-dnf.md)
- [Comando `yum` (RHEL/CentOS legado)](./yum/note-linux-yum.md)
- [Comando `pacman` (Arch Linux)](./pacman/note-linux-pacman.md)
- [Comando `zypper` (openSUSE/SUSE)](./zypper/note-linux-zypper.md)
- [Comando `apk` (Alpine Linux)](./apk/note-linux-apk.md)

## 🧭 Trilha de estudo recomendada

1. **Fundamentos:** `clear`, `ls`, `mkdir`, `cp`, `mv`, `rm`
2. **Busca e logs:** `find`, `grep`, `tail`, `sed`, `awk`
3. **Sistema e rede:** `ps`, `top`, `df`, `du`, `ip`, `ping`, `curl`, `wget`
4. **Administração:** `chmod`, `tar`, `ssh`, `systemctl`, `journalctl`
5. **Pacotes por distro:** `apt`, `dnf`, `yum`, `pacman`, `zypper`, `apk`

## 🖥️ Terminal e Navegação

| Objetivo                             | Comando(s)           | Nota                                                     |
| :----------------------------------- | :------------------- | :------------------------------------------------------- |
| **Limpar tela do terminal**          | `clear`              | Limpa a tela atual do terminal.                          |
| **Resetar terminal corrompido**      | `reset`              | Recarrega estado do terminal quando saída fica quebrada. |
| **Mostrar diretório atual**          | `pwd`                | Exibe o caminho completo da pasta atual.                 |
| **Listar arquivos/pastas**           | `ls`                 | Listagem simples do diretório.                           |
| **Listar com detalhes**              | `ls -la`             | Mostra permissões, dono, tamanho e ocultos.              |
| **Entrar em diretório**              | `cd NOME_DIRETORIO`  | Navega para a pasta desejada.                            |
| **Voltar um nível**                  | `cd ..`              | Retorna para a pasta pai.                                |
| **Voltar para HOME**                 | `cd ~`               | Vai para o diretório do usuário.                         |
| **Alternar para diretório anterior** | `cd -`               | Alterna entre os dois últimos diretórios visitados.      |
| **Ver histórico de comandos**        | `history`            | Lista comandos executados.                               |
| **Repetir último comando**           | `!!`                 | Reexecuta o comando anterior.                            |
| **Localizar executável no PATH**     | `which NOME_COMANDO` | Mostra o caminho binário do comando encontrado.          |
| **Abrir manual do comando**          | `man NOME_COMANDO`   | Exibe documentação oficial local.                        |
| **Criar atalho de comando (sessão)** | `alias ll='ls -lah'` | Cria atalho temporário para a sessão atual.              |
| **Remover atalho**                   | `unalias ll`         | Remove alias criado anteriormente.                       |
| **Ver variáveis de ambiente**        | `env`                | Lista variáveis do ambiente atual do shell.              |
| **Mostrar valor de variável**        | `echo $HOME`         | Exibe valor de variável específica.                      |
| **Encerrar sessão de terminal**      | `exit`               | Finaliza shell atual.                                    |

### ⚡ Fluxo rápido no terminal (dia a dia)

1. Confirme o contexto com `pwd` e `ls -la`.
2. Navegue com `cd`, `cd ..` e `cd -`.
3. Consulte documentação com `man` quando tiver dúvida de opção.
4. Ganhe velocidade com `history`, `!!` e aliases úteis.
5. Antes de comandos destrutivos, valide caminho e arquivos novamente.

## 📁 Arquivos e Diretórios

| Objetivo                           | Comando(s)                         | Nota                                    |
| :--------------------------------- | :--------------------------------- | :-------------------------------------- |
| **Criar diretório**                | `mkdir NOME_DIRETORIO`             | Cria uma nova pasta.                    |
| **Criar diretórios aninhados**     | `mkdir -p pasta1/pasta2`           | Cria toda a estrutura necessária.       |
| **Criar arquivo vazio**            | `touch arquivo.txt`                | Útil para iniciar arquivos rapidamente. |
| **Copiar arquivo**                 | `cp origem.txt destino.txt`        | Duplica um arquivo.                     |
| **Copiar diretório**               | `cp -r pasta_origem pasta_destino` | Copia pastas recursivamente.            |
| **Mover/Renomear arquivo**         | `mv antigo.txt novo.txt`           | Move ou renomeia arquivos/pastas.       |
| **Remover arquivo**                | `rm arquivo.txt`                   | Apaga um arquivo.                       |
| **Remover diretório com conteúdo** | `rm -r pasta`                      | Remove pasta e subpastas.               |
| **Remoção forçada**                | `rm -rf pasta`                     | Use com cautela; apaga sem confirmação. |

## 📖 Visualização e Busca

| Objetivo                          | Comando(s)                 | Nota                                       |
| :-------------------------------- | :------------------------- | :----------------------------------------- |
| **Ver conteúdo de arquivo**       | `cat arquivo.txt`          | Exibe todo o conteúdo.                     |
| **Ler arquivo paginado**          | `less arquivo.txt`         | Navegação confortável em arquivos grandes. |
| **Ver início do arquivo**         | `head -n 20 arquivo.txt`   | Mostra as primeiras linhas.                |
| **Ver final do arquivo**          | `tail -n 20 arquivo.txt`   | Mostra as últimas linhas.                  |
| **Acompanhar logs em tempo real** | `tail -f app.log`          | Atualiza a saída continuamente.            |
| **Buscar texto em arquivo**       | `grep "texto" arquivo.txt` | Procura por padrão específico.             |
| **Buscar em diretórios**          | `grep -R "texto" .`        | Busca recursiva a partir da pasta atual.   |
| **Encontrar arquivos por nome**   | `find . -name "*.md"`      | Localiza arquivos por padrão.              |

## 🔐 Permissões e Propriedade

| Objetivo                | Comando(s)                         | Nota                                           |
| :---------------------- | :--------------------------------- | :--------------------------------------------- |
| **Ver permissões**      | `ls -l`                            | Mostra permissões no formato Unix.             |
| **Alterar permissões**  | `chmod 755 script.sh`              | Ajusta permissões de leitura/escrita/execução. |
| **Tornar executável**   | `chmod +x script.sh`               | Permite executar o arquivo.                    |
| **Trocar proprietário** | `sudo chown usuario:grupo arquivo` | Altera dono e grupo do arquivo.                |

## ⚙️ Processos e Sistema

| Objetivo                       | Comando(s)    | Nota                                        |
| :----------------------------- | :------------ | :------------------------------------------ |
| **Listar processos**           | `ps aux`      | Exibe processos em execução.                |
| **Monitorar em tempo real**    | `top`         | Mostra CPU, memória e processos ativos.     |
| **Finalizar processo por PID** | `kill PID`    | Envia sinal para encerrar o processo.       |
| **Finalizar processo forçado** | `kill -9 PID` | Encerramento imediato (último recurso).     |
| **Uso de disco (partições)**   | `df -h`       | Mostra espaço de disco em formato legível.  |
| **Uso de disco (pastas)**      | `du -sh *`    | Mostra tamanho de cada item da pasta atual. |
| **Uso de memória RAM**         | `free -h`     | Exibe memória total, usada e livre.         |
| **Informações do sistema**     | `uname -a`    | Mostra dados do kernel/sistema.             |

## 🌐 Rede

| Objetivo                    | Comando(s)                 | Nota                                   |
| :-------------------------- | :------------------------- | :------------------------------------- |
| **Ver interfaces e IPs**    | `ip a`                     | Lista interfaces e endereços de rede.  |
| **Testar conectividade**    | `ping -c 4 google.com`     | Envia 4 pacotes ICMP.                  |
| **Testar HTTP rapidamente** | `curl -I https://site.com` | Mostra cabeçalhos da resposta HTTP.    |
| **Baixar arquivo**          | `wget URL`                 | Faz download de arquivos via terminal. |

## 📦 Pacotes (Múltiplas Distros)

| Distro                   | Gerenciador | Atualizar índice        | Atualizar sistema    | Instalar pacote                   |
| :----------------------- | :---------- | :---------------------- | :------------------- | :-------------------------------- |
| **Debian/Ubuntu**        | `apt`       | `sudo apt update`       | `sudo apt upgrade`   | `sudo apt install NOME_PACOTE`    |
| **Fedora/RHEL (novo)**   | `dnf`       | `sudo dnf check-update` | `sudo dnf upgrade`   | `sudo dnf install NOME_PACOTE`    |
| **RHEL/CentOS (legado)** | `yum`       | `sudo yum check-update` | `sudo yum update`    | `sudo yum install NOME_PACOTE`    |
| **Arch Linux**           | `pacman`    | `sudo pacman -Sy`       | `sudo pacman -Syu`   | `sudo pacman -S NOME_PACOTE`      |
| **openSUSE/SUSE**        | `zypper`    | `sudo zypper refresh`   | `sudo zypper update` | `sudo zypper install NOME_PACOTE` |
| **Alpine Linux**         | `apk`       | `sudo apk update`       | `sudo apk upgrade`   | `sudo apk add NOME_PACOTE`        |

## 🧠 Atalhos e Dicas Rápidas

| Objetivo                       | Atalho/Comando | Nota                                   |
| :----------------------------- | :------------- | :------------------------------------- |
| **Interromper processo atual** | `Ctrl + C`     | Para comandos em execução no terminal. |
| **Suspender para background**  | `Ctrl + Z`     | Pausa processo atual.                  |
| **Retomar processo suspenso**  | `fg`           | Traz processo para foreground.         |
| **Repetir comando anterior**   | `!!`           | Executa o último comando novamente.    |
| **Histórico de comandos**      | `history`      | Lista comandos utilizados.             |

## ✅ Boas práticas

- Revise comandos destrutivos (`rm -rf`, `kill -9`) antes de executar.
- Prefira testar com caminhos específicos em vez de usar curingas amplos (`*`).
- Use `man NOME_COMANDO` para acessar documentação oficial no terminal.
