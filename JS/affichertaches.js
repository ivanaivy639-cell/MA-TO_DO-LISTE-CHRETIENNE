function affichertaches() {
    fetch("PHP/affichertaches.php")
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Erreur HTTP " + response.status);
            }

            return response.json();
        })
        .then(function(taches) {
            const container = document.getElementById("dynamiqueContainer");

            if (!container) {
                return;
            }

            container.innerHTML = "";

            if (!Array.isArray(taches) || taches.length === 0) {
                container.innerHTML = "<p>Aucune tache enregistree pour le moment.</p>";
                return;
            }

            taches.forEach(function(tache) {
                const row = document.createElement("div");
                row.className = "tache";
                row.innerHTML = `
                    <div class="task-card-head">
                        <input type="checkbox" class="task-check">
                        <h3>${tache.type ?? ""}</h3>
                    </div>
                    <div class="task-info-grid">
                        <div class="task-info-box">
                            <strong>passage biblique</strong>
                            <span>${tache.context ?? ""}</span>
                        </div>
                        <div class="task-info-box">
                            <strong>Date</strong>
                            <span>${tache.date ?? ""}</span>
                        </div>
                        <div class="task-info-box">
                            <strong>Debut</strong>
                            <span>${tache.debut ?? ""}</span>
                        </div>
                        <div class="task-info-box">
                            <strong>Fin</strong>
                            <span>${tache.fin ?? ""}</span>
                        </div>
                        <button type="button" class="save">modifier</button>
                        <button type="button" class="cancel">supprimer</button>
                    </div>
                `;
                container.appendChild(row);
            });
        })
        .catch(function(error) {
            console.error("Erreur affichage dynamique :", error);
        });
}
