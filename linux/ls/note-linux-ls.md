## NOME

**ls** - lista o conteúdo de diretórios

## SINOPSE

`ls [OPÇÃO]... [ARQUIVO]...`

---

## DESCRIÇÃO

O comando `ls` lista informações sobre arquivos e diretórios. Sem argumentos, ele lista o conteúdo do diretório atual.

Quando usado com opções, pode mostrar detalhes como permissões, tamanho, data de modificação, arquivos ocultos, inode, tipo de arquivo e classificação visual.

É um dos comandos mais usados para inspeção rápida de ambiente e também para auditoria básica de permissões.

---

## OPÇÕES MAIS USADAS

- **-l**: Exibe no formato longo (permissões, dono, grupo, tamanho e data).
- **-a**: Mostra também arquivos ocultos (nomes iniciados com `.`).
- **-h**: Com `-l`, mostra tamanhos em formato legível (KB, MB, GB).
- **-t**: Ordena por data de modificação (mais recente primeiro).
- **-r**: Inverte a ordem da listagem.
- **-R**: Lista subdiretórios recursivamente.
- **-d**: Mostra o próprio diretório em vez do conteúdo.
- **-S**: Ordena por tamanho (maior primeiro).
- **-1**: Exibe uma entrada por linha.
- **-F**: Classifica com sufixos (`/` para diretório, `*` para executável).
- **-i**: Mostra o número do inode.
- **--color=auto**: Destaca tipos de arquivos com cores (quando disponível).

---

## FORMATO LONGO (`-l`) EXPLICADO

Exemplo:

`-rwxr-xr-- 1 felipe dev 2450 Fev 24 10:32 script.sh`

- **`-rwxr-xr--`**: permissões e tipo do arquivo.
- **`1`**: número de links físicos.
- **`felipe`**: usuário proprietário.
- **`dev`**: grupo proprietário.
- **`2450`**: tamanho em bytes.
- **`Fev 24 10:32`**: data/hora da última modificação.
- **`script.sh`**: nome do arquivo.

---

## EXEMPLOS

- Listagem simples:

`ls`

- Listagem detalhada com ocultos:

`ls -la`

- Listagem detalhada com tamanho legível:

`ls -lh`

- Ordenar por data:

`ls -lt`

- Ver apenas informações do diretório atual:

`ls -ld .`

- Listar ocultos sem `.` e `..`:

`ls -A`

- Listar por tamanho com os maiores primeiro:

`ls -lSh`

- Listar por data mais recente:

`ls -lt`

- Listar recursivamente com detalhes:

`ls -laR`

- Listar somente diretórios na pasta atual:

`ls -d */`

---

## COMBINAÇÕES ÚTEIS

- Inspeção geral de projeto:

`ls -lah`

- Auditoria rápida de permissões:

`ls -l | less`

- Ver maiores itens do diretório atual:

`ls -lSh | head`

---

## ERROS COMUNS

- **Não ver arquivo oculto:** use `-a` ou `-A`.
- **Confundir `ls -l` com tamanho legível:** inclua `-h`.
- **Listagem muito longa:** pagine com `less`.
- **Recursão excessiva com `-R`:** pode gerar muito ruído em diretórios grandes.

---

## CÓDIGO DE SAÍDA

- **0**: execução com sucesso.
- **> 0**: houve erro (ex.: diretório inexistente, permissão negada).

---

## DICAS RÁPIDAS

- Use `ls -la` como comando padrão para inspeção de pastas.
- Para diretórios com muitos arquivos, combine com `less`: `ls -la | less`.
- Para arquivos especiais e links simbólicos, o formato `-l` é essencial.
- Prefira `ls -lah` para leitura humana em ambientes de estudo e administração.

---
