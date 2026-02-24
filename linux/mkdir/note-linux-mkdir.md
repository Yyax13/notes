## NOME

**mkdir** - cria diretórios

## SINOPSE

`mkdir [OPÇÃO]... DIRETORIO...`

---

## DESCRIÇÃO

O `mkdir` cria um ou mais diretórios.

É usado para estruturar projetos, preparar caminhos para scripts e organizar ambientes de desenvolvimento.

---

## OPÇÕES MAIS USADAS

- **`-p`**: cria diretórios pais automaticamente; não falha se já existir.
- **`-v`**: mostra mensagem para cada diretório criado.
- **`-m MODO`**: define permissões no momento da criação (ex.: `-m 755`).

---

## EXEMPLOS

- Criar uma pasta simples:

`mkdir logs`

- Criar várias pastas de uma vez:

`mkdir src tests docs`

- Criar estrutura aninhada:

`mkdir -p app/storage/cache`

- Criar com permissão específica:

`mkdir -m 700 .secrets`

- Ver o que foi criado:

`mkdir -pv projeto/{api,web,docs}`

---

## CENÁRIOS PRÁTICOS

- Estrutura básica de projeto:

`mkdir -p projeto/{src,tests,docs,scripts}`

- Preparar pastas de upload e log:

`mkdir -p storage/{uploads,logs,tmp}`

- Criar pasta de backup com data:

`mkdir -p backup/$(date +%F)`

---

## PERMISSÕES E UMASK

Mesmo com `mkdir`, o `umask` influencia permissões padrão.

- Ver `umask` atual:

`umask`

- Se precisar controle explícito, use `-m`.

Exemplo:

`mkdir -m 755 public`

---

## ERROS COMUNS

- **Diretório já existe:** sem `-p`, o comando retorna erro.
- **Caminho inexistente em árvore:** use `-p` para criar pais automaticamente.
- **Permissão negada:** criar em pasta sem direito de escrita.
- **Esquecer aspas em nomes com espaço:** use `mkdir "Minha Pasta"`.

---

## CÓDIGO DE SAÍDA

- **0**: diretórios criados com sucesso.
- **> 0**: erro de execução (já existe sem `-p`, permissão, caminho inválido).

---

## BOAS PRÁTICAS

- Use `-p` em scripts para evitar falhas por diretório já existente.
- Defina permissões sensíveis com `-m` em diretórios privados.
- Padronize nomes de pasta simples (sem espaços) em ambientes de automação.

---
