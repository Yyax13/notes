## NOME

**wget** - faz download de arquivos via rede

## SINOPSE

`wget [OPÇÕES]... URL`

---

## DESCRIÇÃO

O `wget` baixa conteúdo por HTTP/HTTPS/FTP e pode retomar downloads interrompidos.

É muito útil para scripts, servidores e ambientes sem interface gráfica.

---

## OPÇÕES MAIS USADAS

- **`-O ARQUIVO`**: define nome do arquivo de saída.
- **`-c`**: continua download interrompido.
- **`-q`**: modo silencioso.
- **`-P DIR`**: salva no diretório especificado.
- **`--limit-rate=VALOR`**: limita taxa de download.
- **`--show-progress`**: exibe progresso (quando suportado).

---

## EXEMPLOS

- Download simples:

`wget https://example.com/file.zip`

- Download com nome personalizado:

`wget -O backup.zip https://example.com/file.zip`

- Retomar download:

`wget -c https://example.com/bigfile.iso`

- Salvar em pasta específica:

`wget -P downloads https://example.com/doc.pdf`

- Limitar velocidade:

`wget --limit-rate=500k https://example.com/file.zip`

---

## ERROS COMUNS

- **URL redirecionada sem suporte adequado no servidor**.
- **Permissão negada na pasta de destino**.
- **Confundir `-O` (arquivo) com `-P` (diretório)**.

---

## CÓDIGO DE SAÍDA

- **0**: download concluído com sucesso.
- **> 0**: falha de rede, DNS, SSL, escrita ou autenticação.

---
