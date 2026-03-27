<?php
$host = "localhost";
$user = "root";
$password = "ivy";
$bd = "todo_list_app";

$conn = new PDO("mysql:host=$host;dbname=$bd;charset=utf8mb4", $user, $password);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
?>
