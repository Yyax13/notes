Limpar histórico do terminal:
```
cls
```
<hr>

Iniciar novo packet com GIT na máquina (executa apenas uma vez):
```
git init
```
<hr>

Definir as configurações do usuário:
```
### git config --local user.name 'NOME'
### git config --local user.name 'EMAIL'
```
<hr>

Clonar os arquivos do Git Hub:
```
### git clone --branch 'NOME-BRANCH' 'URL-REPOSITÓRIO'
```
<hr>

Adicionar repositório remoto ao local:
```
git remote add origin URL-REPOSITÓRIO
```
<hr>

Verificar em qual branch está:
```
### git branch
```
<hr>

Realizar o dowload das atualizações:
```
### git pull
```
<hr>

Adicionar o arquivo criado ao índice de preparação (também há como fazer isto pelo ícone "+" ao lado do arquivo que foi alterado recentemente que se encontra no terceiro ícone de cima pra baixo do lado esquerdo do VS).
O índice de preparação é uma área intermediária entre o diretório de trabalho e o repositório git.
```
### git add 'NOME-ARQUIVO'
### git add . (adicionado todos os arquivos modificados)
```
<hr>

Verificar o status do arquivo no repositório:
```
### git status
```
<hr>

Representa um conjunto de alterações em um ponto específico da história de seu projeto, registra apenas as alterações adicionadas ao índice de preparação.
O comando -m permite que insira a mensagem de commit diretamente na linha de comando:
```
### git commit -m "Comentário da escolha!"
```
<hr>

Enviar os commits locais para um repositório remoto:
```
### git push origin 'NOME-BRANCH'
```
<hr>

Para ignorar algum arquivo de subí-lo no Git Hub:
```
### Adicione-o ao arquivo ".gitignore"
```
<hr>

Criar nova branch:
```
### git checkout -b 'NOME-BRANCH' -> 
### git add . -> 
### git branch -> 
### git push origin 'NOME BRANCH'
```
<hr>

Mudar de branch:
```
### git switch 'NOME-BRANCH'
```
<hr>

Retirar um arquivo da área de preparação:
```
### git restore --staged 'NOME-ARQUIVO'
<hr>
```
