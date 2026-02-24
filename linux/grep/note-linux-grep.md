## NOME

**grep** - procura padrões de texto em arquivos

## SINOPSE

`grep [OPÇÕES] PADRÃO [ARQUIVO...]`

---

## DESCRIÇÃO

O comando `grep` busca linhas que correspondem a um padrão (texto simples ou expressão regular).

É muito usado para filtrar logs, encontrar trechos de código e localizar conteúdo em múltiplos arquivos.

Por padrão, o `grep` imprime apenas as linhas que casam com o padrão. Com opções, ele pode mostrar contexto, contar ocorrências, retornar só nomes de arquivos e funcionar como base para pipelines.

---

## OPÇÕES MAIS USADAS

- **-i**: Ignora diferença entre maiúsculas e minúsculas.
- **-n**: Mostra o número da linha onde houve correspondência.
- **-R**: Busca recursiva em diretórios.
- **-r**: Similar ao `-R`, busca recursiva (com comportamento dependente de links simbólicos).
- **-v**: Inverte o resultado (linhas que **não** correspondem).
- **-w**: Busca a palavra inteira.
- **-E**: Ativa expressões regulares estendidas.
- **-c**: Mostra quantidade de linhas encontradas.
- **-l**: Mostra apenas nomes de arquivos com correspondência.
- **-L**: Mostra apenas arquivos **sem** correspondência.
- **-o**: Exibe somente o trecho que casou com o padrão.
- **-A N**: Mostra `N` linhas **após** cada correspondência.
- **-B N**: Mostra `N` linhas **antes** de cada correspondência.
- **-C N**: Mostra `N` linhas de contexto antes/depois.
- **--color=auto**: Destaca visualmente o padrão encontrado.

---

## PADRÕES E REGEX (RESUMO)

- **Texto literal:** `grep "erro" arquivo.log`
- **Início da linha (`^`):** `grep "^ERROR" arquivo.log`
- **Fim da linha (`$`):** `grep "final$" arquivo.log`
- **Ou lógico (`|`) com `-E`:** `grep -E "erro|falha" arquivo.log`
- **Dígitos:** `grep -E "[0-9]+" arquivo.log`
- **Palavra inteira:** `grep -w "token" arquivo.log`

---

## EXEMPLOS

- Buscar texto em um arquivo:

`grep "erro" app.log`

- Buscar ignorando maiúsculas/minúsculas:

`grep -i "warning" app.log`

- Buscar com número de linha:

`grep -n "TODO" note-linux.md`

- Buscar recursivamente na pasta atual:

`grep -R "database" .`

- Mostrar linhas que não contêm o padrão:

`grep -v "DEBUG" app.log`

- Contar ocorrências por linha:

`grep -c "Exception" app.log`

- Mostrar 2 linhas de contexto antes/depois:

`grep -C 2 "FATAL" app.log`

- Mostrar só arquivos que possuem padrão:

`grep -Rl "TODO" .`

- Mostrar apenas o trecho encontrado:

`grep -oE "[0-9]{3}" arquivo.txt`

- Buscar em Markdown excluindo pasta `.git`:

`grep -R --exclude-dir=.git "Linux" .`

---

## WORKFLOWS COMUNS

- Filtrar processos:

`ps aux | grep "nginx"`

- Filtrar porta em uso:

`ss -lntp | grep ":80"`

- Acompanhar erro em tempo real:

`tail -f app.log | grep --color=auto "ERROR"`

- Auditar falhas de autenticação:

`grep -i "failed password" /var/log/auth.log`

---

## ERROS COMUNS

- **Sem resultado por causa de maiúsculas/minúsculas:** use `-i`.
- **Regex não funciona como esperado:** tente `-E` para regex estendida.
- **Saída muito grande em busca recursiva:** combine com `-n`, `-l` ou `--exclude-dir`.
- **Espaços e caracteres especiais no padrão:** envolva o padrão em aspas.

---

## CÓDIGO DE SAÍDA

- **0**: houve ao menos uma correspondência.
- **1**: nenhuma correspondência encontrada.
- **2**: erro de execução (arquivo inexistente, regex inválida etc.).

---

## DICAS RÁPIDAS

- Combine com `tail -f` para logs: `tail -f app.log | grep "ERROR"`.
- Em projetos grandes, prefira `grep -R "texto" .` com padrão específico.
- Se o padrão tiver caracteres especiais, use aspas simples quando necessário.
- Para busca em código-fonte, use `-n` para localizar rapidamente a linha.

---
