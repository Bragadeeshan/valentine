// script.js ✅ FULL COPY/PASTE

const playArea = document.getElementById("playArea");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const subtitle = document.getElementById("subtitle");

const resetBtn = document.getElementById("resetBtn");
const celebrate = document.getElementById("celebrate");
const card = document.getElementById("card");
const restartBtn = document.getElementById("restartBtn");
const copyBtn = document.getElementById("copyBtn");

const confettiLayer = document.getElementById("confetti");
const heartsLayer = document.getElementById("hearts");

const soundToggle = document.getElementById("soundToggle");
const popAudio = document.getElementById("popAudio");
const yayAudio = document.getElementById("yayAudio");

let escapeCount = 0;
let lastMoveAt = 0;
let lastPointer = { x: 0, y: 0 };
let safeUntil = 0; // prevents immediate repeat triggers after teleport

const lines = [
  "Be honest… but choose wisely 😅",
  "Wait… why are you hovering ‘No’? 🤨",
  "AYO STOP 😭",
  "That button is shy 🙈",
  "Are you serious right now? 😐",
  "This is awkward already 😬",
  "You missed. Again. 😂",
  "No doesn’t feel safe 😳",
  "You really trying that hard huh?",
  "Okay but like… why though? 😩",
  "Just press Yes and let’s be happy 🥹",
  "This is getting personal now 😤",
  "Bro… it’s Valentine’s 😩💖",
  "You're testing my patience 😭",
  "That button has trust issues 🏃‍♂️💨",
  "It said NOPE.",
  "The No button is in survival mode 😭",
  "You vs The No Button — who wins?",
  "Plot twist: It keeps running.",
  "Why are you like this? 😂",
  "Are you scared of happiness?",
  "Yes is right there… glowing… waiting ✨",
  "This could’ve been over already 😭",
  "The Yes button is getting stronger 💪",
  "Last chance before I make Yes huge 😈",
  "Okay this is the final warning.",
  "Alright now you're just being mean 😩",
  "The No button filed for protection.",
  "It’s fighting for its life 😂",
  "Just press Yes and we both win 💘",
  "Fine. Keep trying. I dare you.",
  "Yes is inevitable.",
  "Resistance is futile 😌",
  "Okay okay YOU WIN… just press Yes.",
];


placeNoAtPercent(72, 58);
placeYesAtPercent(22, 58);

/* ---------- helpers ---------- */
function placeNoAtPercent(xPercent, yPercent) {
  noBtn.style.left = `${xPercent}%`;
  noBtn.style.top = `${yPercent}%`;
}
function placeYesAtPercent(xPercent, yPercent) {
  yesBtn.style.left = `${xPercent}%`;
  yesBtn.style.top = `${yPercent}%`;
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function randomInRange(min, max) { return Math.random() * (max - min) + min; }

function getCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
}

/* ---------- audio ---------- */
function unlockAudio() {
  if (!soundToggle.checked) return;

  popAudio.volume = 0.6;
  yayAudio.volume = 0.85;

  // Attempt to "unlock" with a user gesture
  popAudio.play().then(() => {
    popAudio.pause();
    popAudio.currentTime = 0;
  }).catch(() => {});
}

function playPop() {
  if (!soundToggle.checked) return;
  popAudio.currentTime = 0;
  popAudio.play().catch(() => {});
}

function playYay() {
  if (!soundToggle.checked) return;
  yayAudio.currentTime = 0;
  yayAudio.play().catch(() => {});
}

// Unlock audio on first interaction (browser policy)
document.addEventListener("pointerdown", unlockAudio, { once: true });

/* ---------- NO button movement (fixed "skips") ---------- */
function moveNoButton() {
  const now = Date.now();
  if (now - lastMoveAt < 140) return; // stronger throttle
  lastMoveAt = now;

  const areaRect = playArea.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();

  const pad = 16;
  const minX = pad;
  const maxX = areaRect.width - noRect.width - pad;
  const minY = pad;
  const maxY = areaRect.height - noRect.height - pad;

  let x = minX, y = minY;

  for (let i = 0; i < 20; i++) {
    x = randomInRange(minX, maxX);
    y = randomInRange(minY, maxY);

    // Proposed center in viewport coords
    const proposedCenter = {
      x: areaRect.left + x + noRect.width / 2,
      y: areaRect.top + y + noRect.height / 2,
    };

    // Keep away from pointer so it doesn't instantly retrigger
    const pointerDx = lastPointer.x - proposedCenter.x;
    const pointerDy = lastPointer.y - proposedCenter.y;
    const pointerDist = Math.sqrt(pointerDx * pointerDx + pointerDy * pointerDy);
    const minPointerDistance = 140;

    // Avoid overlapping Yes
    const proposed = {
      left: areaRect.left + x,
      right: areaRect.left + x + noRect.width,
      top: areaRect.top + y,
      bottom: areaRect.top + y + noRect.height,
    };

    const yesBox = {
      left: yesRect.left - 12,
      right: yesRect.right + 12,
      top: yesRect.top - 12,
      bottom: yesRect.bottom + 12,
    };

    const overlapYes =
      proposed.left < yesBox.right &&
      proposed.right > yesBox.left &&
      proposed.top < yesBox.bottom &&
      proposed.bottom > yesBox.top;

    if (!overlapYes && pointerDist > minPointerDistance) break;
  }

  const leftPct = (x / areaRect.width) * 100;
  const topPct = (y / areaRect.height) * 100;

  noBtn.style.left = `${clamp(leftPct, 0, 100)}%`;
  noBtn.style.top = `${clamp(topPct, 0, 100)}%`;

  // Ignore triggers briefly after teleport
  safeUntil = Date.now() + 220;

  escapeCount++;
  subtitle.textContent = lines[escapeCount % lines.length];


  // Grow YES for viral effect
  const scale = 1 + Math.min(escapeCount * 0.05, 0.6);
  yesBtn.style.transform = `translate(-50%, -50%) scale(${scale})`;

  playPop();
}

function handlePointerMove(e) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  lastPointer.x = e.clientX;
  lastPointer.y = e.clientY;

  if (Date.now() < safeUntil) return;

  const c = getCenter(noBtn);
  const dx = lastPointer.x - c.x;
  const dy = lastPointer.y - c.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const threshold = 95 + Math.min(escapeCount * 5, 60);
  if (dist < threshold) moveNoButton();
}

// Works for mouse + touch + stylus
document.addEventListener("pointermove", handlePointerMove);

// Mobile: if they try to tap it, it runs
noBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  moveNoButton();
});

// If cursor lands on it, run
noBtn.addEventListener("mouseenter", () => moveNoButton());

/* ---------- YES click => celebration ---------- */
yesBtn.addEventListener("click", () => {
  card.classList.add("hidden");
  celebrate.classList.remove("hidden");
  celebrate.classList.add("fade-in");

  playYay();
  launchConfetti(140);
});

/* ---------- Reset / Restart ---------- */
function resetAll() {
  escapeCount = 0;
  subtitle.textContent = lines[0];
  yesBtn.style.transform = "translate(-50%, -50%) scale(1)";
  placeYesAtPercent(22, 58);
  placeNoAtPercent(72, 58);
  clearConfetti();
}

resetBtn.addEventListener("click", () => resetAll());

restartBtn.addEventListener("click", () => {
  celebrate.classList.add("hidden");
  card.classList.remove("hidden");
  resetAll();
});

/* ---------- Copy link ---------- */
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copyBtn.textContent = "Copied ✅";
    setTimeout(() => (copyBtn.textContent = "Copy link"), 1200);
  } catch {
    copyBtn.textContent = "Copy failed 😅";
    setTimeout(() => (copyBtn.textContent = "Copy link"), 1200);
  }
});

/* ---------- Confetti (behind GIF) ---------- */
function clearConfetti() {
  confettiLayer.innerHTML = "";
}

function launchConfetti(count = 100) {
  clearConfetti();
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const vw = window.innerWidth;
  const colors = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899"];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    const left = Math.random() * vw;
    const w = randomInRange(6, 12);
    const h = randomInRange(10, 18);
    const duration = randomInRange(1.7, 3.3);
    const delay = randomInRange(0, 0.5);

    piece.style.left = `${left}px`;
    piece.style.width = `${w}px`;
    piece.style.height = `${h}px`;
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];

    confettiLayer.appendChild(piece);

    setTimeout(() => piece.remove(), (duration + delay) * 1000 + 200);
  }
}

/* ---------- Floating hearts background ---------- */
function spawnHearts() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const heart = document.createElement("div");
  heart.className = "heart";
  heart.textContent = Math.random() > 0.5 ? "💗" : "💖";

  const left = Math.random() * window.innerWidth;
  const size = randomInRange(14, 28);
  const dur = randomInRange(4.5, 8.5);
  const drift = `${randomInRange(-60, 60)}px`;

  heart.style.left = `${left}px`;
  heart.style.fontSize = `${size}px`;
  heart.style.animationDuration = `${dur}s`;
  heart.style.setProperty("--drift", drift);

  heartsLayer.appendChild(heart);
  setTimeout(() => heart.remove(), dur * 1000 + 200);
}

// Start hearts
setInterval(spawnHearts, 450);

/* ---------- Reduced motion fallback ---------- */
(function reducedMotionFallback() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReduced) return;

  noBtn.disabled = true;
  noBtn.style.opacity = "0.6";
  subtitle.textContent = "Reduced motion is on — ‘No’ is disabled 😄";
})();
