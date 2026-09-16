import "./presentation-modal.scss";

function openPresentationModal() {
  const overflow = document.querySelector("[data-presentation-modal__overflow]");
  const modal = document.querySelector("[data-presentation-modal]");
  if (!overflow || !modal) return;

  window.dispatchEvent(new Event("stop-scroll"));
  overflow.classList.remove("hidden");
  modal.scrollTop = 0;
}

function closePresentationModal() {
  const overflow = document.querySelector("[data-presentation-modal__overflow]");
  if (!overflow || overflow.classList.contains("hidden")) return;

  window.dispatchEvent(new Event("start-scroll"));
  overflow.classList.add("hidden");
}

function selectMessenger(button) {
  const group = button.closest("[data-presentation-messenger-group]");
  if (!group) return;

  const value = group.querySelector("[data-presentation-messenger-value]");
  const alreadyActive = button.classList.contains("is-active");

  group.querySelectorAll("[data-presentation-messenger]").forEach((btn) => {
    btn.classList.toggle("is-active", !alreadyActive && btn === button);
  });

  if (value) value.value = alreadyActive ? "" : button.getAttribute("data-presentation-messenger") || "";
}

document.body.addEventListener("click", (evt) => {
  const trigger = evt.target.closest("[data-presentation-trigger]");
  if (trigger) {
    evt.preventDefault();
    openPresentationModal();
    return;
  }

  const messengerBtn = evt.target.closest("[data-presentation-messenger]");
  if (messengerBtn) {
    selectMessenger(messengerBtn);
    return;
  }

  const overflow = document.querySelector("[data-presentation-modal__overflow]");
  const close = evt.target.closest("[data-presentation-modal-close]");
  if (close || evt.target === overflow) {
    closePresentationModal();
  }
});

document.addEventListener("keydown", (evt) => {
  if (evt.key === "Escape") closePresentationModal();
});
