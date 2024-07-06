const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Load images
const bird = new Image();
const bg = new Image();
const fg = new Image();
const pipeNorth = new Image();
const pipeSouth = new Image();

bird.src = "images/bird.png"; 
bg.src = "images/bg.png";
fg.src = "images/fg.png";
pipeNorth.src = "images/pipeNorth.png";
pipeSouth.src = "images/pipeSouth.png";

// Load sounds
const fly = new Audio();
const scoreSound = new Audio();
const overSound = new Audio();
const playSound = new Audio();

fly.src = "sounds/fly.mp3";
scoreSound.src = "sounds/score.mp3";
overSound.src = "sounds/gameover.mp3";
playSound.src = "sounds/play.mp3";

// Variables
let gap = 200; 
let birdWidth = 55;
let birdHeight = 40;
let gravity = 1.5;
let lift = -30;
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

const minGap = 90; 
const maxGapVariation = 40; 

let pipe = [];
resetPipes();

// Game states
let gameState = 'start';
let lastPipeTime = 0;

// Initial pipe movement speed and speed increment parameters
let pipeMovementSpeed = 1.5; // Initial speed
const maxPipeSpeed = 10; // Maximum speed
const speedIncrementInterval = 8000; // Interval in milliseconds to increase speed
let lastSpeedIncreaseTime = Date.now();

function resizeCanvas() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  if (aspectRatio > 1) {
    // Landscape
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight * 0.7;
    gap = 200; 
  } else {
    // Portrait
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;
    gap = 230; // Adjust gap for portrait
  }

  const speedModifier = aspectRatio > 1 ? 1.1 : 1.4;
  pipeMovementSpeed = 2 * speedModifier; // Reset initial speed based on aspect ratio
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
    playSound.play();
  } else if (gameState === 'start') {
    gameState = 'play';
    playSound.play();
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

  const currentTime = Date.now(); // Get current timestamp

  // Time-based pipe generation with minimum gap and variation
  if (currentTime - lastPipeTime > 2000) {
    generatePipe();
    lastPipeTime = currentTime;
  }

  for (let i = 0; i < pipe.length; i++) {
    const constant = pipeNorth.height + gap;
    ctx.drawImage(pipeNorth, pipe[i].x, pipe[i].y);
    ctx.drawImage(pipeSouth, pipe[i].x, pipe[i].y + constant);

    pipe[i].x -= pipeMovementSpeed;

    if (
      (bX + birdWidth > pipe[i].x && bX < pipe[i].x + pipeNorth.width &&
        (bY < pipe[i].y + pipeNorth.height || bY + birdHeight > pipe[i].y + constant)) ||
      bY + birdHeight > canvas.height - fg.height ||
      bY < 0
    ) {
      gameState = 'gameover';
      overSound.play();
    }

    // Check for passing a pipe and increment score
    const pipeCenterX = pipe[i].x + pipeNorth.width / 2;
    const birdCenterX = bX + birdWidth / 2;
    if (birdCenterX > pipeCenterX && !pipe[i].scored) {
      score++;
      pipe[i].scored = true;
      scoreSound.play();
    }

    // Remove pipes that are out of view
    if (pipe[i].x + pipeNorth.width < 0) {
      pipe.splice(i, 1);
      i--; // Decrement i to avoid skipping elements
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

  // Increase pipe speed periodically
  if (currentTime - lastSpeedIncreaseTime > speedIncrementInterval && pipeMovementSpeed < maxPipeSpeed) {
    pipeMovementSpeed++; // Increment speed
    lastSpeedIncreaseTime = currentTime; // Update last speed increase time
  }

  if (gameState !== 'gameover') {
    requestAnimationFrame(draw);
  } else {
    playSound.pause();
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("bestScore", bestScore);
    }
    ctx.fillStyle = "#FFF";
    ctx.font = "30px Verdana";
    ctx.textAlign = "center";

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
  resetPipes();
  gameState = 'start';
  lastPipeTime = 0; // Reset last pipe spawn time
  displayStartScreen();
}

function resetPipes() {
  pipe = [];
  pipe.push({
    x: canvas.width,
    y: Math.floor(Math.random() * (canvas.height - fg.height - gap - minGap)) - pipeNorth.height,
    scored: false 
  });
  console.log('Initial pipe:', pipe[0]); // Log initial pipe
}

function generatePipe() {
  const newY = Math.floor(Math.random() * (canvas.height - fg.height - gap - minGap)) - pipeNorth.height;
  
  if (pipe.length === 0 || (pipe.length > 0 && pipe[pipe.length - 1].x < canvas.width - 300)) {
    pipe.push({
      x: canvas.width,
      y: newY,
      scored: false
    });
    console.log('New pipe:', { x: canvas.width, y: newY }); 
  }
}

resetGame();
requestAnimationFrame(draw);
