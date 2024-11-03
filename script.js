// DOM Elements
const gameArea = document.getElementById("game");
const spacecraft = document.getElementById("spacecraft");
const scoreBoard = document.getElementById("score");
const speedBoard = document.getElementById("speed");
const menuButton = document.getElementById("menu-button");
const menu = document.getElementById("menu");
const resumeButton = document.getElementById("resume-button");
const tryAgainButton = document.getElementById("try-again-button");
const muteButton = document.getElementById("mute-button");
const gameOverPopup = document.getElementById("game-over");
const finalScoreDisplay = document.getElementById("final-score");
const restartButton = document.getElementById("restart-button");
const backgroundMusic = document.getElementById("background-music");
const collisionSound = document.getElementById("collision-sound");

// Game Variables
let score = 0;
let diseaseSpeed = 2;
let gameRunning = true;
let muted = false;
let diseaseSpawnIntervalId;
const lightYearConversionFactor = 0.0001; // 1 game speed unit = 0.0001 light-years per second

// Spacecraft Position
let spacecraftX = (gameArea.offsetWidth / 2) - (spacecraft.offsetWidth / 2);
let spacecraftY = gameArea.offsetHeight - spacecraft.offsetHeight - 20;
spacecraft.style.left = `${spacecraftX}px`;
spacecraft.style.top = `${spacecraftY}px`;

// Smooth Movement Variables
let targetX = spacecraftX;
let targetY = spacecraftY;

// Function to Start Background Music Immediately
function playBackgroundMusic() {
    backgroundMusic.volume = 0.5; // Adjust volume as needed
    backgroundMusic.loop = true;
    backgroundMusic.play().catch((error) => {
        console.warn("Background music failed to play automatically. It may require user interaction.");
    });
}

// Function to Move Spacecraft Smoothly
function smoothMoveSpacecraft() {
    spacecraftX += (targetX - spacecraftX) * 0.1;
    spacecraftY += (targetY - spacecraftY) * 0.1;

    spacecraft.style.left = `${spacecraftX}px`;
    spacecraft.style.top = `${spacecraftY}px`;

    requestAnimationFrame(smoothMoveSpacecraft);
}

// Function to Set Target Position for Smooth Movement
function setTargetPosition(event) {
    const rect = gameArea.getBoundingClientRect();
    targetX = event.clientX - rect.left - spacecraft.offsetWidth / 2;
    targetY = event.clientY - rect.top - spacecraft.offsetHeight / 2;
}

// For touch devices
function setTouchTargetPosition(event) {
    const rect = gameArea.getBoundingClientRect();
    targetX = event.touches[0].clientX - rect.left - spacecraft.offsetWidth / 2;
    targetY = event.touches[0].clientY - rect.top - spacecraft.offsetHeight / 2;
}

// Function to Create Disease Objects
function createDisease() {
    if (!gameRunning) return;

    const disease = document.createElement("div");
    disease.classList.add("disease");
    disease.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
    disease.style.top = `-30px`;
    gameArea.appendChild(disease);

    const fallInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(fallInterval);
            disease.remove();
            return;
        }

        let currentTop = parseInt(disease.style.top);
        currentTop += diseaseSpeed;
        disease.style.top = `${currentTop}px`;

        const spacecraftRect = spacecraft.getBoundingClientRect();
        const diseaseRect = disease.getBoundingClientRect();

        if (collision(spacecraftRect, diseaseRect)) {
            if (!muted) collisionSound.play();
            endGame();
            clearInterval(fallInterval);
        }

        if (currentTop > gameArea.offsetHeight) {
            disease.remove();
            score++;
            scoreBoard.textContent = score;

            // Calculate and display speed in light-years per second
            const speedInLightYears = (diseaseSpeed * lightYearConversionFactor).toFixed(6);
            speedBoard.textContent = `${speedInLightYears} light-years/sec`;

            // Increase speed every 5 points
            if (score % 5 === 0) {
                diseaseSpeed += 0.5;
            }
            clearInterval(fallInterval);
        }
    }, 20);
}

// Collision Detection Function
function collision(rect1, rect2) {
    return !(
        rect1.top > rect2.bottom ||
        rect1.bottom < rect2.top ||
        rect1.left > rect2.right ||
        rect1.right < rect2.left
    );
}

// Function to Start the Game
function startGame() {
    gameRunning = true;
    score = 0;
    diseaseSpeed = 2;
    scoreBoard.textContent = score;
    speedBoard.textContent = Math.round(diseaseSpeed); // Rounded speed display
    gameOverPopup.style.display = "none";
    menu.style.display = "none";
    document.querySelectorAll(".disease").forEach(disease => disease.remove());

    spacecraftX = (gameArea.offsetWidth / 2) - (spacecraft.offsetWidth / 2);
    spacecraftY = gameArea.offsetHeight - spacecraft.offsetHeight - 20;
    spacecraft.style.left = `${spacecraftX}px`;
    spacecraft.style.top = `${spacecraftY}px`;

    diseaseSpawnIntervalId = setInterval(createDisease, 1000);
    playBackgroundMusic(); // Play background music immediately
}

// Function to End the Game
function endGame() {
    gameRunning = false;
    clearInterval(diseaseSpawnIntervalId);
    finalScoreDisplay.textContent = score;
    gameOverPopup.style.display = "flex";
}

// Menu Button Click
menuButton.addEventListener("click", () => {
    if (!gameRunning) return;
    gameRunning = false;
    menu.style.display = "flex";
    clearInterval(diseaseSpawnIntervalId);
});

// Resume Button Click
resumeButton.addEventListener("click", () => {
    gameRunning = true;
    menu.style.display = "none";
    diseaseSpawnIntervalId = setInterval(createDisease, 1000);
});

// Try Again Button Click
tryAgainButton.addEventListener("click", () => {
    menu.style.display = "none";
    startGame();
});

// Mute Button Click
muteButton.addEventListener("click", () => {
    muted = !muted;
    backgroundMusic.muted = muted;
    collisionSound.muted = muted;
    muteButton.textContent = muted ? "Unmute" : "Mute";
});

// Restart Button Click
restartButton.addEventListener("click", () => {
    gameOverPopup.style.display = "none";
    startGame();
});

// Mouse and Touch Controls
gameArea.addEventListener("mousemove", setTargetPosition);
gameArea.addEventListener("touchmove", setTouchTargetPosition);

// Start Smooth Movement
smoothMoveSpacecraft();

// Start Game on Load
startGame();
