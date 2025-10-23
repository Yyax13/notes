Documentação Oficial:
```
https://laravel.com/docs/12.x
```
<hr>

Requisitos:
```
PHP 8.2 ou superior
Composer 2.2 ou superior
Node JS 22 ou superior
Xampp atualizado
```
<hr>

Criar o projeto com Laravel usando Composer (na pasta que está):
```
composer create-project laravel/laravel .
```
<hr>

### RODAR O PROJETO INSTALADO DE TERCEIROS:

Instalar as dependências do PHP e do Node JS (necessário pois estes arquivos não são compartilhados devido ao gitignore):
```
composer install
npm install
```

Gerar a chave no .env:
```
php artisan key:generate
```

Executar as bibliotecas do Node JS
```
npm run dev
```

Informações sensíveis:
```
Duplicar o arquivo .env.example e renomeá-lo para .env
Alterar os dados do banco de dados conforme o que possui
```

Executar as migrations
```
php artisan migrate
```

Ligar servidor:
```
php artisan serve
Endereço para acessar: http://127.0.0.1:8000
```

<hr>

### ANOTAÇÕES:

Rotas:
```
get    -> listar, visualizar
post   -> cadastrar
put    -> editar
delete -> apagar
```

Síntaxe das rotas:
```
Route:<tipo-da-rota>('<url-da-rota>', [<controller-da-rota>::class, '<método-da-rota>'])->name(<nome-da-rota>);
```

Criar controller, model e view:
```
php artisan make:view <pasta-da-view>.<nome-da-view>
php artisan make:controller <nome-da-controller>
php artisan make:model <nome-da-model>
```

Criar migrations (criar tabelas no banco de dados):
```
php artisan make:migration create_<nome-da-tabela>_table
```

Executar todas as migrations:
```
php artisan migrate

```

Se quiser ver quais migrações já foram executadas e quais ainda estão pendentes:
```
php artisan migrate:status
```

Para reverter a operação de migração mais recente, você pode usar o rollbackcomando Artisan. Este comando reverte o último "lote" de migrações, que pode incluir vários arquivos de migração:
```
php artisan migrate:rollback
```

Apaga todas as migratios e executa novamente junto das seeders
```
php artisan migrate:fresh --seed
```