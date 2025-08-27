const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const scoreboard = document.getElementById('scoreboard');
const message = document.getElementById('message');

// Game config
const paddleHeight = 70, paddleWidth = 10;
const ballRadius = 8;
const playerX = 20, aiX = canvas.width - 20 - paddleWidth;
let playerY, aiY, playerSpeed, aiSpeed;
let ballX, ballY, ballDX, ballDY;
let playerScore, aiScore;
let upPressed = false, downPressed = false;
let gameOver = false;

function resetGame() {
    playerY = canvas.height / 2 - paddleHeight / 2;
    aiY = canvas.height / 2 - paddleHeight / 2;
    playerSpeed = 0;
    aiSpeed = 5;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    let dir = Math.random() > 0.5 ? 1 : -1;
    ballDX = 5 * dir;
    ballDY = 4 * (Math.random() * 2 - 1);
    playerScore = 0;
    aiScore = 0;
    gameOver = false;
    message.textContent = "";
    updateScore();
}

function updateScore() {
    scoreboard.textContent = "Player: " + playerScore + "    AI: " + aiScore;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw dashed net
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = "#FFD600";
    ctx.fillRect(playerX, playerY, paddleWidth, paddleHeight);
    ctx.fillStyle = "#E53935";
    ctx.fillRect(aiX, aiY, paddleWidth, paddleHeight);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

function gameLoop() {
    if (!gameOver) {
        // Player movement
        if (upPressed) playerY -= 6;
        if (downPressed) playerY += 6;
        playerY = clamp(playerY, 0, canvas.height - paddleHeight);

        // AI movement - simple follow
        let aiTarget = ballY - paddleHeight / 2;
        if (aiY + paddleHeight / 2 < aiTarget - 10) aiY += aiSpeed;
        else if (aiY + paddleHeight / 2 > aiTarget + 10) aiY -= aiSpeed;
        aiY = clamp(aiY, 0, canvas.height - paddleHeight);

        // Ball movement
        ballX += ballDX;
        ballY += ballDY;

        // Collision: top/bottom
        if (ballY - ballRadius < 0) {
            ballY = ballRadius;
            ballDY = -ballDY;
        }
        if (ballY + ballRadius > canvas.height) {
            ballY = canvas.height - ballRadius;
            ballDY = -ballDY;
        }

        // Collision: player paddle
        if (
            ballX - ballRadius < playerX + paddleWidth &&
            ballY > playerY &&
            ballY < playerY + paddleHeight
        ) {
            ballX = playerX + paddleWidth + ballRadius;
            ballDX = -ballDX;
            let hitPos = (ballY - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
            ballDY = 5 * hitPos;
        }

        // Collision: AI paddle
        if (
            ballX + ballRadius > aiX &&
            ballY > aiY &&
            ballY < aiY + paddleHeight
        ) {
            ballX = aiX - ballRadius;
            ballDX = -ballDX;
            let hitPos = (ballY - (aiY + paddleHeight / 2)) / (paddleHeight / 2);
            ballDY = 5 * hitPos;
        }

        // Score!
        if (ballX < 0) {
            aiScore++;
            updateScore();
            if (aiScore >= 10) {
                gameOver = true;
                message.textContent = "AI Wins! Press R to restart.";
            }
            resetBall();
        }
        if (ballX > canvas.width) {
            playerScore++;
            updateScore();
            if (playerScore >= 10) {
                gameOver = true;
                message.textContent = "You Win! Press R to restart.";
            }
            resetBall();
        }
    }
    draw();
    requestAnimationFrame(gameLoop);
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    let dir = Math.random() > 0.5 ? 1 : -1;
    ballDX = 5 * dir;
    ballDY = 4 * (Math.random() * 2 - 1);
}

// Controls
document.addEventListener('keydown', function (e) {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') upPressed = true;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') downPressed = true;
    if (e.key === 'r' || e.key === 'R') {
        resetGame();
    }
});
document.addEventListener('keyup', function (e) {
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') upPressed = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') downPressed = false;
});

resetGame();
draw();
requestAnimationFrame(gameLoop);
