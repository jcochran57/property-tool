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

