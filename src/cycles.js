// Game Grid Variables
const grid = document.getElementById('grid'); 
const gridFill = grid.getContext('2d');
let refresh = 10; //The interval will be seven times a second.
let tileCount = 80;
let tileSize = 10;

class User {
    constructor(color, startX, startY) {
        this.color = color;
        this.x = startX;
        this.y = startY;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.lightTrail = [];
    }
}

const users = [
    new User("#7DFDFE", Math.floor(tileCount / 2), Math.floor(tileCount - 2)),
    new User("#DF740C", Math.floor(tileCount / 2), 2)
];

let maxTrailLength = 10;
//let trailRender = 0;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Cycle 1 Controls
function keyInput(event, userBase) {
    const user = users[userBase];
    // Up
    if(event.keyCode == 38){
        if(user.yVelocity == 1) {
            return;
        }
        user.yVelocity=-1; //move one tile up
        user.xVelocity=0;
        //direction=0;

    }
    // Down
    if(event.keyCode == 40){
        if(user.yVelocity == -1) {
            return;
        }
        user.yVelocity=1;//move one tile down
        user.xVelocity=0;
        //direction=180;
    }

    // Left
    if(event.keyCode == 37){
        if(user.xVelocity == 1) {
            return;
        }
        user.yVelocity=0;
        user.xVelocity=-1;//move one tile left
        //direction=90;
    }
    // Right
    if(event.keyCode == 39){
        if(user.xVelocity == -1) {
            return;
        }
        user.yVelocity=0;
        user.xVelocity=1;//move one tile right
        //direction=-90;
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

// Render Cycles
function renderUsers() {
    for (const user of users) {
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
    for (const user of users) {
        user.x = user.x + user.xVelocity;
        user.y = user.y + user.yVelocity;
    }
}
function checkCollision() {
    for (const user of users) {
        if ((user.lightTrail.length > maxTrailLength)) { //collision happens when left, right ,top, and bottom sides of apple is in contact with any part of snake
            //trailRender++;
        }
    }
}

// Game Over Function
function isGameOver() {
    let gameOver = false;

    // Check if Game has started
    if ((users[0].yVelocity === 0 && users[0].xVelocity === 0) || (users[1].yVelocity === 0 && users[1].xVelocity === 0)) {
        return false;
    }

    // Check Wall Collisions
    for (const user of users) {
        if (user.x < 0 || user.x === tileCount || user.y < 0 || user.y === tileCount) {
            gameOver = true;
            break;
        }
    }

    // Check Own Collisions
    for (i = 0; i < user[0].lightTrail.length; i++) {
        let trail = user[0].lightTrail[i];
        if (user.x == trail.x && user.y === trail.y) {
            gameOver = true;
            break;
        }
    }

    // Check Opponent Collisions
    if (user[0] !== user[1]) {
        for (i = 0; i < user[1].lightTrail.length; i++) {
            let trail = user[1].lightTrail[i]
            if (user.x === trail.x && user.y === trail.y) {
                gameOver = true;
                break;
            }
        }
    }

    // Check Head-on Collisions
    if (user[0].x === user[1].x && user[0].y === user[1].y) {
        gameOver = true;
    }

    if (gameOver) {
        gridFill.fillStyle = "white";
        gridFill.font = "50px verdana";
        gridFill.fillText("Derezzed!", grid.clientWidth / 3.25, grid.clientHeight / 2); //position our text in center
        sleep(3000).then(() => {
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
    for (const user of users) {
        player.x = Math.floor(tileCount / 2);
        player.y = player.color === "#7DFDFE" ? Math.floor(tileCount - 2) : 2;
        player.xVelocity = 0;
        player.yVelocity = player.color === "#7DFDFE" ? -1 : 1;
        player.lightTrail.length = 0;
    }

    drawGame(); // Restart the game loop
}

sleep(3000).then(() => { 
    drawGame();
});

