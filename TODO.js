const presentation = document.getElementById("presentation");
const loginForm = document.getElementById("loginForm");

if (presentation) {
  const lines = [
    { tag: "h2", html: "Bienvenue" },
    {
      tag: "p",
      className: "intro",
      html: 'Bonjour et bienvenue sur votre <strong>Todo List Chretienne</strong>.'
    },
    { tag: "p", html: "Cette application vous aide a organiser, dans la paix et la clarte :" },
    { tag: "p", html: "Vos moments de priere" },
    { tag: "p", html: "Vos lectures bibliques" },
    { tag: "p", html: "Vos meditations" },
    { tag: "p", html: "Vos taches personnelles" },
    { tag: "p", className: "blessing", html: "Que Dieu benisse votre journee." }
  ];

  const speed = 34;
  const pauseBetweenLines = 220;

  const typeHtml = (element, html, done) => {
    let index = 0;
    let rendered = "";
    let insideTag = false;

    const step = () => {
      if (index >= html.length) {
        element.innerHTML = html;
        element.classList.remove("typing-cursor");
        done();
        return;
      }

      const char = html[index];
      rendered += char;

      if (char === "<") {
        insideTag = true;
      } else if (char === ">") {
        insideTag = false;
      }

      element.innerHTML = rendered;
      index += 1;
      setTimeout(step, insideTag ? 0 : speed);
    };

    element.classList.add("typing-cursor");
    step();
  };

  const typeLine = (lineIndex = 0) => {
    if (lineIndex >= lines.length) {
      return;
    }

    const line = lines[lineIndex];
    const element = document.createElement(line.tag);
    element.className = line.className
      ? `typing-line ${line.className}`
      : "typing-line";
    presentation.appendChild(element);

    typeHtml(element, line.html, () => {
      setTimeout(() => typeLine(lineIndex + 1), pauseBetweenLines);
    });
  };

  typeLine();
}
function login() {
    const email = document.getElementById("email").value;
  if (!email) {
      alert("Veuillez entrer votre adresse email.");
    } else {
    alert("Connexion reussit !");
  };
}
