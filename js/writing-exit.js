(() => {
  "use strict";
  let active = null;
  const warning = "Your answers and unfinished work will be deleted if you exit this task. Do you want to leave?";
  function clearActive() {
    if (!active) return;
    localStorage.removeItem("englisity-" + active.type + "-" + active.id + "-draft");
    const box = document.getElementById(active.type === "task1" ? "task1Draft" : "task2Draft");
    if (box) box.value = "";
    active = null;
  }
  document.addEventListener("click", event => {
    const target = event.target.closest("button, a");
    if (!target) return;
    if (target.matches("[data-open-task-detail]")) {
      active = { type: "task1", id: target.dataset.openTaskDetail };
      return;
    }
    if (target.matches("[data-open-task2-detail]")) {
      active = { type: "task2", id: target.dataset.openTask2Detail };
      return;
    }
    const isTaskBack = target.matches("[data-back-to-task-library], [data-back-to-task2-library]");
    const isNavigation = target.matches("a[href]") && active && target.getAttribute("href") !== "#";
    if (!active || (!isTaskBack && !isNavigation)) return;
    if (!confirm(warning)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    clearActive();
  }, true);
})();