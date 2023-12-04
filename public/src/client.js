// WebSocket
const ws = new WebSocket('ws://localhost:8080');

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
let tileCount = 80;
let tileSize = 10;

class User {
    constructor(color, startX, startY) {
        this.color = color;
        this.x = startX;
        this.y = startY;
        this.xVelocity = 0;
        this.yVelocity = this.color === "#7DFDFE" ? -1 : 1;
        this.lightTrail = [];
    }

    static users = [
        new User("#7DFDFE", Math.floor(tileCount / 4), Math.floor(tileCount - 2)),
        new User("#DF740C", Math.floor((3 * tileCount) / 4), 2),
    ];

    static resetUsers() {
        User.users.forEach((player, index) => {
            player.x = index === 0 ? Math.floor(tileCount / 4) : Math.floor((3 * tileCount) / 4);
            player.y = index === 0 ? Math.floor(tileCount - 2) : 2;
            player.xVelocity = 0;
            player.yVelocity = index === 0 ? -1 : 1;
            player.lightTrail.length = 0;
        });
    }
}

/*
const users = [
    new User("#7DFDFE", Math.floor(tileCount / 2), Math.floor(tileCount - 2)),
    new User("#DF740C", Math.floor(tileCount / 2), 2)
];
*/

let maxTrailLength = 10;
//let trailRender = 0;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Cycle 1 Controls
function keyInput(event) {
    // Player 1
    const player1 = User.users[0];
    // Player 2
    const player2 = User.users[1];

    switch (event.code) {
        // Player 1
        case 'KeyW':
            if (player1.yVelocity != 1) {
                player1.yVelocity = -1; // Move one tile up
                player1.xVelocity = 0;
            }
            break;
        case 'KeyS':
            if(player1.yVelocity != 1) {
                player1.yVelocity=1; //move one tile down
                player1.xVelocity=0;
            }
            break;
        case 'KeyA':
            if(player1.yVelocity != 1) {
                player1.yVelocity=0; //move one tile left
                player1.xVelocity=-1;
            }
            break;
        case 'KeyD':
            if(player1.yVelocity != 1) {
                player1.yVelocity=0; //move one tile right
                player1.xVelocity=1;
            }
            break;

        // Player 2
        case 'KeyW':
            if (player2.yVelocity != 1) {
                player2.yVelocity = -1; // Move one tile up
                player2.xVelocity = 0;
            }
            break;
        case 'KeyS':
            if(player2.yVelocity != 1) {
                player2.yVelocity=1; //move one tile down
                player2.xVelocity=0;
            }
            break;
        case 'KeyA':
            if(player2.yVelocity != 1) {
                player2.yVelocity=0; //move one tile left
                player2.xVelocity=-1;
            }
            break;
        case 'KeyD':
            if(player2.yVelocity != 1) {
                player2.yVelocity=0; //move one tile right
                player2.xVelocity=1;
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
        if ((user.lightTrail.length > maxTrailLength)) { //collision happens when left, right ,top, and bottom sides of apple is in contact with any part of snake
            //trailRender++;
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
    document.body.addEventListener('keydown', (event) => keyInput(event, 0)); // Player 1
    document.body.addEventListener('keydown', (event) => keyInput(event, 1)); // Player 2

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
    drawGame(); // Restart the game loop
}

sleep(3000).then(() => { 
    drawGame();
});

// Connection Termination
ws.onclose = () => {
    console.log('Connection closed');
};