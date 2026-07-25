function paintButton(button, saved) {
  const icon = button.querySelector("i");
  if (!icon) return;
  icon.classList.toggle("fa-regular", !saved);
  icon.classList.toggle("fa-solid", saved);
}
// Call once per container after rendering cards that include buttons with
// data-plan (JSON-encoded plan object) and data-plan-id attributes.
export function wireSaveButtons(container, plansStorage) {
  if (!container || container._saveWired) return;
  container._saveWired = true;

  container.addEventListener("click", (e) => {
    const button = e.target.closest("[data-plan]");
    if (!button) return;

    const plan = JSON.parse(button.dataset.plan);
    const nowSaved = !plansStorage.isSaved(plan.id);

    if (nowSaved) {
      plansStorage.save(plan);
    } else {
      plansStorage.remove(plan.id);
    }

    container.querySelectorAll(`[data-plan-id="${plan.id}"]`).forEach((btn) => paintButton(btn, nowSaved));
  });
}
export function paintSavedStates(container, plansStorage) {
  if (!container) return;
  container.querySelectorAll("[data-plan-id]").forEach((btn) => {
    paintButton(btn, plansStorage.isSaved(btn.dataset.planId));
  });
}
