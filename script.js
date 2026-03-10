const roomPools = [
  {
    name: "Ev",
    items: ["Kupa", "Anahtar", "Kumanda", "Kitap", "Yastık", "Lamba", "Çorap", "Telefon", "Kulaklık", "Saat"],
  },
  {
    name: "Okul",
    items: ["Silgi", "Kalem", "Cetvel", "Defter", "Makas", "Boya", "Sırt Çantası", "Dosya", "Küre", "Projeksiyon Kumandası"],
  },
  {
    name: "İşyeri",
    items: ["Zımba", "USB", "Mühür", "Kartvizit", "Ajanda", "Sunum Tıklayıcı", "Not Kağıdı", "Sözleşme", "Toplantı Rozeti", "Masa Kartı"],
  },
  {
    name: "Laboratuvar",
    items: ["Mikroskop", "Pipet", "Petri Kabı", "Koruyucu Gözlük", "Deney Tüpü", "Eldiven", "pH Kağıdı", "Termometre", "Numune Şişesi", "Kronometre"],
  },
  {
    name: "Spor Salonu",
    items: ["Dambıl", "Mat", "Su Şişesi", "Havlu", "Atlama İpi", "Eldiven", "Protein Shaker", "Kronometre", "Spor Çantası", "Direnç Bandı"],
  },
  {
    name: "Alışveriş Merkezi",
    items: ["Hediye Kartı", "Mağaza Poşeti", "Fiş", "Güneş Gözlüğü", "Parfüm", "Ayakkabı Kutusu", "Bilet", "Yönlendirme Broşürü", "Cüzdan", "Şapka"],
  },
  {
    name: "Market",
    items: ["Süt", "Ekmek", "Makarna", "Elma", "Peynir", "Yoğurt", "Deterjan", "Pil", "Meyve Suyu", "Kahve"],
  },
];

const symbols = ["📦", "🧩", "🛒", "📚", "🧪", "🏷️", "🧼", "🎒", "🗂️", "🎯", "🔍", "🧠", "🧴", "📌", "🧤", "🧭"];

const state = {
  level: 1,
  maxLevel: 20,
  playing: false,
  currentRoom: null,
  targets: [],
  found: new Set(),
  cells: [],
  timeLeft: 0,
  timer: null,
};

const roomLabel = document.getElementById("roomLabel");
const levelLabel = document.getElementById("levelLabel");
const timerLabel = document.getElementById("timerLabel");
const targetsEl = document.getElementById("targets");
const grid = document.getElementById("grid");
const message = document.getElementById("message");

document.getElementById("startBtn").addEventListener("click", () => {
  if (!state.playing) startLevel(state.level);
});

document.getElementById("restartBtn").addEventListener("click", resetGame);

function resetGame() {
  clearInterval(state.timer);
  state.level = 1;
  state.playing = false;
  state.found.clear();
  state.targets = [];
  state.cells = [];
  message.textContent = "Oyun sıfırlandı. Başlat'a bas!";
  message.className = "message";
  levelLabel.textContent = "1";
  timerLabel.textContent = "0";
  roomLabel.textContent = "Oda: -";
  targetsEl.innerHTML = "";
  grid.innerHTML = "";
}

function difficulty(level) {
  return {
    cols: Math.min(4 + Math.floor((level - 1) / 4), 8),
    rows: Math.min(3 + Math.floor((level - 1) / 5), 6),
    targetCount: Math.min(2 + Math.floor((level - 1) / 3), 8),
    seconds: Math.max(48 - level * 1.5, 18),
  };
}

function startLevel(level) {
  clearInterval(state.timer);
  state.playing = true;
  state.found.clear();
  levelLabel.textContent = String(level);

  const room = roomPools[(level - 1) % roomPools.length];
  state.currentRoom = room;
  roomLabel.textContent = `Oda: ${room.name}`;

  const d = difficulty(level);
  state.targets = shuffle([...room.items]).slice(0, d.targetCount);
  state.timeLeft = Math.floor(d.seconds);
  timerLabel.textContent = String(state.timeLeft);

  renderTargets();
  renderGrid(d.rows, d.cols, room, state.targets);

  message.textContent = `Seviye ${level} başladı. ${state.targets.length} eşya bul!`;
  message.className = "message";

  state.timer = setInterval(() => {
    state.timeLeft -= 1;
    timerLabel.textContent = String(Math.max(state.timeLeft, 0));

    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      state.playing = false;
      message.textContent = "Süre doldu! Aynı seviyeyi tekrar dene.";
      message.className = "message fail";
    }
  }, 1000);
}

function renderTargets() {
  targetsEl.innerHTML = "";
  state.targets.forEach((item) => {
    const li = document.createElement("li");
    li.dataset.item = item;
    li.textContent = item;
    targetsEl.appendChild(li);
  });
}

function renderGrid(rows, cols, room, targets) {
  grid.innerHTML = "";
  const total = rows * cols;
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(68px, 1fr))`;

  const decoys = shuffle(room.items.filter((x) => !targets.includes(x)));
  const neededDecoys = Math.max(total - targets.length, 0);

  const contents = [
    ...targets.map((name) => ({ name, target: true })),
    ...Array.from({ length: neededDecoys }, (_, i) => ({
      name: decoys[i % decoys.length] || `Nesne ${i + 1}`,
      target: false,
    })),
  ];

  state.cells = shuffle(contents).slice(0, total);

  state.cells.forEach((cell, idx) => {
    const btn = document.createElement("button");
    btn.className = "cell";
    const icon = symbols[(idx + state.level) % symbols.length];
    btn.innerHTML = `<strong>${icon}</strong><br><span>${cell.name}</span>`;
    btn.addEventListener("click", () => handlePick(btn, cell));
    grid.appendChild(btn);
  });
}

function handlePick(button, cell) {
  if (!state.playing || button.classList.contains("found")) return;

  if (cell.target) {
    state.found.add(cell.name);
    button.classList.add("found");

    const li = targetsEl.querySelector(`[data-item="${CSS.escape(cell.name)}"]`);
    if (li) li.classList.add("found");

    if (state.found.size === state.targets.length) {
      clearInterval(state.timer);
      state.playing = false;

      if (state.level === state.maxLevel) {
        message.textContent = "Tebrikler! 20 seviyenin tamamını bitirdin 🎉";
        message.className = "message ok";
      } else {
        message.textContent = `Harika! Seviye ${state.level} tamamlandı.`;
        message.className = "message ok";
        state.level += 1;
        setTimeout(() => startLevel(state.level), 1200);
      }
    }
  } else {
    button.style.background = "#ffe8ec";
    setTimeout(() => {
      if (!button.classList.contains("found")) button.style.background = "";
    }, 350);
    state.timeLeft = Math.max(state.timeLeft - 2, 0);
    timerLabel.textContent = String(state.timeLeft);
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
