import "./partner-modal.scss";

function parseJSON(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function renderDiscounts(list, discounts) {
  list.innerHTML = "";

  discounts.forEach((discount) => {
    const item = document.createElement("li");
    item.className = "partner-modal__discount-item";

    const value = document.createElement("span");
    value.className = "partner-modal__discount-value";
    value.textContent = discount.value || "";

    const label = document.createElement("span");
    label.className = "partner-modal__discount-label";
    label.textContent = discount.label || "";

    item.append(value, label);
    list.appendChild(item);
  });
}

function renderAddress(row, valueEl, addresses) {
  if (!addresses.length) {
    row.hidden = true;
    return;
  }

  row.hidden = false;
  valueEl.innerHTML = "";

  addresses.forEach((address, index) => {
    if (index > 0) valueEl.append(document.createElement("br"));
    valueEl.append(document.createTextNode(address));
  });
}

function renderPhone(row, valueEl, phone) {
  if (!phone) {
    row.hidden = true;
    return;
  }

  row.hidden = false;
  valueEl.textContent = phone;
  valueEl.setAttribute("href", `tel:${phone.replace(/[^\d+]/g, "")}`);
}

// Reads its content purely from the clicked card's data-partner-* attributes,
// so a backend (e.g. a Laravel admin panel driving a `@foreach($partners as $partner)`
// loop, with discounts/addresses passed through as `@json($partner->discounts)`)
// only has to render those attributes on each card — no JS changes needed to
// add, edit or remove partners.
function fillPartnerModal(modal, card) {
  const logo = modal.querySelector("[data-partner-modal-logo]");
  const name = modal.querySelector("[data-partner-modal-name]");
  const description = modal.querySelector("[data-partner-modal-description]");
  const discountsList = modal.querySelector("[data-partner-modal-discounts]");
  const addressRow = modal.querySelector("[data-partner-modal-address-row]");
  const addressValue = modal.querySelector("[data-partner-modal-address]");
  const phoneRow = modal.querySelector("[data-partner-modal-phone-row]");
  const phoneValue = modal.querySelector("[data-partner-modal-phone]");

  const data = card.dataset;

  if (logo) {
    logo.src = data.partnerLogo || "";
    logo.alt = data.partnerName || "";
  }
  if (name) name.textContent = data.partnerName || "";
  if (description) description.textContent = data.partnerDescription || "";
  if (discountsList) renderDiscounts(discountsList, parseJSON(data.partnerDiscounts, []));

  const addresses = parseJSON(data.partnerAddresses, []);
  const phone = data.partnerPhone || "";

  if (addressRow && addressValue) renderAddress(addressRow, addressValue, addresses);
  if (phoneRow && phoneValue) renderPhone(phoneRow, phoneValue, phone);

  // The whole contacts panel is only worth showing when it actually has
  // something in it — partners without a known address/phone yet (not all
  // of them will, until the admin panel fills these in) just skip the block.
  const contactsPanel = modal.querySelector(".partner-modal__panel--contacts");
  if (contactsPanel) contactsPanel.classList.toggle("is-empty", !addresses.length && !phone);
}

function openPartnerModal(card) {
  const overflow = document.querySelector("[data-partner-modal__overflow]");
  const modal = document.querySelector("[data-partner-modal]");
  if (!overflow || !modal) return;

  fillPartnerModal(modal, card);

  window.dispatchEvent(new Event("stop-scroll"));
  overflow.classList.remove("hidden");
}

function closePartnerModal() {
  const overflow = document.querySelector("[data-partner-modal__overflow]");
  if (!overflow || overflow.classList.contains("hidden")) return;

  window.dispatchEvent(new Event("start-scroll"));
  overflow.classList.add("hidden");
}

document.body.addEventListener("click", (evt) => {
  const trigger = evt.target.closest("[data-partner-trigger]");
  if (trigger) {
    const card = trigger.closest("[data-partner-card]");
    if (card) openPartnerModal(card);
    return;
  }

  const overflow = document.querySelector("[data-partner-modal__overflow]");
  const close = evt.target.closest("[data-partner-modal-close]");
  if (close || evt.target === overflow) {
    closePartnerModal();
  }
});

document.addEventListener("keydown", (evt) => {
  if (evt.key === "Escape") closePartnerModal();
});
