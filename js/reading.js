
const readingTests = [
  {
    id: "palladio-exhibition",
    title: "A new exhibition celebrates Palladio's architecture 500 years on",
    category: "Passage 1",
    level: "Academic",
    instructions:
      "Questions 1–7: choose TRUE, FALSE or NOT GIVEN. Questions 8–13: complete each sentence using NO MORE THAN THREE WORDS from the passage.",
    passage: [
      `Vicenza is a pleasant, prosperous city in the Veneto, 60 km west of Venice. Its grand families settled and farmed the area from the 16th century. But its principal claim to fame is Andrea Palladio, who is such an influential architect that a neoclassical style is known as Palladian. The city is a permanent exhibition of some of his finest buildings, and as he was born in Padua, to be precise — 500 years ago, the International Centre for the Study of Palladio's Architecture has an excellent excuse for mounting la grande mostra, the big show.`,
      `The exhibition has the special advantage of being held in one of Palladio's buildings, Palazzo Barbaran da Porto. Its bold façade is a mixture of rustication and decoration set between two rows of elegant columns. On the second floor the pediments are alternately curved or pointed, a Palladian trademark. The harmonious proportions of the atrium at the entrance lead through to a dramatic interior of fine fireplaces and painted ceilings. Palladio's design is simple, clear and not over-crowded. The show has been organised on the same principles, according to Howard Burns, the architectural historian who co-curated it.`,
      `Palladio's father was a miller who settled in Vicenza, where the young Andrea was apprenticed to a skilled stonemason. How did a humble miller's son become a world renowned architect? The answer in the exhibition is that, as a young man, Palladio excelled at carving decorative stonework on columns, doorways and fireplaces. He was plainly intelligent, and lucky enough to come across a rich patron, Gian Giorgio Trissino, a landowner and scholar, who organised his education, taking him to Rome in the 1540s, where he studied the masterpieces of classical Roman architecture and the work of other influential architects of the time, such as Donato Bramante and Raphael.`,
      `Burns argues that social mobility was also important. Entrepreneurs, prosperous from agriculture in the Veneto, commissioned the promising local architect to design their country villas and their urban mansions. In Venice the aristocracy were anxious to co-opt talented artists, and Palladio was given the chance to design the buildings that have made him famous – the churches of San Giorgio Maggiore and the Redentore, both easy to admire because they can be seen from the city’s historical centre across a stretch of water.`,
      `He tried his hand at bridges – his unbuilt version of the Rialto Bridge was decorated with the large pediment and columns of a temple – and, after a fire at the Ducal Palace, he offered an alternative design which bears an uncanny resemblance to the Banqueting House in Whitehall in London. Since it was designed by Inigo Jones, Palladio’s first foreign disciple, this is not as surprising as it sounds.`,
      `Jones, who visited Italy in 1614, bought a trunk full of the master’s architectural drawings; they passed through the hands of the Dukes of Burlington and Devonshire before settling at the Royal Institute of British Architects in 1894. Many are now on display at Palazzo Barbaran. What they show is how Palladio drew on the buildings of ancient Rome as models. The major theme of both his rural and urban building was temple architecture, with a strong pointed pediment supported by columns and approached by wide steps.`,
      `Palladio’s work for rich landowners alienates unreconstructed critics on the Italian left, but among the papers in the show are designs for cheap housing in Venice. In the wider world, Palladio’s reputation has been nurtured by a text he wrote and illustrated, "Quattro Libri dell’Architettura". His influence spread to St Petersburg and to Charlottesville in Virginia, where Thomas Jefferson commissioned a Palladian villa he called Monticello.`,
      `Vicenza’s show contains detailed models of the major buildings and is leavened by portraits of Palladio’s teachers and clients by Titian, Veronese and Tintoretto; the paintings of his Venetian buildings are all by Canaletto, no less. This is an uncompromising exhibition; many of the drawings are small and faint, and there are no sideshows for children, but the impact of harmonious lines and satisfying proportions is to impart in a viewer a feeling of benevolent calm. Palladio is history’s most therapeutic architect.`,
      `“Palladio, 500 Anni: La Grande Mostra" is at Palazzo Barbaran da Porto, Vicenza, until January 6th 2009. The exhibition continues at the Royal Academy of Arts, London, from January 31st to April 13th, and travels afterwards to Barcelona and Madrid.`
    ],
    questions: [
      {
        number: 1,
        type: "choice",
        group: "TRUE / FALSE / NOT GIVEN",
        prompt: "The building where the exhibition is staged has been newly renovated.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "NOT GIVEN",
        explanation: "The passage describes the building's architecture, but it never says that the building has been newly renovated."
      },
      {
        number: 2,
        type: "choice",
        group: "TRUE / FALSE / NOT GIVEN",
        prompt: "Palazzo Barbaran da Porto typically represents Palladio's design.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "TRUE",
        explanation: "The passage describes Palladian trademarks in the building, including its columns, pediments and harmonious proportions."
      },
      {
        number: 3,
        type: "choice",
        group: "TRUE / FALSE / NOT GIVEN",
        prompt: "Palladio's father worked as an architect.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "FALSE",
        explanation: "The passage directly states that Palladio's father was a miller, not an architect."
      },
      {
        number: 4,
        type: "choice",
        group: "TRUE / FALSE / NOT GIVEN",
        prompt: "Palladio's family refused to pay for his architectural studies.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "NOT GIVEN",
        explanation: "The passage says Gian Giorgio Trissino organised Palladio's education. It does not say whether his family offered or refused financial support."
      },
      {
        number: 5,
        type: "choice",
        group: "TRUE / FALSE / NOT GIVEN",
        prompt: "Palladio's alternative design for the Ducal Palace in Venice was based on an English building.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "FALSE",
        explanation: "The passage says Palladio's design resembled the Banqueting House. It identifies Inigo Jones, Palladio's disciple, as the designer of that English building. Resemblance does not mean Palladio based his design on it."
      },
      {
        number: 6,
        type: "choice",
        group: "TRUE / FALSE / NOT GIVEN",
        prompt: "Palladio designed for both wealthy and poor people.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "TRUE",
        explanation: "He designed villas and mansions for prosperous landowners, and the exhibition also includes his designs for cheap housing in Venice."
      },
      {
        number: 7,
        type: "choice",
        group: "TRUE / FALSE / NOT GIVEN",
        prompt: "The exhibition includes paintings of people by famous artists.",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        answer: "TRUE",
        explanation: "The exhibition contains portraits of Palladio's teachers and clients by Titian, Veronese and Tintoretto."
      },
      {
        number: 8,
        type: "text",
        group: "SENTENCE COMPLETION",
        prompt: "What job was Palladio training for before he became an architect?",
        answers: ["a stonemason", "stonemason", "a skilled stonemason", "skilled stonemason"],
        answer: "a stonemason",
        explanation: "The passage says Andrea was apprenticed to a skilled stonemason. The required job is stonemason."
      },
      {
        number: 9,
        type: "text",
        group: "SENTENCE COMPLETION",
        prompt: "Who arranged Palladio's architectural studies?",
        answers: ["Gian Giorgio Trissino"],
        answer: "Gian Giorgio Trissino",
        explanation: "The passage identifies Gian Giorgio Trissino as the patron who organised Palladio's education."
      },
      {
        number: 10,
        type: "text",
        group: "SENTENCE COMPLETION",
        prompt: "Who was the first non-Italian architect influenced by Palladio?",
        answers: ["Inigo Jones"],
        answer: "Inigo Jones",
        explanation: "The passage calls Inigo Jones Palladio's first foreign disciple. 'Foreign' matches the question's idea of non-Italian."
      },
      {
        number: 11,
        type: "text",
        group: "SENTENCE COMPLETION",
        prompt: "What type of Ancient Roman buildings most heavily influenced Palladio's work?",
        answers: ["temple architecture"],
        answer: "temple architecture",
        explanation: "The passage explicitly says the major theme of Palladio's rural and urban buildings was temple architecture."
      },
      {
        number: 12,
        type: "text",
        group: "SENTENCE COMPLETION",
        prompt: "What did Palladio write that strengthened his reputation?",
        answers: ["Quattro Libri dell'Architettura", "Quattro Libri dell’Architettura"],
        answer: "Quattro Libri dell’Architettura",
        explanation: "The passage says his reputation was nurtured by the text he wrote and illustrated, titled Quattro Libri dell’Architettura."
      },
      {
        number: 13,
        type: "text",
        group: "SENTENCE COMPLETION",
        prompt: "In the writer's opinion, what feeling will visitors to the exhibition experience?",
        answers: ["benevolent calm"],
        answer: "benevolent calm",
        explanation: "The final description says the exhibition's harmonious lines and proportions impart a feeling of benevolent calm."
      }
    ]
  }
];

const $ = (selector) => document.querySelector(selector);

const library = $("#library");
const testScreen = $("#test-screen");
const testList = $("#test-list");
const testCount = $("#test-count");
const searchInput = $("#search-tests");
const questionForm = $("#question-form");
const passageText = $("#passage-text");
const resultMessage = $("#result-message");
const explanationsBox = $("#explanations");
const showExplanationsButton = $("#show-explanations");

let activeFilter = "All";
let activeTest = null;
let startedAt = 0;
let timerInterval = null;
let checked = false;
let savedAnswers = {};

function normaliseAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”"]/g, "")
    .replace(/[.,!?;:]/g, "")
    .replace(/\s+/g, " ");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function renderLibrary() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = readingTests.filter((test) => {
    const matchesFilter = activeFilter === "All" ||
      test.category === activeFilter;

    const matchesSearch =
      test.title.toLowerCase().includes(searchTerm) ||
      test.passage.join(" ").toLowerCase().includes(searchTerm);

    return matchesFilter && matchesSearch;
  });

  testCount.textContent =
    `${filtered.length} ${filtered.length === 1 ? "test" : "tests"}`;

  testList.innerHTML = "";

  if (filtered.length === 0) {
    testList.innerHTML = `
      <div class="empty-library">
        <h3>No tests found</h3>
        <p>Try another search or choose a different category.</p>
      </div>`;
    return;
  }

  filtered.forEach((test) => {
    const card = document.createElement("article");
    card.className = "reading-test-card";
    card.innerHTML = `
      <div class="test-card-top">
        <span class="test-tag">${escapeHTML(test.category)}</span>
        <span class="test-level">${escapeHTML(test.level)}</span>
      </div>
      <h3>${escapeHTML(test.title)}</h3>
      <p>${test.questions.length} questions · Authentic reading practice</p>
      <button class="button button-primary open-test" type="button">
        Start practice <span aria-hidden="true">→</span>
      </button>`;

    card.querySelector(".open-test").addEventListener("click", () => {
      openTest(test.id);
    });

    testList.appendChild(card);
  });
}

function openTest(testId) {
  activeTest = readingTests.find((test) => test.id === testId);
  if (!activeTest) return;

  checked = false;
  savedAnswers = {};
  clearInterval(timerInterval);

  library.hidden = true;
  testScreen.hidden = false;

  $("#test-category").textContent = activeTest.category.toUpperCase();
  $("#test-title").textContent = activeTest.title;
  $("#test-instructions").textContent = activeTest.instructions;

  passageText.innerHTML = `
    <div class="passage-header">
      <span class="eyebrow">READING PASSAGE</span>
      <span class="passage-question-count">${activeTest.questions.length} questions</span>
    </div>
    <div class="passage-content">
      ${activeTest.passage.map((paragraph, index) => `
        <p><span class="paragraph-number">${index + 1}</span>${escapeHTML(paragraph)}</p>
      `).join("")}
    </div>`;

  renderQuestions();

  resultMessage.innerHTML = "";
  resultMessage.className = "result-message";
  explanationsBox.innerHTML = "";
  explanationsBox.hidden = true;
  showExplanationsButton.hidden = true;
  showExplanationsButton.textContent = "Show explanations";

  $("#check-answers").disabled = false;
  $("#check-answers").textContent = "Check answers";

  startedAt = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestions() {
  const groups = [
    {
      title: "Questions 1–7",
      subtitle: "Do the statements agree with the passage?",
      questions: activeTest.questions.filter((q) => q.type === "choice")
    },
    {
      title: "Questions 8–13",
      subtitle: "Choose NO MORE THAN THREE WORDS from the passage.",
      questions: activeTest.questions.filter((q) => q.type === "text")
    }
  ];

  questionForm.innerHTML = groups.map((group) => {
    if (!group.questions.length) return "";

    return `
      <div class="question-group">
        <div class="question-group-heading">
          <h3>${group.title}</h3>
          <p>${group.subtitle}</p>
        </div>
        ${group.questions.map(renderQuestion).join("")}
      </div>`;
  }).join("");

  questionForm.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      if (checked) return;
      savedAnswers[input.name] = input.type === "radio"
        ? questionForm.querySelector(`input[name="${input.name}"]:checked`)?.value || ""
        : input.value;
      updateAnsweredCount();
    });

    input.addEventListener("change", () => {
      if (checked) return;
      savedAnswers[input.name] = input.type === "radio"
        ? questionForm.querySelector(`input[name="${input.name}"]:checked`)?.value || ""
        : input.value;
      updateAnsweredCount();
    });
  });

  updateAnsweredCount();
}

function renderQuestion(question) {
  const number = question.number;

  if (question.type === "choice") {
    return `
      <fieldset class="question-card" id="question-${number}">
        <legend>
          <span class="question-number">${number}</span>
          <span class="question-prompt">${escapeHTML(question.prompt)}</span>
        </legend>
        <div class="answer-options">
          ${question.options.map((option) => `
            <label class="answer-option">
              <input type="radio" name="q${number}" value="${option}">
              <span>${option}</span>
            </label>
          `).join("")}
        </div>
        <div class="question-feedback" hidden></div>
      </fieldset>`;
  }

  return `
    <div class="question-card short-answer-card" id="question-${number}">
      <label class="short-answer-label" for="q${number}">
        <span class="question-number">${number}</span>
        <span class="question-prompt">${escapeHTML(question.prompt)}</span>
      </label>
      <input
        class="short-answer-input"
        id="q${number}"
        name="q${number}"
        type="text"
        maxlength="100"
        placeholder="Type your answer..."
        autocomplete="off"
        spellcheck="false"
      >
      <div class="question-feedback" hidden></div>
    </div>`;
}

function updateAnsweredCount() {
  if (checked || !activeTest) return;

  const answered = activeTest.questions.filter((question) => {
    const field = questionForm.elements[`q${question.number}`];
    return field && String(field.value || "").trim() !== "";
  }).length;

  const countLabel = $("#test-instructions");
  if (countLabel) {
    countLabel.dataset.progress =
      `${answered} of ${activeTest.questions.length} answered`;
  }

  let progress = $("#reading-progress-label");
  if (!progress) {
    progress = document.createElement("p");
    progress.id = "reading-progress-label";
    progress.className = "reading-progress-label";
    $("#test-instructions").insertAdjacentElement("afterend", progress);
  }

  progress.textContent = `${answered} of ${activeTest.questions.length} questions answered`;
}

function updateTimer() {
  if (!startedAt) return;

  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  $("#timer").textContent = `${minutes}:${remainingSeconds}`;
}

function getUserAnswer(question) {
  const field = questionForm.elements[`q${question.number}`];

  if (question.type === "choice") {
    return questionForm.querySelector(
      `input[name="q${question.number}"]:checked`
    )?.value || "";
  }

  return field?.value?.trim() || "";
}

function isCorrect(question, userAnswer) {
  const actual = normaliseAnswer(userAnswer);

  if (question.type === "choice") {
    return actual === normaliseAnswer(question.answer);
  }

  return question.answers.some((answer) =>
    normaliseAnswer(answer) === actual
  );
}

function checkAnswers() {
  if (!activeTest || checked) return;

  checked = true;
  clearInterval(timerInterval);

  const questions = activeTest.questions;
  const outcomes = questions.map((question) => {
    const userAnswer = getUserAnswer(question);
    return {
      question,
      userAnswer,
      correct: isCorrect(question, userAnswer)
    };
  });

  const correctCount = outcomes.filter((item) => item.correct).length;
  const unansweredCount = outcomes.filter((item) => !item.userAnswer).length;
  const percentage = Math.round((correctCount / questions.length) * 100);

  outcomes.forEach(({ question, userAnswer, correct }) => {
    const card = $(`#question-${question.number}`);
    const feedback = card.querySelector(".question-feedback");

    card.classList.remove("is-correct", "is-incorrect");
    card.classList.add(correct ? "is-correct" : "is-incorrect");

    feedback.hidden = false;
    feedback.className = `question-feedback ${correct ? "feedback-correct" : "feedback-incorrect"}`;
    feedback.innerHTML = correct
      ? `<span class="feedback-icon">✓</span> Correct`
      : `<span class="feedback-icon">✕</span> ${
          userAnswer
            ? `Your answer: <strong>${escapeHTML(userAnswer)}</strong>`
            : "Not answered"
        }`;
  });

  questionForm.querySelectorAll("input").forEach((input) => {
    input.disabled = true;
  });

  $("#check-answers").disabled = true;
  $("#check-answers").textContent = "Answers checked";
  showExplanationsButton.hidden = false;

  const choiceOutcomes = outcomes.filter((item) => item.question.type === "choice");
  const textOutcomes = outcomes.filter((item) => item.question.type === "text");

  const choiceCorrect = choiceOutcomes.filter((item) => item.correct).length;
  const textCorrect = textOutcomes.filter((item) => item.correct).length;

  const strengths = [];
  const improvements = [];

  if (choiceCorrect >= 5) {
    strengths.push("You handled most TRUE / FALSE / NOT GIVEN statements well.");
  } else if (choiceCorrect >= 3) {
    strengths.push("You identified some statement answers correctly.");
    improvements.push("Practise separating information that contradicts the passage from information the passage never mentions.");
  } else {
    improvements.push("Focus on TRUE / FALSE / NOT GIVEN: TRUE matches the text, FALSE contradicts it, and NOT GIVEN is not established by the text.");
  }

  if (textCorrect >= 4) {
    strengths.push("Your sentence-completion answers were mostly accurate.");
  } else {
    improvements.push("For sentence completion, find the relevant sentence in the passage and copy only the words needed. Check the three-word limit.");
  }

  if (unansweredCount > 0) {
    improvements.push(`You left ${unansweredCount} question${unansweredCount === 1 ? "" : "s"} blank. Try to answer every question, even when you're unsure.`);
  }

  if (correctCount === questions.length) {
    strengths.push("Excellent accuracy: you answered every question correctly.");
  }

  if (!improvements.length) {
    improvements.push("Review the explanations anyway and practise another passage to make sure you can repeat this result.");
  }

  resultMessage.className = "result-message result-visible";
  resultMessage.innerHTML = `
    <div class="results-card">
      <div class="results-topline">
        <span class="eyebrow">YOUR RESULTS</span>
        <span class="results-complete">Practice completed</span>
      </div>
      <div class="results-score-row">
        <div>
          <div class="results-score">${correctCount}<span>/${questions.length}</span></div>
          <p class="results-score-caption">answers correct</p>
        </div>
        <div class="results-percentage">
          <strong>${percentage}%</strong>
          <span>accuracy</span>
        </div>
      </div>
      <div class="results-track">
        <span style="width: ${percentage}%"></span>
      </div>
      <div class="results-breakdown">
        <div><span>TRUE / FALSE / NOT GIVEN</span><strong>${choiceCorrect}/7</strong></div>
        <div><span>Sentence completion</span><strong>${textCorrect}/6</strong></div>
        <div><span>Time spent</span><strong>${$("#timer").textContent}</strong></div>
      </div>
      <div class="results-feedback-grid">
        <section>
          <h3><span class="feedback-icon">✓</span> What went well</h3>
          <ul>${strengths.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </section>
        <section>
          <h3><span class="feedback-icon">↗</span> How to improve</h3>
          <ul>${improvements.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
        </section>
      </div>
      <p class="results-note">This is feedback for this 13-question practice, not an official IELTS band score.</p>
    </div>`;

  saveReadingResult(correctCount, questions.length, percentage);
  renderExplanations(outcomes);
  resultMessage.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderExplanations(outcomes) {
  explanationsBox.innerHTML = `
    <div class="explanations-heading">
      <span class="eyebrow">LEARN FROM YOUR ANSWERS</span>
      <h2>Answer explanations</h2>
      <p>Review the evidence in the passage and understand why each answer is correct.</p>
    </div>
    ${outcomes.map(({ question, userAnswer, correct }) => `
      <article class="explanation-card ${correct ? "explanation-correct" : "explanation-incorrect"}">
        <div class="explanation-card-top">
          <span class="question-number">${question.number}</span>
          <span class="explanation-status">${correct ? "Correct" : "Review this answer"}</span>
        </div>
        <h3>${escapeHTML(question.prompt)}</h3>
        <p class="explanation-your-answer">Your answer: <strong>${escapeHTML(userAnswer || "Not answered")}</strong></p>
        <p class="explanation-correct-answer">Correct answer: <strong>${escapeHTML(question.answer)}</strong></p>
        <p>${escapeHTML(question.explanation)}</p>
      </article>
    `).join("")}
    <button id="try-again" class="button button-primary" type="button">Try this passage again</button>`;

  $("#try-again").addEventListener("click", () => openTest(activeTest.id));
}

function saveReadingResult(score, total, percentage) {
  try {
    const key = "ieltsAtlasProgress";
    const previous = JSON.parse(localStorage.getItem(key) || "{}");

    const next = {
      ...previous,
      completedSessions: (Number(previous.completedSessions) || 0) + 1,
      lastReadingScore: score,
      lastReadingTotal: total,
      lastReadingPercentage: percentage
    };

    localStorage.setItem(key, JSON.stringify(next));
  } catch (error) {
    console.warn("Reading progress could not be saved in this browser.", error);
  }
}

$("#check-answers").addEventListener("click", checkAnswers);

showExplanationsButton.addEventListener("click", () => {
  const willShow = explanationsBox.hidden;
  explanationsBox.hidden = !willShow;
  showExplanationsButton.textContent = willShow
    ? "Hide explanations"
    : "Show explanations";

  if (willShow) {
    explanationsBox.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

$("#back-to-library").addEventListener("click", () => {
  clearInterval(timerInterval);
  testScreen.hidden = true;
  library.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
});

searchInput.addEventListener("input", renderLibrary);

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter-button").forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    renderLibrary();
  });
});

renderLibrary();
