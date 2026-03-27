const inscriptionForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

async function login() {
  if (!emailInput || !passwordInput) {
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Veuillez remplir l'adresse email et le mot de passe.");
    return;
  }

  try {
    const response = await fetch("/ma_to_list_chretienne/PHP/inscription.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetails = data.error ? `\nDetail : ${data.error}` : "";
      alert((data.message || "Erreur serveur.") + errorDetails);
      return;
    }

    alert(data.message || "Requete envoyee.");

    if (response.ok && data.success) {
      inscriptionForm?.reset();
    }
  } catch (error) {
    alert("Impossible de contacter le serveur PHP ou la base de donnees.");
    console.error(error);
  }
}

if (inscriptionForm) {
  inscriptionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
  });
}
