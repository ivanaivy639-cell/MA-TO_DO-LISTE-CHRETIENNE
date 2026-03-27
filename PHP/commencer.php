<?php
require "bd.php";
session_start();

header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents("php://input"), true);
$type = $data["type"] ?? null;
$context = $data["context"] ?? null;
$date = $data["date"] ?? null;
$debut = $data["debut"] ?? null;
$fin = $data["fin"] ?? null;

$stmt = $conn->prepare("INSERT INTO task (type, context, date, debut, fin) VALUES (?, ?, ?, ?, ?)");
$stmt->execute([$type, $context, $date ?: null, $debut ?: null, $fin ?: null]);

echo json_encode(["message" => "tache ajoutee avec succes"]);
?>
