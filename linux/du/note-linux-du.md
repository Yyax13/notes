## NOME

**du** - estima uso de espaço em disco por arquivos e diretórios

## SINOPSE

`du [OPÇÕES]... [ARQUIVO]...`

---

## DESCRIÇÃO

O `du` mostra quanto espaço arquivos e pastas ocupam.

Diferente do `df`, ele detalha consumo por caminho, sendo ótimo para encontrar “vilões” de armazenamento.

---

## OPÇÕES MAIS USADAS

- **`-h`**: formato legível (KB, MB, GB).
- **`-s`**: mostra apenas total por item.
- **`-a`**: inclui arquivos individuais.
- **`-d N`**: limita profundidade de exibição.
- **`--max-depth=N`**: equivalente portátil em alguns sistemas.

---

## EXEMPLOS

- Ver tamanho total da pasta atual:

`du -sh .`

- Ver tamanho de cada item na pasta atual:

`du -sh *`

- Ver consumo com profundidade 1:

`du -h -d 1`

- Encontrar maiores diretórios:

`du -h -d 1 | sort -h`

- Ver tamanho de arquivo específico:

`du -h arquivo.iso`

---

## WORKFLOWS COMUNS

- Auditar diretórios mais pesados:

`du -h -d 1 /var | sort -h`

- Limpeza de projeto grande:

`du -sh node_modules .git storage`

---

## ERROS COMUNS

- **Confundir com `df`:** `du` mostra por pasta/arquivo; `df` por partição.
- **Esquecer `-h`:** saída fica difícil de interpretar.
- **Rodar em `/` sem filtro:** pode gerar saída enorme.

---

## CÓDIGO DE SAÍDA

- **0**: execução com sucesso.
- **> 0**: erro de leitura/permissão/caminho.

---
