## NOME

**ping** - testa conectividade de rede com ICMP

## SINOPSE

`ping [OPÇÕES] DESTINO`

---

## DESCRIÇÃO

O `ping` envia pacotes ICMP para verificar conectividade, latência e perda de pacotes.

É um teste inicial rápido para diagnóstico de rede e disponibilidade de host.

---

## OPÇÕES MAIS USADAS

- **`-c N`**: envia `N` pacotes e encerra.
- **`-i N`**: intervalo entre pacotes (segundos).
- **`-W N`**: timeout de resposta por pacote (segundos).
- **`-s N`**: tamanho do payload.
- **`-4`**: força IPv4.
- **`-6`**: força IPv6.

---

## EXEMPLOS

- Teste básico:

`ping google.com`

- Enviar 4 pacotes:

`ping -c 4 8.8.8.8`

- Testar com timeout curto:

`ping -c 4 -W 1 1.1.1.1`

- Forçar IPv4:

`ping -4 -c 4 github.com`

- Forçar IPv6:

`ping -6 -c 4 google.com`

---

## INTERPRETAÇÃO RÁPIDA

- **`time=... ms`**: latência por resposta.
- **`packet loss`**: porcentagem de perda.
- **`ttl`**: tempo de vida do pacote.

Perda alta ou latência muito oscilante indicam possível instabilidade de rede.

---

## ERROS COMUNS

- **Host bloqueia ICMP:** ausência de resposta nem sempre significa host offline.
- **DNS com problema:** teste também com IP direto.
- **Esquecer `-c` em scripts:** comando pode ficar contínuo.

---

## CÓDIGO DE SAÍDA

- **0**: recebeu respostas.
- **1**: sem resposta/pacotes perdidos relevantes.
- **2**: erro de execução (sintaxe/permissão).

---
