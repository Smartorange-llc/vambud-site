import "./vacancy-modal.scss";

function parseJSON(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function renderParagraphs(container, paragraphs) {
  container.innerHTML = "";
  paragraphs.forEach((text) => {
    const p = document.createElement("p");
    p.className = "vacancy-modal__description-item";
    p.textContent = text;
    container.appendChild(p);
  });
}

function renderList(list, items) {
  list.innerHTML = "";
  items.forEach((text) => {
    const li = document.createElement("li");
    li.className = "vacancy-modal__list-item";

    const dot = document.createElement("span");
    dot.className = "vacancy-modal__dot";

    const label = document.createElement("span");
    label.textContent = text;

    li.append(dot, label);
    list.appendChild(li);
  });
}

function renderTaskGroups(container, groups) {
  container.innerHTML = "";

  groups.forEach((group) => {
    const wrap = document.createElement("div");
    wrap.className = "vacancy-modal__group";

    if (group.heading) {
      const heading = document.createElement("p");
      heading.className = "vacancy-modal__group-heading";
      heading.textContent = group.heading;
      wrap.appendChild(heading);
    }

    const list = document.createElement("ul");
    list.className = "vacancy-modal__list";
    renderList(list, group.items || []);
    wrap.appendChild(list);

    container.appendChild(wrap);
  });
}

// Reads its content purely from the clicked row's data-vacancy-* attributes
// (title/description/motivation/phone as plain strings, tasks/requirements/
// offers as JSON), so a backend (Laravel admin driving a `@foreach($vacancies
// as $vacancy)` loop with `@json($vacancy->tasks)` etc.) only has to render
// those attributes on each row — no JS changes needed to add, edit or remove
// vacancies.
function fillVacancyModal(modal, row) {
  const title = modal.querySelector("[data-vacancy-modal-title]");
  const description = modal.querySelector("[data-vacancy-modal-description]");
  const motivation = modal.querySelector("[data-vacancy-modal-motivation]");
  const phoneLink = modal.querySelector("[data-vacancy-modal-phone-link]");
  const phoneValue = modal.querySelector("[data-vacancy-modal-phone]");
  const tasks = modal.querySelector("[data-vacancy-modal-tasks]");
  const requirements = modal.querySelector("[data-vacancy-modal-requirements]");
  const offers = modal.querySelector("[data-vacancy-modal-offers]");
  const applyBtn = modal.querySelector("[data-vacancy-modal-apply]");

  const data = row.dataset;

  if (title) title.textContent = data.vacancyTitle || "";
  if (description) renderParagraphs(description, parseJSON(data.vacancyDescription, []));
  if (motivation) motivation.textContent = data.vacancyMotivation || "";
  if (phoneValue) phoneValue.textContent = data.vacancyPhone || "";
  if (phoneLink) phoneLink.setAttribute("href", `tel:${(data.vacancyPhone || "").replace(/[^\d+]/g, "")}`);
  if (tasks) renderTaskGroups(tasks, parseJSON(data.vacancyTasks, []));
  if (requirements) renderList(requirements, parseJSON(data.vacancyRequirements, []));
  if (offers) renderList(offers, parseJSON(data.vacancyOffers, []));
  // Read by header.js when this button is clicked, to tag the shared
  // call-us form submission with which vacancy the reply is about.
  if (applyBtn) applyBtn.dataset.callUsTheme = data.vacancyTitle ? `Вакансія: ${data.vacancyTitle}` : "";
}

function openVacancyModal(row) {
  const overflow = document.querySelector("[data-vacancy-modal__overflow]");
  const modal = document.querySelector("[data-vacancy-modal]");
  if (!overflow || !modal) return;

  fillVacancyModal(modal, row);

  window.dispatchEvent(new Event("stop-scroll"));
  overflow.classList.remove("hidden");
  // .modal-form.vacancy-modal itself no longer scrolls (see vacancy-modal.scss)
  // — .vacancy-modal__body scrolls on mobile/tablet, .main/.side scroll
  // independently at laptop, so each needs its own reset back to the top.
  modal.querySelectorAll(".vacancy-modal__body, .vacancy-modal__main, .vacancy-modal__side").forEach((el) => {
    el.scrollTop = 0;
  });
}

function closeVacancyModal() {
  const overflow = document.querySelector("[data-vacancy-modal__overflow]");
  if (!overflow || overflow.classList.contains("hidden")) return;

  window.dispatchEvent(new Event("start-scroll"));
  overflow.classList.add("hidden");
}

document.body.addEventListener("click", (evt) => {
  const trigger = evt.target.closest("[data-vacancy-trigger]");
  if (trigger) {
    const row = trigger.closest("[data-vacancy-card]");
    if (row) openVacancyModal(row);
    return;
  }

  const overflow = document.querySelector("[data-vacancy-modal__overflow]");
  const close = evt.target.closest("[data-vacancy-modal-close]");
  if (close || evt.target === overflow) {
    closeVacancyModal();
  }
});

document.addEventListener("keydown", (evt) => {
  if (evt.key === "Escape") closeVacancyModal();
});
