### Exemplo:
````
$host = "localhost";
$port = 3306;
$pass = "";
$user = "root";
$dbname = "celke";

try {
    $conn = new PDO("mysql: host=$host;port=$port;dbname=" . $dbname, $user, $pass);
} catch (PDOException $err) {
    echo $err->getMessage();
}
````
