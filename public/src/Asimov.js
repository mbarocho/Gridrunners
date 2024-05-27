const ws = new WebSocket('wss://the-grid.onrender.com:10000');

// Connection Establishment
ws.onopen = () => {
    console.log('Connected to WebSocket server');
    ws.send('Hello, WebSocket server!');
};

// Game Grid Variables
const grid = document.getElementById('grid');
const gridFill = grid.getContext('2d');
let refresh = 10; // The interval will be ten times a second.
let tileCount = 60;
let tileSize = 10;

class User {
    // Cycle Constructor
    constructor(color, startX, startY, isAI = false) {
        this.color = color;
        this.x = startX;
        this.y = startY;
        this.xVelocity = 0;
        this.yVelocity = this.color === "#7DFDFE" ? -1 : 1;
        this.lightTrail = [];
        this.isAI = isAI;
    }

    static users = [
        new User("#7DFDFE", Math.floor(tileCount / 2), Math.floor(tileCount - 2)),
        new User("#DF740C", Math.floor(tileCount / 2), 2, true), // Player 2 is AI
    ];

    static resetUsers() {
        User.users.forEach((player, index) => {
            player.x = Math.floor(tileCount / 2);
            player.y = index === 0 ? Math.floor(tileCount - 2) : 2;
            player.xVelocity = 0;
            player.yVelocity = index === 0 ? -1 : 1;
            player.lightTrail.length = 0;
        });
    }
}

let maxTrailLength = 10;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Human Movement for Player 1
function keyInputUser1(event) {
    const user1 = User.users[0];
    switch (event.code) {
        case 'KeyW':
            if (user1.yVelocity != 1) {
                user1.yVelocity = -1; // Move one tile up
                user1.xVelocity = 0;
            }
            break;
        case 'KeyS':
            if (user1.yVelocity != -1) {
                user1.yVelocity = 1; // Move one tile down
                user1.xVelocity = 0;
            }
            break;
        case 'KeyA':
            if (user1.xVelocity != 1) {
                user1.yVelocity = 0; // Move one tile left
                user1.xVelocity = -1;
            }
            break;
        case 'KeyD':
            if (user1.xVelocity != -1) {
                user1.yVelocity = 0; // Move one tile right
                user1.xVelocity = 1;
            }
            break;
    }
}

// Draw the Game Grid
function clearScreen() {
    gridFill.fillStyle = 'black';
    gridFill.fillRect(0, 0, grid.clientWidth, grid.clientHeight);
}

// Draw and Modify the Light Cycle
class TrailRender {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

ws.onmessage = (event) => {
    const playerData = JSON.parse(event.data);
    renderUsers();
};

// Render Cycles
function renderUsers() {
    for (const user of User.users) {
        gridFill.fillStyle = user.color;
        gridFill.fillRect(user.x * tileSize, user.y * tileSize, tileSize, tileSize);

        // Render Light Trail
        for (const trail of user.lightTrail) {
            gridFill.shadowColor = user.color;
            gridFill.shadowBlur = 25;
            gridFill.fillRect(trail.x * tileSize, trail.y * tileSize, tileSize, tileSize);
        }
        user.lightTrail.push(new TrailRender(user.x, user.y));
    }
}

function changeCyclePosition() {
    for (const user of User.users) {
        user.x += user.xVelocity;
        user.y += user.yVelocity;
    }
}

function checkCollision() {
    for (const user of User.users) {
        if (user.lightTrail.length > maxTrailLength) {
            // Collision logic can be expanded here
        }
    }
}

// AI Movement
function moveAI(user) {
    const directions = [
        { x: 0, y: -1 }, // Up
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }, // Left
        { x: 1, y: 0 },  // Right
    ];

    function isSafeDirection(direction) {
        const nextX = user.x + direction.x;
        const nextY = user.y + direction.y;
        if (nextX < 0 || nextX >= tileCount || nextY < 0 || nextY >= tileCount) {
            return false; // Wall collision
        }
        for (const otherUser of User.users) {
            for (const trail of otherUser.lightTrail) {
                if (nextX === trail.x && nextY === trail.y) {
                    return false; // Trail collision
                }
            }
        }
        return true;
    }

    // Filter out unsafe directions
    const safeDirections = directions.filter(isSafeDirection);

    if (safeDirections.length > 0) {
        const randomDirection = safeDirections[Math.floor(Math.random() * safeDirections.length)];
        user.xVelocity = randomDirection.x;
        user.yVelocity = randomDirection.y;
    }
}

// Game Over Function
function isGameOver() {
    let gameOver = false;

    User.users.forEach((currentUser) => {
        if (currentUser.yVelocity === 0 && currentUser.xVelocity === 0) {
            return false;
        }

        if (
            currentUser.x < 0 ||
            currentUser.x === tileCount ||
            currentUser.y < 0 ||
            currentUser.y === tileCount
        ) {
            gameOver = true;
            return;
        }

        for (let i = 0; i < currentUser.lightTrail.length; i++) {
            let trail = currentUser.lightTrail[i];
            for (const otherUser of User.users) {
                if (currentUser !== otherUser) {
                    for (let j = 0; j < otherUser.lightTrail.length; j++) {
                        let otherTrail = otherUser.lightTrail[j];
                        if (currentUser.x === otherTrail.x && currentUser.y === otherTrail.y) {
                            gameOver = true;
                            return;
                        }
                    }
                }
            }
            if (currentUser.x == trail.x && currentUser.y === trail.y) {
                gameOver = true;
                return;
            }
        }

        for (const otherUser of User.users) {
            if (currentUser !== otherUser) {
                if (currentUser.x === otherUser.x && currentUser.y === otherUser.y) {
                    gameOver = true;
                    return;
                }
            }
        }
    });

    if (gameOver) {
        gridFill.fillStyle = "white";
        gridFill.font = "50px verdana";
        gridFill.fillText("Derezzed!", grid.clientWidth / 3.25, grid.clientHeight / 2);
        sleep(3000).then(() => {
            User.resetUsers();
            resetGame();
        });
    }
    return gameOver;
}

// Game Function
function drawGame() {
    document.body.addEventListener('keydown', keyInputUser1); // Add key listener for Player 1

    changeCyclePosition();
    let result = isGameOver();
    if (result) {
        document.body.removeEventListener('keydown', keyInputUser1);
        return;
    }
    clearScreen();
    renderUsers();
    checkCollision();
    
    // Move AI player
    const aiPlayer = User.users.find(user => user.isAI);
    if (aiPlayer) {
        moveAI(aiPlayer);
    }

    setTimeout(drawGame, 1000 / refresh);
}

function resetGame() {
    User.resetUsers();
    drawGame();
}

function countdownAndStart() {
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        clearScreen();
        gridFill.fillStyle = "white";
        gridFill.font = "50px verdana";
        gridFill.fillText(countdown, grid.clientWidth / 2.25, grid.clientHeight / 2);
        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            drawGame();
        }
    }, 1000);
}

sleep(3000).then(() => {
    console.log("Starting Game");
    countdownAndStart();
});

// Connection Termination
ws.onclose = () => {
    console.log('Connection closed');
};
