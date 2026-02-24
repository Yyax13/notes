## NOME

**find** - pesquisa arquivos e diretórios em uma árvore de caminhos

## SINOPSE

`find [CAMINHO...] [EXPRESSÃO]`

---

## DESCRIÇÃO

O `find` percorre diretórios recursivamente e aplica filtros (nome, tipo, tamanho, data, permissões, dono etc.).

É um comando essencial para auditoria, limpeza de arquivos antigos, automação e operação em lote.

---

## OPÇÕES E TESTES MAIS USADOS

- **`-name "PADRAO"`**: busca por nome (sensível a maiúsculas/minúsculas).
- **`-iname "PADRAO"`**: busca por nome sem diferenciar maiúsculas/minúsculas.
- **`-type f`**: apenas arquivos.
- **`-type d`**: apenas diretórios.
- **`-maxdepth N`**: limita profundidade de busca.
- **`-mindepth N`**: inicia busca a partir de certa profundidade.
- **`-size +100M`**: arquivos maiores que 100 MB.
- **`-mtime +7`**: modificados há mais de 7 dias.
- **`-perm 644`**: permissão exata.
- **`-user usuario`**: arquivos de um usuário específico.

---

## AÇÕES COMUNS

- **`-print`**: imprime resultado (padrão em muitos cenários).
- **`-delete`**: remove os arquivos encontrados.
- **`-exec COMANDO {} \;`**: executa comando para cada resultado.
- **`-exec COMANDO {} +`**: executa comando em lote (mais eficiente).

---

## EXEMPLOS

- Encontrar todos os arquivos `.md` no diretório atual:

`find . -type f -name "*.md"`

- Buscar diretórios chamados `cache`:

`find . -type d -name "cache"`

- Buscar sem diferenciar maiúsculas/minúsculas:

`find . -iname "*readme*"`

- Buscar arquivos maiores que 200 MB:

`find . -type f -size +200M`

- Arquivos alterados há mais de 30 dias:

`find . -type f -mtime +30`

- Remover `.log` antigos (com cautela):

`find . -type f -name "*.log" -mtime +15 -delete`

- Alterar permissões dos scripts encontrados:

`find . -type f -name "*.sh" -exec chmod +x {} \;`

- Listar com detalhes via `ls`:

`find . -type f -name "*.env" -exec ls -l {} +`

---

## OPERADORES LÓGICOS

- **E (AND implícito):** `find . -type f -name "*.txt"`
- **OU (`-o`):** `find . \( -name "*.jpg" -o -name "*.png" \)`
- **NÃO (`!`):** `find . -type f ! -name "*.md"`

Use parênteses escapados `\(` e `\)` para agrupar expressões no shell.

---

## ERROS COMUNS

- **Esquecer aspas no padrão:** o shell expande antes do `find`.
- **Usar `-delete` sem validar:** sempre teste primeiro sem ação destrutiva.
- **Busca lenta em árvore grande:** limite com `-maxdepth` ou caminho mais específico.
- **Permissão negada em pastas do sistema:** execute em escopo correto ou use `sudo` quando necessário.

---

## CÓDIGO DE SAÍDA

- **0**: comando executado com sucesso.
- **> 0**: erro durante a busca/execução.

---

## BOAS PRÁTICAS

- Teste primeiro com `-print` antes de usar `-delete` ou `-exec` destrutivo.
- Prefira caminhos específicos em vez de iniciar sempre por `.` ou `/`.
- Para operações em lote, prefira `-exec ... {} +` quando possível.

---
