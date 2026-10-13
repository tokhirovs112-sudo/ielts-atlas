
const STORAGE_KEY = "ieltsAtlasProgress";

function getProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { completedSessions: 0 };
  } catch {
    return { completedSessions: 0 };
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function renderHomeProgress() {
  const counter = document.getElementById("completed-count");

  if (counter) {
    counter.textContent = getProgress().completedSessions || 0;
  }
}

document.addEventListener("DOMContentLoaded", renderHomeProgress);
