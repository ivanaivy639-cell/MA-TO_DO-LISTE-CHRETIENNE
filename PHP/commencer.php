<?php
header("Content-Type: application/json; charset=UTF-8");

require "bd.php";

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Donnees invalides."
        ]);
        exit();
    }

    $type = trim($data["type"] ?? "");
    $context = trim($data["context"] ?? "");
    $date = trim($data["date"] ?? "");
    $debut = trim($data["debut"] ?? "");
    $fin = trim($data["fin"] ?? "");

    if ($context === "" || $date === "" || $debut === "" || $fin === "") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Veuillez remplir tous les champs."
        ]);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO task (type, context, date, debut, fin) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$type, $context, $date, $debut, $fin]);

    echo json_encode([
        "success" => true,
        "message" => "tache ajoutee avec succes"
    ]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de l'enregistrement.",
        "error" => $error->getMessage()
    ]);
}
?>
