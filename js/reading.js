
/* =========================================================
   IELTS ATLAS — READING
   Adjustable passage/question panels
   Independent scrolling and font-size controls
   Saved preferences, answer checking and explanations
   ========================================================= */

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
        explanation: "The passage describes Palladian features in the building, including its columns, pediments and harmonious proportions."
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
        explanation: "The passage says Palladio's design resembled the Banqueting House. Resemblance does not establish that he based his design on that building."
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
        explanation: "The passage says Andrea was apprenticed to a skilled stonemason."
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
        explanation: "The passage calls Inigo Jones Palladio's first foreign disciple."
      },
      {
        number: 11,
        type: "text",
        group: "SENTENCE COMPLETION",
        prompt: "What type of architecture heavily influenced Palladio's work?",
        answers: ["temple architecture"],
        answer: "temple architecture",
        explanation: "The passage explicitly identifies temple architecture as a major theme of Palladio's rural and urban buildings."
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
        explanation: "The passage says the exhibition's harmonious lines and proportions impart a feeling of benevolent calm."
      }
    ]
  }
];

const $ = (selector, root = document) => root.querySelector(selector);

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

const FONT_DEFAULTS = {
  passage: 15,
  questions: 13
};

const FONT_MIN = 11;
const FONT_MAX = 24;

const FONT_KEYS = {
  passage: "ieltsAtlasPassageFontSize",
  questions: "ieltsAtlasQuestionsFontSize"
};

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The page remains usable if browser storage is unavailable.
  }
}

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
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

/* =========================================================
   ADJUSTABLE WORKSPACE
   ========================================================= */

function addWorkspaceStyles() {
  if ($("#reading-workspace-styles")) return;

  const style = document.createElement("style");
  style.id = "reading-workspace-styles";

  style.textContent = `
    .reading-workspace-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin: 16px 0;
      padding: 12px 15px;
      border: 1px solid #e0e7e1;
      border-radius: 12px;
      background: #fff;
    }

    .workspace-control-group {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .workspace-label {
      margin-right: 4px;
      color: #536258;
      font-size: 12px;
      font-weight: 750;
    }

    .reading-workspace-controls button {
      min-width: 36px;
      min-height: 34px;
      padding: 6px 10px;
      border: 1px solid #dce5de;
      border-radius: 8px;
      background: #f7faf7;
      color: #246c40;
      cursor: pointer;
      font: inherit;
      font-size: 13px;
      font-weight: 750;
    }

    .reading-workspace-controls button:hover {
      border-color: #8ab99a;
      background: #edf7ef;
    }

    .reading-workspace-controls button:focus-visible {
      outline: 2px solid #368653;
      outline-offset: 2px;
    }

    #reset-reading-layout {
      margin-left: auto;
      color: #536258;
    }

    .test-layout {
      --passage-width: 60%;
      display: grid !important;
      grid-template-columns:
        minmax(0, var(--passage-width))
        10px
        minmax(0, calc(100% - var(--passage-width) - 10px)) !important;
      align-items: stretch !important;
      gap: 0 !important;
    }

    .test-layout > .passage-panel,
    .test-layout > .questions-panel {
      min-width: 0;
      max-width: 100%;
    }

    .test-layout > .passage-panel {
      position: relative;
      top: auto;
      height: calc(100vh - 220px);
      min-height: 400px;
      max-height: 850px;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: #c7d8cb transparent;
    }

    .test-layout > .questions-panel {
      position: relative;
      top: auto;
      height: calc(100vh - 220px);
      min-height: 400px;
      max-height: 850px;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: #c7d8cb transparent;
    }

    .test-layout > .passage-panel .passage-header {
      position: sticky;
      top: 0;
      z-index: 2;
    }

    .reading-resizer {
      position: relative;
      z-index: 5;
      width: 10px;
      min-width: 10px;
      align-self: stretch;
      cursor: col-resize;
      touch-action: none;
      user-select: none;
    }

    .reading-resizer::after {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 4px;
      width: 2px;
      border-radius: 4px;
      background: #dce5de;
      content: "";
      transition: background .15s, width .15s, left .15s;
    }

    .reading-resizer:hover::after,
    .reading-resizer:focus-visible::after,
    .reading-resizer.is-dragging::after {
      left: 2px;
      width: 5px;
      background: #368653;
    }

    .reading-resizer:focus-visible {
      outline: 2px solid #368653;
      outline-offset: -2px;
    }

    body.resizing-reading-panels {
      cursor: col-resize !important;
      user-select: none !important;
    }

    body.resizing-reading-panels * {
      cursor: col-resize !important;
      user-select: none !important;
    }

    .passage-content p {
      font-size: var(--reading-passage-font-size, 15px) !important;
    }

    .questions-panel .question-card legend,
    .questions-panel .question-prompt,
    .questions-panel .short-answer-label,
    .questions-panel .answer-option,
    .questions-panel .short-answer-input {
      font-size: var(--reading-question-font-size, 13px) !important;
    }

    .questions-panel .question-group-heading h3 {
      font-size: calc(var(--reading-question-font-size, 13px) + 3px);
    }

    .questions-panel .question-group-heading p {
      font-size: calc(var(--reading-question-font-size, 13px) - 1px);
    }

    .questions-panel .question-feedback {
      font-size: calc(var(--reading-question-font-size, 13px) - 1px);
    }

    @media (max-width: 760px) {
      .test-layout {
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 16px !important;
      }

      .reading-resizer {
        display: none;
      }

      .test-layout > .passage-panel,
      .test-layout > .questions-panel {
        height: auto;
        min-height: 0;
        max-height: none;
        overflow: visible;
      }

      .reading-workspace-controls {
        justify-content: flex-start;
      }

      #reset-reading-layout {
        margin-left: 0;
      }
    }

    @media (max-width: 480px) {
      .workspace-control-group {
        flex-wrap: wrap;
      }

      .workspace-label {
        font-size: 11px;
      }

      .reading-workspace-controls {
        padding: 10px;
        gap: 9px;
      }
    }
  `;

  document.head.appendChild(style);
}

function getSavedFontSize(type) {
  const saved = Number(storageGet(FONT_KEYS[type]));

  if (!Number.isFinite(saved) || saved < FONT_MIN || saved > FONT_MAX) {
    return FONT_DEFAULTS[type];
  }

  return saved;
}

function applyReadingFontSizes() {
  document.documentElement.style.setProperty(
    "--reading-passage-font-size",
    `${getSavedFontSize("passage")}px`
  );

  document.documentElement.style.setProperty(
    "--reading-question-font-size",
    `${getSavedFontSize("questions")}px`
  );

  const passageValue = $("#passage-font-value");
  const questionValue = $("#question-font-value");

  if (passageValue) {
    passageValue.textContent = `${getSavedFontSize("passage")} px`;
  }

  if (questionValue) {
    questionValue.textContent = `${getSavedFontSize("questions")} px`;
  }
}

function applyPassageWidth(value, save = false) {
  const layout = $(".test-layout");
  if (!layout) return;

  const width = Math.max(25, Math.min(75, Number(value) || 60));

  layout.style.setProperty("--passage-width", `${width}%`);

  const label = $("#passage-width-value");
  if (label) {
    label.textContent = `${Math.round(width)}%`;
  }

  if (save) {
    storageSet("ieltsAtlasPassageWidth", String(width));
  }
}

function changeFontSize(type, change) {
  const current = getSavedFontSize(type);
  const next = Math.max(FONT_MIN, Math.min(FONT_MAX, current + change));

  storageSet(FONT_KEYS[type], String(next));
  applyReadingFontSizes();
}

function createWorkspaceControls(layout) {
  let controls = $(".reading-workspace-controls");

  if (!controls) {
    controls = document.createElement("div");
    controls.className = "reading-workspace-controls";

    controls.innerHTML = `
      <div class="workspace-control-group">
        <span class="workspace-label">Passage</span>
        <button type="button" data-font="passage" data-step="-1" aria-label="Decrease passage text size">A−</button>
        <button type="button" data-font="passage" data-step="1" aria-label="Increase passage text size">A+</button>
        <span id="passage-font-value" class="workspace-label"></span>
      </div>

      <div class="workspace-control-group">
        <span class="workspace-label">Questions</span>
        <button type="button" data-font="questions" data-step="-1" aria-label="Decrease question text size">A−</button>
        <button type="button" data-font="questions" data-step="1" aria-label="Increase question text size">A+</button>
        <span id="question-font-value" class="workspace-label"></span>
      </div>

      <div class="workspace-control-group">
        <span class="workspace-label">Passage width</span>
        <span id="passage-width-value" class="workspace-label">60%</span>
      </div>

      <button type="button" id="reset-reading-layout">Reset layout</button>
    `;

    layout.parentNode.insertBefore(controls, layout);

    controls.querySelectorAll("[data-font]").forEach(button => {
      button.addEventListener("click", () => {
        changeFontSize(
          button.dataset.font,
          Number(button.dataset.step)
        );
      });
    });

    $("#reset-reading-layout", controls).addEventListener("click", () => {
      storageSet("ieltsAtlasPassageWidth", "60");

      Object.values(FONT_KEYS).forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignore unavailable storage.
        }
      });

      applyPassageWidth(60, true);
      applyReadingFontSizes();
    });
  }
}

function createReadingDivider(layout) {
  let divider = $(".reading-resizer", layout);

  if (divider) return divider;

  divider = document.createElement("div");
  divider.className = "reading-resizer";
  divider.setAttribute("role", "separator");
  divider.setAttribute("aria-label", "Resize passage and question panels");
  divider.setAttribute("aria-orientation", "vertical");
  divider.setAttribute("aria-valuemin", "25");
  divider.setAttribute("aria-valuemax", "75");
  divider.setAttribute("aria-valuenow", "60");
  divider.setAttribute("tabindex", "0");
  divider.title = "Drag to resize, or use the left and right arrow keys";

  const passagePanel = $(".passage-panel", layout);
  const questionsPanel = $(".questions-panel", layout);

  if (!passagePanel || !questionsPanel) return null;

  // Place the divider between the two existing panels.
  layout.insertBefore(divider, questionsPanel);

  let dragging = false;

  divider.addEventListener("pointerdown", event => {
    if (window.innerWidth <= 760) return;

    dragging = true;
    divider.classList.add("is-dragging");
    document.body.classList.add("resizing-reading-panels");

    try {
      divider.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture may be unavailable in some browsers.
    }

    event.preventDefault();
  });

  divider.addEventListener("pointermove", event => {
    if (!dragging) return;

    const rect = layout.getBoundingClientRect();
    if (!rect.width) return;

    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    const width = Math.max(25, Math.min(75, percent));

    applyPassageWidth(width);
    divider.setAttribute("aria-valuenow", String(Math.round(width)));
  });

  function stopDragging() {
    if (!dragging) return;

    dragging = false;
    divider.classList.remove("is-dragging");
    document.body.classList.remove("resizing-reading-panels");

    const current = parseFloat(
      getComputedStyle(layout).getPropertyValue("--passage-width")
    ) || 60;

    applyPassageWidth(current, true);
  }

  divider.addEventListener("pointerup", stopDragging);
  divider.addEventListener("pointercancel", stopDragging);
  divider.addEventListener("lostpointercapture", stopDragging);

  divider.addEventListener("keydown", event => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();

    const current = parseFloat(
      getComputedStyle(layout).getPropertyValue("--passage-width")
    ) || 60;

    const change = event.key === "ArrowRight" ? 5 : -5;
    const next = Math.max(25, Math.min(75, current + change));

    applyPassageWidth(next, true);
    divider.setAttribute("aria-valuenow", String(Math.round(next)));
  });

  return divider;
}

function setupReadingWorkspace() {
  addWorkspaceStyles();

  const layout = $(".test-layout");
  if (!layout) return;

  createWorkspaceControls(layout);
  createReadingDivider(layout);

  const savedWidth = Number(storageGet("ieltsAtlasPassageWidth"));
  applyPassageWidth(
    Number.isFinite(savedWidth) && savedWidth >= 25 && savedWidth <= 75
      ? savedWidth
      : 60
  );

  applyReadingFontSizes();
}

/* =========================================================
   TEST LIBRARY
   ========================================================= */

function renderLibrary() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = readingTests.filter(test => {
    const matchesFilter =
      activeFilter === "All" || test.category === activeFilter;

    const searchableText = [
      test.title,
      ...test.passage,
      ...test.questions.map(question => question.prompt)
    ].join(" ").toLowerCase();

    return matchesFilter && searchableText.includes(searchTerm);
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

  filtered.forEach(test => {
    const card = document.createElement("article");
    card.className = "reading-test-card";

    card.innerHTML = `
      <div class="test-card-top">
        <span class="test-tag">${escapeHTML(test.category)}</span>
        <span class="test-level">${escapeHTML(test.level)}</span>
      </div>
      <h3>${escapeHTML(test.title)}</h3>
      <p>${test.questions.length} questions · Reading practice</p>
      <button class="button button-primary open-test" type="button">
        Start practice <span aria-hidden="true">→</span>
      </button>`;

    $(".open-test", card).addEventListener("click", () => {
      openTest(test.id);
    });

    testList.appendChild(card);
  });
}

/* =========================================================
   OPEN AND RENDER A TEST
   ========================================================= */

function openTest(testId) {
  activeTest = readingTests.find(test => test.id === testId);
  if (!activeTest) return;

  checked = false;
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

  setupReadingWorkspace();

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
      questions: activeTest.questions.filter(q => q.type === "choice")
    },
    {
      title: "Questions 8–13",
      subtitle: "Choose NO MORE THAN THREE WORDS from the passage.",
      questions: activeTest.questions.filter(q => q.type === "text")
    }
  ];

  questionForm.innerHTML = groups.map(group => {
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

  questionForm.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", updateAnsweredCount);
    input.addEventListener("change", updateAnsweredCount);
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
          ${question.options.map(option => `
            <label class="answer-option">
              <input type="radio" name="q${number}" value="${escapeHTML(option)}">
              <span>${escapeHTML(option)}</span>
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

  const answered = activeTest.questions.filter(question => {
    return getUserAnswer(question).trim() !== "";
  }).length;

  let progress = $("#reading-progress-label");

  if (!progress) {
    progress = document.createElement("p");
    progress.id = "reading-progress-label";
    progress.className = "reading-progress-label";
    $("#test-instructions").insertAdjacentElement("afterend", progress);
  }

  progress.textContent =
    `${answered} of ${activeTest.questions.length} questions answered`;
}

function updateTimer() {
  if (!startedAt) return;

  const seconds = Math.floor((Date.now() - startedAt) / 1000);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  $("#timer").textContent = `${minutes}:${remainingSeconds}`;
}

/* =========================================================
   ANSWER CHECKING AND RESULTS
   ========================================================= */

function getUserAnswer(question) {
  if (question.type === "choice") {
    return questionForm.querySelector(
      `input[name="q${question.number}"]:checked`
    )?.value || "";
  }

  return questionForm.elements[`q${question.number}`]?.value?.trim() || "";
}

function isCorrect(question, userAnswer) {
  const actual = normaliseAnswer(userAnswer);

  if (question.type === "choice") {
    return actual === normaliseAnswer(question.answer);
  }

  return question.answers.some(answer =>
    normaliseAnswer(answer) === actual
  );
}

function checkAnswers() {
  if (!activeTest || checked) return;

  checked = true;
  clearInterval(timerInterval);

  const questions = activeTest.questions;

  const outcomes = questions.map(question => {
    const userAnswer = getUserAnswer(question);

    return {
      question,
      userAnswer,
      correct: isCorrect(question, userAnswer)
    };
  });

  const correctCount = outcomes.filter(item => item.correct).length;
  const unansweredCount =
    outcomes.filter(item => !item.userAnswer).length;
  const percentage =
    Math.round((correctCount / questions.length) * 100);

  outcomes.forEach(({ question, userAnswer, correct }) => {
    const card = $(`#question-${question.number}`);
    const feedback = $(".question-feedback", card);

    card.classList.remove("is-correct", "is-incorrect");
    card.classList.add(correct ? "is-correct" : "is-incorrect");

    feedback.hidden = false;
    feedback.className =
      `question-feedback ${correct ? "feedback-correct" : "feedback-incorrect"}`;

    feedback.innerHTML = correct
      ? `<span class="feedback-icon">✓</span> Correct`
      : `<span class="feedback-icon">✕</span> ${
          userAnswer
            ? `Your answer: <strong>${escapeHTML(userAnswer)}</strong>`
            : "Not answered"
        }`;
  });

  questionForm.querySelectorAll("input").forEach(input => {
    input.disabled = true;
  });

  $("#check-answers").disabled = true;
  $("#check-answers").textContent = "Answers checked";
  showExplanationsButton.hidden = false;

  const choiceOutcomes =
    outcomes.filter(item => item.question.type === "choice");
  const textOutcomes =
    outcomes.filter(item => item.question.type === "text");

  const choiceCorrect =
    choiceOutcomes.filter(item => item.correct).length;
  const textCorrect =
    textOutcomes.filter(item => item.correct).length;

  const strengths = [];
  const improvements = [];

  if (choiceCorrect >= 5) {
    strengths.push(
      "You handled most TRUE / FALSE / NOT GIVEN statements well."
    );
  } else if (choiceCorrect >= 3) {
    strengths.push("You identified some statement answers correctly.");
    improvements.push(
      "Practise distinguishing contradictions from information that the passage never mentions."
    );
  } else {
    improvements.push(
      "TRUE matches the text, FALSE contradicts it, and NOT GIVEN is not established by the text."
    );
  }

  if (textCorrect >= 4) {
    strengths.push(
      "Your sentence-completion answers were mostly accurate."
    );
  } else {
    improvements.push(
      "Locate the relevant sentence and copy only the necessary words. Check the three-word limit."
    );
  }

  if (unansweredCount > 0) {
    improvements.push(
      `You left ${unansweredCount} question${unansweredCount === 1 ? "" : "s"} blank. Try to answer every question.`
    );
  }

  if (correctCount === questions.length) {
    strengths.push("Excellent accuracy: every answer was correct.");
  }

  if (!improvements.length) {
    improvements.push(
      "Review the explanations and practise another passage to check that you can repeat this result."
    );
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
          <div class="results-score">
            ${correctCount}<span>/${questions.length}</span>
          </div>
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
        <div>
          <span>TRUE / FALSE / NOT GIVEN</span>
          <strong>${choiceCorrect}/${choiceOutcomes.length}</strong>
        </div>
        <div>
          <span>Sentence completion</span>
          <strong>${textCorrect}/${textOutcomes.length}</strong>
        </div>
        <div>
          <span>Time spent</span>
          <strong>${$("#timer").textContent}</strong>
        </div>
      </div>

      <div class="results-feedback-grid">
        <section>
          <h3><span class="feedback-icon">✓</span> What went well</h3>
          <ul>${strengths.map(item =>
            `<li>${escapeHTML(item)}</li>`
          ).join("")}</ul>
        </section>

        <section>
          <h3><span class="feedback-icon">↗</span> How to improve</h3>
          <ul>${improvements.map(item =>
            `<li>${escapeHTML(item)}</li>`
          ).join("")}</ul>
        </section>
      </div>

      <p class="results-note">
        This is feedback for a ${questions.length}-question practice, not an official IELTS band score.
      </p>
    </div>`;

  saveReadingResult(correctCount, questions.length, percentage);
  renderExplanations(outcomes);

  resultMessage.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function renderExplanations(outcomes) {
  explanationsBox.innerHTML = `
    <div class="explanations-heading">
      <span class="eyebrow">LEARN FROM YOUR ANSWERS</span>
      <h2>Answer explanations</h2>
      <p>Review each answer and understand why it is correct.</p>
    </div>

    ${outcomes.map(({ question, userAnswer, correct }) => `
      <article class="explanation-card ${correct ? "explanation-correct" : "explanation-incorrect"}">
        <div class="explanation-card-top">
          <span class="question-number">${question.number}</span>
          <span class="explanation-status">
            ${correct ? "Correct" : "Review this answer"}
          </span>
        </div>

        <h3>${escapeHTML(question.prompt)}</h3>

        <p class="explanation-your-answer">
          Your answer: <strong>${escapeHTML(userAnswer || "Not answered")}</strong>
        </p>

        <p class="explanation-correct-answer">
          Correct answer: <strong>${escapeHTML(question.answer)}</strong>
        </p>

        <p>${escapeHTML(question.explanation)}</p>
      </article>
    `).join("")}

    <button id="try-again" class="button button-primary" type="button">
      Try this passage again
    </button>`;

  $("#try-again").addEventListener("click", () => {
    openTest(activeTest.id);
  });
}

function saveReadingResult(score, total, percentage) {
  try {
    const key = "ieltsAtlasProgress";
    const previous = JSON.parse(localStorage.getItem(key) || "{}");

    const next = {
      ...previous,
      completedSessions:
        (Number(previous.completedSessions) || 0) + 1,
      lastReadingScore: score,
      lastReadingTotal: total,
      lastReadingPercentage: percentage
    };

    localStorage.setItem(key, JSON.stringify(next));
  } catch (error) {
    console.warn(
      "Reading progress could not be saved in this browser.",
      error
    );
  }
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

$("#check-answers").addEventListener("click", checkAnswers);

showExplanationsButton.addEventListener("click", () => {
  const willShow = explanationsBox.hidden;

  explanationsBox.hidden = !willShow;

  showExplanationsButton.textContent = willShow
    ? "Hide explanations"
    : "Show explanations";

  if (willShow) {
    explanationsBox.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
});

$("#back-to-library").addEventListener("click", () => {
  clearInterval(timerInterval);

  testScreen.hidden = true;
  library.hidden = false;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

searchInput.addEventListener("input", renderLibrary);

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter-button").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderLibrary();
  });
});

/* Initialise the library and workspace styling. */
addWorkspaceStyles();
renderLibrary();
/* =========================================================
   IELTS ATLAS — ADDITIONAL READING PASSAGES
   Passages 2 & 3 + Full Reading mode
   ========================================================= */

const extraReadingTests = [
  {
    id: "artists-liars",
    title: "Are Artists Liars?",
    category: "Passage 2",
    level: "Academic",
    passage: [
      `Shortly before his death, Marlon Brando was working on a series of instructional videos about acting, to be called "Lying for a Living". On the surviving footage, Brando can be seen dispensing advice on his craft to a group of Hollywood stars, including Leonardo Di Caprio and Sean Penn. Brando also recruited random people from the Los Angeles street and persuaded them to improvise. "If you can lie, you can act," Brando told Jod Kaftan, a writer for Rolling Stone. "Are you good at lying?" asked Kaftan. "Jesus," said Brando, "I'm fabulous at it."`,
      `Brando was not the first person to note that the line between an artist and a liar is a fine one. If art is a kind of lying, then lying is a form of art, albeit of a lower order. Lying and artistic storytelling spring from a common neurological root, exposed in psychiatric patients who suffer from a particular kind of impairment. Both liars and artists refuse to accept the tyranny of reality. Both carefully craft stories worthy of belief, a skill requiring intellectual sophistication, emotional sensitivity and physical self-control. Such parallels are hardly coincidental.`,
      `A case study published in 1985 by neurologist Antonio Damasio tells the story of a middle-aged woman with brain damage caused by strokes. She retained cognitive abilities, including coherent speech, but what she said was unpredictable. In psychiatry, she was "confabulating". Chronic confabulation is a rare type of memory problem. It is defined as the production of fabricated, distorted or misinterpreted memories without the conscious intention to deceive. Amnesiacs make errors of omission, but confabulators make errors of commission: they make things up. They are nearly always unaware of their condition and may earnestly give absurd explanations. Confabulators are not trying to deceive. They engage in what one neuropsychologist calls "honest lying". Uncertain and distressed by their uncertainty, they feel a compulsion to narrate: a need to shape, order and explain what they do not understand. They can be highly inventive verbally, but unlike writers, they have little or no control over their material.`,
      `The wider significance of this condition is what it tells us about ourselves. There is a river of verbal creativity in the normal human mind, from which artistic invention and lying are drawn. We are born storytellers, spinning narratives out of experience and imagination. This gives us the ability to conceive of alternative futures and different worlds and to understand our lives through the stories of others. But it can lead us into trouble when we try to persuade others that our inventions are real. Most of the time, we control which stories we tell and to whom. Yet people lie for all sorts of reasons, including the fact that confabulating can be dangerously fun.`,
      `During a famous libel case in 1996, Jonathan Aitken, a former cabinet minister, recounted a tale about the horrors he endured after a national newspaper tainted his name. The case involved claims made by the Guardian about Aitken's relationships with Saudi arms dealers, including meetings he allegedly held on a trip to Paris while a government minister. What amazed many in hindsight was the superfluity of the lies Aitken told during his testimony. His case collapsed in June 1997, when the defence found indisputable evidence about his Paris trip. Until then, his charm, fluency and theatrical sincerity looked as if they might bring him victory. The evidence showed that his daughter was not with him that day and that he had simply got into his car and driven off, with no vehicle in pursuit.`,
      `Unlike Aitken, actors, playwrights and novelists are not literally attempting to deceive us, because the rules are laid out in advance: come to the theatre, or open this book, and we will lie to you. Art provides a safe space into which our lies can be channelled into something socially useful. Given the universal compulsion to tell stories, art is a way to refine and enjoy insightful ones. But artistic lies differ from normal lies and from the "honest lying" of confabulators: they have meaning beyond their creator. The liar lies on behalf of himself; the artist tells lies on behalf of everyone. Novels express a curious truth disguised as something else. Art is a lie whose secret ingredient is truth.`
    ],
    questions: [
      {number:14,type:"choice",group:"MATCHING HEADINGS",prompt:"Paragraph A",options:["i","ii","iii","iv","v","vi","vii","viii"],answer:"vi",explanation:"Paragraph A introduces the fine line between acting and lying through Marlon Brando's advice."},
      {number:15,type:"choice",group:"MATCHING HEADINGS",prompt:"Paragraph B",options:["i","ii","iii","iv","v","vi","vii","viii"],answer:"ii",explanation:"Paragraph B explains the neurological similarities between liars and artists."},
      {number:16,type:"choice",group:"MATCHING HEADINGS",prompt:"Paragraph C",options:["i","ii","iii","iv","v","vi","vii","viii"],answer:"iv",explanation:"Paragraph C describes confabulation and gives examples of people who experience it."},
      {number:17,type:"choice",group:"MATCHING HEADINGS",prompt:"Paragraph D",options:["i","ii","iii","iv","v","vi","vii","viii"],answer:"viii",explanation:"Paragraph D discusses the creativity involved in storytelling and lying."},
      {number:18,type:"choice",group:"MATCHING HEADINGS",prompt:"Paragraph E",options:["i","ii","iii","iv","v","vi","vii","viii"],answer:"i",explanation:"Paragraph E illustrates unsuccessful deceit through Jonathan Aitken's failed case."},
      {number:19,type:"choice",group:"MATCHING HEADINGS",prompt:"Paragraph F",options:["i","ii","iii","iv","v","vi","vii","viii"],answer:"v",explanation:"Paragraph F explains how artists' stories differ from ordinary lies."},
      {number:20,type:"multi",group:"CHOOSE TWO LETTERS",prompt:"Which TWO statements about people suffering from confabulation are true?",options:["A","B","C","D","E"],answer:["B","E"],explanation:"They do not deliberately intend to deceive, and they invent stories to fill gaps in their understanding."},
      {number:21,type:"multi",group:"CHOOSE TWO LETTERS",prompt:"Which TWO statements about people suffering from confabulation are true?",options:["A","B","C","D","E"],answer:["B","E"],explanation:"They do not deliberately intend to deceive, and they invent stories to fill gaps in their understanding."},
      {number:22,type:"multi",group:"CHOOSE TWO LETTERS",prompt:"Which TWO statements about playwrights and novelists are true?",options:["A","B","C","D","E"],answer:["A","E"],explanation:"Art gives stories meaning beyond the creator, and audiences know that the stories are fictional."},
      {number:23,type:"multi",group:"CHOOSE TWO LETTERS",prompt:"Which TWO statements about playwrights and novelists are true?",options:["A","B","C","D","E"],answer:["A","E"],explanation:"Art gives stories meaning beyond the creator, and audiences know that the stories are fictional."},
      {number:24,type:"text",group:"SUMMARY COMPLETION",prompt:"A ______ accused Jonathan Aitken, a former cabinet minister, who was involved with Saudi arms dealers.",answers:["national newspaper"],answer:"national newspaper",explanation:"The passage refers to a national newspaper that reported on Aitken."},
      {number:25,type:"text",group:"SUMMARY COMPLETION",prompt:"The claims concerned Aitken's relationships with Saudi ______.",answers:["arms dealers"],answer:"arms dealers",explanation:"The passage explicitly mentions Saudi arms dealers."},
      {number:26,type:"text",group:"SUMMARY COMPLETION",prompt:"His charm and theatrical sincerity seemed likely to bring him ______.",answers:["victory"],answer:"victory",explanation:"The passage says his behaviour looked as if it might bring him victory."}
    ],
    headings: [
      "i — Unsuccessful deceit",
      "ii — Biological basis between liars and artists",
      "iii — How to lie in an artistic way",
      "iv — Confabulations and the exemplifiers",
      "v — The distinction between artists and common liars",
      "vi — The fine line between liars and artists",
      "vii — The definition of confabulation",
      "viii — Creativity when people lie"
    ]
  },
  {
    id: "amateur-naturalists",
    title: "Amateur Naturalists",
    category: "Passage 3",
    level: "Academic",
    passage: [
      `Tim Sparks examines old notebooks containing bee-keeping notes made between 1941 and 1969 by Walter Coates of Kilworth, Leicestershire. He adds the notes to a growing pile of local journals, birdwatchers' lists and gardening diaries. Around two centuries earlier, Robert Marsham began recording the life cycles of plants and animals on his estate. Successive generations of the Marsham family continued these observations for 211 years.`,
      `Today, such records are being used in ways their authors could not have expected. These data sets are valuable to ecologists studying the timing of biological events, or phenology. Combining historical records with climate data helps researchers discover how temperature changes affect the arrival of spring and improve predictions about climate change. Researchers are examining hundreds of years of observations made by amateur naturalists, and systematic projects have attracted considerable interest.`,
      `Sparks first discovered the many amateur observers when a retiring colleague gave him the Marsham records. He now follows leads from one historical data set to another. As news of his research spreads, people tell him about other records and more amateur observers come forward. One man from Kent sent him 30 years of kitchen calendars recording when his neighbour's magnolia tree flowered.`,
      `Other researchers have found data from unusual sources. Ecologist Rafe Sagarin studied records of a betting contest in Alaska in which participants guess the exact time a wooden tripod will fall through the surface of a thawing river. The competition has taken place annually on the Tenana River since 1917. Analysis showed that the thaw now arrives five days earlier than when the contest began.`,
      `These records show that many natural events now occur earlier across much of the northern hemisphere, including the opening of leaves, returning migratory birds and emerging butterflies. The data can also help predict future changes. Birdwatchers' counts combined with climate models suggest that increased droughts could halve breeding populations at ponds in the American Midwest. Researchers predict that North American waterfowl numbers could fall significantly as global warming increases.`,
      `Not all professionals are happy to use amateur data. Some scientists believe it contains too many problems because observers may define events differently. Researchers need precise information about what was observed and how carefully and systematically the observations were made. Measuring the beginning of autumn can be especially difficult because deciding when leaves change colour is subjective.`,
      `Most phenologists believe amateurs can make a valuable contribution, but professional researchers stress the need for quality control. Researchers assess the quality of records and use statistical techniques to account for uncertainty. Scientists are also developing standardised recording schemes. Well-designed studies could produce enough observations to reduce the effect of individual differences. Amateur records are relatively cheap to collect and provide broad geographical coverage over long periods and across many species.`,
      `Phenology can also help communicate the effects of climate change. The public understand these records and are more likely to accept them. The observations can illustrate consequences such as more rat infestations being reported in warmer years. Involving the public is also good for public relations and empowers people by showing them that their hobby can contribute to scientific research.`
    ],
    questions: [
      {number:27,type:"choice",group:"MATCHING INFORMATION",prompt:"The definition of phenology",options:["A","B","C","D","E","F","G","H"],answer:"B",explanation:"Paragraph B defines phenology as the study of the timing of biological events."},
      {number:28,type:"choice",group:"MATCHING INFORMATION",prompt:"How Sparks first became aware of amateur records",options:["A","B","C","D","E","F","G","H"],answer:"C",explanation:"Paragraph C explains that a retiring colleague gave Sparks the Marsham records."},
      {number:29,type:"choice",group:"MATCHING INFORMATION",prompt:"How people reacted to their involvement in data collection",options:["A","B","C","D","E","F","G","H"],answer:"H",explanation:"Paragraph H says people are thrilled that their hobby can contribute to science."},
      {number:30,type:"choice",group:"MATCHING INFORMATION",prompt:"The necessity to encourage amateur data collection",options:["A","B","C","D","E","F","G","H"],answer:"G",explanation:"Paragraph G explains why large numbers of observers and standardised recording schemes are needed."},
      {number:31,type:"choice",group:"MATCHING INFORMATION",prompt:"A description of using amateur records to make predictions",options:["A","B","C","D","E","F","G","H"],answer:"E",explanation:"Paragraph E uses historical observations and climate models to predict future effects."},
      {number:32,type:"choice",group:"MATCHING INFORMATION",prompt:"Records of a competition providing clues to climate change",options:["A","B","C","D","E","F","G","H"],answer:"D",explanation:"Paragraph D describes the Alaskan river-thaw betting contest."},
      {number:33,type:"choice",group:"MATCHING INFORMATION",prompt:"A very old record compiled by generations of amateur naturalists",options:["A","B","C","D","E","F","G","H"],answer:"A",explanation:"Paragraph A describes the Marsham family records maintained for 211 years."},
      {number:34,type:"text",group:"SENTENCE COMPLETION",prompt:"Walter Coates's records largely contain information about ______.",answers:["bee-keeping","beekeeping","bee keeping"],answer:"bee-keeping",explanation:"The notebooks contain bee-keeping notes."},
      {number:35,type:"text",group:"SENTENCE COMPLETION",prompt:"Robert Marsham is famous for recording the ______ of animals and plants on his land.",answers:["life cycles"],answer:"life cycles",explanation:"The passage states that Marsham recorded the life cycles of plants and animals."},
      {number:36,type:"text",group:"SENTENCE COMPLETION",prompt:"Global warming may cause North American waterfowl numbers to drop significantly due to increased ______.",answers:["droughts"],answer:"droughts",explanation:"The climate models predict increased droughts that could reduce breeding populations."},
      {number:37,type:"choice",group:"MULTIPLE CHOICE",prompt:"Why do many scientists discredit data collected by amateurs?",options:["A","B","C","D"],answer:"C",explanation:"Some scientists regard amateur data as unreliable because observations may not be systematic."},
      {number:38,type:"choice",group:"MULTIPLE CHOICE",prompt:"Mark Schwartz used the example of leaves to illustrate that",options:["A","B","C","D"],answer:"D",explanation:"Researchers need precise information about what observers actually recorded."},
      {number:39,type:"choice",group:"MULTIPLE CHOICE",prompt:"How do scientists suggest amateur data should be used?",options:["A","B","C","D"],answer:"A",explanation:"Researchers propose improved, standardised recording methods and statistical techniques."},
      {number:40,type:"choice",group:"MULTIPLE CHOICE",prompt:"What is the implication of phenology for ordinary people?",options:["A","B","C","D"],answer:"D",explanation:"Phenology helps the public understand and accept information about climate change."}
    ]
  }
];

readingTests.push(...extraReadingTests);

/* Add a Full Reading card and individual passage cards. */
const originalRenderLibrary = renderLibrary;

renderLibrary = function () {
  originalRenderLibrary();

  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) return;

  const fullCard = document.createElement("article");
  fullCard.className = "reading-test-card";
  fullCard.innerHTML = `
    <div class="test-card-top">
      <span class="test-tag">FULL READING</span>
      <span class="test-level">Academic</span>
    </div>
    <h3>Full IELTS Reading Test</h3>
    <p>3 passages · Questions 1–40 · 60 minutes</p>
    <button class="button button-primary" type="button">Start full test →</button>
  `;
  $(".button", fullCard).addEventListener("click", () => openTest("full-reading"));
  testList.prepend(fullCard);
};

/*
 * This extension provides the additional passages and their answer keys.
 * Your original Palladio practice remains available as before.
 */
renderLibrary();
