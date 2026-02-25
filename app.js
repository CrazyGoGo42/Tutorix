// #region Navigation & Scroll
const nav = document.querySelector(".nav-island");
const scrollThreshold = 50;
const isMobile = () => window.innerWidth <= 768;

window.addEventListener("scroll", () => {
  if (!isMobile()) {
    if (window.scrollY > scrollThreshold) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Dynamic year
document.getElementById("year").textContent = new Date().getFullYear();
// #endregion

// #region Level-Daten
const levels = [
  { id: 1, title: "Grundlagen", description: "Die ersten Wörter", words: 10 },
  { id: 2, title: "Alltag", description: "Wörter für den Alltag", words: 10 },
  { id: 3, title: "Familie", description: "Familie und Freunde", words: 10 },
  { id: 4, title: "Essen", description: "Essen und Trinken", words: 10 },
  { id: 5, title: "Reisen", description: "Unterwegs sein", words: 10 },
  { id: 6, title: "Arbeit", description: "Im Beruf", words: 10 },
  { id: 7, title: "Freizeit", description: "Hobbys und Sport", words: 10 },
  { id: 8, title: "Natur", description: "Tiere und Pflanzen", words: 10 },
  { id: 9, title: "Technik", description: "Moderne Welt", words: 10 },
  { id: 10, title: "Meister", description: "Fortgeschritten", words: 15 },
];

// Vokabeln (Griechisch -> Deutsch)
const vocabulary = {
  1: [
    { gr: "γεια σου", de: "Hallo" },
    { gr: "ευχαριστώ", de: "Danke" },
    { gr: "παρακαλώ", de: "Bitte" },
    { gr: "ναι", de: "Ja" },
    { gr: "όχι", de: "Nein" },
    { gr: "καλό", de: "Gut" },
    { gr: "κακό", de: "Schlecht" },
    { gr: "νερό", de: "Wasser" },
    { gr: "ψωμί", de: "Brot" },
    { gr: "σπίτι", de: "Haus" },
  ],
  2: [
    { gr: "πρωί", de: "Morgen" },
    { gr: "βράδυ", de: "Abend" },
    { gr: "μέρα", de: "Tag" },
    { gr: "νύχτα", de: "Nacht" },
    { gr: "σήμερα", de: "Heute" },
    { gr: "χθες", de: "Gestern" },
    { gr: "αύριο", de: "Morgen" },
    { gr: "χρόνος", de: "Zeit" },
    { gr: "ρολόι", de: "Uhr" },
    { gr: "εβδομάδα", de: "Woche" },
  ],
  3: [
    { gr: "μητέρα", de: "Mutter" },
    { gr: "πατέρας", de: "Vater" },
    { gr: "αδελφός", de: "Bruder" },
    { gr: "αδελφή", de: "Schwester" },
    { gr: "παιδί", de: "Kind" },
    { gr: "οικογένεια", de: "Familie" },
    { gr: "φίλος", de: "Freund" },
    { gr: "φίλη", de: "Freundin" },
    { gr: "γιαγιά", de: "Oma" },
    { gr: "παππούς", de: "Opa" },
  ],
  4: [
    { gr: "φαγητό", de: "Essen" },
    { gr: "κρέας", de: "Fleisch" },
    { gr: "ψάρι", de: "Fisch" },
    { gr: "λαχανικά", de: "Gemüse" },
    { gr: "φρούτα", de: "Obst" },
    { gr: "τυρί", de: "Käse" },
    { gr: "γάλα", de: "Milch" },
    { gr: "καφές", de: "Kaffee" },
    { gr: "τσάι", de: "Tee" },
    { gr: "κρασί", de: "Wein" },
  ],
  5: [
    { gr: "αεροπλάνο", de: "Flugzeug" },
    { gr: "τρένο", de: "Zug" },
    { gr: "αυτοκίνητο", de: "Auto" },
    { gr: "λεωφορείο", de: "Bus" },
    { gr: "ξενοδοχείο", de: "Hotel" },
    { gr: "παραλία", de: "Strand" },
    { gr: "θάλασσα", de: "Meer" },
    { gr: "βουνό", de: "Berg" },
    { gr: "πόλη", de: "Stadt" },
    { gr: "χωριό", de: "Dorf" },
  ],
  6: [
    { gr: "δουλειά", de: "Arbeit" },
    { gr: "γραφείο", de: "Büro" },
    { gr: "υπολογιστής", de: "Computer" },
    { gr: "συνάδελφος", de: "Kollege" },
    { gr: "αφεντικό", de: "Chef" },
    { gr: "συνάντηση", de: "Meeting" },
    { gr: "μισθός", de: "Gehalt" },
    { gr: "διακοπές", de: "Urlaub" },
    { gr: "έργο", de: "Projekt" },
    { gr: "επιτυχία", de: "Erfolg" },
  ],
  // Weitere Level... #TODO!
};
// #endregion

// #region Fortschritt (LocalStorage)
function getProgress() {
  const saved = localStorage.getItem("vokabeltrainer_progress");
  return saved
    ? JSON.parse(saved)
    : { currentLevel: 1, completedLevels: [], levelScores: {} };
}

function saveProgress(progress) {
  localStorage.setItem("vokabeltrainer_progress", JSON.stringify(progress));
}
// #endregion

// #region Level-Pfad Rendering (Snake Path)
function renderLevels() {
  const levelPath = document.querySelector(".level-path");
  const progress = getProgress();

  levelPath.innerHTML = "";

  // Calculate positions along a sine wave
  const nodeSize = 70;
  const verticalSpacing = 100;
  const amplitude = 80; // How far left/right the wave goes
  const containerWidth = 400;
  const centerX = containerWidth / 2;
  const totalHeight = levels.length * verticalSpacing + nodeSize;

  // Set container height
  levelPath.style.height = totalHeight + "px";

  // Create SVG for path line
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("path-svg");
  svg.setAttribute("width", containerWidth);
  svg.setAttribute("height", totalHeight);
  levelPath.appendChild(svg);

  // Calculate all node positions first
  const positions = levels.map((level, index) => {
    // Sine wave for smooth S-curve
    const x = centerX + Math.sin(index * 0.8) * amplitude;
    const y = nodeSize / 2 + 20 + index * verticalSpacing;
    return { x, y, level, index };
  });

  // Draw the smooth path first (behind nodes)
  drawSmoothPath(svg, positions, progress);

  // Create level nodes
  positions.forEach(({ x, y, level, index }) => {
    const isCompleted = progress.completedLevels.includes(level.id);
    const isCurrent = level.id === progress.currentLevel;
    const isUnlocked = level.id <= progress.currentLevel;

    const node = document.createElement("div");
    node.className = `level-node ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""} ${isUnlocked ? "unlocked" : "locked"}`;
    node.textContent = level.id;
    node.dataset.levelId = level.id;

    // Position the node
    node.style.left = x - nodeSize / 2 + "px";
    node.style.top = y - nodeSize / 2 + "px";

    if (isUnlocked) {
      node.addEventListener("click", () => openLevelModal(level, progress));
    }

    levelPath.appendChild(node);
  });
}

function drawSmoothPath(svg, positions, progress) {
  if (positions.length < 2) return;

  // Create one continuous path for inactive (gray)
  const inactivePath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  inactivePath.classList.add("path-line");

  // Build smooth curve through all points using Catmull-Rom to Bezier conversion
  let d = `M ${positions[0].x} ${positions[0].y}`;

  for (let i = 0; i < positions.length - 1; i++) {
    const p0 = positions[Math.max(0, i - 1)];
    const p1 = positions[i];
    const p2 = positions[i + 1];
    const p3 = positions[Math.min(positions.length - 1, i + 2)];

    // Catmull-Rom to Cubic Bezier conversion
    const tension = 0.5;
    const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3;
    const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3;
    const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3;
    const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  inactivePath.setAttribute("d", d);
  svg.appendChild(inactivePath);

  // Create active (green) path overlay for completed sections
  if (progress.completedLevels.length > 0) {
    const lastCompleted = Math.max(...progress.completedLevels);
    const activePositions = positions.slice(0, lastCompleted + 1);

    if (activePositions.length >= 2) {
      const activePath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      activePath.classList.add("path-line", "active");

      let activeD = `M ${activePositions[0].x} ${activePositions[0].y}`;

      for (let i = 0; i < activePositions.length - 1; i++) {
        const p0 = activePositions[Math.max(0, i - 1)];
        const p1 = activePositions[i];
        const p2 = activePositions[i + 1];
        const p3 = activePositions[Math.min(activePositions.length - 1, i + 2)];

        const tension = 0.5;
        const cp1x = p1.x + ((p2.x - p0.x) * tension) / 3;
        const cp1y = p1.y + ((p2.y - p0.y) * tension) / 3;
        const cp2x = p2.x - ((p3.x - p1.x) * tension) / 3;
        const cp2y = p2.y - ((p3.y - p1.y) * tension) / 3;

        activeD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }

      activePath.setAttribute("d", activeD);
      svg.appendChild(activePath);
    }
  }
}
// #endregion

// #region Modal
const modal = document.getElementById("levelModal");
const modalClose = document.getElementById("modalClose");
const startLevelBtn = document.getElementById("startLevel");

let selectedLevel = null;

function openLevelModal(level, progress) {
  selectedLevel = level;

  document.querySelector(".modal-level").textContent = `Level ${level.id}`;
  document.querySelector(".modal-title").textContent = level.title;
  document.querySelector(".modal-description").textContent = level.description;

  const score = progress.levelScores[level.id] || 0;
  const percentage = Math.round((score / level.words) * 100);

  document.querySelector(".progress-fill").style.width = `${percentage}%`;
  document.querySelector(".progress-text").textContent =
    `${score}/${level.words} abgeschlossen`;

  modal.classList.add("active");
}

modalClose.addEventListener("click", () => {
  modal.classList.remove("active");
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
  }
});

startLevelBtn.addEventListener("click", () => {
  modal.classList.remove("active");
  startQuiz(selectedLevel);
});
// #endregion

// #region Quiz-Variablen
const quizView = document.getElementById("quizView");
const quizClose = document.getElementById("quizClose");
const quizContent = document.getElementById("quizContent");
const quizProgressFill = document.getElementById("quizProgressFill");
const quizHeartsEl = document.getElementById("quizHearts");

let currentQuiz = {
  level: null,
  questions: [],
  currentIndex: 0,
  hearts: 3,
  correctAnswers: 0,
};
// #endregion

// #region Shuffle & Fragen generieren - Source: ChatGPT hat geholfen :)

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions(level) {
  const words = vocabulary[level.id] || vocabulary[1];
  const questions = [];

  words.forEach((word) => {
    // Level 6: Input-Fragen (Wort eintippen)
    if (level.id === 6) {
      questions.push({
        type: "input",
        question: `Übersetze "${word.gr}" auf Deutsch:`,
        correct: word.de,
      });
    } else {
      // Andere Level: Multiple Choice
      const wrongAnswers = shuffleArray(words.filter((w) => w.de !== word.de))
        .slice(0, 3)
        .map((w) => w.de);

      questions.push({
        type: "translate",
        question: `Was bedeutet "${word.gr}"?`,
        correct: word.de,
        options: shuffleArray([word.de, ...wrongAnswers]),
      });
    }
  });

  return shuffleArray(questions);
}
// #endregion

// #region Quiz-Logik
function startQuiz(level) {
  currentQuiz = {
    level: level,
    questions: generateQuestions(level),
    currentIndex: 0,
    hearts: 3,
    correctAnswers: 0,
  };

  updateQuizUI();
  quizView.classList.add("active");
  showQuestion();
}

function updateQuizUI() {
  const progress =
    (currentQuiz.currentIndex / currentQuiz.questions.length) * 100;
  quizProgressFill.style.width = `${progress}%`;
  quizHeartsEl.textContent =
    "❤️".repeat(currentQuiz.hearts) + "🖤".repeat(3 - currentQuiz.hearts);
}

function showQuestion() {
  if (currentQuiz.currentIndex >= currentQuiz.questions.length) {
    endQuiz(true);
    return;
  }

  const question = currentQuiz.questions[currentQuiz.currentIndex];

  // Input-Fragen (Level 6)
  if (question.type === "input") {
    quizContent.innerHTML = `
      <p class="quiz-question">${question.question}</p>
      <div class="quiz-input-container">
        <input type="text" class="quiz-input" id="quizInput" placeholder="Deine Antwort..." autocomplete="off">
      </div>
      <button class="quiz-check-btn" id="checkAnswer" disabled>Prüfen</button>
    `;

    const inputField = quizContent.querySelector("#quizInput");
    const checkBtn = quizContent.querySelector("#checkAnswer");

    inputField.addEventListener("input", () => {
      checkBtn.disabled = inputField.value.trim() === "";
    });

    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && inputField.value.trim() !== "") {
        checkInputAnswer(inputField.value.trim(), question.correct);
      }
    });

    checkBtn.addEventListener("click", () => {
      checkInputAnswer(inputField.value.trim(), question.correct);
    });

    inputField.focus();
  } else {
    // Multiple Choice Fragen
    quizContent.innerHTML = `
      <p class="quiz-question">${question.question}</p>
      <div class="quiz-options">
        ${question.options
          .map(
            (option, i) => `
          <button class="quiz-option" data-answer="${option}">${option}</button>
        `,
          )
          .join("")}
      </div>
      <button class="quiz-check-btn" id="checkAnswer" disabled>Prüfen</button>
    `;

    const options = quizContent.querySelectorAll(".quiz-option");
    const checkBtn = quizContent.querySelector("#checkAnswer");
    let selectedAnswer = null;

    options.forEach((option) => {
      option.addEventListener("click", () => {
        options.forEach((o) => o.classList.remove("selected"));
        option.classList.add("selected");
        selectedAnswer = option.dataset.answer;
        checkBtn.disabled = false;
      });
    });

    checkBtn.addEventListener("click", () => {
      checkAnswer(selectedAnswer, question.correct, options);
    });
  }
}

function checkAnswer(selected, correct, options) {
  const isCorrect = selected === correct;

  options.forEach((option) => {
    option.style.pointerEvents = "none";
    if (option.dataset.answer === correct) {
      option.classList.add("correct");
    } else if (option.dataset.answer === selected && !isCorrect) {
      option.classList.add("wrong");
    }
  });

  if (isCorrect) {
    currentQuiz.correctAnswers++;
  } else {
    currentQuiz.hearts--;
    updateQuizUI();
  }

  showFeedback(isCorrect, isCorrect ? null : correct);
}

function checkInputAnswer(userInput, correct) {
  // Case-insensitive comparison
  const isCorrect = userInput.toLowerCase() === correct.toLowerCase();

  const inputField = quizContent.querySelector("#quizInput");
  const checkBtn = quizContent.querySelector("#checkAnswer");

  inputField.disabled = true;
  checkBtn.disabled = true;

  if (isCorrect) {
    inputField.classList.add("correct");
    currentQuiz.correctAnswers++;
  } else {
    inputField.classList.add("wrong");
    currentQuiz.hearts--;
    updateQuizUI();
  }

  showFeedback(isCorrect, isCorrect ? null : correct);
}

function showFeedback(isCorrect, correctAnswer = null) {
  const existing = document.querySelector(".quiz-feedback");
  if (existing) existing.remove();

  const feedback = document.createElement("div");
  feedback.className = `quiz-feedback ${isCorrect ? "correct" : "wrong"}`;

  if (isCorrect) {
    feedback.innerHTML = `
      <span class="feedback-title">Richtig!</span>
      <button class="feedback-weiter-btn">Weiter</button>
    `;
  } else {
    feedback.innerHTML = `
      <span class="feedback-title">Falsch!</span>
      <span class="feedback-answer">Richtige Antwort: <strong>${correctAnswer}</strong></span>
      <button class="feedback-weiter-btn">Weiter</button>
    `;
  }

  quizView.appendChild(feedback);

  const weiterBtn = feedback.querySelector(".feedback-weiter-btn");
  weiterBtn.addEventListener("click", () => {
    feedback.remove();

    // Check if quiz should end (no hearts left)
    if (currentQuiz.hearts <= 0) {
      endQuiz(false);
      return;
    }

    // Move to next question
    currentQuiz.currentIndex++;
    updateQuizUI();
    showQuestion();
  });
}
// #endregion

// #region Quiz beenden & Ergebnis
function endQuiz(completed) {
  const progress = getProgress();

  if (
    completed &&
    currentQuiz.correctAnswers >= currentQuiz.questions.length * 0.7
  ) {
    // 70% to pass
    if (!progress.completedLevels.includes(currentQuiz.level.id)) {
      progress.completedLevels.push(currentQuiz.level.id);
    }
    if (currentQuiz.level.id >= progress.currentLevel) {
      progress.currentLevel = Math.min(currentQuiz.level.id + 1, levels.length);
    }
  }

  progress.levelScores[currentQuiz.level.id] = Math.max(
    progress.levelScores[currentQuiz.level.id] || 0,
    currentQuiz.correctAnswers,
  );

  saveProgress(progress);

  // Show result
  const passed =
    completed &&
    currentQuiz.correctAnswers >= currentQuiz.questions.length * 0.7;

  quizContent.innerHTML = `
    <div style="text-align: center; padding: 2rem;">
      <div style="font-size: 4rem; margin-bottom: 1rem;">${passed ? "yayy" : ":("}</div>
      <h2 style="margin-bottom: 1rem;">${passed ? "Geschafft!" : "Nicht bestanden"}</h2>
      <p style="color: var(--dark-gray); margin-bottom: 2rem;">
        ${currentQuiz.correctAnswers} von ${currentQuiz.questions.length} richtig
      </p>
      <button class="quiz-check-btn" onclick="closeQuiz()">
        ${passed ? "Weiter" : "Nochmal versuchen"}
      </button>
    </div>
  `;
}

function closeQuiz() {
  quizView.classList.remove("active");
  renderLevels();
}

quizClose.addEventListener("click", () => {
  if (confirm("Möchtest du das Quiz wirklich beenden?")) {
    closeQuiz();
  }
});
// #endregion

// #region Initialisierung
renderLevels();
window.addEventListener("resize", renderLevels);
// #endregion
