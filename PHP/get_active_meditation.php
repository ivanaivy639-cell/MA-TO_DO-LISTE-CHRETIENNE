<?php
require "bd.php";

header("Content-Type: application/json; charset=UTF-8");

try {
    date_default_timezone_set("Africa/Lagos");

    $currentDate = date("Y-m-d");
    $currentTime = date("H:i:s");

    $stmt = $conn->prepare(
        "SELECT id, type, context, date, debut, fin
         FROM task
         WHERE type IN (?, ?)
           AND date = ?
           AND debut <= ?
         ORDER BY debut DESC, id DESC
         LIMIT 1"
    );

    $stmt->execute(["Meditation", "Etude biblique", $currentDate, $currentTime]);
    $task = $stmt->fetch();

    if (!$task) {
        echo json_encode([
            "success" => false,
            "message" => "La fiche de meditation est disponible uniquement pendant le temps prevu pour la tache."
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "message" => "La fiche est ouverte pour la tache " . $task["type"] . ($task["context"] ? " : " . $task["context"] : "") . ", a partir de " . substr($task["debut"], 0, 5) . ".",
        "task" => $task
    ]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de la verification de la tache active.",
        "error" => $error->getMessage()
    ]);
}
?>
