document.addEventListener("DOMContentLoaded", () => {
    const statusBox = document.getElementById("meditation-status");
    const sheet = document.getElementById("meditation-sheet");
    const dateField = document.getElementById("date-etude");
    const texteMeditationField = document.getElementById("texte-verset");
    const contexteField = document.getElementById("contexte");
    const motsClesField = document.getElementById("mots-cles");
    const definitionBibliqueField = document.getElementById("definition-biblique");
    const definitionStandardField = document.getElementById("definition-standard");
    const version1Field = document.getElementById("version-1");
    const version2Field = document.getElementById("version-2");
    const versetMarquantField = document.getElementById("verset-marquant");
    const reflexionField = document.getElementById("reflexion");
    const decisionField = document.getElementById("decision");
    const acteField = document.getElementById("acte");
    const priereField = document.getElementById("prayer");
    const saveButton = document.getElementById("save-meditation");
    const storageTaskKey = "activeMeditationTask";
    const completedTasksKey = "completedMeditationTasks";
    const activationHistoryKey = "meditationTaskActivations";
    const meditationLifetimeMs = 24 * 60 * 60 * 1000;

    let activeTask = null;
    let expirationTimerId = null;

    const setStatus = (message, statusClass) => {
        statusBox.textContent = message;
        statusBox.classList.remove("is-error", "is-success");

        if (statusClass) {
            statusBox.classList.add(statusClass);
        }
    };

    const showSheet = () => {
        sheet.classList.remove("is-hidden");
    };

    const hideSheet = () => {
        sheet.classList.add("is-hidden");
    };

    const clearExpirationTimer = () => {
        if (expirationTimerId) {
            window.clearTimeout(expirationTimerId);
            expirationTimerId = null;
        }
    };

    const clearSheet = () => {
        [
            dateField,
            texteMeditationField,
            contexteField,
            motsClesField,
            definitionBibliqueField,
            definitionStandardField,
            version1Field,
            version2Field,
            versetMarquantField,
            reflexionField,
            decisionField,
            acteField,
            priereField
        ].forEach((field) => {
            if (field) {
                field.value = "";
            }
        });
    };

    const applyTaskToSheet = (task) => {
        activeTask = task;

        if (dateField && task && task.date) {
            dateField.value = task.date;
        }

        if (texteMeditationField && task && task.context && !texteMeditationField.value.trim()) {
            texteMeditationField.value = task.context;
        }
    };

    const fillMeditation = (meditation) => {
        if (!meditation) {
            return;
        }

        if (dateField && meditation.date_etude) {
            dateField.value = meditation.date_etude;
        }
        if (texteMeditationField && meditation.texte_meditation) {
            texteMeditationField.value = meditation.texte_meditation;
        }
        if (contexteField && meditation.contexte) {
            contexteField.value = meditation.contexte;
        }
        if (motsClesField && meditation.mots_cles) {
            motsClesField.value = meditation.mots_cles;
        }
        if (definitionBibliqueField && meditation.definition_biblique) {
            definitionBibliqueField.value = meditation.definition_biblique;
        }
        if (definitionStandardField && meditation.definition_standard) {
            definitionStandardField.value = meditation.definition_standard;
        }
        if (version1Field && meditation.version_1) {
            version1Field.value = meditation.version_1;
        }
        if (version2Field && meditation.version_2) {
            version2Field.value = meditation.version_2;
        }
        if (versetMarquantField && meditation.verset_marquant) {
            versetMarquantField.value = meditation.verset_marquant;
        }
        if (reflexionField && meditation.reflexion) {
            reflexionField.value = meditation.reflexion;
        }
        if (decisionField && meditation.decision) {
            decisionField.value = meditation.decision;
        }
        if (acteField && meditation.acte) {
            acteField.value = meditation.acte;
        }
        if (priereField && meditation.priere) {
            priereField.value = meditation.priere;
        }
    };

    const getStoredTask = () => {
        const raw = localStorage.getItem(storageTaskKey);

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            localStorage.removeItem(storageTaskKey);
            return null;
        }
    };

    const getActivationHistory = () => {
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

    const saveActivationHistory = (history) => {
        localStorage.setItem(activationHistoryKey, JSON.stringify(history));
    };

    const getTaskActivationTimestamp = (taskId) => {
        if (!taskId) {
            return null;
        }

        const history = getActivationHistory();
        const activationTimestamp = history[String(taskId)];
        return typeof activationTimestamp === "number" ? activationTimestamp : null;
    };

    const setTaskActivationTimestamp = (taskId, timestamp) => {
        if (!taskId) {
            return null;
        }

        const history = getActivationHistory();
        const normalizedTaskId = String(taskId);
        const normalizedTimestamp = typeof timestamp === "number" ? timestamp : Date.now();

        history[normalizedTaskId] = normalizedTimestamp;
        saveActivationHistory(history);

        return normalizedTimestamp;
    };

    const removeTaskActivationTimestamp = (taskId) => {
        if (!taskId) {
            return;
        }

        const history = getActivationHistory();
        const normalizedTaskId = String(taskId);

        if (Object.prototype.hasOwnProperty.call(history, normalizedTaskId)) {
            delete history[normalizedTaskId];
            saveActivationHistory(history);
        }
    };

    const getTaskExpirationTimestamp = (task) => {
        if (!task || !task.id) {
            return null;
        }

        const activationTimestamp = getTaskActivationTimestamp(task.id);

        if (!activationTimestamp) {
            return null;
        }

        return activationTimestamp + meditationLifetimeMs;
    };

    const isTaskExpired = (task) => {
        const expirationTimestamp = getTaskExpirationTimestamp(task);

        return expirationTimestamp !== null && Date.now() >= expirationTimestamp;
    };

    const closeExpiredMeditationView = () => {
        clearExpirationTimer();
        hideSheet();
        clearSheet();

        if (activeTask && activeTask.id) {
            localStorage.removeItem(storageTaskKey);
        }

        activeTask = null;
        setStatus("La vue meditation a ete fermee car le delai de 24h apres activation est depasse.", "is-error");
        window.location.href = "commencer.html";
    };

    const scheduleExpiration = (task) => {
        clearExpirationTimer();

        const expirationTimestamp = getTaskExpirationTimestamp(task);

        if (expirationTimestamp === null) {
            return;
        }

        const remainingTime = expirationTimestamp - Date.now();

        if (remainingTime <= 0) {
            closeExpiredMeditationView();
            return;
        }

        expirationTimerId = window.setTimeout(() => {
            closeExpiredMeditationView();
        }, remainingTime);
    };

    const getCompletedTaskIds = () => {
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

    const markTaskAsCompleted = () => {
        if (!activeTask || !activeTask.id) {
            return;
        }

        const completedIds = getCompletedTaskIds();
        const taskId = String(activeTask.id);

        if (!completedIds.includes(taskId)) {
            completedIds.push(taskId);
            localStorage.setItem(completedTasksKey, JSON.stringify(completedIds));
        }

        localStorage.removeItem(storageTaskKey);
        removeTaskActivationTimestamp(activeTask.id);
        clearExpirationTimer();
        window.dispatchEvent(
            new CustomEvent("meditationTaskStatusChanged", {
                detail: {
                    taskId: taskId,
                    status: "completed"
                }
            })
        );
    };

    const openFromTask = (task, message) => {
        if (!task || !task.id) {
            hideSheet();
            setStatus("Aucune tache de meditation active pour le moment.", "is-error");
            return;
        }

        let activationTimestamp = getTaskActivationTimestamp(task.id);

        if (!activationTimestamp) {
            activationTimestamp = setTaskActivationTimestamp(task.id);
        }

        if (Date.now() >= activationTimestamp + meditationLifetimeMs) {
            localStorage.removeItem(storageTaskKey);
            hideSheet();
            setStatus("La vue meditation est fermee car les 24h apres activation sont depassees.", "is-error");
            window.location.href = "commencer.html";
            return;
        }

        clearSheet();
        applyTaskToSheet(task);
        localStorage.setItem(storageTaskKey, JSON.stringify(task));
        showSheet();
        setStatus(message, "is-success");
        scheduleExpiration(task);

        fetch("PHP/get_meditation_sheet.php?task_id=" + encodeURIComponent(task.id), {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erreur HTTP " + response.status);
                }

                return response.json();
            })
            .then((data) => {
                if (data.success && data.meditation) {
                    fillMeditation(data.meditation);
                }
            })
            .catch((error) => {
                console.error("Chargement meditation:", error);
            });
    };

    if (saveButton) {
        saveButton.addEventListener("click", () => {
            if (!activeTask || !activeTask.id) {
                setStatus("Aucune tache active n'est disponible pour enregistrer la fiche.", "is-error");
                return;
            }

            saveButton.disabled = true;

            fetch("PHP/save_meditation.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    task_id: activeTask.id,
                    date_etude: dateField ? dateField.value.trim() : "",
                    texte_meditation: texteMeditationField ? texteMeditationField.value.trim() : "",
                    contexte: contexteField ? contexteField.value.trim() : "",
                    mots_cles: motsClesField ? motsClesField.value.trim() : "",
                    definition_biblique: definitionBibliqueField ? definitionBibliqueField.value.trim() : "",
                    definition_standard: definitionStandardField ? definitionStandardField.value.trim() : "",
                    version_1: version1Field ? version1Field.value.trim() : "",
                    version_2: version2Field ? version2Field.value.trim() : "",
                    verset_marquant: versetMarquantField ? versetMarquantField.value.trim() : "",
                    reflexion: reflexionField ? reflexionField.value.trim() : "",
                    decision: decisionField ? decisionField.value.trim() : "",
                    acte: acteField ? acteField.value.trim() : "",
                    priere: priereField ? priereField.value.trim() : ""
                })
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Erreur HTTP " + response.status);
                    }

                    return response.json();
                })
                .then((data) => {
                    if (!data.success) {
                        throw new Error(data.message || "Erreur d'enregistrement.");
                    }

                    markTaskAsCompleted();
                    setStatus(data.message, "is-success");
                    hideSheet();
                    clearSheet();
                    activeTask = null;
                    window.location.href = "commencer.html";
                })
                .catch((error) => {
                    console.error("Enregistrement meditation:", error);
                    setStatus(error.message || "Impossible d'enregistrer la fiche pour le moment.", "is-error");
                })
                .finally(() => {
                    saveButton.disabled = false;
                });
        });
    }

    const storedTask = getStoredTask();

    if (storedTask && storedTask.id) {
        if (isTaskExpired(storedTask)) {
            localStorage.removeItem(storageTaskKey);
            hideSheet();
            setStatus("La vue meditation est fermee car les 24h apres activation sont depassees.", "is-error");
            window.location.href = "commencer.html";
            return;
        }

        openFromTask(
            storedTask,
            "La fiche est ouverte pour la tache selectionnee " +
                (storedTask.type || "") +
                (storedTask.context ? " : " + storedTask.context : "") +
                "."
        );
        return;
    }

    fetch("PHP/get_active_meditation.php", {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur HTTP " + response.status);
            }

            return response.json();
        })
        .then((data) => {
            if (data.success && data.task) {
                openFromTask(data.task, data.message);
                return;
            }

            hideSheet();
            setStatus(data.message || "Aucune tache de meditation active pour le moment.", "is-error");
        })
        .catch((error) => {
            console.error(error);
            hideSheet();
            setStatus("Impossible de verifier la tache de meditation pour le moment.", "is-error");
        });

});
