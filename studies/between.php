<?php

require '/wamp64/www/celke/projectPhp-celke/conection-database/conection.php';

/**
 * Between serve para procurar valores no bd utilizando um valor inicial e um final, desta forma:
 */
$query = 'SELECT id, name FROM adms_sits_users WHERE id BETWEEN 2 AND 5';
$result = $conn->prepare($query);
$result->execute();

/**
 * Obtém apenas os id´s 2, 4, 4 e 5.
 */
foreach ($result AS $oneValue){
    extract($oneValue);
    echo " ID  => $id.<br>";
    echo "Nome => $name.<br>";
    echo '<hr>';
}

