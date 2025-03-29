const WebSocket = require('ws');
const http = require('http');

// HTTP Server untuk health check
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Server aktif!');
});

// WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Pengguna terhubung');
  
  ws.on('message', async (message) => {
    // Jika pesan mengandung kata kunci AI
    if (message.toString().includes('#AI')) {
      const prompt = message.toString().replace('#AI', '');
      const aiResponse = await fetch("https://api.deepseek.com/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await aiResponse.json();
      ws.send(`AI: ${data.choices[0].text}`);
    } else {
      // Broadcast pesan biasa ke semua pengguna
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    }
  });
});

// Jalankan server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Running on port ${PORT}`));
