Função para transformar string (palavra) em array de letras:
```
$email_array = str_split($user->email);
```

Função para transformar string em array com alguma string de separação:
```
$email_array = explode(' ', $user->email);
```

Função para transformar array em string com alguma string de separação:
```
$email_string = implode(' ', $user->email_array);
```

Função para capturar a última posição de um array:
```
$end = end($array);
```
