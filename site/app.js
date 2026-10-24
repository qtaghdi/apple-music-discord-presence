const i18n = window.AMDPI18n;
let releaseTag;
function updateReleaseLabel() { document.querySelector("#release-version").textContent = releaseTag ? i18n.t("{version} available", { version: releaseTag }) : i18n.t("Free & open source"); }
updateReleaseLabel();
document.addEventListener("amdp-language-change", updateReleaseLabel);
const downloads = {
  mac: "https://github.com/qtaghdi/apple-music-discord-presence/releases/latest/download/apple-music-discord-presence-macos-arm64.zip",
  windows: "https://github.com/qtaghdi/apple-music-discord-presence/releases/latest/download/apple-music-discord-presence-windows-x64.zip",
};

const isWindows = /Windows/i.test(navigator.userAgent);
const platformButton = document.querySelector(".platform-download");
const platformLabel = document.querySelector(".platform-label");
if (isWindows) {
  platformButton.href = downloads.windows;
  platformLabel.textContent = "Windows";
}

fetch("https://api.github.com/repos/qtaghdi/apple-music-discord-presence/releases/latest", {
  headers: { Accept: "application/vnd.github+json" },
})
  .then((response) => response.ok ? response.json() : Promise.reject())
  .then((release) => {
    releaseTag = release.tag_name;
    updateReleaseLabel();
  })
  .catch(() => {});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const animatedSections = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-active");
      animatedSections.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll("[data-animate]").forEach((element) => animatedSections.observe(element));
