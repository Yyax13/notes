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

### RODAR O PROJETO INSTALADO DE TERCEIROS (após ter clonado o repositório):

Instalar as dependências do PHP e do Node JS (necessário pois estes arquivos não são compartilhados devido ao gitignore):
```
composer install
npm install
```

Informações sensíveis:
```
Duplicar o arquivo .env.example e renomeá-lo para .env
Alterar os dados do banco de dados conforme o que possui
```

Gerar a chave no .env:
```
php artisan key:generate
```

Executar as bibliotecas do Node JS
```
npm run dev
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

<hr>

### ROTAS:
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

<hr>

### MODELS:

Criar controller, model e view:
```
php artisan make:view <pasta-da-view>.<nome-da-view>
php artisan make:controller <nome-da-controller>
php artisan make:model <nome-da-model>
```

Se o nome da coluna não estiver no atributo $fillable na Model não será possível manipulá-lo, ex.:
```
protected $fillable = [
   'name',
   'email',
   'password',
   'cpf',
   'date_birth',
   'gender',
   'telephone',
    ];
```

Precisa também informar o nome da tabela na model:
```
protected $table = "users";
```

Na model a chave primária por padrão é o id mas se quiser pode especificar:
```
protected $primaryKey = 'exemplo_id';
```

Se quiser que a chave primária não seja auto incrementa precisa informar:
```
public $incrementing = false;
```

Se quiser que a chave primária não for inteiro precisa informar:
```
protected $keyType = 'string';
```

Se não quiser que gere os campos padrões created e modified precisa informar:
```
public $timestamps = false;
```

Criar a model, migration, factory (registros fake), seeder, policy, controller e o form request (para validar formulário)
```
php artisan make:model NomeDaModel --all
```

O método "firstOrCreate" verifica se existe algum registro com os parâmetros fornecidos, se não existir então o cria (só funciona para registros e não tabelas), ex.:
```
ProductModel::firstOrCreate([
    'store' => 'Casas Freire',
    'description' => 'Playstation 5 Pro',
    'flat' => 'Portáteis(reparo)',
    'months_guarantee' => 12
        ]);
```

<hr>

### MIGRATES:

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

Apaga todas as migratios e executa novamente junto das seeders:
```
php artisan migrate:fresh --seed
```

<hr>

### SEEDERS:
Criar seeder:
```
php artisan make:seeder Nome-Da-Seeder
```

Usa-se o ::create para criar registros no banco de dados (geralmente na seed):
```
User::create([
     'name' => 'Lucas Vinicius',
     'cpf' => '12428432990',
     'date_birth' => '06/02/2006',
     'gender' => 'masculino',
     'email' => 'lucasvini269@gmail.com',
     'telephone' => '43999859499',
     'password' => 'L4bar3tTA!'
            ]);
```

Executar todas as seeders:
```
php artisan db:seed
php artisan db:seed --NomeDaSeed (se quiser executar uma em específico)
```

### FORMULÁRIO:

No formulário, impede do usuário enviar dados de fora, o de baixo define o método:
```
@csrf
@method('POST')
```

Recuperar registros com o foreach:
```
foreach (Flight::all() as $flight) {
    echo $flight->name;
}
```

### CONTROLLER:

Síntaxe básica para cadastrar registro utilizando formulário.
"with" envia a mensagem do segundo argumento na sessão do primeiro argumento:
```
try {
    EnterpriseModel::create([
        'name' => $request->name,
        'cnpj' => $request->cnpj,
        'email' => $request->email,
        'telephone' => $request->telephone
    ]);
    return redirect()->route('enterprises.index')->with('success', 'Cadastro realizado com sucesso!');
    } catch (Exception $e) {
        dd($e);
}
```