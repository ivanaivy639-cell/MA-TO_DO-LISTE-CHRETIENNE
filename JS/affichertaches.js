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
            const getCompletedTaskIds = function() {
                const raw = localStorage.getItem("completedMeditationTasks");

                if (!raw) {
                    return [];
                }

                try {
                    const parsed = JSON.parse(raw);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (error) {
                    localStorage.removeItem("completedMeditationTasks");
                    return [];
                }
            };
            const completedTaskIds = getCompletedTaskIds();

            if (!container) {
                return;
            }

            const canOpenMeditationView = function(tache) {
                const type = (tache.type ?? "").trim().toLowerCase();

                if (type !== "meditation" && type !== "etude biblique") {
                    return false;
                }

                if (!tache.date || !tache.debut || !tache.fin) {
                    return false;
                }

                const now = new Date();
                const start = new Date(tache.date + "T" + tache.debut);

                return !Number.isNaN(start.getTime())
                    && now >= start;
            };

            container.innerHTML = "";

            if (!Array.isArray(taches) || taches.length === 0) {
                container.innerHTML = "<p>Aucune tache enregistree pour le moment.</p>";
                return;
            }

            taches.forEach(function(tache) {
                const isActive = canOpenMeditationView(tache);
                const isCompleted = completedTaskIds.includes(String(tache.id));
                const row = document.createElement("div");
                row.className = isActive ? "tache tache-active" : "tache";
                row.innerHTML = `
                    <div class="task-card-head">
                        <input type="checkbox" class="task-check" ${isCompleted ? "checked" : ""}>
                        <h3>${tache.type ?? ""}</h3>
                        ${isActive ? '<span class="task-state">Active maintenant</span>' : ""}
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

                if (isActive) {
                    row.title = "Cliquer pour ouvrir la vue meditation";
                    row.addEventListener("click", function(event) {
                        if (event.target.closest("button") || event.target.closest("input")) {
                            return;
                        }

                        localStorage.setItem("activeMeditationTask", JSON.stringify(tache));
                        window.location.href = "vuemeditation.html";
                    });
                }

                container.appendChild(row);
            });
        })
        .catch(function(error) {
            console.error("Erreur affichage dynamique :", error);
        });
}
