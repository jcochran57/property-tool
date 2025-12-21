// app.js – Cochran Claims Property Tool (2D Base w/ Wall Dimensions)

document.addEventListener("DOMContentLoaded", () => {
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
     Data Model
  ========================= */
  let rooms = [];
  let selectedRoomId = null;
  let roomCounter = 1;

  const PX_PER_FT = 25; // scale

  /* =========================
     UI Elements
  ========================= */
  const addRoomBtn = document.getElementById("addRoomBtn");
  const undoBtn = document.getElementById("undoBtn");
  const roomList = document.getElementById("roomList");

  if (!addRoomBtn || !undoBtn || !roomList) {
    console.error("Required UI elements not found");
    return;
  }

  addRoomBtn.addEventListener("click", addRoom);
  undoBtn.addEventListener("click", undoLast);

  /* =========================
     Room Functions
  ========================= */
  function addRoom() {
    const room = {
      id: crypto.randomUUID(),
      name: `Room ${roomCounter++}`,
      x: 120 + rooms.length * 30,
      y: 120 + rooms.length * 30,
      walls: {
        top: 12,
        right: 10,
        bottom: 12,
        left: 10
      }
    };

    room.w = room.walls.top * PX_PER_FT;
    room.h = room.walls.left * PX_PER_FT;

    rooms.push(room);
    selectedRoomId = room.id;
    updateRoomList();
    draw();
  }

  function undoLast() {
    if (!rooms.length) return;
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
      const isSelected = room.id === selectedRoomId;

      ctx.lineWidth = 4;
      ctx.strokeStyle = isSelected ? "#1976D2" : "#444";
      ctx.strokeRect(room.x, room.y, room.w, room.h);

      // Room name
      ctx.font = "14px Arial";
      ctx.fillStyle = "#000";
      ctx.fillText(room.name, room.x + 8, room.y - 10);

      // Wall dimensions (2D only)
      ctx.font = "12px Arial";
      ctx.fillStyle = "#333";

      const cx = room.x + room.w / 2;
      const cy = room.y + room.h / 2;

      ctx.fillText(`${room.walls.top} ft`, cx - 18, room.y - 4);
      ctx.fillText(`${room.walls.right} ft`, room.x + room.w + 6, cy);
      ctx.fillText(`${room.walls.bottom} ft`, cx - 18, room.y + room.h + 14);
      ctx.fillText(`${room.walls.left} ft`, room.x - 40, cy);
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

  /* =========================
     Edit Wall Dimensions (Double-Click)
  ========================= */
  canvas.addEventListener("dblclick", e => {
    const mx = e.clientX;
    const my = e.clientY;

    const room = rooms.find(r =>
      mx >= r.x &&
      mx <= r.x + r.w &&
      my >= r.y &&
      my <= r.y + r.h
    );

    if (!room) return;

    const edge = 10;
    let side = null;

    if (Math.abs(my - room.y) < edge) side = "top";
    else if (Math.abs(mx - (room.x + room.w)) < edge) side = "right";
    else if (Math.abs(my - (room.y + room.h)) < edge) side = "bottom";
    else if (Math.abs(mx - room.x) < edge) side = "left";

    if (!side) return;

    const current = room.walls[side];
    const input = prompt(`Enter ${side} wall length (ft):`, current);
    if (!input) return;

    const val = parseFloat(input);
    if (isNaN(val) || val <= 0) return;

    room.walls[side] = val;

    // Resize geometry
    if (side === "top" || side === "bottom") {
      room.w = val * PX_PER_FT;
      room.walls.top = room.walls.bottom = val;
    } else {
      room.h = val * PX_PER_FT;
      room.walls.left = room.walls.right = val;
    }

    draw();
  });

});
