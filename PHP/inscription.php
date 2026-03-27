<?php
header("Content-Type: application/json; charset=UTF-8");

require "bd.php";

try {
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Donnees JSON invalides."
        ]);
        exit();
    }

    $email = trim($data["email"] ?? "");
    $plainPassword = trim($data["password"] ?? "");

    if ($email === "" || $plainPassword === "") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email et mot de passe obligatoires."
        ]);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Adresse email invalide."
        ]);
        exit();
    }

    $stmt = $conn->prepare("SELECT id FROM utilisateur WHERE email = ?");
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "message" => "Cette adresse email existe deja."
        ]);
        exit();
    }

    $password = password_hash($plainPassword, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO utilisateur(email, password) VALUES(?, ?)");
    $stmt->execute([$email, $password]);

    echo json_encode([
        "success" => true,
        "message" => "Compte cree avec succes."
    ]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur serveur lors de l'inscription.",
        "error" => $error->getMessage()
    ]);
}
?>
