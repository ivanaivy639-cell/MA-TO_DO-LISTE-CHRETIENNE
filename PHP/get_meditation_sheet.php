<?php
header("Content-Type: application/json; charset=UTF-8");

require "bd.php";

try {
    $taskId = isset($_GET["task_id"]) ? (int) $_GET["task_id"] : 0;

    if ($taskId <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Identifiant de tache invalide."
        ]);
        exit;
    }

    $stmt = $conn->prepare(
        "SELECT id, task_id, date_etude, texte_meditation, contexte, mots_cles, definition_biblique,
                definition_standard, version_1, version_2, verset_marquant, reflexion, decision, acte, priere,
                created_at, updated_at
         FROM fiches
         WHERE task_id = ?
         LIMIT 1"
    );
    $stmt->execute([$taskId]);
    $meditation = $stmt->fetch();

    echo json_encode([
        "success" => true,
        "meditation" => $meditation ?: null
    ]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors du chargement de la fiche.",
        "error" => $error->getMessage()
    ]);
}
?>
