const character = document.getElementById("character");
const scoreDisplay = document.getElementById("score");
const gameOverText = document.getElementById("gameOver");
const bgMusic = document.getElementById("bgMusic");
const difficultySelect = document.getElementById("difficulty");
const game = document.getElementById("game");

let score = 0;
let gameActive = true;

let obstacleSpeed = 9;
let spawnRate = 1200;
let obstacles = [];

// ===== FÍSICA DEL SALTO =====
let gravity = 1;
let velocity = 0;
let characterY = 0;
let isJumping = false;
let jumpKeyHeld = false;

// 🎵 Música
bgMusic.volume = 0.4;

document.addEventListener("keydown", function startMusic() {
    bgMusic.play();
    document.removeEventListener("keydown", startMusic);
});

// ===== DIFICULTAD =====
function updateDifficulty() {
    const difficulty = difficultySelect.value;

    if (difficulty === "easy") {
        obstacleSpeed = 6;
        spawnRate = 1600;
    } else if (difficulty === "normal") {
        obstacleSpeed = 9;
        spawnRate = 1200;
    } else if (difficulty === "hard") {
        obstacleSpeed = 14;
        spawnRate = 800;
    }
}

difficultySelect.addEventListener("change", updateDifficulty);
updateDifficulty();

// ===== CONTROLES =====
function startJump() {
    if (!isJumping && gameActive) {
        velocity = 20; // fuerza inicial
        isJumping = true;
        jumpKeyHeld = true;
    }
}

function stopJump() {
    jumpKeyHeld = false;
}

document.addEventListener("keydown", function(event) {
    if (event.code === "Space" || event.code === "ArrowUp") {
        startJump();
    }
});

document.addEventListener("keyup", function(event) {
    if (event.code === "Space" || event.code === "ArrowUp") {
        stopJump();
    }
});

// ===== CREAR PINCHOS =====
function createObstacle() {
    if (!gameActive) return;

    const obstacle = document.createElement("div");
    obstacle.classList.add("obstacle", "spike");

    obstacle.style.left = game.offsetWidth + "px";
    game.appendChild(obstacle);

    obstacles.push({
        element: obstacle,
        x: game.offsetWidth
    });

    setTimeout(createObstacle, spawnRate);
}

// ===== LOOP PRINCIPAL =====
function gameLoop() {
    if (!gameActive) return;

    // ----- FÍSICA SALTO VARIABLE -----
    if (isJumping && jumpKeyHeld) {
        velocity += 0.5; // mientras mantienes sube más
    }

    velocity -= gravity;
    characterY += velocity;

    if (characterY <= 0) {
        characterY = 0;
        velocity = 0;
        isJumping = false;
    }

    character.style.bottom = characterY + "px";

    // ----- MOVER OBSTÁCULOS -----
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];

        obs.x -= obstacleSpeed;
        obs.element.style.left = obs.x + "px";

        const charRect = character.getBoundingClientRect();
        const obsRect = obs.element.getBoundingClientRect();

        if (
            charRect.left < obsRect.right - 5 &&
            charRect.right > obsRect.left + 5 &&
            charRect.bottom > obsRect.top + 5
        ) {
            gameOver();
        }

        if (obs.x < -60) {
            obs.element.remove();
            obstacles.splice(i, 1);
        }
    }

    requestAnimationFrame(gameLoop);


    // ----- COLISIÓN CON OBSTÁCULOS ESTÁTICOS -----
const staticObstacles = document.querySelectorAll(".static-obstacle");

staticObstacles.forEach(obs => {
    const charRect = character.getBoundingClientRect();
    const obsRect = obs.getBoundingClientRect();

    if (
        charRect.left < obsRect.right - 5 &&
        charRect.right > obsRect.left + 5 &&
        charRect.top < obsRect.bottom - 5 &&
        charRect.bottom > obsRect.top + 5
    ) {
        gameOver();
    }
});

}

// ===== PUNTOS =====
setInterval(() => {
    if (gameActive) {
        score++;
        scoreDisplay.textContent = score;
    }
}, 100);

// ===== GAME OVER =====
function gameOver() {
    gameActive = false;
    gameOverText.style.display = "block";
    bgMusic.pause();
}

// ===== REINICIAR =====
function restartGame() {
    score = 0;
    scoreDisplay.textContent = score;
    gameActive = true;

    obstacles.forEach(o => o.element.remove());
    obstacles = [];

    characterY = 0;
    velocity = 0;
    isJumping = false;

    gameOverText.style.display = "none";
    bgMusic.currentTime = 0;
    bgMusic.play();

    updateDifficulty();
    createObstacle();
    requestAnimationFrame(gameLoop);
}

// ===== INICIAR =====
createObstacle();
requestAnimationFrame(gameLoop);