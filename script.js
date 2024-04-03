const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerImg = new Image(); // membuat objek gambar baru.
playerImg.src = "images/mobil-user.png";

const obstacleImgs = [
  // array yang berisi sumber gambar rintangan.
  "images/mobil-1.png", // sumber gambar rintangan 1.
  "images/mobil-2.png", // sumber gambar rintangan 2.
  "images/mobil-3.png", // sumber gambar rintangan 3.
  "images/mobil-4.png", // sumber gambar rintangan 4.
];

const player = {
  width: 50, // ukuran pemain lebar 50
  height: 100, // ukuran pemain tinggi 100
  speed: 5, //kecepatan pemain
};

const obstacles = []; // array yang berisi rintangan
const obstacleWidth = 50; // lebar rintangan
const obstacleHeight = 100; // tinggi rintangan
let obstacleSpeed; // kecepatan rintangan
const obstacleGap = 50; // jarak antara rintangan
let lastObstacleY = 0; // posisi y rintangan terakhir

let score; // skor pemain
let highScoreEasy = localStorage.getItem("highScoreEasy") || 0; // skor tertinggi level mudah
let highScoreMedium = localStorage.getItem("highScoreMedium") || 0; // skor tertinggi level sedang
let highScoreHard = localStorage.getItem("highScoreHard") || 0; // skor tertinggi level sulit
let levelNow; // level permainan
let gameOver = false; // status permainan berakhir
let gamePaused = true; // status permainan dijeda
let requestId; // id permintaan animasi frame

function drawPlayer() {
  // menggambar gambar pemain pada kanvas pada posisi dan ukuran yang ditentukan oleh objek player
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawObstacles() {
  // digunakan untuk menggambar setiap rintangan pada kanvas
  obstacles.forEach((obstacle) => {
    // digunakan untuk melakukan iterasi atau pengulangan pada setiap elemen dalam array obstacles
    const obstacleImg = new Image(); // membuat objek gambar baru.
    obstacleImg.src = obstacleImgs[obstacle.type - 1]; // mengatur sumber gambar ke salah satu gambar dalam array obstacleImgs
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
  // digunakan untuk memindahkan pemain berdasarkan kecepatan dan arahnya.
  const nextX = player.x + player.dx; // menghitung posisi x berikutnya dari pemain berdasarkan posisi x saat ini dan kecepatan x (dx).
  if (nextX >= 0 && nextX <= canvas.width - player.width) {
    // posisi x berada dalam batas kanvas?. Jika ya, pemain pindah posisi x berikutnya.
    player.x = nextX;
  }

  player.y += player.dy; // memindahkan pemain secara vertikal berdasarkan kecepatan y (dy).

  if (player.y < 0) {
    // Jika pemain bergerak di luar batas atas kanvas, posisi y pemain diatur ke 0.
    player.y = 0;
  } else if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }
}

function moveObstacles() {
  //digunakan untuk memindahkan setiap rintangan dan memeriksa apakah ada tabrakan dengan pemain.
  if (!gameOver && !gamePaused) {
    //memeriksa apakah permainan sudah berakhir atau dijeda.
    obstacles.forEach((obstacle) => {
      //melakukan pengulangan pada setiap elemen dalam array obstacles
      obstacle.y += obstacleSpeed; //memindahkan rintangan secara vertikal berdasarkan kecepatan rintangan.
      if (obstacle.y > canvas.height) {
        //memeriksa apakah rintangan melewati batas bawah kanvas. Jika ya, kode ini akan dijalankan.
        obstacle.y = lastObstacleY - obstacleHeight - obstacleGap; // mengatur posisi y rintangan ke atas kanvas.
        obstacle.x = Math.random() * (canvas.width - obstacleWidth); // mengatur posisi x rintangan ke posisi acak di kanvas.
        obstacle.type = Math.floor(Math.random() * 4) + 1; //mengatur tipe rintangan ke angka acak antara 1 dan 4.
        score += getScoreIncrement(); //menambahkan skor berdasarkan level permainan.
        document.getElementById("scoreAudio").play(); // memainkan efek suara skor.
      }

      if (collisionDetection(player, obstacle)) {
        // memeriksa apakah ada tabrakan antara pemain dan rintangan.
        gameOver = true; // mengatur gameOver ke true.
        updateHighScore(); // memperbarui skor tertinggi berdasarkan level permainan.
        cancelAnimationFrame(requestId); // membatalkan permintaan animasi frame.
        gamePaused = true; // mengatur gamePaused ke true.
        document.getElementById("restartBtn").style.display = "inline"; // menampilkan tombol restart.
        document.getElementById("gameOverAudio").play(); // memainkan efek suara game over.
        document.getElementById("gameBackSound").pause(); // menghentikan efek suara latar belakang.
        Swal.fire({
          title: "Game Over!",
          text: `Your score: ${score} \n High Score: ${getHighScore()}`,
          icon: "error",
          confirmButtonText: "Play Again",
          allowOutsideClick: false, // Mencegah menutup alert di luar kotak dialog
        });
      }
    });
  }
}

function collisionDetection(player, obstacle) {
  // digunakan untuk mendeteksi tabrakan antara pemain dan rintangan.
  return (
    // memeriksa apakah pemain dan rintangan bertabrakan.
    player.x < obstacle.x + obstacleWidth && // memeriksa apakah posisi x pemain kurang dari posisi x rintangan ditambah lebar rintangan.
    player.x + player.width > obstacle.x && // memeriksa apakah posisi x pemain ditambah lebar pemain lebih besar dari posisi x rintangan.
    player.y < obstacle.y + obstacleHeight && // memeriksa apakah posisi y pemain kurang dari posisi y rintangan ditambah tinggi rintangan.
    player.y + player.height > obstacle.y // memeriksa apakah posisi y pemain ditambah tinggi pemain lebih besar dari posisi y rintangan.
  );
}

function drawScore() {
  // digunakan untuk menggambar skor pemain dan skor tertinggi.
  ctx.fillStyle = "white"; // mengatur warna isi teks ke putih.
  ctx.font = "24px Arial"; // mengatur ukuran dan jenis font teks.
  ctx.textAlign = "end"; // mengatur teks agar rata kanan.
  ctx.fillText("Score: " + score, canvas.width - 10, 30); // menampilkan skor pemain.
  ctx.fillText(
    // menampilkan skor tertinggi berdasarkan level permainan.
    `High Score ${levelNow}: ` + getHighScore(), // menampilkan skor tertinggi berdasarkan level permainan.
    canvas.width - 10,
    60 // posisi x dan y teks.
  );
}

function resetGame() {
  // digunakan untuk mengatur ulang permainan.
  player.x = canvas.width / 2; // mengatur posisi x pemain ke tengah kanvas dikurangi 25.
  player.y = canvas.height; // mengatur posisi y pemain ke bagian bawah kanvas dikurangi 100.
  player.dx = 0; // mengatur perubahan posisi x pemain ke 0.
  player.dy = 0; // mengatur perubahan posisi y pemain ke 0.
  score = 0; // mengatur skor pemain ke 0.
  gameOver = false; // mengatur gameOver ke false.
  gamePaused = false; // mengatur gamePaused ke false.

  lastObstacleY = 0; // mengatur posisi y rintangan terakhir ke 0.
  obstacles.forEach((obstacle, index) => {
    // melakukan iterasi atau pengulangan pada setiap elemen dalam array obstacles.
    obstacle.y = -(obstacleHeight + obstacleGap) * index; // mengatur posisi y rintangan berdasarkan indeks rintangan.
    lastObstacleY = obstacle.y; // mengatur posisi y rintangan terakhir ke posisi y rintangan saat ini.
    obstacle.x = Math.random() * (canvas.width - obstacleWidth); // mengatur posisi x rintangan ke posisi acak di kanvas.
    obstacle.type = Math.floor(Math.random() * 4) + 1; // mengatur tipe rintangan ke angka acak antara 1 dan 4.
  });

  ctx.clearRect(0, 0, canvas.width, canvas.height); // membersihkan kanvas.
  document.getElementById("restartBtn").style.display = "none"; // menyembunyikan tombol restart.
  document.getElementById("levelSelection").style.display = "none"; // menyembunyikan pilihan level.
  update(); // memperbarui permainan.
}

function drawStartScreen() {
  // digunakan untuk menggambar layar awal permainan.
  ctx.clearRect(0, 0, canvas.width, canvas.height); // membersihkan kanvas.
  if (score >= 0 && gamePaused) {
    // memeriksa apakah skor pemain ada dan permainan dijeda.
    ctx.fillStyle = "white"; // mengatur warna isi teks ke putih.
    ctx.font = "24px Arial"; // mengatur ukuran dan jenis font teks.
    ctx.textAlign = "center"; // mengatur teks agar rata tengah.
    ctx.fillText(
      // menampilkan pesan teks.
      "Tekan spasi pada keyboard untuk memulai game",
      canvas.width / 2, // posisi x teks.
      canvas.height / 2 // posisi y teks.
    );
  }
}

function setObstacleSpeed(level) {
  // digunakan untuk mengatur kecepatan rintangan berdasarkan level permainan.
  switch (
    level // memeriksa level permainan.
  ) {
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
  // digunakan untuk mendapatkan peningkatan skor berdasarkan level permainan.
  switch (
    level // memeriksa level permainan.
  ) {
    case "easy": // jika level permainan mudah.
      return 1;
    case "medium": // jika level permainan sedang.
      return 2;
    case "hard": // jika level permainan sulit.
      return 3;
    default:
      return 0;
  }
}

function getHighScore() {
  // digunakan untuk mendapatkan skor tertinggi berdasarkan level permainan.
  switch (
    level // memeriksa level permainan.
  ) {
    case "easy":
      return highScoreEasy; // mengembalikan skor tertinggi level mudah.
    case "medium":
      return highScoreMedium; // mengembalikan skor tertinggi level sedang.
    case "hard":
      return highScoreHard; // mengembalikan skor tertinggi level sulit.
    default:
      return 0;
  }
}

function updateHighScore() {
  // digunakan untuk memperbarui skor tertinggi berdasarkan level permainan.
  switch (
    level // memeriksa level permainan.
  ) {
    case "easy":
      if (score > highScoreEasy) {
        // memeriksa apakah skor pemain lebih besar dari skor tertinggi level mudah.
        highScoreEasy = score; // mengatur skor tertinggi level mudah ke skor pemain.
        localStorage.setItem("highScoreEasy", highScoreEasy); // menyimpan skor tertinggi level mudah ke penyimpanan lokal.
      }
      break;
    case "medium":
      if (score > highScoreMedium) {
        // memeriksa apakah skor pemain lebih besar dari skor tertinggi level sedang.
        highScoreMedium = score; // mengatur skor tertinggi level sedang ke skor pemain.
        localStorage.setItem("highScoreMedium", highScoreMedium); // menyimpan skor tertinggi level sedang ke penyimpanan lokal.
      }
      break;
    case "hard":
      if (score > highScoreHard) {
        // memeriksa apakah skor pemain lebih besar dari skor tertinggi level sulit.
        highScoreHard = score; // mengatur skor tertinggi level sulit ke skor pemain.
        localStorage.setItem("highScoreHard", highScoreHard); // menyimpan skor tertinggi level sulit ke penyimpanan lokal.
      }
      break;
    default:
      break;
  }
}

document.getElementById("easyBtn").addEventListener("click", function () {
  // digunakan untuk menangani klik tombol level mudah.
  level = "easy";
  setObstacleSpeed(level); // mengatur kecepatan rintangan berdasarkan level permainan.
  resetGame(); // mengatur ulang permainan.
});

document.getElementById("mediumBtn").addEventListener("click", function () {
  // digunakan untuk menangani klik tombol level sedang.
  level = "medium";
  setObstacleSpeed(level); // mengatur kecepatan rintangan berdasarkan level permainan.
  resetGame(); // mengatur ulang permainan.
});

document.getElementById("hardBtn").addEventListener("click", function () {
  // digunakan untuk menangani klik tombol level sulit.
  level = "hard";
  setObstacleSpeed(level); // mengatur kecepatan rintangan berdasarkan level permainan.
  resetGame(); // mengatur ulang permainan.
});

document.getElementById("restartBtn").addEventListener("click", function () {
  // digunakan untuk menangani klik tombol restart.
  document.getElementById("restartBtn").style.display = "none"; // menyembunyikan tombol restart.
  document.getElementById("levelSelection").style.display = "block"; // menampilkan pilihan level.
  drawStartScreen(); // menggambar layar awal permainan.
});

function update() {
  // digunakan untuk memperbarui permainan.
  ctx.clearRect(0, 0, canvas.width, canvas.height); // membersihkan kanvas.
  if (gamePaused) {
    // memeriksa apakah permainan dijeda.
    drawStartScreen(); // menggambar layar awal permainan.
  } else {
    // jika permainan tidak dijeda.
    movePlayer(); // memindahkan pemain.
    drawPlayer(); // menggambar pemain.
    moveObstacles(); // memindahkan rintangan.
    drawObstacles(); // menggambar rintangan.
    drawScore(); // menggambar skor pemain dan skor tertinggi.
    requestId = requestAnimationFrame(update); // meminta animasi frame.
    document.getElementById("gameBackSound").play(); // memainkan efek suara latar belakang.
    ctx.fillStyle = "white"; // mengatur warna isi teks ke putih.
    ctx.font = "24px Arial"; // mengatur ukuran dan jenis font teks.
    ctx.textAlign = "end"; // mengatur teks agar rata kanan.
    ctx.fillText(
      // menampilkan level permainan.
      `High Score ${levelNow}: ` + getHighScore(), // menampilkan skor tertinggi berdasarkan level permainan.
      canvas.width - 10,
      60 // posisi x dan y teks.
    );
  }
}

document.addEventListener("keydown", function (event) {
  // menangani event keydown.
  if (event.key === " " && gamePaused) {
    // memeriksa apakah tombol spasi ditekan dan permainan dijeda.
    resetGame(); // mengatur ulang permainan.
  }

  if (!gameOver && !gamePaused) {
    // memeriksa apakah permainan belum berakhir dan tidak dijeda.
    if (event.key === "ArrowLeft") {
      // memeriksa apakah tombol panah kiri ditekan.
      player.dx = -player.speed; // mengatur perubahan posisi x pemain ke kecepatan pemain.
    } else if (event.key === "ArrowRight") {
      // memeriksa apakah tombol panah kanan ditekan.
      player.dx = player.speed; // mengatur perubahan posisi x pemain ke kecepatan pemain.
    } else if (event.key === "ArrowUp") {
      // memeriksa apakah tombol panah atas ditekan.
      player.dy = -player.speed; // mengatur perubahan posisi y pemain ke kecepatan pemain.
    } else if (event.key === "ArrowDown") {
      // memeriksa apakah tombol panah bawah ditekan.
      player.dy = player.speed; // mengatur perubahan posisi y pemain ke kecepatan pemain.
    }
  }
});

document.addEventListener("keyup", function (event) {
  // menangani event keyup.
  if (!gameOver && !gamePaused) {
    // memeriksa apakah permainan belum berakhir dan tidak dijeda.
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      // memeriksa apakah tombol panah kiri atau kanan dilepas.
      player.dx = 0; // mengatur perubahan posisi x pemain ke 0.
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      // memeriksa apakah tombol panah atas atau bawah dilepas.
      player.dy = 0; // mengatur perubahan posisi y pemain ke 0.
    }
  }
});

// Generate obstacles
for (let i = 0; i < 10; i++) {
  // melakukan iterasi atau pengulangan sebanyak 10 kali.
  obstacles.push({
    // menambahkan objek rintangan ke array obstacles.
    x: Math.random() * (canvas.width - obstacleWidth), // posisi x rintangan diatur ke posisi acak di kanvas.
    y: -(obstacleHeight + obstacleGap) * i, // posisi y rintangan diatur ke atas kanvas.
    type: Math.floor(Math.random() * 4) + 1, // tipe rintangan diatur ke angka acak antara 1 dan 4.
  });
}

update(); // memperbarui permainan.
