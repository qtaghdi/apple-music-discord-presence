const form = document.querySelector("#settings-form");
const connectionState = document.querySelector("#connection-state");
const saveMessage = document.querySelector("#save-message");
const saveButton = form.querySelector("button[type='submit']");

const preview = {
  artwork: document.querySelector("#preview-artwork"),
  lineOne: document.querySelector("#preview-line-one"),
  lineTwo: document.querySelector("#preview-line-two"),
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
