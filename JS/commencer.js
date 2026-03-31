document.querySelectorAll(".save").forEach(function(button) {
  button.addEventListener("click", function(e) {
    e.preventDefault();
    

    const taskBox = button.closest(".task");
    const type = taskBox.querySelector(".task-name").textContent.trim();
    const textInput = taskBox.querySelector('input[type="text"]');
    const dateInput = taskBox.querySelector('input[type="date"]');
    const timeInputs = taskBox.querySelectorAll('input[type="time"]');

    const context = textInput ? textInput.value.trim() : "";
    const date = dateInput ? dateInput.value : "";
    const debut = timeInputs[0] ? timeInputs[0].value : "";
    const fin = timeInputs[1] ? timeInputs[1].value : "";

    if (!context || !date || !debut || !fin) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    fetch("PHP/commencer.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type, context, date, debut, fin })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error("Erreur HTTP " + res.status);
      }
      return res.json();
    })
    .then(data => {
      alert(data.message);
      if (data.success) {
        textInput.value = "";
        dateInput.value = "";
        timeInputs.forEach(input => input.value = "");

        if (typeof affichertaches === "function") {
          affichertaches();
        }
      }
    })
    .catch(error => {
      console.error(error);
      alert("L'enregistrement a echoue. Verifiez PHP/commencer.php et la connexion a la base de donnees.");
    });
  });
});
document.querySelectorAll(".cancel").forEach(function(button) {
  button.addEventListener("click", function(e) {
    if (confirm("Voulez-vous vraiment annuler cette tache ?")) {
      const taskBox = button.closest(".task");
      taskBox.querySelector('input[type="text"]').value = "";
      taskBox.querySelector('input[type="date"]').value = "";
      taskBox.querySelectorAll('input[type="time"]').forEach(input => input.value = "");

      
    }   
  }
)});

if (typeof affichertaches === "function") {
  affichertaches();
}
