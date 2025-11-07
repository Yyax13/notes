# 📚 Guia Rápido de Comandos Essenciais do Git

## 🖥️ Gerenciamento do Terminal

| Objetivo                      | Comando(s)                               | Nota                                                            |
| :---------------------------- | :--------------------------------------- | :-------------------------------------------------------------- |
| **Limpar a tela do terminal** | `clear` (Linux/macOS) ou `cls` (Windows) | O atalho **Ctrl + L** também funciona na maioria dos terminais. |

## 📂 Inicialização e Configuração

| Objetivo                                           | Comando(s)                                                                         | Nota                                                                              |
| :------------------------------------------------- | :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **Iniciar novo repositório local**                 | `git init`                                                                         | Executado apenas uma vez para começar a rastrear o projeto.                       |
| **Definir usuário para repositório específico**    | `git config --local user.name "NOME"`<br>`git config --local user.email "EMAIL"`   | **Prioridade máxima:** Sobrescreve as configurações globais apenas neste projeto. |
| **Definir usuário global para todos repositórios** | `git config --global user.name "NOME"`<br>`git config --global user.email "EMAIL"` | Define o padrão para todos os projetos na sua máquina.                            |
| **Visualizar todas as configurações**              | `git config --list`                                                                | Útil para verificar as configurações locais e globais ativas.                     |
| **Ignorar arquivos ao commitar**                   | _Adicione os padrões ao arquivo_ **`.gitignore`**                                  | Use para ignorar pastas (`node_modules/`), arquivos temporários, logs, etc.       |

## 📥 Clonagem e Conexão Remota

| Objetivo                                         | Comando(s)                                     | Nota                                                                                        |
| :----------------------------------------------- | :--------------------------------------------- | :------------------------------------------------------------------------------------------ |
| **Clonar um repositório remoto**                 | `git clone 'URL-REPOSITÓRIO'`                  | Cria uma cópia local completa do repositório, incluindo todo o histórico.                   |
| **Clonar uma branch específica**                 | `git clone -b 'NOME-BRANCH' 'URL-REPOSITÓRIO'` | Clona o repositório e já faz o checkout para a branch desejada.                             |
| **Adicionar repositório remoto ao local**        | `git remote add origin URL-REPOSITÓRIO`        | Conecta seu repositório local a um remoto, geralmente chamado `origin`.                     |
| **Visualizar repositórios remotos configurados** | `git remote -v`                                | Lista os nomes dos remotos e suas respectivas URLs de fetch/push.                           |
| **Realizar o download das atualizações**         | `git pull`                                     | Baixa e faz o _merge_ das mudanças do remoto para a branch local atual. **(Fetch + Merge)** |
| **Baixar atualizações sem fazer merge**          | `git fetch`                                    | Baixa os dados do remoto para que você possa inspecioná-los antes de integrar.              |
| **Enviar commits locais para o remoto**          | `git push`                                     | Sincroniza seus commits locais com o repositório remoto configurado.                        |

## 🌳 Gerenciamento de Branches

| Objetivo                                  | Comando(s)                               | Nota                                                                                                    |
| :---------------------------------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| **Verificar em qual branch está**         | `git branch`                             | Lista as branches locais; a branch atual é marcada com um asterisco (`*`).                              |
| **Mudar para uma branch existente**       | `git switch 'NOME-BRANCH'`               | Comando moderno e recomendado. Alternativa: `git checkout 'NOME-BRANCH'`.                               |
| **Criar e Mudar para nova branch**        | `git switch -c 'NOME-BRANCH'`            | Cria a nova branch e move você para ela em um só comando. Alternativa: `git checkout -b 'NOME-BRANCH'`. |
| **Criar uma branch (sem mudar para ela)** | `git branch 'NOVA-BRANCH'`               | Cria a branch localmente, mas mantém você na branch atual.                                              |
| **Enviar nova branch para o remoto**      | `git push -u origin 'NOME-BRANCH'`       | Envia a branch e define o rastreamento (`-u` ou `--set-upstream`).                                      |
| **Deletar uma branch local**              | `git branch -d 'NOME-BRANCH'`            | Deleta a branch localmente (apenas se estiver mergeada). Use `-D` para forçar.                          |
| **Deletar uma branch remota**             | `git push origin --delete 'NOME-BRANCH'` | Remove a branch do repositório remoto.                                                                  |
| **Integrar mudanças de outra branch**     | `git merge 'BRANCH-ORIGEM'`              | Junta o histórico da `BRANCH-ORIGEM` na sua branch atual.                                               |

## ✍️ Processo de Commit (Trabalho Diário)

| Objetivo                                             | Comando(s)                            | Descrição                                                                    |
| :--------------------------------------------------- | :------------------------------------ | :--------------------------------------------------------------------------- |
| **Verificar o status do repositório**                | `git status`                          | Essencial! Vê o que foi modificado, adicionado ou está não rastreado.        |
| **Adicionar arquivo à Área de Preparação (Staging)** | `git add 'NOME-ARQUIVO'`              | Adiciona um arquivo específico para o próximo commit.                        |
| **Adicionar todas as mudanças rastreadas**           | `git add .`                           | Adiciona todas as alterações (novos arquivos e modificações) rastreadas.     |
| **Criar Commit**                                     | `git commit -m "Mensagem concisa!"`   | Registra as alterações da Área de Preparação no histórico do projeto.        |
| **Commitar todas as mudanças rastreadas de uma vez** | `git commit -am "Mensagem concisa!"`  | Atalho para `git add .` (apenas para arquivos já rastreados) e `git commit`. |
| **Retirar arquivo da Área de Preparação**            | `git restore --staged 'NOME-ARQUIVO'` | Tira as alterações da staging, mas as mantém no diretório de trabalho.       |

## 🔍 Visualização e Histórico

| Objetivo                                           | Comando(s)                       | Nota                                                                      |
| :------------------------------------------------- | :------------------------------- | :------------------------------------------------------------------------ |
| **Visualizar Histórico Completo**                  | `git log`                        | Mostra o histórico detalhado, incluindo autor, data e mensagem.           |
| **Visualizar Histórico Resumido**                  | `git log --oneline`              | **Recomendado!** Visão compacta e legível do histórico.                   |
| **Mostrar mudanças não adicionadas (Working Dir)** | `git diff`                       | Vê as alterações no diretório de trabalho que ainda não estão na staging. |
| **Mostrar mudanças em staging**                    | `git diff --staged`              | Vê o que será commitado (diferença entre staging e o último commit).      |
| **Mostrar mudanças entre dois commits/branches**   | `git diff 'COMMIT-A' 'COMMIT-B'` | Compara o estado do código entre dois pontos no histórico.                |

## ↩️ Desfazer e Correção de Erros

| Objetivo                                     | Comando(s)                   | Cuidado!                                                                                                                                        |
| :------------------------------------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Descartar mudanças locais não preparadas** | `git restore 'NOME-ARQUIVO'` | Perde todas as alterações **não adicionadas** desde o último commit. Alternativa: `git checkout -- 'NOME-ARQUIVO'`.                             |
| **Corrigir mensagem do último commit**       | `git commit --amend`         | Reescreve a mensagem do último commit. Se não houver alterações na staging, apenas a mensagem é alterada.                                       |
| **Desfazer o último commit (soft)**          | `git reset --soft HEAD~1`    | Desfaz o commit, mas **mantém** as alterações na Área de Preparação.                                                                            |
| **Desfazer o último commit (mixed)**         | `git reset HEAD~1`           | Desfaz o commit e **move** as alterações para o diretório de trabalho (não na staging). **Padrão e mais seguro.**                               |
| **Desfazer o último commit (hard)**          | `git reset --hard HEAD~1`    | **APAGA** o último commit e **todas** as alterações. Use com extrema cautela!                                                                   |
| **Reverter um commit específico**            | `git revert 'HASH-COMMIT'`   | Cria um **novo commit** que desfaz as alterações de um commit anterior, mantendo o histórico limpo. **Recomendado para commits já publicados.** |

## 🔄 Sincronização e Atualização

| Objetivo                                     | Comando(s)                 | Nota                                                                                                   |
| :------------------------------------------- | :------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Rebasear sua branch**                      | `git rebase 'BRANCH-BASE'` | Move ou combina uma sequência de commits para uma nova base. **Use com cautela em branches públicas.** |
| **Stash (Guardar) mudanças temporariamente** | `git stash`                | Salva o estado atual do diretório de trabalho e da staging para aplicar depois.                        |
| **Aplicar o último stash**                   | `git stash pop`            | Aplica as mudanças salvas e remove o stash da lista.                                                   |
| **Listar todos os stashes**                  | `git stash list`           | Vê todos os estados salvos.                                                                            |
| **Limpar arquivos não rastreados**           | `git clean -f`             | Remove arquivos que não estão sob o controle do Git. Use `git clean -df` para incluir diretórios.      |
