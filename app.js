// app.js – Cochran Claims Property Tool base

console.log("Cochran Property Tool loaded");

const canvas = document.createElement("canvas");
canvas.id = "floorCanvas";
canvas.style.border = "1px solid #999";
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 120;

document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

// Resize support
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth - 20;
  canvas.height = window.innerHeight - 120;
  draw();
});

// Simple demo room
let room = {
  x: 150,
  y: 150,
  w: 300,
  h: 200
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#333";
  ctx.strokeRect(room.x, room.y, room.w, room.h);

  ctx.font = "14px Arial";
  ctx.fillStyle = "#000";
  ctx.fillText("Sample Room", room.x + 10, room.y - 10);
}

draw();

// iPad + mouse drag support
let dragging = false;
let offsetX = 0;
let offsetY = 0;

canvas.addEventListener("pointerdown", e => {
  dragging = true;
  offsetX = e.clientX - room.x;
  offsetY = e.clientY - room.y;
});

canvas.addEventListener("pointermove", e => {
  if (!dragging) return;
  room.x = e.clientX - offsetX;
  room.y = e.clientY - offsetY;
  draw();
});

canvas.addEventListener("pointerup", () => dragging = false);
canvas.addEventListener("pointerleave", () => dragging = false);
console.log("Cochran Property Tool loaded");

/* =========================
   Canvas Setup
========================= */
const canvas = document.createElement("canvas");
canvas.id = "floorCanvas";
canvas.style.border = "1px solid #999";
canvas.width = window.innerWidth - 320;
canvas.height = window.innerHeight - 120;

document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth - 320;
  canvas.height = window.innerHeight - 120;
  draw();
});

/* =========================
   Room Data
========================= */
let rooms = [];
let selectedRoomId = null;
let roomCounter = 1;

/* =========================
   UI Elements
========================= */
const addRoomBtn = document.getElementById("addRoomBtn");
const undoBtn = document.getElementById("undoBtn");
const roomList = document.getElementById("roomList");

/* =========================
   Button Wiring
========================= */
addRoomBtn.addEventListener("click", addRoom);
undoBtn.addEventListener("click", undoLast);

/* =========================
   Room Functions
========================= */
function addRoom() {
  const room = {
    id: crypto.randomUUID(),
    name: `Room ${roomCounter++}`,
    x: 100 + rooms.length * 30,
    y: 100 + rooms.length * 30,
    w: 300,
    h: 200
  };

  rooms.push(room);
  selectedRoomId = room.id;
  updateRoomList();
  draw();
}

function undoLast() {
  if (rooms.length === 0) return;
  rooms.pop();
  selectedRoomId = rooms.length ? rooms[rooms.length - 1].id : null;
  updateRoomList();
  draw();
}

/* =========================
   Room List UI
========================= */
function updateRoomList() {
  roomList.innerHTML = "";

  rooms.forEach(room => {
    const div = document.createElement("div");
    div.textContent = room.name;
    div.style.padding = "6px";
    div.style.cursor = "pointer";
    div.style.borderBottom = "1px solid #ddd";

    if (room.id === selectedRoomId) {
      div.style.background = "#e0f0ff";
      div.style.fontWeight = "bold";
    }

    div.onclick = () => {
      selectedRoomId = room.id;
      updateRoomList();
      draw();
    };

    roomList.appendChild(div);
  });
}

/* =========================
   Drawing
========================= */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  rooms.forEach(room => {
    ctx.lineWidth = 4;
    ctx.strokeStyle =
      room.id === selectedRoomId ? "#1976D2" : "#444";

    ctx.strokeRect(room.x, room.y, room.w, room.h);

    ctx.font = "14px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(room.name, room.x + 8, room.y - 8);
  });
}

/* =========================
   Dragging (Mouse + iPad)
========================= */
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

canvas.addEventListener("pointerdown", e => {
  const mx = e.clientX;
  const my = e.clientY;

  const room = rooms.find(r =>
    mx >= r.x &&
    mx <= r.x + r.w &&
    my >= r.y &&
    my <= r.y + r.h
  );

  if (!room) return;

  selectedRoomId = room.id;
  dragging = true;
  dragOffsetX = mx - room.x;
  dragOffsetY = my - room.y;

  updateRoomList();
  draw();
});

canvas.addEventListener("pointermove", e => {
  if (!dragging) return;

  const room = rooms.find(r => r.id === selectedRoomId);
  if (!room) return;

  room.x = e.clientX - dragOffsetX;
  room.y = e.clientY - dragOffsetY;
  draw();
});

canvas.addEventListener("pointerup", () => dragging = false);
canvas.addEventListener("pointerleave", () => dragging = false);


