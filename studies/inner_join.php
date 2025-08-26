<?php

require '/wamp64/www/celke/projectPhp-celke/conection-database/conection.php';

/**
 * Inner Join serve para obter valor de duas ou mais tabelas do bd.
 * Síntaxe básica: INNER JOIN 'outra tabela' AS 'apelido outra tabela' ON 'chave primaira da outra tabela'='chave estrangeira desta tabela'.
 */
$query = 'SELECT sit_usr.id, sit_usr.name, sit_usr.adms_color_id, colors.id, colors.name AS color_name
          FROM adms_sits_users AS sit_usr
          INNER JOIN adms_colors AS colors ON colors.id=sit_usr.adms_color_id';
$bquery = $conn->prepare($query);
$bquery->execute();

/**
 * Precisa haver um relacionamento de chave primária e chave estrangeira no banco de dados.
 */
while($row = $bquery->fetch(PDO::FETCH_ASSOC)){
    extract($row);
    echo "ID: $id.<br>";
    echo "Nome: $name.<br>";
    echo "Cor: $color_name.<br>";
    echo "<hr>";
}