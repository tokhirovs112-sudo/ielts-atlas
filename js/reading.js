
const readingTests = [
  {
    id: "sample-001",
    title: "How Urban Gardens Help Cities",
    category: "Passage 1",
    description: "An introductory passage about urban gardening.",
    instructions: "Read the passage and answer all five questions.",
    passage: [
      {
        heading: "Gardens in Unexpected Places",
        text: "In many cities, unused rooftops, small courtyards and empty plots are being transformed into gardens. These spaces allow residents to grow vegetables and herbs close to their homes. Although such gardens cannot replace large farms, they can provide fresh produce and make use of land that might otherwise remain empty."
      },
      {
        heading: "Benefits Beyond Food",
        text: "Urban gardens may also help neighbourhoods become more connected. Residents often share tools, exchange gardening advice and work together on common projects. Green spaces can offer a quiet place to relax, while plants may provide shelter and food for some insects and birds. However, successful gardens require regular care and access to suitable soil and water."
      },
      {
        heading: "Planning for the Future",
        text: "City planners increasingly consider gardening when designing public spaces. Some projects provide raised beds for people who cannot easily bend down, while others organise workshops for beginners. Long-term success depends on more than enthusiasm: organisers need clear responsibilities, reliable water supplies and a plan for maintaining the space when volunteers are unavailable."
      }
    ],
    questions: [
      {
        text: "According to the passage, what can urban gardens do with unused land?",
        options: [
          "Turn it into productive growing space",
          "Replace all large farms",
          "Build new apartment blocks",
          "Remove the need for city planning"
        ],
        answer: 0,
        explanation: "The first paragraph says unused spaces can be transformed into gardens for growing vegetables and herbs."
      },
      {
        text: "Which benefit of urban gardens is mentioned beyond producing food?",
        options: [
          "They guarantee lower food prices",
          "They help residents work together",
          "They eliminate traffic congestion",
          "They require no maintenance"
        ],
        answer: 1,
        explanation: "The second paragraph describes residents sharing tools, exchanging advice and working on common projects."
      },
      {
        text: "What do successful gardens need?",
        options: [
          "Only enthusiastic volunteers",
          "A location on every rooftop",
          "Regular care and suitable resources",
          "Complete protection from birds"
        ],
        answer: 2,
        explanation: "The passage specifically mentions regular care and access to suitable soil and water."
      },
      {
        text: "Why might raised beds be useful?",
        options: [
          "They make gardens require no water",
          "They help people who find bending difficult",
          "They prevent all insects from entering",
          "They allow gardens to replace farms"
        ],
        answer: 1,
        explanation: "The third paragraph says some projects provide raised beds for people who cannot easily bend down."
      },
      {
        text: "What is the main point of the final paragraph?",
        options: [
          "Gardening projects succeed without planning",
          "Only professional gardeners can help",
          "Long-term success requires organisation",
          "Cities should stop creating public spaces"
        ],
        answer: 2,
        explanation: "The final paragraph emphasises responsibilities, water supplies and maintenance plans."
      }
    ]
  }
];

let activeFilter = "All";
let currentTest = null;
let startTime = null;
let timerInterval = null;
let submitted = false;
let explanationsVisible = false;

const $ = (selector) => document.querySelector(selector);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function renderLibrary() {
  const search = $("#search-tests").value.trim().toLowerCase();

  const filtered = readingTests.filter(test => {
    const matchesCategory =
      activeFilter === "All" || test.category === activeFilter;

    const searchableText =
      `${test.title} ${test.description} ${test.category}`.toLowerCase();

    return matchesCategory && searchableText.includes(search);
  });

  $("#test-count").textContent =
    `${filtered.length} ${filtered.length === 1 ? "test" : "tests"}`;

  if (filtered.length === 0) {
    $("#test-list").innerHTML = `
      <div class="empty-state">
        <h3>No tests found yet</h3>
        <p>Try another search or category. More materials can be added here.</p>
      </div>`;
    return;
  }

  $("#test-list").innerHTML = filtered.map(test => `
    <article class="reading-test-card">
      <div class="test-card-top">
        <span class="test-tag">${escapeHTML(test.category)}</span>
        <span class="test-tag">${test.questions.length} questions</span>
      </div>
      <h3>${escapeHTML(test.title)}</h3>
      <p>${escapeHTML(test.description)}</p>
      <button class="button button-primary open-test"
        data-test-id="${escapeHTML(test.id)}">
        Open test →
      </button>
    </article>
  `).join("");
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();

  const update = () => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    $("#timer").textContent = formatTime(seconds);
  };

  update();
  timerInterval = setInterval(update, 1000);
}

function openTest(testId) {
  currentTest = readingTests.find(test => test.id === testId);

  if (!currentTest) return;

  submitted = false;
  explanationsVisible = false;

  $("#library").hidden = true;
  $("#test-screen").hidden = false;
  $("#test-category").textContent = currentTest.category.toUpperCase();
  $("#test-title").textContent = currentTest.title;
  $("#test-instructions").textContent = currentTest.instructions;

  $("#passage-text").innerHTML = currentTest.passage.map(section => `
    <h2>${escapeHTML(section.heading)}</h2>
    <p>${escapeHTML(section.text)}</p>
  `).join("");

  $("#question-form").innerHTML = currentTest.questions.map((question, index) => `
    <fieldset class="question-card">
      <legend>${index + 1}. ${escapeHTML(question.text)}</legend>
      ${question.options.map((option, optionIndex) => `
        <label class="answer-option">
          <input type="radio" name="question-${index}" value="${optionIndex}">
          <span>${escapeHTML(option)}</span>
        </label>
      `).join("")}
    </fieldset>
  `).join("");

  $("#result-message").textContent = "";
  $("#show-explanations").hidden = true;
  $("#explanations").hidden = true;
  $("#explanations").innerHTML = "";
  $("#check-answers").disabled = false;

  startTimer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function checkAnswers() {
  if (!currentTest || submitted) return;

  const form = $("#question-form");
  const formData = new FormData(form);
  const total = currentTest.questions.length;
  let correct = 0;

  currentTest.questions.forEach((question, index) => {
    const selected = formData.get(`question-${index}`);
    const isCorrect = selected !== null &&
      Number(selected) === question.answer;

    if (isCorrect) correct++;

    const fieldset = form.querySelectorAll(".question-card")[index];
    fieldset.classList.remove("answer-correct", "answer-incorrect");
    fieldset.classList.add(isCorrect ? "answer-correct" : "answer-incorrect");
  });

  submitted = true;
  clearInterval(timerInterval);

  $("#result-message").textContent =
    `Your result: ${correct} / ${total} correct. ` +
    `${total - correct} incorrect or unanswered.`;

  $("#check-answers").disabled = true;
  $("#show-explanations").hidden = false;

  try {
    const key = "ieltsAtlasProgress";
    const saved = JSON.parse(localStorage.getItem(key) || "{}");

    saved.completedSessions = (saved.completedSessions || 0) + 1;
    saved.readingResults = saved.readingResults || [];
    saved.readingResults.push({
      testId: currentTest.id,
      correct,
      total,
      completedAt: new Date().toISOString()
    });

    localStorage.setItem(key, JSON.stringify(saved));
  } catch (error) {
    console.warn("Could not save progress in this browser.", error);
  }
}

function toggleExplanations() {
  if (!currentTest || !submitted) return;

  explanationsVisible = !explanationsVisible;
  $("#explanations").hidden = !explanationsVisible;

  $("#show-explanations").textContent = explanationsVisible
    ? "Hide explanations"
    : "Show explanations";

  if (!explanationsVisible) return;

  $("#explanations").innerHTML = `
    <h3>Answer explanations</h3>
    ${currentTest.questions.map((question, index) => `
      <div class="explanation-item">
        <strong>Question ${index + 1}</strong>
        <p>Correct answer: ${escapeHTML(question.options[question.answer])}</p>
        <p>${escapeHTML(question.explanation)}</p>
      </div>
    `).join("")}
  `;
}

function returnToLibrary() {
  clearInterval(timerInterval);
  $("#test-screen").hidden = true;
  $("#library").hidden = false;
  currentTest = null;
  renderLibrary();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

$("#search-tests").addEventListener("input", renderLibrary);

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter-button").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderLibrary();
  });
});

$("#test-list").addEventListener("click", event => {
  const button = event.target.closest(".open-test");
  if (button) openTest(button.dataset.testId);
});

$("#check-answers").addEventListener("click", checkAnswers);
$("#show-explanations").addEventListener("click", toggleExplanations);
$("#back-to-library").addEventListener("click", returnToLibrary);

renderLibrary();
