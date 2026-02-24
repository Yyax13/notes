## NOME

**df** - mostra uso de espaço em disco por sistema de arquivos

## SINOPSE

`df [OPÇÕES]... [ARQUIVO]...`

---

## DESCRIÇÃO

O `df` exibe espaço total, usado e disponível em sistemas de arquivos montados.

É útil para diagnosticar falta de espaço e planejar limpeza.

---

## OPÇÕES MAIS USADAS

- **`-h`**: tamanho em formato legível (KB, MB, GB).
- **`-T`**: mostra tipo do sistema de arquivos.
- **`-i`**: mostra uso de inodes.
- **`-a`**: inclui sistemas de arquivos com 0 blocos.
- **`--total`**: adiciona linha de total consolidado.

---

## EXEMPLOS

- Ver uso de disco legível:

`df -h`

- Ver tipo de filesystem:

`df -hT`

- Checar inodes:

`df -i`

- Ver partição específica:

`df -h /home`

---

## LEITURA DA SAÍDA

- **Filesystem**: dispositivo/sistema de arquivos.
- **Size**: capacidade total.
- **Used**: espaço usado.
- **Avail**: espaço disponível.
- **Use%**: percentual de uso.
- **Mounted on**: ponto de montagem.

---

## ERROS COMUNS

- **Confundir `df` com `du`:** `df` é por partição; `du` é por pasta/arquivo.
- **Ignorar uso de inodes:** partição pode lotar inodes antes de lotar espaço.
- **Analisar sem `-h`:** números crus dificultam leitura.

---

## CÓDIGO DE SAÍDA

- **0**: execução com sucesso.
- **> 0**: erro de leitura de sistema de arquivos ou argumento inválido.

---
