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

Função para capturar uma parte de uma string:
```
echo substr("Programador", 0, 4);
// Resultado -> Prog
```

Função para deixar a primeira letra de uma string maiúscula:
```
<?php
echo ucfirst("olá mundo"); // Saída: Olá mundo
?>
```

Remove tudo que há do primeiro parâmtro na string e subtitui pelo segundo:
```
$this->data = preg_replace('/[^[:alnum:]\p{L}]/u', '', $this->data); // -> Regex para PHP, remove tudo que não é letra ou número.
```
