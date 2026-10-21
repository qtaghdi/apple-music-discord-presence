const form = document.querySelector("#settings-form");
const connectionState = document.querySelector("#connection-state");
const saveMessage = document.querySelector("#save-message");
const saveButton = form.querySelector("button[type='submit']");
const previewPanel = document.querySelector(".preview-panel");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const preview = {
  artwork: document.querySelector("#preview-artwork"),
  lineOne: document.querySelector("#preview-line-one"),
  lineTwo: document.querySelector("#preview-line-two"),
  progress: document.querySelector(".track-progress"),
  time: document.querySelector("#preview-time"),
  button: document.querySelector("#preview-button"),
};

function readForm() {
  const data = new FormData(form);
  return {
    showAlbum: data.has("showAlbum"),
    showArtwork: data.has("showArtwork"),
    showTimeRemaining: data.has("showTimeRemaining"),
    showButton: data.has("showButton"),
    showPaused: data.has("showPaused"),
    displayOrder: data.get("displayOrder"),
  };
}

function writeForm(settings) {
  for (const key of ["showAlbum", "showArtwork", "showTimeRemaining", "showButton", "showPaused"]) {
    form.elements.namedItem(key).checked = settings[key];
  }
  form.elements.namedItem("displayOrder").value = settings.displayOrder;
  updatePreview();
}

function updatePreview() {
  const settings = readForm();
  preview.artwork.classList.toggle("hidden", !settings.showArtwork);
  preview.progress.hidden = !settings.showTimeRemaining;
  preview.time.hidden = !settings.showTimeRemaining;
  preview.button.hidden = !settings.showButton;

  const artist = "Satellite Hearts";
  const album = "Neon Afterglow";
  preview.lineOne.textContent = settings.displayOrder === "album-artist" && settings.showAlbum ? album : artist;
  preview.lineTwo.textContent = settings.displayOrder === "album-artist" ? artist : album;
  preview.lineTwo.hidden = !settings.showAlbum;
}

function setMessage(message, type = "") {
  saveMessage.textContent = message;
  saveMessage.className = `save-message ${type}`.trim();
}

async function requestSettings(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Could not update settings.");
  return body;
}

form.addEventListener("change", () => {
  updatePreview();
  setMessage("Unsaved changes");
});

previewPanel.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches || window.innerWidth <= 900) return;
  const bounds = previewPanel.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  previewPanel.style.setProperty("--tilt-x", `${(-y * 2.4).toFixed(2)}deg`);
  previewPanel.style.setProperty("--tilt-y", `${(x * 3).toFixed(2)}deg`);
});

previewPanel.addEventListener("pointerleave", () => {
  previewPanel.style.removeProperty("--tilt-x");
  previewPanel.style.removeProperty("--tilt-y");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  saveButton.disabled = true;
  setMessage("Saving…");
  try {
    const settings = await requestSettings("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(readForm()),
    });
    writeForm(settings);
    setMessage("Saved. Your activity has been updated.", "success");
  } catch (error) {
    setMessage(error instanceof Error ? error.message : "Could not save settings.", "error");
  } finally {
    saveButton.disabled = false;
  }
});

async function load() {
  try {
    writeForm(await requestSettings("/api/settings"));
    connectionState.textContent = "Ready";
    connectionState.classList.add("ready");
  } catch (error) {
    connectionState.textContent = "Unavailable";
    connectionState.classList.add("error");
    setMessage(error instanceof Error ? error.message : "Could not load settings.", "error");
    saveButton.disabled = true;
  }
}

void load();
