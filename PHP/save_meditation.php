<?php
header("Content-Type: application/json; charset=UTF-8");

require "bd.php";

try {
    $data = json_decode(file_get_contents("php://input"), true);

    $taskId = isset($data["task_id"]) ? (int) $data["task_id"] : 0;
    $dateEtude = trim($data["date_etude"] ?? "");
    $texteMeditation = trim($data["texte_meditation"] ?? "");
    $contexte = trim($data["contexte"] ?? "");
    $motsCles = trim($data["mots_cles"] ?? "");
    $definitionBiblique = trim($data["definition_biblique"] ?? "");
    $definitionStandard = trim($data["definition_standard"] ?? "");
    $version1 = trim($data["version_1"] ?? "");
    $version2 = trim($data["version_2"] ?? "");
    $versetMarquant = trim($data["verset_marquant"] ?? "");
    $reflexion = trim($data["reflexion"] ?? "");
    $decision = trim($data["decision"] ?? "");
    $acte = trim($data["acte"] ?? "");
    $priere = trim($data["priere"] ?? "");

    if ($taskId <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Aucune tache active n'a ete trouvee pour enregistrer la fiche."
        ]);
        exit;
    }

    $taskStmt = $conn->prepare("SELECT id FROM task WHERE id = ? LIMIT 1");
    $taskStmt->execute([$taskId]);

    if (!$taskStmt->fetch()) {
        echo json_encode([
            "success" => false,
            "message" => "La tache associee a cette fiche est introuvable."
        ]);
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO fiches (
            task_id,
            date_etude,
            texte_meditation,
            contexte,
            mots_cles,
            definition_biblique,
            definition_standard,
            version_1,
            version_2,
            verset_marquant,
            reflexion,
            decision,
            acte,
            priere
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            date_etude = VALUES(date_etude),
            texte_meditation = VALUES(texte_meditation),
            contexte = VALUES(contexte),
            mots_cles = VALUES(mots_cles),
            definition_biblique = VALUES(definition_biblique),
            definition_standard = VALUES(definition_standard),
            version_1 = VALUES(version_1),
            version_2 = VALUES(version_2),
            verset_marquant = VALUES(verset_marquant),
            reflexion = VALUES(reflexion),
            decision = VALUES(decision),
            acte = VALUES(acte),
            priere = VALUES(priere),
            updated_at = CURRENT_TIMESTAMP"
    );

    $stmt->execute([
        $taskId,
        $dateEtude !== "" ? $dateEtude : null,
        $texteMeditation !== "" ? $texteMeditation : null,
        $contexte !== "" ? $contexte : null,
        $motsCles !== "" ? $motsCles : null,
        $definitionBiblique !== "" ? $definitionBiblique : null,
        $definitionStandard !== "" ? $definitionStandard : null,
        $version1 !== "" ? $version1 : null,
        $version2 !== "" ? $version2 : null,
        $versetMarquant !== "" ? $versetMarquant : null,
        $reflexion !== "" ? $reflexion : null,
        $decision !== "" ? $decision : null,
        $acte !== "" ? $acte : null,
        $priere !== "" ? $priere : null
    ]);

    echo json_encode([
        "success" => true,
        "message" => "La fiche de meditation a ete enregistree avec succes."
    ]);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur lors de l'enregistrement de la fiche.",
        "error" => $error->getMessage()
    ]);
}
?>
