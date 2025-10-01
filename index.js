//  Data model & persistence 
//might have to join with other design
const LS_KEY = "flashcards_pro_v1";
let state = {
  decks: [],
  activeDeck: null,
  session: { streak: 0, correct: 0, total: 0 },
}; 

function load() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
    } catch (e) {
      console.warn("corrupt storage", e);
    }
  }
}
function save() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
  render();
}

// simple spaced repetition metadata on each card: interval(days), ease, repetitions, next (timestamp)
function makeCard(q, a, tag) {
  return {
    q,
    a,
    tag: tag || "",
    interval: 0,
    ease: 2.5,
    reps: 0,
    next: Date.now(),
    created: Date.now(),
  };
}

// UI rendering 
const elems = {
  deckList: el("deckList"),
  deckCount: el("deckCount"),
  currentDeckName: el("currentDeckName"),
  deckMeta: el("deckMeta"),
  cardsList: el("cardsList"),
  frontText: el("frontText"),
  backText: el("backText"),
  tagChip: el("tagChip"),
  nextDue: el("nextDue"),
  progressFill: el("progressFill"),
  statText: el("statText"),
  streak: el("streak"),
  accuracy: el("accuracy"),
};

function el(id) {
  return document.getElementById(id);
}

function render() {
  // decks
  elems.deckList.innerHTML = "";
  state.decks.sort(
    (a, b) => b.updatedAt - a.updatedAt || a.title.localeCompare(b.title)
  );
  state.decks.forEach((d, idx) => {
    const div = document.createElement("div");
    div.className = "deck-item" + (state.activeDeck === idx ? " active" : "");
    div.innerHTML = `<div><strong>${escapeHtml(
      d.title || "Untitled"
    )}</strong><div class="small muted">${d.cards.length} cards • ${
      d.tags || ""
    }</div></div><div><button data-idx="${idx}" class="select">Open</button></div>`;
    elems.deckList.appendChild(div);
  });
  elems.deckCount.textContent = state.decks.length;

  // active deck
  if (state.activeDeck === null || !state.decks[state.activeDeck]) {
    elems.currentDeckName.textContent = "(No deck selected)";
    elems.deckMeta.textContent = "0 cards • tags: —";
    el("cardsList").innerHTML = "";
    el("frontText").textContent = "Select a deck to begin";
    el("backText").textContent = "—";
    el("tagChip").textContent = "—";
    el("nextDue").textContent = "next: —";
    return;
  }
  const deck = state.decks[state.activeDeck];
  elems.currentDeckName.textContent = deck.title || "Untitled";
  elems.deckMeta.textContent = `${deck.cards.length} cards • tags: ${
    deck.tags || "—"
  }`;

  // cards list
  const list = el("cardsList");
  list.innerHTML = "";
  deck.cards.forEach((c, i) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.gap = "8px";
    div.style.padding = "6px 0";
    div.innerHTML = `<div style="flex:1"><strong>${escapeHtml(
      c.q
    )}</strong><div class="tiny muted">${escapeHtml(
      c.tag || ""
    )}</div></div><div style="width:120px;text-align:right"><button data-i="${i}" class="editCard">Edit</button> <button data-i="${i}" class="delCard">Del</button></div>`;
    list.appendChild(div);
  });

  // show next due card summary
  updateSessionStats();
}

function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// ========== Deck management ==========
el("newDeckBtn").onclick = () => {
  const title = prompt("Deck title") || "New Deck";
  state.decks.unshift({
    title,
    tags: "",
    cards: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  state.activeDeck = 0;
  save();
};
el("saveDeck").onclick = () => {
  const t = el("deckTitle").value.trim();
  if (!t) return alert("Please enter deck title");
  if (state.activeDeck === null) {
    state.decks.unshift({
      title: t,
      tags: el("deckTags").value,
      cards: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    state.activeDeck = 0;
  } else {
    state.decks[state.activeDeck].title = t;
    state.decks[state.activeDeck].tags = el("deckTags").value;
    state.decks[state.activeDeck].updatedAt = Date.now();
  }
  save();
};
el("deckList").addEventListener("click", (e) => {
  if (e.target.classList.contains("select")) {
    state.activeDeck = Number(e.target.dataset.idx);
    save();
  }
});
el("addSample").onclick = () => {
  if (state.activeDeck === null) return alert("Open a deck first");
  const d = state.decks[state.activeDeck];
  d.cards.push(makeCard("Sample Q: What is 2+2?", "4", "math"));
  d.cards.push(makeCard("Capital of Ethiopia?", "Addis Ababa", "geo"));
  d.updatedAt = Date.now();
  save();
};
el("clearDeck").onclick = () => {
  if (!confirm("Clear all cards in deck?")) return;
  state.decks[state.activeDeck].cards = [];
  state.decks[state.activeDeck].updatedAt = Date.now();
  save();
};

// Card editing
el("addCardBtn").onclick = () => {
  if (state.activeDeck === null) return alert("Open a deck first");
  const q = el("newQ").value.trim();
  const a = el("newA").value.trim();
  const tag = el("newTag").value.trim();
  if (!q || !a) return alert("Question and answer required");
  state.decks[state.activeDeck].cards.push(makeCard(q, a, tag));
  state.decks[state.activeDeck].updatedAt = Date.now();
  el("newQ").value = "";
  el("newA").value = "";
  el("newTag").value = "";
  save();
};
el("bulkImport").onclick = () => {
  const txt = prompt("Paste deck JSON (array of {q,a,tag})");
  if (!txt) return;
  try {
    const arr = JSON.parse(txt);
    if (!Array.isArray(arr)) throw 0;
    for (const it of arr) {
      state.decks[state.activeDeck].cards.push(
        makeCard(it.q || "", it.a || "", it.tag || "")
      );
    }
    state.decks[state.activeDeck].updatedAt = Date.now();
    save();
  } catch (e) {
    alert("Invalid JSON");
  }
};
el("clearCards").onclick = () => {
  if (!confirm("Clear all cards?")) return;
  state.decks[state.activeDeck].cards = [];
  state.decks[state.activeDeck].updatedAt = Date.now();
  save();
};

// cards list actions (delegate)
el("cardsList").addEventListener("click", (e) => {
  if (e.target.classList.contains("delCard")) {
    const i = Number(e.target.dataset.i);
    state.decks[state.activeDeck].cards.splice(i, 1);
    state.decks[state.activeDeck].updatedAt = Date.now();
    save();
  }
  if (e.target.classList.contains("editCard")) {
    const i = Number(e.target.dataset.i);
    const c = state.decks[state.activeDeck].cards[i];
    const nq = prompt("Question", c.q);
    if (nq == null) return;
    const na = prompt("Answer", c.a);
    if (na == null) return;
    const nt = prompt("Tag", c.tag);
    if (nt == null) return;
    c.q = nq;
    c.a = na;
    c.tag = nt;
    state.decks[state.activeDeck].updatedAt = Date.now();
    save();
  }
});

// ========== Study flow & spaced repetition (SM-2 simplified)  must make new edits==========
let sessionQueue = [];
let sessionIndex = 0;
let showingBack = false;
function buildSession() {
  sessionQueue = [];
  sessionIndex = 0;
  showingBack = false;
  if (state.activeDeck === null) return;
  
  const deck = state.decks[state.activeDeck];
  const now = Date.now();
  // due cards first, then others
  const due = deck.cards.filter((c) => c.next <= now);
  const notdue = deck.cards.filter((c) => c.next > now);
  sessionQueue = due.concat(notdue);
  updateCardView();
}
function updateCardView() {
  if (sessionQueue.length === 0) {
    el("frontText").textContent = "No cards in deck.";
    el("backText").textContent = "—";
    el("tagChip").textContent = "—";
    el("nextDue").textContent = "next: —";
    el("progressFill").style.width = "0%";
    el("statText").textContent = "0 reviewed • 0 due";
    return;
  }
  const c = sessionQueue[sessionIndex];
  el("frontText").textContent = c.q;
  el("backText").textContent = c.a;
  el("tagChip").textContent = c.tag || "—";
  el("nextDue").textContent = "next: " + new Date(c.next).toLocaleDateString();
  el("progressFill").style.width =
    ((sessionIndex + 1) / sessionQueue.length) * 100 + "%";
  el("statText").textContent = `${
    state.session.total
  } reviewed • ${deckDueCount()} due`;


  // show front, hide back do not forget
  showingBack = false;
  showFront();
}
function deckDueCount() {
  if (state.activeDeck === null) return 0;
  const now = Date.now();
  return state.decks[state.activeDeck].cards.filter((c) => c.next <= now)
    .length;
}

function showBack() {
  el("flashcard").querySelector(".front").style.display = "none";
  el("flashcard").querySelector(".back").style.display = "flex";

  showingBack = true;
}
function showFront() {
  el("flashcard").querySelector(".front").style.display = "flex";
  el("flashcard").querySelector(".back").style.display = "none";

  showingBack = false;
}

el("flashcard").addEventListener("click", () => {
  if (sessionQueue.length === 0) return;
  if (showingBack) {

    // nothing
  } else showBack();
});

// grade: hard(0), knew(1), easy(2)
el("knownBtn").onclick = () => gradeCurrent(1);
el("easyBtn").onclick = () => gradeCurrent(2);
el("hardBtn").onclick = () => gradeCurrent(0);

function gradeCurrent(grade) {
  if (sessionQueue.length === 0) return;
  const c = sessionQueue[sessionIndex]; // SM-2 simplified
  // update metrics
  state.session.total += 1;
  if (grade > 0) state.session.correct += 1;
  state.session.streak = grade > 0 ? (state.session.streak || 0) + 1 : 0;
  // adjust ease
  if (grade === 0) c.ease = Math.max(1.3, c.ease - 0.2);
  if (grade === 2) c.ease = c.ease + 0.15;
  if (grade > 0) c.reps += 1;
  else c.reps = 0;
  // compute new interval
  if (c.reps === 0) c.interval = 1;
  else if (c.reps === 1) c.interval = 6;
  else c.interval = Math.round(c.interval * c.ease);
  // set next
  c.next = Date.now() + c.interval * 24 * 60 * 60 * 1000;
  // move to next
  sessionIndex = Math.min(sessionIndex + 1, sessionQueue.length - 1);
  save();
  updateCardView();
}
// navigation
function nextCard() {
  if (sessionQueue.length === 0) return;
  sessionIndex = (sessionIndex + 1) % sessionQueue.length;
  showFront();
  updateCardView();
}
function prevCard() {
  if (sessionQueue.length === 0) return;
  sessionIndex = (sessionIndex - 1 + sessionQueue.length) % sessionQueue.length;
  showFront();
  updateCardView();
}


// actions
el("studyBtn").onclick = () => {
  buildSession();
};
el("quizBtn").onclick = () => {
  alert("Quiz mode: type your answer and check (coming soon more features)");
};
el("editModeBtn").onclick = () => {
  alert("Use right panel to edit cards");
};

// keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextCard();
  if (e.key === "ArrowLeft") prevCard();
  if (e.key === " " || e.key === "Enter") {
    if (!showingBack) showBack();
    else gradeCurrent(1);
    e.preventDefault();
  }
});


// stats & session
function updateSessionStats() {
  const deck = state.decks[state.activeDeck];
  if (!deck) return;
  const due = deck.cards.filter((c) => c.next <= Date.now()).length;
  el(
    "statText"
  ).textContent = `${state.sessionion.correct} correct • ${state.session.total} seen • ${due} due`;
  el("streak").textContent = `Streak: ${state.session.streak || 0}`;
  const acc = state.session.total
    ? Math.round((state.session.correct / state.session.total) * 100)
    : 0;
  el("accuracy").textContent = `Acc: ${acc}%`;
}

// import/export
el("importBtn").onclick = () => {
  const txt = prompt("Paste exported JSON");
  if (!txt) return;
  try {
    const data = JSON.parse(txt);
    if (!data.decks) throw 0;
    state = data;
    save();
    alert("Imported");
  
  } catch (e) {
    alert("Invalid file");
  }
};
el("exportBtn").onclick = () => {
  const out = JSON.stringify(state, null, 2);
  prompt("Copy this JSON to export", out);
};

// theme toggle (simple)
el("themeBtn").onclick = () => {
  document.body.classList.toggle("light");
  if (document.body.classList.contains("light")) {
    document.body.style.background = "linear-gradient(180deg,#f7f9fc,#eef2ff)";
    document.body.style.color = "#0b1220";
  } else {
    document.body.style.background = "linear-gradient(180deg,#071024,#081328)";
    document.body.style.color = "var(--text)";
  }
};

// helpers
function elq(sel) {
  return document.querySelector(sel);
} // convenience

// initialize
load();
if (state.decks.length === 0) {
  state.decks.push({
    title: "Sample Deck",
    tags: "demo",
    cards: [
      makeCard(
        "What does HTTP stand for?",
        "HyperText Transfer Protocol",
        "web"
      ),
      makeCard("Binary for 10?", "1010", "cs"),
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}
if (state.activeDeck === null) state.activeDeck = 0;
render();

const card = document.getElementById("card");
const easyBtn = document.getElementById("easyBtn");
const hardBtn = document.getElementById("hardBtn");
const knewBtn = document.getElementById("knewBtn");

let flipped = false;
let currentCard = 0;


const cards = [
  { front: "What is HTML?", back: "A markup language for creating web pages." },
  {
    front: "What is CSS?",
    back: "A style sheet language for designing web pages.",
  },
  {
    front: "What is JavaScript?",
    back: "A programming language for web development.",
  },
];

function loadCard() {
  flipped = false;
  card.classList.remove("flipped");
  card.textContent = cards[currentCard].front;
  easyBtn.disabled = true;
  hardBtn.disabled = true;
  knewBtn.disabled = true;
}

card.addEventListener("click", () => {
  flipped = !flipped;
  card.classList.toggle("flipped");
  card.textContent = flipped
    ? cards[currentCard].back
    : cards[currentCard].front;

  if (flipped) {
    easyBtn.disabled = false;
    hardBtn.disabled = false;
    knewBtn.disabled = false;
    

  }
});

function nextCard() {
  currentCard = (currentCard + 1) % cards.length;
  loadCard();
}

easyBtn.addEventListener("click", () => {
  nextCard();
});
hardBtn.addEventListener("click", () => {
  nextCard();
});
knewBtn.addEventListener("click", () => {
  nextCard();
});


loadCard();
