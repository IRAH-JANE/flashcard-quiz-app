const fileInput = document.getElementById("fileInput");
const countSelect = document.getElementById("countSelect");
const generateBtn = document.getElementById("generateBtn");
const statusText = document.getElementById("status");

const flashcardsContainer = document.getElementById("flashcards");
const quizContainer = document.getElementById("quizContainer");

const flashcardModeBtn = document.getElementById("flashcardModeBtn");
const quizModeBtn = document.getElementById("quizModeBtn");

const exportJsonBtn = document.getElementById("exportJsonBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const exportTxtBtn = document.getElementById("exportTxtBtn");

const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");
const historyList = document.getElementById("historyList");

const setInfo = document.getElementById("setInfo");
const scoreBox = document.getElementById("scoreBox");

let flashcards = [];
let currentSetId = null;
let currentMode = "flashcards";
let currentFilename = "";
let currentFileMode = "";

let quizIndex = 0;
let quizCorrect = 0;
let quizWrong = 0;
let quizAnswered = false;

const themeToggleBtn = document.getElementById("themeToggleBtn");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("flashcard-theme", theme);

  if (theme === "dark") {
    themeToggleBtn.textContent = "☀️ Light Mode";
  } else {
    themeToggleBtn.textContent = "🌙 Dark Mode";
  }
}

const savedTheme = localStorage.getItem("flashcard-theme") || "light";
applyTheme(savedTheme);

themeToggleBtn.addEventListener("click", function () {
  const currentTheme = document.documentElement.getAttribute("data-theme");

  if (currentTheme === "dark") {
    applyTheme("light");
  } else {
    applyTheme("dark");
  }
});

function escapeHTML(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setStatus(message) {
  statusText.textContent = message;
}

function updateScoreBox() {
  scoreBox.textContent = `Score: ${quizCorrect} / ${quizCorrect + quizWrong}`;
}

function sourceLabel(card) {
  if (card.answer_source === "file") return "Answer source: file";
  if (card.answer_source === "ai") return "Answer source: AI";
  return "Answer source: unknown";
}

function renderSetInfo() {
  if (!flashcards.length) {
    setInfo.textContent = "No set loaded.";
    return;
  }

  setInfo.textContent = `${currentFilename || "Current set"} • ${currentFileMode || "unknown"} • ${flashcards.length} cards`;
}

generateBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];

  if (!file) {
    alert("Please choose a PDF or DOCX file first.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("count", countSelect.value);

  flashcards = [];
  currentSetId = null;
  currentFilename = "";
  currentFileMode = "";
  renderSetInfo();
  renderFlashcards();

  setStatus("Uploading file...");
  generateBtn.disabled = true;

  try {
    setStatus("Extracting text and checking file type...");

    const response = await fetch("/process", {
      method: "POST",
      body: formData,
    });

    setStatus("Generating flashcards. Local AI may take a while...");

    const data = await response.json();

    if (!response.ok || data.error) {
      setStatus(data.error || "Something went wrong.");
      return;
    }

    flashcards = data.questions || [];
    currentSetId = data.set_id;
    currentFilename = data.filename;
    currentFileMode = data.mode;

    quizIndex = 0;
    quizCorrect = 0;
    quizWrong = 0;
    quizAnswered = false;

    updateScoreBox();
    renderSetInfo();
    setStatus(`Done. Generated ${flashcards.length} cards.`);

    currentMode = "flashcards";
    renderFlashcards();
    await loadHistory();
  } catch (error) {
    console.error(error);
    setStatus(
      "Something went wrong. Check Flask terminal and make sure Ollama is running.",
    );
  } finally {
    generateBtn.disabled = false;
  }
});

function renderFlashcards() {
  currentMode = "flashcards";
  flashcardsContainer.classList.remove("hidden");
  quizContainer.classList.add("hidden");

  flashcardsContainer.innerHTML = "";

  if (!flashcards.length) {
    flashcardsContainer.innerHTML = `<p class="empty">No flashcards yet.</p>`;
    return;
  }

  flashcards.forEach((card, index) => {
    const cardEl = document.createElement("div");
    cardEl.className = "flashcard";

    const choicesHTML =
      Array.isArray(card.choices) && card.choices.length > 0
        ? `
          <ul class="choices">
            ${card.choices.map((choice) => `<li>${escapeHTML(choice)}</li>`).join("")}
          </ul>
        `
        : "";

    cardEl.innerHTML = `
      <div class="card-top">
        <h3>Question ${index + 1}</h3>
        <span class="badge">${escapeHTML(sourceLabel(card))}</span>
      </div>

      <p class="question-text">${escapeHTML(card.question)}</p>

      ${choicesHTML}

      <div class="answer-box hidden" id="answer-${index}">
        <strong>Answer:</strong>
        <p>${escapeHTML(card.answer)}</p>
      </div>

      <div class="card-actions">
        <button onclick="toggleAnswer(${index})">Show / Hide Answer</button>
        <button onclick="openEditCard(${index})">Edit</button>
        <button class="danger" onclick="deleteCard(${index})">Delete</button>
      </div>

      <div class="edit-box hidden" id="edit-${index}">
        <label>Question</label>
        <textarea id="edit-question-${index}">${escapeHTML(card.question)}</textarea>

        <label>Answer</label>
        <textarea id="edit-answer-${index}">${escapeHTML(card.answer)}</textarea>

        <label>Choices, one per line</label>
        <textarea id="edit-choices-${index}">${escapeHTML((card.choices || []).join("\n"))}</textarea>

        <button onclick="saveEditCard(${index})">Save Edit</button>
        <button onclick="closeEditCard(${index})">Cancel</button>
      </div>
    `;

    flashcardsContainer.appendChild(cardEl);
  });
}

window.toggleAnswer = function (index) {
  const box = document.getElementById(`answer-${index}`);
  box.classList.toggle("hidden");
};

window.openEditCard = function (index) {
  document.getElementById(`edit-${index}`).classList.remove("hidden");
};

window.closeEditCard = function (index) {
  document.getElementById(`edit-${index}`).classList.add("hidden");
};

window.saveEditCard = async function (index) {
  const question = document
    .getElementById(`edit-question-${index}`)
    .value.trim();
  const answer = document.getElementById(`edit-answer-${index}`).value.trim();
  const choicesText = document
    .getElementById(`edit-choices-${index}`)
    .value.trim();

  flashcards[index].question = question;
  flashcards[index].answer = answer;
  flashcards[index].choices = choicesText
    ? choicesText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

  await saveCurrentSet();
  renderFlashcards();
  setStatus("Card edited and saved.");
};

window.deleteCard = async function (index) {
  if (!confirm("Delete this card?")) return;

  flashcards.splice(index, 1);
  await saveCurrentSet();
  renderFlashcards();
  renderSetInfo();
  setStatus("Card deleted.");
};

async function saveCurrentSet() {
  if (!currentSetId) return;

  try {
    await fetch(`/history/${currentSetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cards: flashcards }),
    });

    await loadHistory();
  } catch (error) {
    console.error(error);
  }
}

flashcardModeBtn.addEventListener("click", () => {
  renderFlashcards();
});

quizModeBtn.addEventListener("click", () => {
  startQuiz();
});

function startQuiz() {
  if (!flashcards.length) {
    alert("Generate or load flashcards first.");
    return;
  }

  currentMode = "quiz";
  quizIndex = 0;
  quizCorrect = 0;
  quizWrong = 0;
  quizAnswered = false;

  updateScoreBox();
  renderQuiz();
}

function renderQuiz() {
  flashcardsContainer.classList.add("hidden");
  quizContainer.classList.remove("hidden");

  if (!flashcards.length) {
    quizContainer.innerHTML = `<p class="empty">No flashcards available.</p>`;
    return;
  }

  if (quizIndex >= flashcards.length) {
    quizContainer.innerHTML = `
      <div class="quiz-card">
        <h2>Quiz Finished</h2>
        <p class="final-score">Final Score: ${quizCorrect} / ${flashcards.length}</p>
        <button onclick="startQuizAgain()">Restart Quiz</button>
        <button onclick="renderFlashcards()">Back to Flashcards</button>
      </div>
    `;
    return;
  }

  const card = flashcards[quizIndex];
  const hasChoices = Array.isArray(card.choices) && card.choices.length > 0;

  const choicesHTML = hasChoices
    ? `
      <div class="quiz-choices">
        ${card.choices
          .map(
            (choice, i) => `
          <button onclick="selectQuizChoice(${i})" id="quiz-choice-${i}">
            ${escapeHTML(choice)}
          </button>
        `,
          )
          .join("")}
      </div>
    `
    : `
      <button onclick="showQuizAnswer()">Show Answer</button>
      <div id="manualAnswerBox" class="answer-box hidden">
        <strong>Answer:</strong>
        <p>${escapeHTML(card.answer)}</p>
        <button onclick="markManual(true)">I got it right</button>
        <button class="danger" onclick="markManual(false)">I got it wrong</button>
      </div>
    `;

  quizContainer.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-top">
        <h2>Question ${quizIndex + 1} of ${flashcards.length}</h2>
        <span class="badge">${escapeHTML(sourceLabel(card))}</span>
      </div>

      <p class="question-text">${escapeHTML(card.question)}</p>

      ${choicesHTML}

      <div id="quizFeedback" class="quiz-feedback hidden"></div>

      <div class="quiz-actions">
        <button onclick="nextQuizQuestion()">Next</button>
        <button onclick="renderFlashcards()">Exit Quiz</button>
      </div>
    </div>
  `;
}

window.startQuizAgain = function () {
  startQuiz();
};

function getAnswerLetter(answer) {
  const match = String(answer)
    .trim()
    .toLowerCase()
    .match(/^\(([a-d])\)/);
  return match ? match[1] : "";
}

function normalizeAnswer(text) {
  return String(text)
    .replace("(AI-generated answer)", "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

window.selectQuizChoice = function (choiceIndex) {
  if (quizAnswered) return;

  const card = flashcards[quizIndex];
  const selectedChoice = card.choices[choiceIndex];

  const selectedLetter = getAnswerLetter(selectedChoice);
  const answerLetter = getAnswerLetter(card.answer);

  let correct = false;

  if (selectedLetter && answerLetter) {
    correct = selectedLetter === answerLetter;
  } else {
    correct = normalizeAnswer(selectedChoice) === normalizeAnswer(card.answer);
  }

  quizAnswered = true;

  if (correct) {
    quizCorrect++;
  } else {
    quizWrong++;
  }

  updateScoreBox();

  const feedback = document.getElementById("quizFeedback");
  feedback.classList.remove("hidden");
  feedback.innerHTML = correct
    ? `<strong class="correct">Correct!</strong>`
    : `<strong class="wrong">Wrong.</strong><br>Correct answer: ${escapeHTML(card.answer)}`;

  card.choices.forEach((_, i) => {
    const btn = document.getElementById(`quiz-choice-${i}`);
    btn.disabled = true;

    if (i === choiceIndex) {
      btn.classList.add(correct ? "selected-correct" : "selected-wrong");
    }
  });
};

window.showQuizAnswer = function () {
  document.getElementById("manualAnswerBox").classList.remove("hidden");
};

window.markManual = function (isCorrect) {
  if (quizAnswered) return;

  quizAnswered = true;

  if (isCorrect) {
    quizCorrect++;
  } else {
    quizWrong++;
  }

  updateScoreBox();
};

window.nextQuizQuestion = function () {
  quizIndex++;
  quizAnswered = false;
  renderQuiz();
};

// -----------------------------
// EXPORTS
// -----------------------------

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

exportJsonBtn.addEventListener("click", () => {
  if (!flashcards.length) return alert("No flashcards to export.");

  downloadFile(
    "flashcards.json",
    JSON.stringify(flashcards, null, 2),
    "application/json",
  );
});

exportCsvBtn.addEventListener("click", () => {
  if (!flashcards.length) return alert("No flashcards to export.");

  const rows = [["Question", "Choices", "Answer", "Answer Source"]];

  flashcards.forEach((card) => {
    rows.push([
      card.question,
      (card.choices || []).join(" | "),
      card.answer,
      card.answer_source || "",
    ]);
  });

  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  downloadFile("flashcards.csv", csv, "text/csv");
});

exportTxtBtn.addEventListener("click", () => {
  if (!flashcards.length) return alert("No flashcards to export.");

  const txt = flashcards
    .map((card, index) => {
      return `
Question ${index + 1}
${card.question}

Choices:
${(card.choices || []).join("\n") || "None"}

Answer:
${card.answer}

Source:
${card.answer_source || "unknown"}
`;
    })
    .join("\n--------------------\n");

  downloadFile("flashcards.txt", txt, "text/plain");
});

// -----------------------------
// HISTORY
// -----------------------------

async function loadHistory() {
  try {
    const response = await fetch("/history");
    const data = await response.json();

    historyList.innerHTML = "";

    if (!data.history || !data.history.length) {
      historyList.innerHTML = `<p class="empty">No history yet.</p>`;
      return;
    }

    data.history.forEach((item) => {
      const row = document.createElement("div");
      row.className = "history-item";

      row.innerHTML = `
        <button onclick="loadHistorySet('${item.id}')">
          <strong>${escapeHTML(item.filename)}</strong>
          <span>${escapeHTML(item.mode)} • ${item.count} cards</span>
          <small>${escapeHTML(item.created_at)}</small>
        </button>
        <button class="danger small" onclick="deleteHistorySet('${item.id}')">Delete</button>
      `;

      historyList.appendChild(row);
    });
  } catch (error) {
    console.error(error);
  }
}

window.loadHistorySet = async function (id) {
  try {
    const response = await fetch(`/history/${id}`);
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    currentSetId = data.id;
    currentFilename = data.filename;
    currentFileMode = data.mode;
    flashcards = data.cards || [];

    quizCorrect = 0;
    quizWrong = 0;
    quizIndex = 0;
    quizAnswered = false;

    updateScoreBox();
    renderSetInfo();
    renderFlashcards();

    setStatus("Loaded from history.");
  } catch (error) {
    console.error(error);
  }
};

window.deleteHistorySet = async function (id) {
  if (!confirm("Delete this history item?")) return;

  await fetch(`/history/${id}`, {
    method: "DELETE",
  });

  if (currentSetId === id) {
    currentSetId = null;
  }

  await loadHistory();
};

refreshHistoryBtn.addEventListener("click", loadHistory);

loadHistory();
updateScoreBox();
renderFlashcards();
