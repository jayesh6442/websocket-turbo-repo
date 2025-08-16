import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
    console.log("Client connected!");
    ws.on('message', (data) => {
        wss.clients.forEach((client) => {
            if (client.readyState === ws.OPEN) {
                client.send(`User says: ${data}`);
            }
        });
    });
});
