// WebSocket
const ws = new WebSocket('wss://the-grid.onrender.com:10000');

// Connection Establishment
ws.onopen = () => {
    console.log('Connected to WebSocket server');
    // You can send messages here using ws.send()
    ws.send('Hello, WebSocket server!');
};

// Game Grid Variables
const grid = document.getElementById('grid'); 
const gridFill = grid.getContext('2d');
let refresh = 10; //The interval will be ten times a second.
let tileCount = 60;
let tileSize = 10;

class User {
    // Cycle Constructor
    constructor(color, startX, startY) {
        this.color = color;
        this.x = startX;
        this.y = startY;
        this.xVelocity = 0;
        this.yVelocity = this.color === "#7DFDFE" ? -1 : 1;
        this.lightTrail = [];
    }

    static users = [
        new User("#7DFDFE", Math.floor(tileCount / 2), Math.floor(tileCount - 2)),
        new User("#DF740C", Math.floor(tileCount / 2), 2),
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

// Cycle 1 Controls
function keyInputUser1(event) {
    const user1 = User.users[0];
    switch (event.code) {
        // Player 1
        case 'KeyW':
            if (user1.yVelocity != 1) {
                user1.yVelocity = -1; // Move one tile up
                user1.xVelocity = 0;
            }
            break;
        case 'KeyS':
            if(user1.yVelocity != -1) {
                user1.yVelocity=1; //move one tile down
                user1.xVelocity=0;
            }
            break;
        case 'KeyA':
            if(user1.xVelocity != 1) {
                user1.yVelocity=0; //move one tile left
                user1.xVelocity=-1;
            }
            break;
        case 'KeyD':
            if(user1.xVelocity != -1) {
                user1.yVelocity=0; //move one tile right
                user1.xVelocity=1;
            }
            break;
    }
}

// Cycle 2 Controls
function keyInputUser2(event) {
    const user2 = User.users[1];
    switch (event.code) {
        case 'ArrowUp':
            if (user2.yVelocity != 1) {
                user2.yVelocity = -1; // Move one tile up
                user2.xVelocity = 0;
            }
            break;
        case 'ArrowDown':
            if(user2.yVelocity != -1) {
                user2.yVelocity=1; //move one tile down
                user2.xVelocity=0;
            }
            break;
        case 'ArrowLeft':
            if(user2.xVelocity != 1) {
                user2.yVelocity=0; //move one tile left
                user2.xVelocity=-1;
            }
            break;
        case 'ArrowRight':
            if(user2.xVelocity != -1) {
                user2.yVelocity=0; //move one tile right
                user2.xVelocity=1;
            }
            break;
    }
}

// Draw the Game Grid
function clearScreen(){
    gridFill.fillStyle = 'black';
    gridFill.fillRect(0,0,grid.clientWidth, grid.clientHeight);
}

// Draw and Modify the Light Cycle
class trailRender {
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
        user.lightTrail.push(new trailRender(user.x, user.y));
    }
}

function changeCyclePosition() {
    for (const user of User.users) {
        user.x = user.x + user.xVelocity;
        user.y = user.y + user.yVelocity;
    }
}
function checkCollision() {
    for (const user of User.users) {
        if ((user.lightTrail.length > maxTrailLength)) { // Collision happens if the cycles hit any part of either trail
        }
    }
}

// Game Over Function
function isGameOver() {
    let gameOver = false;

    User.users.forEach((currentUser) => {
        // Check if Game has started
        if ((currentUser.yVelocity === 0 && currentUser.xVelocity === 0)) {
            return false;
        }

        // Check Wall Collisions
        if (
            currentUser.x < 0 ||
            currentUser.x === tileCount ||
            currentUser.y < 0 ||
            currentUser.y === tileCount
        ) {
            gameOver = true;
            return;
        }

        // Check Collisions
        for (let i = 0; i < currentUser.lightTrail.length; i++) {
            let trail = currentUser.lightTrail[i];
            // Opponent Trail
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
            // Own Trail
            if (currentUser.x == trail.x && currentUser.y === trail.y) {
                gameOver = true;
                return;
            }
        }

        // Check Head-on Collisions
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
        // { Add if statement to play again here }
        sleep(3000).then(() => {
            User.resetUsers();
            resetGame();
        });
    }
    return gameOver;
}


// Game Function
function drawGame() {
    // Add controllers to cycles
    document.body.addEventListener('keydown', (event) => keyInputUser1(event, 0)); // Player 1
    document.body.addEventListener('keydown', (event) => keyInputUser2(event, 1)); // Player 2

    changeCyclePosition();
    let result = isGameOver();
    if (result) {
        document.body.removeEventListener('keydown', keyInput);
        return;
    }
    clearScreen();
    renderUsers();
    checkCollision();
    setTimeout(drawGame, 1000/refresh); //Refresh rate 10 frames per second
}

function resetGame() {
    User.resetUsers();
    countdown(); // Restart the game loop
}

function countdown() {
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        clearScreen();
        gridFill.fillStyle = "white";
        gridFill.font = "50px verdana";
        gridFill.fillText(countdown, grid.clientWidth / 2, grid.clientHeight / 2);
        countdown--;
        if (countdown < 0) {
            clearInterval(countdownInterval);
            drawGame();
        }
    }, 1000);
}

sleep(3000).then(() => {
    console.log("Starting Game");
    countdown();
});

// Connection Termination
ws.onclose = () => {
    console.log('Connection closed');
};