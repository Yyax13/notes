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

# RODAR O PROJETO INSTALADO DE TERCEIROS (após ter clonado o repositório):

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

Traduzir projeto para português:
```
https://github.com/lucascudo/laravel-pt-BR-localization
```

Instalar auditoria:
```
https://laravel-auditing.com/guide/installation.html
```

Gerar a chave no .env:
```
php artisan key:generate
```

Instalar o Laravel Permissions:
```
https://spatie.be/docs/laravel-permission/v6/introduction
```

Instalar as dependências do Tailwind CSS:
```
https://tailwindcss.com/docs/installation/framework-guides/laravel/vite
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

# ANOTAÇÕES:

### ROTAS

Para que cada uma serve:
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

Sequência para criar as rotas:
```
 - Método -> get; função -> index() // listar
 - Método -> get; função -> create() // carregar formulário cadastrar
 - Método -> post; função -> store() // adicionar registro
 - Método -> get; função -> show() // vizualizar detalhes do registro
 - Método -> get; função -> edit() // carregar o formulario editar
 - Método -> put; função -> uptade() // editar registro
 - Método -> delete; função -> destroy() // deletar registro
```

Comando para listar todas as rotas existentes do projeto:
```
php artisan route:list
```

Grupos (prefixo) de rotas(
Cria um grupo de rotas duma mesma controller, desta forma refatorando o código):
```
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index'])->name('users.index');
    Route::get('/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
});

// Basta criar o prefixo seguindo esta tabela:
//  Verbo       URL                  Método       Nome
//  GET       - /users             - index      - users.index
//  GET       - /users/create      - create     - users.create
//  POST      - /users             - store      - users.store
//  GET       - /users/{user}      - show       - users.show
//  GET       - /users/{user}/edit - edit       - users.edit
//  PUT/PATCH - /users/{user}      - update     - users.update
//  DELETE    - /users/{user}      - destroy    - users.destroy
```

Rotas resource (
Isto cria automaticamente todas as 7 rotas do RESTful, o nome de cada rota vai de acordo com o informado, ex.:):
```
Route::resource('users', UserController::class);

// Route:get('users-index', UserController::class, 'index'])->name('users.index');
// Route:get('users-create', UserController::class, 'create'])->name('users.create');
// ...
```

Também dá para criar várias controllers de rotas resource numa mesma rota:
```
Route::resources([
    'users' => UserController::class,
    'products' => ProductController::class,
    ...
]);
```

Fazer com que uma rota possa possuir mais de um tipo (ex.: get e post):
```
Route::match(['get', 'post'], '/create', [UserController::class, 'create'])->name('users.create');
```

Criar rotas restritas no arquivo web.php(o usuário precisa estar autenticado para acessá-las):
```
Route::match(['get', 'post'], '/create', [UserController::class, 'create'])->name('users.create');
```

Arquivo para verificar as configurações de autenticação:
```
config/auth.php
```

<hr>

### MODELS

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

Síntaxe para usar algumas funções do eloquent:
 * where() -> traz os registros onde da coluna do promeiro argumento onde os valores são iguais ao do segundo argumento.
 * limit() e orderBy() -> auto explicativo.
 * get() -> executa a query trazendo TODOS os registros encontrados, precisa dela para a query ser executada somente em casos que irá BUSCAR registros.
```
$modelExemplo = Model::where('active', 1)
    ->orderBy('name')
    ->limit(10)
    ->get();
```

Trazer o primeiro registro dos parâmetros informados, se não houver retorna nulo:
```
$modelExemplo = Model::where('number', 'FR 900')->first();
```

Trazer o primeiro registro dos parâmetros informados, se não houver então cria o registro do segundo argumento da função:
```
$modelExemplo = Model::firstOrCreate([
    'name' => 'Lucas'
],
    [
    'email' => 'lucas@gmail.com',
    'password' => '1234'
]
    );
```

Trazer o primeiro registro dos parâmetros informados, se não houver retorna uma excessão:
```
$modelExemplo = Model::where('number', 'FR 900')->firstOrFail();
```

Busca o registro pelo ID informado, se não houver retorna uma excessão:
```
$modelExemplo = Model::findOrFail($id);
```

Síntaxa para realizar edição de um registro (insere os novos valores):
```
$modelExemplo->update([
    'name' => 'Lucas',
    'email' => 'lucas@gmail.com'
]);
```

Síntaxa para realizar exclusão de um registro (em alguns casos é necessário incluir o ->middleware() na rota de exclusão para funcionar):
```
$modelExemplo = Model::find(1); // Recupera o ID 1
$modelExemplo->delete();
```

Excluir registros em massa:
```
$modelExemplo = Model::destroy(1, 2, 3); // Exclui os IDs um, dois e três
```

Caso haja colunas json na tabela informar assim na Model, assim, o Laravel converte automaticamente ao cadastrar ou editar registros, desta forma pode cadastra-los/edita-los como array mesmo:
```
protected $casts = [
    'coluna_json' => 'array'
];
```

Para buscar registros exceto o parâmetro informado, ex.:
```
$levels_access = LevelAccess::where('name', '!=', 'Desenvolvedor')->get(); // Traz todos os níveis de acesso exceto "Desenvolvedor"
return view('users.create', ['levels_access' => $levels_access]);
```

<hr>

### MIGRATES

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

### SEEDERS

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

### FORMULÁRIO

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

Criptografar senha para enviá-la ao banco de dados:
```
Model::create([
'password' => Hash::make($request->password),
]);
```

Criar um arquivo request:
```
php artisan make:request NomeDaRequest
```

Se quiser utilizar a validação através do arquivo request precisa espeficar:
```
public function authorize(): bool
{
    return true;
}
```

Realizar validação do formulário dentro da própria controller:
```
public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|unique:posts|max:255',
        'body' => 'required',
    ]);
    // Se passar da validação então segue o código
}
```

Pode separar as regras da validação pela '|' ou armazenar em arrays usando validateWithBag:
```
$validatedData = $request->validateWithBag('post', [
    'title' => ['required', 'unique:posts', 'max:255'],
    'body' => ['required'],
]);
```

Se usar o 'bail' a validação é pausada na primeira excessão que surgir, não chega a verificar as demais:
```
$request->validate([
    'title' => 'bail|required|unique:posts|max:255',
    'body' => 'required',
]);
```

Quando a validação captura algum excessão ela a envia para uma sessão $errors, pode exibí-la num componente:
```
@if ($errors->any()) {{-- any() seria como 'se existir' --}}
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error) {{-- precisa do all() para capturar todas as excessões --}}
                <li>{{ $error }}</li> {{-- imprime o erro --}}
            @endforeach
        </ul>
    </div>
@endif
```

Regras documentadas:
```
https://laravel.com/docs/12.x/validation#available-validation-rules
```

Se o campo não for obrigatório precisa informar:
```
$request->validate([
    'publish_at' => 'nullable|date'
]);
```

Também pode obrigar a validação a pausar o processamento na primeira excessão informando isto na request:
```
protected $stopOnFirstFailure = true;
```

Se quiser personalisar as mensagens de erro na request:
```
public function messages(): array
{
return [
    'title.required' => 'O título é obrigatório!',
    'body.required' => 'A mensagem é obrigatória!',
  ];
}
```

Verifica se o campo é obrigatório somente se existir no respectivo formulário:
```
public function rules(): array
{
    return [
         'name' => 'sometimes|required',
         'cpf' => 'sometimes|required',
         'date_birth' => 'sometimes|required',
         'gender' => 'sometimes|required',
         'email' => 'sometimes|required',
         'telephone' => 'sometimes|required',
         'password' => 'sometimes|required',
    ];
}
```

A Rule::anyOfregra permite especificar que o campo em validação deve satisfazer qualquer um dos conjuntos de regras de validação fornecidos.
No caso abaixo ela precisa ser um e-mail ou uma sequência alfanumérica:
```
'username' => [
    'required',
    Rule::anyOf([
        ['string', 'email'],
        ['string', 'alpha_dash', 'min:6'],
    ]),
],
```

alpha - o campo pode ter somente letras (pode haver caracteres especiais),
alpha:ascii - pode ter somente letras (não pode caracteres especiais):
```
'username' => 'alpha:ascii',
'username' => 'alpha'
```

Se for unique precisa informar de qual tabela é:
```
'cpf' => 'sometimes|required|unique:users',
```

Para edição de registro com colunas unique:
Primeiro precisa capturar o ID do usuário editado (isto dentro da request):
```
// Captura o parâmetro da rota, ou seja, se a rota possuir "/{user}" então captura o ID do registro, se não possuir parâmetro (ex.: em formulários post - cadastrar) retorna null
$user = $this->route('user');
```

Depois precisa informar que é unique, em qual tabela e o ID, para o Laravel ignorar o registro da coluna unique do próprio usuário e permitir a edição:
```
'cpf' => 'sometimes|required|unique:users,cpf,' . ($user ? $user->id : null),
```

Usa o in:valor para informar que o campo precisa ser igual ao(s) valor(es) informado(s):
```
'gender' => 'sometimes|in:masculino,feminino,não_informado',
```

Usa o not_in:valor para informar que o campo não pode ser igual ao(s) valor(es) informado(s):
```
'gender' => 'sometimes|not_in:Selecione:',
```

'numeric' garante que a string possua somente números e 'digits:' que possua exatamente a quantidade de caracteres informado:
```
'cpf' => 'sometimes|required|digits:11|numeric'
```

Num input date para validar se a idade é superior à 18:
```
'date_birth' => 'required|date|before:-18 years',
```
<hr>

Num input date para validar se a idade é superior à 18 (outra forma):
```
'date_birth' => 'sometimes|required|before_or_equal:' . Carbon::now()->subYears(18)->toDateString(),
```
<hr>

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

Retornar a página anterior e manter os dados no formulário:
```
return redirect()->back()->withInput()->with('error', 'Edição não realizada com sucesso!');
```

Vizualizar detalhes de um registro.
Criando a função show na controller (a model do parâmetro busca o registro de acordo com o $parâmetro, onde ele precisa ser o id):
```
public function show(User $user)
{
  dd($user);
}
```

Na rota precisa passar o parâmetro desta forma:
```
Route::get('users-show/{user}', [UserController::class, 'show'])->name('users.show');
```

E para direcionar o link precisa passar o parâmetro desta forma:
```
<a href="{{ route('users.show', [$user->id]) }}">Vizualizar</a>
```

<hr>

### COMPONENTES:

Criar componente:
```
php artisan make:component NomeDoComponente
```

Utilizar o componente na view:
```
<x-NomeDoComponente />
```

<hr>

### SESSÃO E LAYOUTS

Precisa criar manualmente um diretório com o nome 'layouts' dentro do diretório 'views'.
Dentro dele pode criar um arquivo blade onde conterá o conteúdo HTML do projeto, ex.:
```
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Zema</title>
</head>
<body>

    <a href="{{ route('users.index') }}">Usuários</a>

    @yield('content')
    
</body>
</html>
```

Agora, nas views, não é necessário incluir o HTML, somente o conteúdo, colocando-o dentro da sessão, o "@yield('content')" fica responsável em adicioná-lo:
```
@extends('layouts.admin')

@section('content')
    <h1>Bem-vindo à Zema!</h1>
@endsection
```
<hr>

### TRADUZIR LARAVEL PARA PT-BR

GitHub da biblioteca:
```
https://github.com/lucascudo/laravel-pt-BR-localization
```

<hr>

### PAGINAÇÃO

Precisa incluir a paginação na controller primeiramente:
```
public function index(): View
{
    return view('user.index', [
       'users' => DB::table('users')->paginate(15)
    ]);
}
```

Para enviar paginação simples (sem informar o número total de registros, somente anterior e próximo):
```
$users = DB::table('users')->simplePaginate(15);
```

Usar o cursor de paginação, isto é, mascára a URL da paginação para não saber em que página está:
```
$users = DB::table('users')->cursorPaginate(15);
```

<hr>


### LOGS E AUDITORIA

Alterar no .env o modo do log ser salvo:
```
LOG_CHANNEL=stack
LOG_STACK=daily <-
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug
```

Arquivo de configurações do log:
```
config/logging.php
```

Níveis de alerta de cada log:
```
Log::emergency($message);
Log::alert($message);
Log::critical($message);
Log::error($message);
Log::warning($message);
Log::notice($message);
Log::info($message);
Log::debug($message);
```

Altera-se no .env a partir de qual nível que log quer que o Laravel salve:
```
LOG_CHANNEL=stack
LOG_STACK=daily
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug <-
```

Estrutura básica para utilizar o log numa função duma controller:
```
 } catch (Exception $e) {
    Log::notice('Registro não cadastrado com sucesso.', ['exception' => $e->getMessage()]);
    return redirect()->route('users.index')->with('error', 'Usuário não cadastrado com sucesso!');
 }
```

Estrutura básica para utilizar o log numa função duma controller:
```
 } catch (Exception $e) {
    Log::notice('Registro não cadastrado com sucesso.', ['exception' => $e->getMessage()]);
    return redirect()->route('users.index')->with('error', 'Usuário não cadastrado com sucesso!');
 }
```

Instalação da auditoria:
```
https://laravel-auditing.com/guide/installation.html
```

Alterar o fuso-horário do projeto:
```
APP_NAME=Zema
APP_ENV=local
APP_KEY=base64:NoMg/TdSW+TVdyTsiGYUm2kN4qujM3XAcGq2Di3B0G8=
APP_DEBUG=true
APP_TIMEZONE=America/Sao_Paulo <-
APP_URL=http://127.0.0.1:8000
```

Depois, no arquivo config/app.php:
```
'timezone' => env('APP_TIMEZONE', 'UTC'),
```

### CHAVE ESTRANGEIRA

Criar migration para adicionar uma coluna com uma chave estrangeira:
```
php artisan migration:make add_NomeDaColuna(ex.: user_id)_to_NomeDaTabela(ex.: products)
```

Estrutura para adicionar a chave e criar o relacionamento dentro da migrate:
```
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
       $table->foreignId('branch_id') // Nome da coluna com a chave estrangeira
       ->after('remember_token') // Coluna onde a chave estrangeira ficará logo após
       ->default(1) // Valor padrão que a chave estrangeira terá
       ->constrained('branches') // Nome da coluna pai (onde a chave estrangeira retira informação)
       ->onUpdate('cascade') // Cascata: se apagar/editar a tabela pai as filhas também apagam/alteram.
       ->onDelete('restrict'); // Restrito: não edita/apaga a tabela pai se algum registro utilizar sua chave estrangeira
    });
}
```

Excluir coluna da chave estrangeira e relacionamento do rollback da migration:
```
public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropForeign(['branch_id']);
        $table->dropColumn('branch_id');
    });
}
```

Tipos de relacionamentos para colocar na Model ao exibir dados de duas tabelas:
```
Um para muitos => belongsTo()
Muitos para um => hasMany()
```

Exibir dados de duas tabelas na Model,
Após ter criado a chave estrangeira e o relacionamento criar isto na Model que possua a chave estrangeira():
```
public function nomeDaTabelaQueQuerTirarAsInformacoes()
    {
        return $this->belongsTo(User::class);
    }
```

Depois fazer o relacionamento inverso na coluna que será extraída as informações:
```
public function nomeDaTabelaQueTirouAsInformacoes()
    {
        return $this->hasMany(User::class);
    }
```

Para imprimir na view posteriormente:
```
<span>Filial: {{ $user->nomeDaTabelaQueQuerTirarAsInformacoes->city }}</span><br>
```

### AUTENTICAÇÃO

Para realização a validação de login para acessar a plataforma(Auth::attempt verifica direto na tabela 'users' de acordo com os dados que forem informados no método):
```
$authenticated = Auth::attempt([
                'cpf' => $request->cpf,
                'password' => $request->password
            ]);
// Depois faz uma validação para ver se passou, ex.: "if ($authenticated) {..."
```

Para recuperar qualquer dado do usuário logado:
```
$id_do_usuario_logado = Auth::id();
$nome_do_usuario_logado = Auth::user()->name;
```

Realizar o deslogue (logoff) do usuário:
```
public function logout()
{
    Auth::logout();
    return redirect()->route('login');
}
```

### PERMISSÕES (SISTEMA DE PAPÉIS)

Instalar o Laravel Permission:
```
https://spatie.be/docs/laravel-permission/v6/introduction
```

Localização do arquivo de permissões:
```
config/permission.php
```

Utilizar a funcionalidade das páginas que o usuário possuirá permissão de acessar (na seeder):
```
// Antes disto criar as seeders 'PermissionSeeder' e 'RoleSeeder'

// Permissões do administrador
    $adm = Role::firstOrCreate(
        ['name' => 'Administrador'],
        ['name' => 'Administrador']
);
    $adm->givePermissionTo([
        'index-enterprises',
        'show-enterprises',
        'create-enterprises',
        'edit-enterprises',
        'destroy-enterprises'
]);
```

Na seeeder Permission precisa criar cada página do projeto para poder atribuí-la à quem poderá acessá-las:
```
// Criar um array de páginas
    $permissions = [
        'index-enterprises',
        'show-enterprises',
        'create-enterprises',
        'edit-enterprises',
        'destroy-enterprises',
    ];

    foreach ($permissions as $permission) {
        // Se não encontrar o registro cadastra-o no banco de dados
        Permission::firstOrCreate(
             ['name' => $permission],
              [
                 'name' => $permission,
                 'guard_name' => 'web'
              ]
        );
    }
```

Incluir o HasRoles na model Users para conseguir utilizar o método assignRole():
```
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;

    // ...
}
```

Na seeder Role atribui quais páginas cada papel possui acesso:
```
$customer = Role::firstOrCreate(
            ['name' => 'Cliente'],
            ['name' => 'Cliente']
);
$customer->givePermissionTo([
    'profile',
    'profile.edit',
    'profile.update',

    'dashboard',

    'login',
    'login.proccess',
    'login.create',
    'login.store',
            
    'recover.create',
    'storeRecover.create',
]);
```

E no seeder User usa-se o assignRole() para atribuir o papel:
```
$seller = User::firstOrCreate([
    'name' => 'Mylena Oliveira da Cunha',
    'cpf' => '12425612395',
    'date_birth' => '2006-02-17',
    'gender' => 'feminino',
    'email' => 'mylena@gmail.com',
    'telephone' => '43991182166',
    'password' => Hash::make('1234'),
    'status_id' => 4,
    'branch_id' => 2,
    'level_access_id' => 6
]);
    $seller->assignRole('Vendedor');
```

Em 'bootstrap/app.php' adicionar o seguinte na função 'withMiddleware':
```
$middleware->alias([
    'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
    'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
    'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
]);
```

Adicionar a permissão na rota usando o middleware:
```
Route::get('/edited-records/{table}/{register}', [EditedRecordsController::class, 'index'])->name('edited.records')->middleware('permission:edited.records');
```

Usa-se o can para o respectivo objeto aparecer somente a quem possui permissão de utilizá-lo:
```
@can('users.select-enterprise-update') // No parênteses informa o nome da permissão
    <a href="{{ route('users.select-enterprise-update', ['user' => $user->id]) }}">Alterar Empresa e/ou Filial</a>
@endcan
```

Quando você faz syncRoles('Administrador') o que acontece:
 - Remove todos os roles atuais do usuário;
 - Adiciona somente Administrador;
 - Atualiza o cache de permissões automaticamente.
```
$user->syncRoles(['Administrador']);
```
