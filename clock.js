const themes = [
  {
    id: "cars",
    label: "Luxury Cars",
    file: "themes/cars.jpg"
  },
  {
    id: "luxury",
    label: "Luxury Villa",
    file: "themes/luxury.jpg"
  },
  {
    id: "space",
    label: "Space",
    file: "themes/space.jpg"
  },
  {
    id: "ocean",
    label: "Ocean",
    file: "themes/ocean.jpg"
  },
  {
    id: "nature",
    label: "Nature",
    file: "themes/nature.jpg"
  },
  {
    id: "faith",
    label: "Faith",
    file: "themes/faith.jpg"
  }
];

const clockScreen = document.getElementById("clockScreen");
const themeMenu = document.getElementById("themeMenu");
const themeGrid = document.getElementById("themeGrid");

const ticks = document.getElementById("ticks");

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");

let currentThemeIndex = 0;
let selectedThemeId = null;
let clockScale = 1;
let cursorTimer = null;
let isClockMode = false;

function createClockFace() {
  ticks.innerHTML = "";

  for (let i = 0; i < 60; i++) {
    const tick = document.createElement("div");
    tick.className = i % 5 === 0 ? "tick hour" : "tick";
    tick.style.transform = `translate(-50%, -50%) rotate(${i * 6}deg)`;
    ticks.appendChild(tick);
  }
}

function updateClock() {
  const now = new Date();

  const milliseconds = now.getMilliseconds();
  const seconds = now.getSeconds() + milliseconds / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6;
  const hourDeg = hours * 30;

  hourHand.style.transform = `rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
  secondHand.style.transform = `rotate(${secondDeg}deg)`;

  requestAnimationFrame(updateClock);
}

function setTemplateBackground() {
  clockScreen.style.backgroundImage = `url("themes/template.png")`;
}

function setTheme(themeId) {
  const theme = themes.find(item => item.id === themeId) || themes[0];

  clockScreen.style.backgroundImage = `url("${theme.file}")`;

  selectedThemeId = theme.id;
  currentThemeIndex = themes.findIndex(item => item.id === theme.id);
}

function selectTheme(themeId) {
  setTheme(themeId);
  hideMenu();

  history.pushState(
    { view: "clock", theme: themeId },
    "",
    "#clock"
  );
}

function nextTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  setTheme(themes[currentThemeIndex].id);
  hideMenu();

  history.replaceState(
    { view: "clock", theme: themes[currentThemeIndex].id },
    "",
    "#clock"
  );
}

function createThemeMenu() {
  themeGrid.innerHTML = "";

  themes.forEach(theme => {
    const button = document.createElement("button");
    button.className = "theme-card";
    button.type = "button";
    button.dataset.theme = theme.id;
    button.style.backgroundImage = `url("${theme.file}")`;

    const label = document.createElement("span");
    label.textContent = theme.label;

    button.appendChild(label);

    button.addEventListener("click", () => {
      selectTheme(theme.id);
    });

    themeGrid.appendChild(button);
  });
}

function showMenu() {
  isClockMode = false;
  setTemplateBackground();
  themeMenu.classList.remove("hidden");
  document.body.classList.remove("hide-cursor");
}

function hideMenu() {
  isClockMode = true;

  if (selectedThemeId) {
    setTheme(selectedThemeId);
  }

  themeMenu.classList.add("hidden");
  hideCursorSoon();
}

function toggleMenu() {
  if (themeMenu.classList.contains("hidden")) {
    showMenu();

    history.pushState(
      { view: "menu" },
      "",
      "#home"
    );
  } else {
    hideMenu();

    if (selectedThemeId) {
      history.pushState(
        { view: "clock", theme: selectedThemeId },
        "",
        "#clock"
      );
    }
  }
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen failed:", error);
  }
}

function setClockScale(newScale) {
  clockScale = Math.min(1.35, Math.max(0.65, newScale));

  const size = `min(${62 * clockScale}vw, ${62 * clockScale}vh)`;
  document.documentElement.style.setProperty("--clock-size", size);
}

function hideCursorSoon() {
  document.body.classList.remove("hide-cursor");

  if (cursorTimer) {
    clearTimeout(cursorTimer);
  }

  cursorTimer = setTimeout(() => {
    if (themeMenu.classList.contains("hidden")) {
      document.body.classList.add("hide-cursor");
    }
  }, 2200);
}

document.addEventListener("keydown", async event => {
  const key = event.key.toLowerCase();

  if (key === "m") {
    toggleMenu();
  }

  if (key === "f") {
    await toggleFullscreen();
  }

  if (key === "c") {
    nextTheme();
  }

  if (key === "+" || key === "=") {
    setClockScale(clockScale + 0.08);
  }

  if (key === "-" || key === "_") {
    setClockScale(clockScale - 0.08);
  }

  if (key === "escape") {
    if (!themeMenu.classList.contains("hidden")) {
      showMenu();

      history.replaceState(
        { view: "menu" },
        "",
        "#home"
      );
    }
  }
});

document.addEventListener("mousemove", hideCursorSoon);

document.addEventListener("dblclick", async () => {
  if (themeMenu.classList.contains("hidden")) {
    await toggleFullscreen();
  }
});

window.addEventListener("popstate", () => {
  showMenu();
});

/*
  START:
  - background = themes/template.png
  - menu is open
  - template is NOT selectable
  - after theme click: menu disappears and selected background remains
  - browser back button returns to home/menu like pressing M
*/

createClockFace();
createThemeMenu();
setTemplateBackground();
showMenu();

history.replaceState(
  { view: "menu" },
  "",
  "#home"
);

updateClock();