## NOME

**chmod** - altera permissões de arquivos e diretórios

## SINOPSE

`chmod [OPÇÕES] MODO ARQUIVO...`

---

## DESCRIÇÃO

O comando `chmod` modifica permissões de leitura (`r`), escrita (`w`) e execução (`x`) para:

- **u**: dono (user)
- **g**: grupo (group)
- **o**: outros (others)
- **a**: todos (all)

As permissões podem ser definidas em modo simbólico (`u+x`, `g-w`) ou numérico (`755`, `644`).

No modo numérico, cada dígito é a soma de permissões:

- **4** = leitura (`r`)
- **2** = escrita (`w`)
- **1** = execução (`x`)

Exemplo: `7 = 4 + 2 + 1` (rwx), `5 = 4 + 1` (r-x), `6 = 4 + 2` (rw-).

---

## MODOS COMUNS

- **644**: dono lê/escreve; grupo e outros apenas leem.
- **755**: dono lê/escreve/executa; grupo e outros leem/executam.
- **700**: apenas dono tem acesso total.
- **600**: arquivo privado (ex.: chave e conteúdo sensível).
- **775**: colaboração em grupo com execução para todos do grupo.

---

## MODO SIMBÓLICO (RÁPIDO)

- **Adicionar permissão:** `chmod u+x script.sh`
- **Remover permissão:** `chmod g-w arquivo.txt`
- **Definir exatamente:** `chmod u=rw,g=r,o= arquivo.txt`
- **Aplicar em todos:** `chmod a+r arquivo.txt`

---

## OPÇÕES MAIS USADAS

- **-R**: Aplica recursivamente em diretórios e conteúdo.
- **-v**: Exibe cada arquivo processado.
- **-c**: Exibe apenas arquivos que tiveram alteração.
- **--reference=ARQ**: Copia permissões de um arquivo de referência.

---

## EXEMPLOS

- Tornar script executável:

`chmod +x deploy.sh`

- Definir permissão padrão de arquivo de texto:

`chmod 644 arquivo.txt`

- Definir permissão de diretório executável/listável:

`chmod 755 minha_pasta`

- Remover escrita do grupo:

`chmod g-w arquivo.txt`

- Aplicar permissões em árvore de diretórios:

`chmod -R 755 public/`

- Ajustar permissões com base em arquivo modelo:

`chmod --reference=padrao.conf app.conf`

- Definir arquivo privado de credencial:

`chmod 600 .env`

- Permitir leitura para grupo e remover de outros:

`chmod g+r,o-r arquivo.txt`

---

## DIRETÓRIOS VS ARQUIVOS

- Em **arquivos**, `x` permite executar.
- Em **diretórios**, `x` permite atravessar/entrar no diretório.
- Diretório com `r` sem `x` pode listar nomes, mas sem abrir caminhos normalmente.
- Padrões comuns:
  - arquivos: `644`
  - diretórios: `755`

---

## UMASK (CONTEXTO IMPORTANTE)

O `umask` define permissões padrão na criação de novos arquivos/diretórios.

- Ver `umask` atual:

`umask`

- Exemplo comum: `022` (arquivos geralmente `644`, diretórios `755`).

---

## ERROS COMUNS

- **Aplicar `-R` no caminho errado:** pode quebrar permissões do sistema/projeto.
- **Usar `777` por conveniência:** abre risco de segurança.
- **Remover `x` de diretório sem perceber:** pode bloquear acesso ao conteúdo.
- **Esquecer diferença entre arquivo e pasta ao definir mesma permissão para ambos.**

---

## CÓDIGO DE SAÍDA

- **0**: permissões alteradas com sucesso.
- **> 0**: erro (arquivo inexistente, falta de permissão, caminho inválido).

---

## CUIDADOS

- Evite `chmod -R 777` sem necessidade: abre acesso total a todos.
- Para scripts, use `+x` apenas quando realmente precisarem ser executáveis.
- Revise permissões em diretórios de configuração e chaves privadas.
- Em produção, prefira princípio do menor privilégio (somente o necessário).

---
