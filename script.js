const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerImg = new Image();
playerImg.src = "images/mobil-user.png";

const obstacleImgs = [
  "images/mobil-1.png",
  "images/mobil-2.png",
  "images/mobil-3.png",
  "images/mobil-4.png",
];

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 100,
  speed: 5,
  dx: 0,
  dy: 0,
};

const obstacles = [];
const obstacleWidth = 50;
const obstacleHeight = 100;
let obstacleSpeed = 3;
const obstacleGap = 200;
let lastObstacleY = 0;

let score = 0;
let highScoreEasy = localStorage.getItem("highScoreEasy") || 0;
let highScoreMedium = localStorage.getItem("highScoreMedium") || 0;
let highScoreHard = localStorage.getItem("highScoreHard") || 0;
let levelNow = "Easy";
let gameOver = false;
let gamePaused = true;
let requestId;

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    const obstacleImg = new Image();
    obstacleImg.src = obstacleImgs[obstacle.type - 1];
    ctx.drawImage(
      obstacleImg,
      obstacle.x,
      obstacle.y,
      obstacleWidth,
      obstacleHeight
    );
  });
}

function movePlayer() {
  const nextX = player.x + player.dx;
  if (nextX >= 0 && nextX <= canvas.width - player.width) {
    player.x = nextX;
  }

  player.y += player.dy;

  if (player.y < 0) {
    player.y = 0;
  } else if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }
}

function moveObstacles() {
  if (!gameOver && !gamePaused) {
    obstacles.forEach((obstacle) => {
      obstacle.y += obstacleSpeed;
      if (obstacle.y > canvas.height) {
        obstacle.y = lastObstacleY - obstacleHeight - obstacleGap;
        obstacle.x = Math.random() * (canvas.width - obstacleWidth);
        obstacle.type = Math.floor(Math.random() * 4) + 1;
        score += getScoreIncrement();
        document.getElementById("scoreAudio").play();
      }

      if (collisionDetection(player, obstacle)) {
        gameOver = true;
        updateHighScore();
        cancelAnimationFrame(requestId);
        gamePaused = true;
        document.getElementById("restartBtn").style.display = "inline";
        document.getElementById("gameOverAudio").play();
        document.getElementById("gameBackSound").pause();
        alert(
          "Game Over! Your score: " + score + "\nHigh Score: " + getHighScore()
        );
      }
    });
  }
}

function collisionDetection(player, obstacle) {
  return (
    player.x < obstacle.x + obstacleWidth &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacleHeight &&
    player.y + player.height > obstacle.y
  );
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "end";
  ctx.fillText("Score: " + score, canvas.width - 10, 30);
  ctx.fillText(
    `High Score ${levelNow}: ` + getHighScore(),
    canvas.width - 10,
    60
  );
}

function resetGame() {
  player.x = canvas.width / 2 - 25;
  player.y = canvas.height - 100;
  player.dx = 0;
  player.dy = 0;
  score = 0;
  gameOver = false;
  gamePaused = false;

  lastObstacleY = 0;
  obstacles.forEach((obstacle, index) => {
    obstacle.y = -(obstacleHeight + obstacleGap) * index;
    lastObstacleY = obstacle.y;
    obstacle.x = Math.random() * (canvas.width - obstacleWidth);
    obstacle.type = Math.floor(Math.random() * 4) + 1;
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("restartBtn").style.display = "none";
  document.getElementById("levelSelection").style.display = "none";
  update();
}

function drawStartScreen() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (score && gamePaused) {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Tekan spasi pada keyboard untuk memulai game",
      canvas.width / 2,
      canvas.height / 2
    );
  }
}

function setObstacleSpeed(level) {
  switch (level) {
    case "easy":
      obstacleSpeed = 4;
      levelNow = "Easy";
      break;
    case "medium":
      obstacleSpeed = 5;
      levelNow = "Medium";
      break;
    case "hard":
      obstacleSpeed = 6;
      levelNow = "Hard";
      break;
    default:
      obstacleSpeed = 5;
      levelNow = "Medium";
  }
}

function getScoreIncrement() {
  switch (level) {
    case "easy":
      return 1;
    case "medium":
      return 2;
    case "hard":
      return 3;
    default:
      return 0;
  }
}

function getHighScore() {
  switch (level) {
    case "easy":
      return highScoreEasy;
    case "medium":
      return highScoreMedium;
    case "hard":
      return highScoreHard;
    default:
      return 0;
  }
}

function updateHighScore() {
  switch (level) {
    case "easy":
      if (score > highScoreEasy) {
        highScoreEasy = score;
        localStorage.setItem("highScoreEasy", highScoreEasy);
      }
      break;
    case "medium":
      if (score > highScoreMedium) {
        highScoreMedium = score;
        localStorage.setItem("highScoreMedium", highScoreMedium);
      }
      break;
    case "hard":
      if (score > highScoreHard) {
        highScoreHard = score;
        localStorage.setItem("highScoreHard", highScoreHard);
      }
      break;
    default:
      break;
  }
}

document.getElementById("easyBtn").addEventListener("click", function () {
  level = "easy";
  setObstacleSpeed(level);
  resetGame();
});

document.getElementById("mediumBtn").addEventListener("click", function () {
  level = "medium";
  setObstacleSpeed(level);
  resetGame();
});

document.getElementById("hardBtn").addEventListener("click", function () {
  level = "hard";
  setObstacleSpeed(level);
  resetGame();
});

document.getElementById("restartBtn").addEventListener("click", function () {
  document.getElementById("restartBtn").style.display = "none";
  document.getElementById("levelSelection").style.display = "block";
  drawStartScreen();
});

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gamePaused) {
    drawStartScreen();
  } else {
    movePlayer();
    drawPlayer();
    moveObstacles();
    drawObstacles();
    drawScore();
    requestId = requestAnimationFrame(update);
    document.getElementById("gameBackSound").play();
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "end";
    ctx.fillText(
      `High Score ${levelNow}: ` + getHighScore(),
      canvas.width - 10,
      60
    );
  }
}

document.addEventListener("keydown", function (event) {
  if (event.key === " " && gamePaused) {
    resetGame();
  }

  if (!gameOver && !gamePaused) {
    if (event.key === "ArrowLeft") {
      player.dx = -player.speed;
    } else if (event.key === "ArrowRight") {
      player.dx = player.speed;
    } else if (event.key === "ArrowUp") {
      player.dy = -player.speed;
    } else if (event.key === "ArrowDown") {
      player.dy = player.speed;
    }
  }
});

document.addEventListener("keyup", function (event) {
  if (!gameOver && !gamePaused) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      player.dx = 0;
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      player.dy = 0;
    }
  }
});

// Generate obstacles
for (let i = 0; i < 10; i++) {
  obstacles.push({
    x: Math.random() * (canvas.width - obstacleWidth),
    y: -(obstacleHeight + obstacleGap) * i,
    type: Math.floor(Math.random() * 4) + 1,
  });
}

update();
