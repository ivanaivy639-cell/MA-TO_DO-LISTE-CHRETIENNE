<?php
header("Content-Type: application/json; charset=UTF-8");

require "bd.php";
session_start();

try {
    $utilisateurId = $_SESSION["utilisateur_id"] ?? null;

    if ($utilisateurId !== null) {
        $stmt = $conn->prepare(
            "SELECT id, utilisateur_id, type, context, date, debut, fin
             FROM task
             WHERE utilisateur_id = ?
             ORDER BY id DESC"
        );
        $stmt->execute([$utilisateurId]);
    } else {
        $stmt = $conn->query(
            "SELECT id, type, context, date, debut, fin
             FROM task
             ORDER BY date DESC"
        );
    }

    $taches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($taches);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors du chargement dynamique des taches.",
        "error" => $error->getMessage()
    ]);
}
?>
