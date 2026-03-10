const LEVELS = [
  { name: "Messy Living Room", image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1800&q=80", baseTime: 95, objects: [
    { name: "Lamp", x: 18, y: 27, radius: 4.8 }, { name: "Plant", x: 80, y: 42, radius: 5 }, { name: "Pillow", x: 36, y: 61, radius: 5.2 }, { name: "Book", x: 57, y: 70, radius: 5 }, { name: "Mug", x: 49, y: 63, radius: 4.8 }, { name: "Remote", x: 44, y: 68, radius: 4.5 }
  ] },
  { name: "Office Desk", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80", baseTime: 85, objects: [
    { name: "Keyboard", x: 53, y: 75, radius: 5.5 }, { name: "Phone", x: 32, y: 67, radius: 5 }, { name: "Notebook", x: 66, y: 62, radius: 5 }, { name: "Coffee Cup", x: 76, y: 48, radius: 5 }, { name: "Pen", x: 61, y: 70, radius: 4.6 }, { name: "Headphones", x: 22, y: 58, radius: 5.2 }
  ] },
  { name: "Street Market", image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1800&q=80", baseTime: 80, objects: [
    { name: "Hat", x: 29, y: 28, radius: 5 }, { name: "Backpack", x: 70, y: 63, radius: 5.2 }, { name: "Crate", x: 57, y: 73, radius: 5.2 }, { name: "Scooter", x: 19, y: 77, radius: 5.2 }, { name: "Sign", x: 76, y: 21, radius: 5 }, { name: "Bottle", x: 47, y: 65, radius: 4.5 }
  ] },
  { name: "Playground", image: "https://images.unsplash.com/photo-1520694478166-daaaaec95b69?auto=format&fit=crop&w=1800&q=80", baseTime: 75, objects: [
    { name: "Slide", x: 38, y: 49, radius: 5.5 }, { name: "Ball", x: 63, y: 75, radius: 4.8 }, { name: "Bench", x: 70, y: 62, radius: 5.2 }, { name: "Swing", x: 20, y: 54, radius: 5.2 }, { name: "Bottle", x: 54, y: 68, radius: 4.5 }, { name: "Backpack", x: 45, y: 70, radius: 5 }
  ] },
  { name: "Library Study Room", image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1800&q=80", baseTime: 70, objects: [
    { name: "Glasses", x: 43, y: 66, radius: 4.8 }, { name: "Clock", x: 74, y: 16, radius: 5 }, { name: "Laptop", x: 56, y: 72, radius: 5.2 }, { name: "Book Stack", x: 30, y: 63, radius: 5.2 }, { name: "Desk Lamp", x: 68, y: 48, radius: 5 }, { name: "Notebook", x: 50, y: 68, radius: 4.8 }
  ] }
];

const state = { levelIndex: 0, hintsLeft: 3, score: 0, timeLeft: 0, timerId: null, currentTargets: [], zoom: 1, levelLocked: false };
const $ = (id) => document.getElementById(id);
const sceneImage = $('sceneImage'), objectList = $('objectList'), timerValue = $('timerValue'), scoreValue = $('scoreValue'), hintValue = $('hintValue'), levelValue = $('levelValue'), feedback = $('feedback'), hintBtn = $('hintBtn'), nextBtn = $('nextBtn'), stage = $('stage'), stageScroll = $('stageScroll'), zoomRange = $('zoomRange'), overlay = $('overlay'), overlayTitle = $('overlayTitle'), overlayText = $('overlayText');

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const generateTargets = (level) => shuffle(level.objects).slice(0, Math.min(5 + state.levelIndex, level.objects.length)).map(o => ({ ...o, found: false }));
const allFound = () => state.currentTargets.every(t => t.found);

function renderUI() {
  levelValue.textContent = `${state.levelIndex + 1} / ${LEVELS.length}`;
  timerValue.textContent = `${Math.max(0, state.timeLeft)}s`;
  scoreValue.textContent = state.score;
  hintValue.textContent = state.hintsLeft;
  objectList.innerHTML = '';
  state.currentTargets.forEach(target => {
    const li = document.createElement('li');
    li.className = `object-item ${target.found ? 'found' : ''}`;
    li.innerHTML = `<span>${target.name}</span><span>${target.found ? '✓' : ''}</span>`;
    objectList.appendChild(li);
  });
  hintBtn.disabled = state.hintsLeft <= 0 || state.levelLocked;
  nextBtn.disabled = !state.levelLocked;
}

function showFeedback(msg, bad = false) { feedback.textContent = msg; feedback.classList.toggle('bad', bad); }
function addFoundRing(xPct, yPct) { const ring = document.createElement('div'); ring.className = 'found-ring'; ring.style.left = `${xPct}%`; ring.style.top = `${yPct}%`; stage.appendChild(ring); setTimeout(() => ring.remove(), 950); }

function showHint() {
  if (state.hintsLeft <= 0 || state.levelLocked) return;
  const target = state.currentTargets.find(t => !t.found); if (!target) return;
  state.hintsLeft -= 1;
  const pulse = document.createElement('div'); pulse.className = 'pulse'; pulse.style.left = `${target.x}%`; pulse.style.top = `${target.y}%`; stage.appendChild(pulse);
  setTimeout(() => pulse.remove(), 1400); showFeedback(`Hint used: ${target.name} is around highlighted area.`); renderUI();
}

function completeLevel(success) {
  clearInterval(state.timerId); state.levelLocked = true; nextBtn.disabled = false;
  if (success) { state.score += Math.max(0, state.timeLeft) * 12; overlayTitle.textContent = 'Level Complete!'; overlayText.textContent = `${LEVELS[state.levelIndex].name} cleared. Time bonus added.`; }
  else { overlayTitle.textContent = 'Time Up!'; overlayText.textContent = 'You ran out of time. Move to next level.'; }
  overlay.classList.add('show'); renderUI();
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => { state.timeLeft -= 1; if (state.timeLeft <= 0) { state.timeLeft = 0; completeLevel(false); } renderUI(); }, 1000);
}

function handleSceneClick(event) {
  if (state.levelLocked) return;
  const rect = sceneImage.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const target = state.currentTargets.find(t => !t.found && Math.hypot(t.x - x, t.y - y) <= t.radius);
  if (target) { target.found = true; state.score += 160; addFoundRing(target.x, target.y); showFeedback(`Found: ${target.name}`); if (allFound()) completeLevel(true); }
  else { state.timeLeft = Math.max(0, state.timeLeft - 4); state.score = Math.max(0, state.score - 40); showFeedback('Wrong click: -4s and -40 score', true); }
  renderUI();
}

function applyZoom() { stage.style.transform = `scale(${state.zoom})`; stage.style.width = `${100 / state.zoom}%`; }
function startLevel(index) {
  overlay.classList.remove('show');
  const level = LEVELS[index]; state.levelIndex = index; state.levelLocked = false;
  state.timeLeft = Math.max(40, level.baseTime - index * 3); state.currentTargets = generateTargets(level);
  sceneImage.src = level.image; showFeedback(`Level: ${level.name}`); renderUI(); startTimer();
}
function nextLevel() {
  if (state.levelIndex + 1 < LEVELS.length) startLevel(state.levelIndex + 1);
  else { overlay.classList.remove('show'); showFeedback(`Game completed! Final score: ${state.score}`); nextBtn.disabled = true; hintBtn.disabled = true; }
}

sceneImage.addEventListener('click', handleSceneClick);
hintBtn.addEventListener('click', showHint);
nextBtn.addEventListener('click', nextLevel);
zoomRange.addEventListener('input', e => { state.zoom = Number(e.target.value); applyZoom(); });

let isDragging = false, lastX = 0, lastY = 0;
stageScroll.addEventListener('mousedown', (e) => { if (state.zoom <= 1) return; isDragging = true; lastX = e.clientX; lastY = e.clientY; stageScroll.style.cursor = 'grabbing'; });
window.addEventListener('mouseup', () => { isDragging = false; stageScroll.style.cursor = 'default'; });
window.addEventListener('mousemove', (e) => { if (!isDragging) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; stageScroll.scrollLeft -= dx; stageScroll.scrollTop -= dy; lastX = e.clientX; lastY = e.clientY; });

startLevel(0);
