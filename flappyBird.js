const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Load images
const bird = new Image();
const bg = new Image();
const fg = new Image();
const pipeNorth = new Image();
const pipeSouth = new Image();

bird.src = "images/bird.gif";
bg.src = "images/bg.gif";
fg.src = "images/fg.png";
pipeNorth.src = "images/pipeNorth.png";
pipeSouth.src = "images/pipeSouth.png";

// Load sounds
const fly = new Audio();
const scoreSound = new Audio();

fly.src = "sounds/fly.mp3";
scoreSound.src = "sounds/score.mp3";

// Variables
let gap = 120;  
let constant;
let bX = 10;
let bY = 150;
let birdWidth = 75;  
let birdHeight = 60; 
let gravity = 1.5;
let lift = -25;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

const pipe = [];
pipe[0] = { x: canvas.width, y: 0 };

// Game states
let gameState = 'start';

function resizeCanvas() {
    const aspectRatio = window.innerWidth / window.innerHeight;
    if (aspectRatio > 1) {
        // Landscape
        canvas.width = window.innerWidth * 0.7;
        canvas.height = window.innerHeight * 0.7;
        gap = 150;
    } else {
        // Portrait
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.7;
        gap = 120;
    }
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

document.addEventListener("keydown", moveUp);
document.addEventListener("touchstart", moveUp);
canvas.addEventListener("click", moveUp);

function moveUp() {
    if (gameState === 'play') {
        bY += lift;
        fly.play();
    } else if (gameState === 'start') {
        gameState = 'play';
        draw();
    } else if (gameState === 'gameover') {
        resetGame();
        gameState = 'play';
        draw();
    }
}

function draw() {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    if (gameState === 'start') {
        displayStartScreen();
        return;
    }

    for (let i = 0; i < pipe.length; i++) {
        constant = pipeNorth.height + gap;
        ctx.drawImage(pipeNorth, pipe[i].x, pipe[i].y);
        ctx.drawImage(pipeSouth, pipe[i].x, pipe[i].y + constant);

        pipe[i].x -= (canvas.width > canvas.height ? 4 : 2); 

        if (pipe[i].x === 125) {
            pipe.push({
                x: canvas.width,
                y: Math.floor(Math.random() * pipeNorth.height) - pipeNorth.height
            });
        }

        if (bX + birdWidth >= pipe[i].x && bX <= pipe[i].x + pipeNorth.width &&
            (bY <= pipe[i].y + pipeNorth.height || bY + birdHeight >= pipe[i].y + constant) ||
            bY + birdHeight >= canvas.height - fg.height) {
            gameState = 'gameover';
        }

        if (pipe[i].x === 5) {
            score++;
            scoreSound.play();
        }
    }

    ctx.drawImage(fg, 0, canvas.height - fg.height, canvas.width, fg.height);
    ctx.drawImage(bird, bX, bY, birdWidth, birdHeight);

    bY += gravity;

    ctx.fillStyle = "#FFF";
    ctx.font = "20px Verdana";
    ctx.textAlign = "center";
    ctx.fillText("Score: " + score, canvas.width / 2, 30);
    ctx.fillText("Best Score: " + bestScore, canvas.width / 2, 60);

    if (gameState !== 'gameover') {
        requestAnimationFrame(draw);
    } else {
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem("bestScore", bestScore);
        }
        ctx.fillStyle = "#FFF";
        ctx.font = "30px Verdana";
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText("Tap to Restart", canvas.width / 2, canvas.height / 2 + 20);
    }
}

function displayStartScreen() {
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 3; i++) {
        let x = i * 200 + canvas.width / 2 - 300;
        ctx.drawImage(pipeNorth, x, 0);
        ctx.drawImage(pipeSouth, x, pipeNorth.height + gap);
    }
    ctx.drawImage(bird, bX, bY, birdWidth, birdHeight);
    ctx.fillStyle = "#FFF";
    ctx.font = "30px Verdana";
    ctx.textAlign = "center";
    ctx.fillText("Tap to Start Game", canvas.width / 2, canvas.height / 2);
}

function resetGame() {
    score = 0;
    bX = 10;
    bY = 150;
    pipe.length = 0;
    pipe[0] = { x: canvas.width, y: 0 };
    gameState = 'start';
    displayStartScreen();
}

resetGame();  
