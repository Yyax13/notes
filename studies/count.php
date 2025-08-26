<?php

require '/wamp64/www/celke/projectPhp-celke/conection-database/conection.php';

/**
 * Count obtém a quantidade de registros na coluna "id".
 */
$query = "SELECT COUNT(id) FROM adms_colors";
$aquery = $conn->prepare($query);
$aquery->execute();

foreach($aquery AS $oneValue){
    extract($oneValue);
    var_dump($oneValue);
}
