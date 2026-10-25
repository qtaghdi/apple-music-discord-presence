// Shared English/Korean UI dictionary. Keep site/i18n.js and settings/i18n.js in sync.
(() => {
  const messages = {
  "Skip to content": "본문으로 건너뛰기",
  "Primary navigation": "주 메뉴",
  "Apple Music Discord Presence home": "Apple Music Discord Presence 홈",
  "Features": "기능",
  "Setup": "설치 방법",
  "Download": "다운로드",
  "Your music,": "지금 듣는 음악,",
  "present.": "Discord에도.",
  "Show what you’re listening to on Apple Music in your Discord activity. It runs quietly and locally on your computer.": "Apple Music에서 듣는 음악을 Discord에 표시하세요. 내 컴퓨터에서 조용히 작동합니다.",
  "Download for": "다운로드",
  "Star on GitHub": "GitHub에서 스타 주기",
  "Free & open source": "무료 · 오픈 소스",
  "· No Node.js required": "· Node.js 설치 불필요",
  "{version} available": "{version} 다운로드 가능",
  "Example Discord profile showing an Apple Music track": "Apple Music 재생 정보가 표시된 Discord 프로필 예시",
  "Abstract blue, lavender, and pink album artwork": "파랑·보라·분홍색 추상 앨범 커버",
  "LISTENING TO APPLE MUSIC": "Apple Music 듣는 중",
  "Product highlights": "주요 특징",
  "runtime packages": "추가 런타임 패키지",
  "Local": "로컬",
  "metadata bridge": "음악 정보 연결",
  "Auto": "자동",
  "Discord reconnect": "Discord 재연결",
  "Built to stay in sync": "음악과 함께, 언제나",
  "where you are.": "어디서나 함께.",
  "Apple Music flowing through a local bridge to Discord": "Apple Music의 음악 정보가 로컬 연결을 거쳐 Discord로 전달되는 모습",
  "Local bridge": "로컬 연결",
  "Live track changes": "곡이 바뀌면 바로 반영",
  "Titles, artists, albums, play state, and seeks update without restarting the app.": "제목·아티스트·앨범·재생 상태·재생 위치가 앱 재시작 없이 반영됩니다.",
  "Accurate playback progress": "정확한 재생 진행률",
  "The progress bar stays aligned with the actual player position.": "실제 재생 위치에 맞춰 재생바가 움직입니다.",
  "Display options": "원하는 정보만 표시",
  "Choose whether to show album details, artwork, playback progress, pause state, and the Apple Music button.": "앨범명·커버·재생바·일시정지 중 표시·Apple Music 버튼을 선택할 수 있습니다.",
  "Automatic reconnection": "끊겨도 자동 재연결",
  "If Discord restarts, the app reconnects and restores your activity automatically.": "Discord를 다시 켜면 자동으로 연결하고 재생 정보를 복원합니다.",
  "Native where it counts": "내 컴퓨터에 맞춘 연결",
  "Made for your desktop.": "Mac에서도, Windows에서도.",
  "Available now": "지금 사용 가능",
  "A small Swift helper reads Music directly through ScriptingBridge. It does not use JXA, Deno, or an intermediary server.": "Music 앱에서 현재 재생 정보를 직접 읽습니다. 중계 서버 없이 내 Mac에서 작동합니다.",
  "Uses the Windows system media session exposed by Apple Music and connects to Discord through native named pipes.": "Windows의 Apple Music 재생 정보를 읽어 같은 컴퓨터의 Discord에 직접 연결합니다.",
  "Download Apple Silicon ZIP": "Apple Silicon용 ZIP 다운로드",
  "Download Windows ZIP": "Windows용 ZIP 다운로드",
  "Three-minute setup": "3분이면 준비 완료",
  "Download. Connect. Listen.": "설치하고, 음악을 틀어보세요.",
  "Download your ZIP": "내 운영체제에 맞게 다운로드",
  "Choose macOS or Windows. The runtime is already included.": "macOS 또는 Windows용 ZIP을 받으세요. 실행에 필요한 런타임은 포함되어 있습니다.",
  "Install and allow access": "설치하고 권한 허용",
  "The shared Discord app is ready to use. Allow Music access when macOS asks, then press play.": "공용 Discord 앱이 미리 연결되어 있습니다. macOS에서 Music 접근을 요청하면 허용해 주세요.",
  "Press play": "음악 재생",
  "Keep Apple Music and desktop Discord open. Open Settings from the macOS menu bar or Windows tray icon.": "Apple Music과 Discord 데스크톱 앱을 켜세요. 설정은 Mac 메뉴 막대 또는 Windows 트레이에서 열 수 있습니다.",
  "Your listening stays yours.": "내 음악 정보는 소중하니까.",
  "Track details go only to Discord and, when artwork is enabled, Apple's public catalog search. There are no analytics or relay servers.": "음악 정보는 Discord와, 커버 검색이 켜져 있을 때 Apple의 공개 검색 API에만 전달됩니다. 분석 도구와 중계 서버는 없습니다.",
  "Apple Music and Discord": "Apple Music과 Discord",
  "Let Discord hear": "지금 듣는 음악을",
  "what you hear.": "Discord에서도.",
  "Free, open source, and local-first.": "무료 · 오픈 소스 · 내 컴퓨터에서 작동",
  "Download for macOS": "macOS용 다운로드",
  "Download for Windows": "Windows용 다운로드",
  "Release notes & all downloads": "업데이트 내역 · 전체 다운로드",
  "Independent open-source software. Not affiliated with Apple or Discord.": "독립 오픈 소스 프로젝트입니다. Apple 및 Discord와 제휴하지 않습니다.",
  "AM Presence Settings": "AM Presence 설정",
  "AM Presence settings": "AM Presence 설정",
  "Local settings": "이 컴퓨터의 설정",
  "Make it feel like yours.": "내 취향대로 설정하세요.",
  "Choose what appears in your Discord activity. Everything stays on this computer.": "Discord에 표시할 정보를 선택하세요. 설정은 이 컴퓨터에만 저장됩니다.",
  "Activity details": "활동 표시 설정",
  "Connecting": "연결 중",
  "Ready": "준비 완료",
  "Unavailable": "연결할 수 없음",
  "Album name": "앨범명",
  "Show the album under the artist.": "아티스트와 함께 앨범명을 표시합니다.",
  "Album artwork": "앨범 커버",
  "Use artwork from Apple’s public catalog.": "Apple의 공개 카탈로그에서 커버를 찾습니다.",
  "Playback progress": "재생바",
  "Show the current position and full track length.": "현재 재생 위치와 곡 전체 길이를 표시합니다.",
  "Open in Apple Music": "Apple Music으로 이동",
  "Add a button when a catalog match is available.": "곡 링크를 찾으면 이동 버튼을 추가합니다. 본인 프로필에서는 버튼이 보이지 않습니다.",
  "Show while paused": "일시정지 중에도 표시",
  "Keep the activity visible when music is paused.": "켜면 일시정지해도 ‘듣는 중’ 활동이 남습니다. 멈췄을 때 숨기려면 꺼두세요.",
  "Detail order": "정보 표시 순서",
  "Artist, then album": "아티스트 → 앨범",
  "Album, then artist": "앨범 → 아티스트",
  "Changes update your activity right away.": "저장하면 Discord 활동에 바로 반영됩니다.",
  "Save changes": "변경 사항 저장",
  "Discord preview": "Discord 미리보기",
  "Live preview": "설정 미리보기",
  "Listen on Apple Music": "Apple Music으로 이동",
  "Preview track details are examples. Your activity uses the song currently playing.": "미리보기의 곡 정보는 예시입니다. 실제 활동에는 현재 듣는 음악이 표시됩니다.",
  "Enjoying AM Presence?": "AM Presence가 마음에 드시나요?",
  "Star on GitHub ↗": "GitHub에서 스타 주기 ↗",
  "Unsaved changes": "저장하지 않은 변경 사항이 있습니다.",
  "Saving…": "저장 중…",
  "Saved. Your activity has been updated.": "저장했습니다. Discord 활동에 반영되었습니다.",
  "Could not update settings.": "설정을 변경하지 못했습니다.",
  "Could not save settings.": "설정을 저장하지 못했습니다.",
  "Could not load settings.": "설정을 불러오지 못했습니다.",
  "Failed to fetch": "앱에 연결할 수 없습니다. 앱이 실행 중인지 확인해 주세요.",
  "Language": "언어",
  "Show what you're playing in Apple Music as rich, accurate Discord presence on macOS and Windows.": "macOS와 Windows에서 Apple Music의 곡 정보·앨범 커버·재생바를 Discord에 표시하세요.",
  "Show your current Apple Music track on Discord. Available for macOS and Windows.": "Apple Music에서 듣는 음악을 Discord에 표시하세요. macOS와 Windows를 지원합니다.",
  "Actual Discord activity with Apple Music artwork and playback progress": "앨범 커버와 재생바가 표시된 실제 Discord 활동 화면"
};
  function chooseLanguage(query, saved, languages = []) {
    for (const value of [query, saved]) if (value === "ko" || value === "en") return value;
    for (const locale of languages) {
      const base = String(locale).toLowerCase().split("-")[0];
      if (base === "ko" || base === "en") return base;
    }
    return "en";
  }
  let language = "en";
  function t(message, values = {}) {
    const template = language === "ko" ? (messages[message] ?? message) : message;
    return template.replace(/\{(\w+)\}/g, (match, key) => String(values[key] ?? match));
  }
  const api = { messages: Object.freeze(messages), chooseLanguage, t, get language() { return language; }, setLanguage };
  window.AMDPI18n = api;
  const originals = new WeakMap();
  const attributes = new WeakMap();
  function apply() {
    document.documentElement.lang = language;
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest("script, style, [data-i18n-dynamic], .language-select")) continue;
      if (!originals.has(node)) originals.set(node, node.parentElement?.hasAttribute("data-i18n-source") ? node.nodeValue.replace(node.nodeValue.trim(), node.parentElement.getAttribute("data-i18n-source")) : node.nodeValue);
      const original = originals.get(node);
      const key = original.trim();
      if (key && messages[key]) node.nodeValue = original.replace(key, t(key));
    }
    document.querySelectorAll("[aria-label], [alt], meta[name='description'], meta[property='og:description'], meta[property='og:image:alt']").forEach((element) => {
      if (!attributes.has(element)) attributes.set(element, {});
      const initial = attributes.get(element);
      for (const attr of ["aria-label", "alt", "content"]) {
        if (!element.hasAttribute(attr)) continue;
        initial[attr] ??= element.getAttribute(`data-i18n-original-${attr}`) ?? element.getAttribute(attr);
        if (messages[initial[attr]]) element.setAttribute(attr, t(initial[attr]));
      }
    });
    document.querySelectorAll(".language-select").forEach((select) => { select.value = language; });
    document.dispatchEvent(new CustomEvent("amdp-language-change"));
  }
  function setLanguage(value) {
    if (value !== "ko" && value !== "en") return;
    language = value;
    try { localStorage.setItem("amdp.language", language); } catch {}
    try { const url = new URL(location.href); url.searchParams.set("lang", language); history.replaceState(null, "", url); } catch {}
    if (typeof document !== "undefined") apply();
  }
  if (typeof document !== "undefined") {
    let saved;
    try { saved = localStorage.getItem("amdp.language"); } catch {}
    language = chooseLanguage(new URLSearchParams(location.search).get("lang") ?? (document.documentElement.lang === "ko" ? "ko" : null), saved, navigator.languages ?? [navigator.language]);
    document.querySelectorAll(".language-select").forEach((select) => select.addEventListener("change", () => setLanguage(select.value)));
    apply();
  }
})();
