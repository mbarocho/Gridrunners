const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));

const users = [];

wss.on('connection', (ws) => {

    const userColors = ["#7DFDFE", "#DF740C"];
    const userColor = userColors[users.length % userColors.length];
    const user = {
        color: userColor,
        x: Math.floor(Math.random() * 80), // Adjust as needed
        y: Math.floor(Math.random() * 80), // Adjust as needed
        xVelocity: 1,
        yVelocity: 0,
        lightTrail: 0
    };

    user.ws = ws;

    users.push(user);

    const initialUserData = users.map(u => ({ x: u.x, y: u.y, color: u.color }));
    ws.send(JSON.stringify({ users: initialUserData }));

    broadcastUsers();

    ws.on('message', (message) => {
        broadcastUsers();
    });

    ws.on('close', () => {
        const index = users.indexOf(user);
        if (index !== -1) {
            users.splice(index, 1);
            broadcastUsers();
        }
    });
});

function broadcastUsers() {
    const userData = users.map(user => ({
        x: user.x,
        y: user.y,
        color: user.color,
    }));

    const message = JSON.stringify({ users: userData });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ users: userData }));
        }
    });
}

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
