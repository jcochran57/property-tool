// app.js – Cochran Claims Property Tool (2D with Wall Dimensions)

document.addEventListener("DOMContentLoaded", () => {
  console.log("Cochran Property Tool loaded");

  /* =========================
     CANVAS CONTAINER
  ========================= */
  const container = document.getElementById("canvasContainer");
  if (!container) {
    alert("canvasContainer not found in index.html");
    return;
  }

  container.style.position = "relative";
  container.style.flex = "1";
  container.style.overflow = "visible";

  const canvas = document.createElement("canvas");
  canvas.id = "floorCanvas";
  canvas.style.border = "1px solid #999";
  canvas.width = container.clientWidth || 1200;
  canvas.height = window.innerHeight - 140;

  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  window.addEventListener("resize", () => {
    canvas.width = container.clientWidth || 1200;
    canvas.height = window.innerHeight - 140;
    draw();
  });

  /* =========================
     DATA MODEL
  ========================= */
  const PX_PER_FT = 25;

  let rooms = [];
  let selectedRoomId = null;
  let roomCounter = 1;

  /* =========================
     UI ELEMENTS
  ========================= */
  const addRoomBtn = document.getElementById("addRoomBtn");
  const undoBtn = document.getElementById("undoBtn");
  const roomList = document.getElementById("roomList");

  if (!addRoomBtn || !undoBtn || !roomList) {
    alert("Required buttons not found in index.html");
    return;
  }

  addRoomBtn.addEventListener("click", addRoom);
  undoBtn.addEventListener("click", undoLast);

  /* =========================
     ROOM CREATION
  ========================= */
  function addRoom() {
    const room = {
      id: crypto.randomUUID(),
      name: `Room ${roomCounter++}`,
      x: 150 + rooms.length * 30,
      y: 150 + rooms.length * 30,
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
     ROOM LIST
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
     DRAWING
  ========================= */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rooms.forEach(room => {
      const selected = room.id === selectedRoomId;

      // Room outline
      ctx.lineWidth = 4;
      ctx.strokeStyle = selected ? "#1976D2" : "#444";
      ctx.strokeRect(room.x, room.y, room.w, room.h);

      // Room label
      ctx.font = "14px Arial";
      ctx.fillStyle = "#000";
      ctx.fillText(room.name, room.x + 8, room.y - 8);

      // WALL DIMENSIONS (HIGH VISIBILITY)
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "red";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 3;

      const cx = room.x + room.w / 2;
      const cy = room.y + room.h / 2;

      ctx.strokeText(`${room.walls.top} ft`, cx - 30, room.y - 12);
      ctx.fillText(`${room.walls.top} ft`, cx - 30, room.y - 12);

      ctx.strokeText(`${room.walls.right} ft`, room.x + room.w + 12, cy);
      ctx.fillText(`${room.walls.right} ft`, room.x + room.w + 12, cy);

      ctx.strokeText(`${room.walls.bottom} ft`, cx - 30, room.y + room.h + 26);
      ctx.fillText(`${room.walls.bottom} ft`, cx - 30, room.y + room.h + 26);

      ctx.strokeText(`${room.walls.left} ft`, room.x - 65, cy);
      ctx.fillText(`${room.walls.left} ft`, room.x - 65, cy);
    });
  }

  /* =========================
     DRAGGING (MOUSE + iPAD)
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
     EDIT WALL DIMENSIONS
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

    const edge = 12;
    let side = null;

    if (Math.abs(my - room.y) < edge) side = "top";
    else if (Math.abs(mx - (room.x + room.w)) < edge) side = "right";
    else if (Math.abs(my - (room.y + room.h)) < edge) side = "bottom";
    else if (Math.abs(mx - room.x) < edge) side = "left";

    if (!side) return;

    const current = room.walls[side];
    const val = prompt(`Enter ${side} wall length (ft):`, current);
    if (!val) return;

    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return;

    room.walls[side] = num;

    if (side === "top" || side === "bottom") {
      room.walls.top = room.walls.bottom = num;
      room.w = num * PX_PER_FT;
    } else {
      room.walls.left = room.walls.right = num;
      room.h = num * PX_PER_FT;
    }

    draw();
  });

});
