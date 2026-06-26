const themes = [
  {
    id: "cars",
    label: "Luxury Cars"
  },
  {
    id: "luxury",
    label: "Luxury Villa"
  },
  {
    id: "space",
    label: "Space"
  },
  {
    id: "ocean",
    label: "Ocean"
  },
  {
    id: "nature",
    label: "Nature"
  },
  {
    id: "faith",
    label: "Faith"
  }
];

const clockScreen = document.getElementById("clockScreen");
const themeLabel = document.getElementById("themeLabel");
const themeMenu = document.getElementById("themeMenu");
const menuBtn = document.getElementById("menuBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const ticks = document.getElementById("ticks");
const numbers = document.getElementById("numbers");

const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const secondHand = document.getElementById("secondHand");
const digitalTime = document.getElementById("digitalTime");

let currentThemeIndex = 0;
let clockScale = 1;

function createClockFace() {
  ticks.innerHTML = "";
  numbers.innerHTML = "";

  for (let i = 0; i < 60; i++) {
    const tick = document.createElement("div");
    tick.className = i % 5 === 0 ? "tick hour" : "tick";
    tick.style.transform = `translate(-50%, -50%) rotate(${i * 6}deg)`;
    ticks.appendChild(tick);
  }

  const visibleNumbers = [
    { value: "12", angle: 0 },
    { value: "3", angle: 90 },
    { value: "6", angle: 180 },
    { value: "9", angle: 270 }
  ];

  visibleNumbers.forEach((item) => {
    const number = document.createElement("div");
    number.className = "number";
    number.textContent = item.value;

    const radius = 38;
    const rad = (item.angle - 90) * Math.PI / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    number.style.transform = `translate(calc(-50% + ${x}%), calc(-50% + ${y}%))`;
    numbers.appendChild(number);
  });
}

function updateClock() {
  const now = new Date();

  const ms = now.getMilliseconds();
  const seconds = now.getSeconds() + ms / 1000;
  const minutes = now.getMinutes() + seconds / 60;
  const hours = (now.getHours() % 12) + minutes / 60;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6;
  const hourDeg = hours * 30;

  hourHand.style.transform = `rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
  secondHand.style.transform = `rotate(${secondDeg}deg)`;

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  digitalTime.textContent = `${hh}:${mm}:${ss}`;

  requestAnimationFrame(updateClock);
}

function setTheme(themeId) {
  const theme = themes.find((item) => item.id === themeId) || themes[0];

  themes.forEach((item) => {
    clockScreen.classList.remove(`theme-${item.id}`);
  });

  clockScreen.classList.add(`theme-${theme.id}`);
  themeLabel.textContent = theme.label;

  currentThemeIndex = themes.findIndex((item) => item.id === theme.id);
  localStorage.setItem("dreamclock-theme", theme.id);
}

function nextTheme() {
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  setTheme(themes[currentThemeIndex].id);
}

function hideMenu() {
  themeMenu.classList.add("hidden");
}

function showMenu() {
  themeMenu.classList.remove("hidden");
}

function toggleMenu() {
  themeMenu.classList.toggle("hidden");
}

async function requestFullscreenMode() {
  const element = document.documentElement;

  try {
    if (!document.fullscreenElement) {
      await element.requestFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen request failed:", error);
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
    console.warn("Fullscreen toggle failed:", error);
  }
}

function setClockScale(newScale) {
  clockScale = Math.min(1.35, Math.max(0.7, newScale));
  const value = `min(${62 * clockScale}vw, ${62 * clockScale}vh)`;
  document.documentElement.style.setProperty("--clock-size", value);
  localStorage.setItem("dreamclock-scale", String(clockScale));
}

function loadSavedSettings() {
  const savedTheme = localStorage.getItem("dreamclock-theme");
  const savedScale = Number(localStorage.getItem("dreamclock-scale"));

  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme("cars");
  }

  if (!Number.isNaN(savedScale) && savedScale > 0) {
    setClockScale(savedScale);
  }
}

document.querySelectorAll(".theme-card").forEach((button) => {
  button.addEventListener("click", async () => {
    const themeId = button.dataset.theme;
    setTheme(themeId);
    hideMenu();

    await requestFullscreenMode();
  });
});

menuBtn.addEventListener("click", toggleMenu);
fullscreenBtn.addEventListener("click", toggleFullscreen);

document.addEventListener("keydown", async (event) => {
  const key = event.key.toLowerCase();

  if (key === "m") {
    toggleMenu();
  }

  if (key === "c") {
    nextTheme();
  }

  if (key === "f") {
    await toggleFullscreen();
  }

  if (key === "+" || key === "=") {
    setClockScale(clockScale + 0.08);
  }

  if (key === "-" || key === "_") {
    setClockScale(clockScale - 0.08);
  }

  if (key === "escape") {
    showMenu();
  }
});

createClockFace();
loadSavedSettings();
updateClock();
