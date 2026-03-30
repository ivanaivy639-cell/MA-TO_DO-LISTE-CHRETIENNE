const motivation = document.getElementById("motivation");

if (motivation) {
  const lines = [
    {
      tag: "p",
      html: "Vivre avec Dieu, c&apos;est vivre organis&eacute;. Que chaque t&acirc;che devienne une offrande &agrave; Lui ✨.",
    },
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

    motivation.appendChild(element);

    typeHtml(element, line.html, () => {
      setTimeout(() => typeLine(lineIndex + 1), pauseBetweenLines);
    });
  };

  typeLine();
}

function plannifions() {
  window.location.href = "commencer.html";
}

function pannifions() {
  window.location.href = "commencer.html";
}

