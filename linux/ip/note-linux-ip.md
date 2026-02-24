## NOME

**ip** - configura e exibe informações de rede (IPRoute2)

## SINOPSE

`ip [OPÇÕES] OBJETO COMANDO`

---

## DESCRIÇÃO

O comando `ip` substitui ferramentas antigas como `ifconfig` e `route`.

Ele permite inspecionar interfaces, endereços, rotas e estado da conectividade local.

---

## OBJETOS MAIS USADOS

- **`addr` / `a`**: endereços IP por interface.
- **`link` / `l`**: estado das interfaces (UP/DOWN, MAC).
- **`route` / `r`**: tabela de rotas.
- **`neigh`**: tabela ARP/NDP de vizinhos.

---

## EXEMPLOS

- Ver interfaces e IPs:

`ip a`

- Ver apenas links/interfaces:

`ip l`

- Ver rotas:

`ip r`

- Ver rota até um destino:

`ip route get 8.8.8.8`

- Ver apenas IPv4:

`ip -4 a`

- Ver apenas IPv6:

`ip -6 a`

---

## COMANDOS ÚTEIS DE ADMINISTRAÇÃO

- Ativar interface:

`sudo ip link set dev eth0 up`

- Desativar interface:

`sudo ip link set dev eth0 down`

- Adicionar IP temporário:

`sudo ip addr add 192.168.1.50/24 dev eth0`

- Remover IP temporário:

`sudo ip addr del 192.168.1.50/24 dev eth0`

---

## ERROS COMUNS

- **Usar sem `sudo` em operações de alteração**.
- **Confundir `ip a` (endereços) com `ip r` (rotas)**.
- **Aplicar mudanças temporárias achando que persistem após reboot**.

---

## CÓDIGO DE SAÍDA

- **0**: execução com sucesso.
- **> 0**: erro de sintaxe/permissão/interface inválida.

---
