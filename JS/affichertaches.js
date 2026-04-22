let meditationTaskRefreshIntervalId = null;
let meditationTaskListenersInitialized = false;

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
            const activationHistoryKey = "meditationTaskActivations";
            const meditationLifetimeMs = 24 * 60 * 60 * 1000;
            const completedTasksKey = "completedMeditationTasks";
            const getCompletedTaskIds = function() {
                const raw = localStorage.getItem(completedTasksKey);

                if (!raw) {
                    return [];
                }

                try {
                    const parsed = JSON.parse(raw);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (error) {
                    localStorage.removeItem(completedTasksKey);
                    return [];
                }
            };
            const getActivationHistory = function() {
                const raw = localStorage.getItem(activationHistoryKey);

                if (!raw) {
                    return {};
                }

                try {
                    const parsed = JSON.parse(raw);
                    return parsed && typeof parsed === "object" ? parsed : {};
                } catch (error) {
                    localStorage.removeItem(activationHistoryKey);
                    return {};
                }
            };
            const saveActivationHistory = function(history) {
                localStorage.setItem(activationHistoryKey, JSON.stringify(history));
            };
            const cleanInvalidActivations = function(history) {
                let hasChanges = false;

                Object.keys(history).forEach(function(taskId) {
                    const activationTimestamp = history[taskId];

                    if (typeof activationTimestamp !== "number") {
                        delete history[taskId];
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    saveActivationHistory(history);
                }

                return history;
            };
            const completedTaskIds = getCompletedTaskIds();
            const activationHistory = cleanInvalidActivations(getActivationHistory());

            if (!container) {
                return;
            }

            const getTaskState = function(tache) {
                const type = (tache.type ?? "").trim().toLowerCase();
                const taskId = String(tache.id);
                const isCompleted = completedTaskIds.includes(taskId);

                if (type !== "meditation" && type !== "etude biblique") {
                    return "default";
                }

                if (isCompleted) {
                    return "completed";
                }

                if (!tache.date || !tache.debut || !tache.fin) {
                    return "default";
                }

                const now = new Date();
                const start = new Date(tache.date + "T" + tache.debut);
                const activationTimestamp = activationHistory[taskId];

                if (typeof activationTimestamp === "number" && Date.now() >= activationTimestamp + meditationLifetimeMs) {
                    return "expired";
                }

                if (Number.isNaN(start.getTime()) || now < start) {
                    return "default";
                }

                return "active";
            };

            const ensureTaskActivationTimestamp = function(taskId) {
                const normalizedTaskId = String(taskId);

                if (typeof activationHistory[normalizedTaskId] !== "number") {
                    activationHistory[normalizedTaskId] = Date.now();
                    saveActivationHistory(activationHistory);
                }
            };

            container.innerHTML = "";

            if (!Array.isArray(taches) || taches.length === 0) {
                container.innerHTML = "<p>Aucune tache enregistree pour le moment.</p>";
                return;
            }

            taches.forEach(function(tache) {
                const taskState = getTaskState(tache);
                const isActive = taskState === "active";
                const isCompleted = taskState === "completed";
                const isExpired = taskState === "expired";
                const statusLabel = taskState === "active"
                    ? "Active maintenant"
                    : taskState === "completed"
                        ? "Terminee"
                        : taskState === "expired"
                            ? "Expiree"
                            : "";
                const row = document.createElement("div");
                row.className = "tache";

                if (isActive) {
                    row.classList.add("tache-active");
                }

                if (isCompleted) {
                    row.classList.add("tache-completed");
                }

                if (isExpired) {
                    row.classList.add("tache-expired");
                }
                row.innerHTML = `
                    <div class="task-card-head">
                        <input type="checkbox" class="task-check" ${isCompleted ? "checked" : ""} disabled>
                        <h3>${tache.type ?? ""}</h3>
                        ${statusLabel ? '<span class="task-state task-state-' + taskState + '">' + statusLabel + '</span>' : ""}
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

                        ensureTaskActivationTimestamp(tache.id);
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

function initMeditationTaskAutoRefresh() {
    if (meditationTaskListenersInitialized) {
        return;
    }

    meditationTaskListenersInitialized = true;

    document.addEventListener("visibilitychange", function() {
        if (!document.hidden) {
            affichertaches();
        }
    });

    window.addEventListener("storage", function(event) {
        if (
            event.key === "meditationTaskActivations" ||
            event.key === "completedMeditationTasks" ||
            event.key === "activeMeditationTask"
        ) {
            affichertaches();
        }
    });

    window.addEventListener("meditationTaskStatusChanged", function() {
        affichertaches();
    });

    meditationTaskRefreshIntervalId = window.setInterval(function() {
        affichertaches();
    }, 60000);
}

initMeditationTaskAutoRefresh();
