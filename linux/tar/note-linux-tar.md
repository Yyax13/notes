## NOME

**tar** - empacota e extrai arquivos arquivados

## SINOPSE

`tar [OPÇÕES] ARQUIVO_TAR [ARQUIVOS...]`

---

## DESCRIÇÃO

O `tar` cria arquivos de arquivo (`.tar`) e trabalha com compactação (`.tar.gz`, `.tar.bz2`, `.tar.xz`).

É padrão para backup, distribuição e transporte de diretórios.

---

## OPÇÕES MAIS USADAS

- **`-c`**: cria arquivo tar.
- **`-x`**: extrai arquivo tar.
- **`-t`**: lista conteúdo do tar.
- **`-f ARQ`**: define nome do arquivo tar.
- **`-v`**: modo verboso.
- **`-z`**: usa gzip.
- **`-j`**: usa bzip2.
- **`-J`**: usa xz.

---

## EXEMPLOS

- Criar `.tar` simples:

`tar -cvf backup.tar projeto/`

- Criar `.tar.gz`:

`tar -czvf backup.tar.gz projeto/`

- Extrair `.tar.gz`:

`tar -xzvf backup.tar.gz`

- Extrair em diretório específico:

`tar -xzvf backup.tar.gz -C /tmp/restaura`

- Listar conteúdo sem extrair:

`tar -tvf backup.tar.gz`

---

## ERROS COMUNS

- **Esquecer `-f` com nome do arquivo**.
- **Usar flag de compressão errada (`-z`, `-j`, `-J`)**.
- **Extrair sem revisar destino (`-C`)**.

---

## CÓDIGO DE SAÍDA

- **0**: operação concluída com sucesso.
- **> 0**: erro de leitura/escrita/arquivo inválido.

---
