
// Cloud WebSocket relay server for audience interaction

const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Assign unique ID + hue per client
wss.on('connection', (ws) => {
  console.log("Client connected");
  const clientId = Math.random().toString(16).slice(2);
  const hue = Math.floor(Math.random() * 360);

  ws.send(JSON.stringify({ type: 'hello', clientId, hue }));
  ws.clientId = clientId;
  ws.hue = hue;

  ws.on('message', (data) => {
    let msg;
    try { msg = JSON.parse(data); } catch { return; }

    if (msg.type === "tap") {
      const enriched = JSON.stringify({
        type: "tap",
        clientId: ws.clientId,
        hue: ws.hue,
        x: msg.x,
        y: msg.y,
        t: Date.now()
      });

      wss.clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN) c.send(enriched);
      });
    }
  });

  ws.on("close", () => console.log("Client disconnected:", clientId));
});

// Render port binding
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port", PORT));
