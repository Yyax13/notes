## NOME

**curl** - transfere dados de/para servidores

## SINOPSE

`curl [OPÇÕES] URL`

---

## DESCRIÇÃO

O `curl` é uma ferramenta para realizar requisições HTTP/HTTPS (e outros protocolos).

É usado para testes de API, download de arquivos e validação de endpoints.

---

## OPÇÕES MAIS USADAS

- **`-I`**: faz requisição HEAD (apenas cabeçalhos).
- **`-X METODO`**: define método HTTP (`GET`, `POST`, etc.).
- **`-H "Header: valor"`**: adiciona cabeçalho.
- **`-d 'dados'`**: envia corpo da requisição.
- **`-o arquivo`**: salva saída em arquivo.
- **`-L`**: segue redirecionamentos.
- **`-s`**: modo silencioso.
- **`-w`**: imprime métricas/formatos customizados.

---

## EXEMPLOS

- Ver cabeçalhos da resposta:

`curl -I https://example.com`

- Download com nome definido:

`curl -L https://example.com/file.zip -o file.zip`

- Requisição GET com token:

`curl -H "Authorization: Bearer TOKEN" https://api.site.com/users`

- Requisição POST JSON:

`curl -X POST https://api.site.com/login -H "Content-Type: application/json" -d '{"email":"a@a.com","senha":"123"}'`

- Ver apenas status code:

`curl -s -o /dev/null -w "%{http_code}\n" https://example.com`

---

## CÓDIGOS HTTP (RÁPIDO)

- **2xx**: sucesso.
- **3xx**: redirecionamento.
- **4xx**: erro do cliente.
- **5xx**: erro do servidor.

---

## ERROS COMUNS

- **Esquecer `-L` em URLs com redirecionamento**.
- **JSON inválido no `-d`**.
- **Header ausente (ex.: `Content-Type`)**.
- **Expor token no histórico do shell**.

---

## CÓDIGO DE SAÍDA

- **0**: requisição executada sem erro de transporte.
- **> 0**: falha de conexão, DNS, SSL ou timeout.

---
