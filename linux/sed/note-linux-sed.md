## NOME

**sed** - editor de fluxo para transformar texto

## SINOPSE

`sed [OPÇÕES] 'SCRIPT' [ARQUIVO...]`

---

## DESCRIÇÃO

O `sed` processa texto linha a linha, permitindo substituições, remoções e edições automáticas.

É muito usado em scripts para ajustes rápidos em arquivos de configuração e logs.

---

## OPÇÕES MAIS USADAS

- **`-n`**: suprime impressão padrão.
- **`-e 'SCRIPT'`**: adiciona expressão de edição.
- **`-f ARQUIVO`**: lê script de um arquivo.
- **`-i`**: edita arquivo no local (in-place).
- **`-i.bak`**: edita no local criando backup.
- **`-E`**: ativa regex estendida.

---

## EXEMPLOS

- Substituir primeira ocorrência em cada linha:

`sed 's/erro/aviso/' app.log`

- Substituir todas as ocorrências por linha:

`sed 's/erro/aviso/g' app.log`

- Ignorar maiúsculas/minúsculas:

`sed 's/linux/Linux/Ig' arquivo.txt`

- Editar arquivo diretamente com backup:

`sed -i.bak 's/DEBUG/INFO/g' app.conf`

- Imprimir apenas linhas 10 a 20:

`sed -n '10,20p' arquivo.txt`

- Remover linhas em branco:

`sed '/^$/d' arquivo.txt`

---

## ERROS COMUNS

- **Esquecer backup ao usar `-i`**.
- **Regex incorreta por falta de escape**.
- **Achar que `sed` altera arquivo sem `-i`**.

---

## CÓDIGO DE SAÍDA

- **0**: execução concluída com sucesso.
- **> 0**: erro de script, leitura ou escrita.

---
