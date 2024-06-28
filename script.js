const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let canvasPos = canvas.getBoundingClientRect();
canvas.width = 800;
canvas.height = (canvas.width * 9) / 16;

const bird = new Image();
const rock = new Image();
const playerBullet = new Image();
const enemyBullet = new Image();
const enemy = new Image();
const pause = document.getElementById("pause");
const restart = document.getElementById("restart");

//set intervals IDs
let rockGeneratorID;
let bulletGeneratorID;
let generateEnemiesID;
let generateRandomLocationID;
let generateEnemyBulletsID;
let generatePowerupsID;
let scoreGenerateID;

//setting images
bird.src = "src/player_frontface.png";
rock.src = "src/rock1.png";
playerBullet.src = "src/bullet.png";
enemyBullet.src = "src/enemyBullet2.png";
enemy.src = "src/enemy_frontface.png";

//blank arrays to store objects
let allRocks = [];
let allBullets = [];
let allEnemies = [];
let allPowerups = [];

//for powerups
let powerupSize = 50;
let powerupGenerateTime = 10000;

//for rocks
let speed = 0; //speed is variable with rock sizes so its default is set to 0
let rockGenerateTime = 2000; //in ms

//for bullets
let bulletSpeed = 10;
let enemyBulletSpeed = 5;
let bulletShootTime = 200; //in ms
let enemyBulletShootTime = 400; //in ms
let birdBulletDamage = 1;
let enemyBulletDamage = 1;

//for bird
let velocity_y = 0;
let velocity_x = 0;
let verticalForce = 0;
let horizontalForce = 0;
let birdHealth = 5;
let birdShield = 5;
let isMovingDown = false;
let isMovingUp = false;
let isMovingLeft = false;
let isMovingRight = false;

//for enemy
let enemySpeed = 0.3; //omni-directional
let enemyHealth = 5;
let enemyGenerateTime = 5000; //in ms
let randomLocationGenerateTime = 5000; //in ms

//global
let isPaused = false;
let gameOver = false;
let gameStart = false;
let keyIsUp = true;
let totalCoins = 0;
let score = 0;

bird.onload = () => {
  console.log("loaded");
  newBird.width = bird.width;
  newBird.height = bird.height;
  newBird.radius = bird.width / 2;
};
bird.onerror = () => {
  console.error("not loaded");
};
function startIntervals() {
  rockGeneratorID = setInterval(rockGenerator, rockGenerateTime);
  bulletGeneratorID = setInterval(bulletGenerator, bulletShootTime);
  generateEnemiesID = setInterval(generateEnemies, enemyGenerateTime);
  generateRandomLocationID = setInterval(
    generateRandomLocation,
    randomLocationGenerateTime
  );
  generateEnemyBulletsID = setInterval(
    generateEnemyBullets,
    enemyBulletShootTime
  );
  generatePowerupsID = setInterval(generatePowerups, powerupGenerateTime);
  scoreGenerateID = setInterval(() => score++, 1000);
}
function pauseIntervals() {
  clearInterval(rockGeneratorID);
  clearInterval(bulletGeneratorID);
  clearInterval(generateEnemiesID);
  clearInterval(generateRandomLocationID);
  clearInterval(generateEnemyBulletsID);
  clearInterval(generatePowerupsID);
  clearInterval(scoreGenerateID);
}

document.addEventListener("keydown", (event) => {
  keyIsUp = false;
  switch (event.key) {
    case "w":
    case "ArrowUp":
      isMovingUp = true;
      isMovingDown = false;
      if (newBird.shield > 0) bird.src = "src/player_leftface_shield.png";
      else bird.src = "src/player_leftface.png";
      break;
    case "s":
    case "ArrowDown":
      isMovingDown = true;
      isMovingUp = false;
      if (newBird.shield > 0) bird.src = "src/player_rightface_shield.png";
      else bird.src = "src/player_rightface.png";
      break;
    case "a":
    case "ArrowLeft":
      isMovingLeft = true;
      isMovingRight = false;

      break;
    case "d":
    case "ArrowRight":
      isMovingRight = true;
      isMovingLeft = false;
      if (newBird.shield > 0)
        bird.src = "src/player_frontface_move_forward_shield.png";
      else bird.src = "src/player_frontface_move_forward.png";
      break;
  }
});
document.addEventListener("keyup", (event) => {
  keyIsUp = true;
  if (newBird.shield > 0) bird.src = "src/player_frontface_shield.png";
  else bird.src = "src/player_frontface.png";
  switch (event.key) {
    case "w":
    case "ArrowUp":
      verticalForce = -0.5;
      isMovingUp = false;
      break;
    case "s":
    case "ArrowDown":
      isMovingDown = false;
      verticalForce = 0.5;
      break;
    case "a":
    case "ArrowLeft":
      isMovingLeft = false;
      horizontalForce = -0.5;
      break;
    case "d":
    case "ArrowRight":
      isMovingRight = false;
      horizontalForce = 0.5;
      break;

    case "r":
      location.reload();
      break;
  }
});
//pause button
pause.onclick = () => {
  if (isPaused) {
    isPaused = false;
    pause.innerText = "||";
    startIntervals();
  } else {
    isPaused = true;
    pause.innerText = "▶";
    pauseIntervals();
  }
};
//restart button
restart.onclick = () => location.reload();

//positioning pause and restart buttons
pause.style.top = `${canvasPos.y + 10}px`;
pause.style.left = `${canvas.width / 1.55 + canvasPos.x}px`;
restart.style.top = `${canvasPos.y + 10}px`;
restart.style.left = `${canvas.width / 1.65 + canvasPos.x}px`;

//rock constructor
function Rock(x, y, width, height, radius, dx, health) {
  //side--->from canvas.height/7 to canvas.height/1.5-newBird.radius
  this.x = x; //x------>canvas.width+side/2
  this.y = y; //y------>Math.floor(Math.random()*(canvas.height-(0-side)+1))
  this.width = width; //width-->Math.floor(Math.random()*(canvas.height/4-canvas.height/8+1))+canvas.height/8
  this.height = height; //height->Math.floor(Math.random()*(canvas.height/4-canvas.height/8+1))+canvas.height/8
  this.radius = radius;
  this.dx = dx; //dx----->speed
  this.health = health; //health->side*0.04
}
//rock generator
function rockGenerator() {
  let side =
    Math.floor(Math.random() * (canvas.height / 2 - canvas.height / 10 + 1)) +
    canvas.height / 10;
  speed = 100 / side; //generate rocks such that greater the size, lower is the speed
  let newRock = new Rock(
    canvas.width + side / 2,
    Math.floor(Math.random() * (canvas.height / 2 - (0 - side) + 1)),
    side,
    side,
    side / 2,
    speed,
    side * 0.04
  );
  allRocks.push(newRock);
}

//rock movement and draw
function rockMovement() {
  allRocks.forEach((element, index) => {
    element.x -= element.dx;
    //drawing the rock
    ctx.drawImage(
      rock,
      element.x - element.width / 2,
      element.y - element.height / 2,
      element.width,
      element.height
    );
    //deleting the rocks which are out of the screen
    if (element.x < -element.width) allRocks.splice(index, 1);
  });
}

//bird constructor
function Bird(x, y, width, height, radius, dy, dx, health, shield) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.dy = dy;
  this.dx = dx;
  this.radius = radius;
  this.health = health;
  this.shield = shield;
}
let newBird = new Bird(
  canvas.width / 6,
  canvas.height / 2,
  bird.width,
  bird.height,
  bird.width / 2,
  velocity_y,
  velocity_x,
  birdHealth,
  0
);

//bird movement
function birdMovement() {
  if (isMovingUp) verticalForce = -2.5;
  if (isMovingDown) verticalForce = 2.5;
  if (isMovingRight) horizontalForce = 2.5;
  if (isMovingLeft) horizontalForce = -2.5;

  newBird.y += verticalForce;
  newBird.x += horizontalForce;

  if (newBird.x > canvas.width - newBird.width)
    newBird.x = canvas.width - newBird.width;
  if (newBird.x < 0) newBird.x = 0;
  if (newBird.y > canvas.height - newBird.height)
    newBird.y = canvas.height - newBird.height;
  if (newBird.y < 0) newBird.y = 0;

  //drawing the bird
  ctx.drawImage(bird, newBird.x, newBird.y, newBird.width, newBird.height);
}

//bullet constructor
function Bullet(x, y, width, height, dx) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.dx = dx;
}
//bullet generator
function bulletGenerator() {
  let newBullet = new Bullet(
    newBird.x + newBird.width / 2,
    newBird.y,
    playerBullet.width,
    playerBullet.height,
    bulletSpeed
  );
  allBullets.push(newBullet);
}
//bullet movement and draw
function bulletMovement() {
  allBullets.forEach((element, index) => {
    element.x += bulletSpeed;
    ctx.drawImage(
      playerBullet,
      element.x,
      element.y,
      element.width,
      element.height
    );

    //deleting bullets out of the screen
    if (element.x > canvas.width) allBullets.splice(index, 1);
  });
}
//bullet collision
function checkCollision(
  bulletX,
  bulletY,
  bulletRadius,
  rockX,
  rockY,
  rockRadius
) {
  let distanceX = rockX - bulletX - bulletRadius;
  let distanceY = rockY - bulletY - bulletRadius;
  let distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  if (distance <= rockRadius) return true;
  return false;
}
//enemy constructor
function Enemy(
  x,
  y,
  width,
  height,
  speed,
  isShooting,
  allBullets,
  moveToX,
  moveToY,
  health
) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.speed = speed;
  this.isShooting = isShooting;
  this.allBullets = allBullets;
  this.moveToX = moveToX;
  this.moveToY = moveToY;
  this.health = health;
}
//function to generate enemies
function generateEnemies() {
  let newEnemy = new Enemy(
    canvas.width,
    Math.floor(Math.random() * (canvas.height - 100 + 1)),
    enemy.width,
    enemy.height,
    enemySpeed,
    false,
    [],
    0,
    generateRandomLocation(),
    enemyHealth
  );
  allEnemies.push(newEnemy);
}

//move enemies to random location
function enemyMoveTo() {
  allEnemies.forEach((element, index) => {
    ctx.drawImage(enemy, element.x, element.y, element.width, element.height);
    element.x -= enemySpeed;
    if (element.y > element.moveToY) element.y -= enemySpeed;
    else element.y += enemySpeed;

    //deleting enemies out of screen
    if (element.x < 0 - element.width) allEnemies.splice(index, 1);
  });
}
//generating random location for enemies
function generateRandomLocation() {
  allEnemies.forEach((enemy) => {
    enemy.moveToY = Math.floor(
      Math.random() * (canvas.height - enemy.height - 0 + 1)
    );
  });
}

//enemy bullets constructor
function EnemyBullet(x, y, width, height, dx) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.dx = dx;
}
//function to generate bullets for enemies
function generateEnemyBullets() {
  allEnemies.forEach((enemy) => {
    let newEnemyBullet = new EnemyBullet(
      enemy.x - enemy.width / 2,
      enemy.y,
      enemyBullet.width,
      enemyBullet.height,
      enemyBulletSpeed
    );
    enemy.allBullets.push(newEnemyBullet);
  });
}
//bullets movement in enemies
function enemyBulletMovement() {
  allEnemies.forEach((enemy) => {
    enemy.allBullets.forEach((bullet, index) => {
      bullet.x -= enemyBulletSpeed;
      ctx.drawImage(
        enemyBullet,
        bullet.x,
        bullet.y,
        bullet.width,
        bullet.height
      );
      //deleting bullets out of screen
      if (bullet.x < 0 - bullet.width) enemy.allBullets.splice(index, 1);
    });
  });
}
let bgImages = []; // Array to store background images
let bgSpeeds = [0.2, 5, 0.4]; // Speeds for parallax effect
let bgPositions = [0, 0, 0]; // Initial positions for backgrounds

// Load background images
function loadBackgroundImages() {
  for (let i = 0; i < 3; i++) {
    let bgImage = new Image();
    if (i == 0) bgImage.src = "src/nebulawetstars.png";
    else if (i == 1) bgImage.src = "src/nebuladrystars.png";
    else if (i == 2) bgImage.src = "src/nebula2.png";
    bgImages.push(bgImage);
  }
}

// Move backgrounds
function moveBackgrounds() {
  for (let i = 0; i < bgImages.length; i++) {
    bgPositions[i] -= bgSpeeds[i]; // Move the background backward
    if (bgPositions[i] <= -canvas.width) {
      // If the background goes off the screen, reset its position to the right edge
      bgPositions[i] = 0;
    }
  }
}

// Draw backgrounds
function drawBackgrounds() {
  for (let i = 0; i < bgImages.length; i++) {
    ctx.drawImage(bgImages[i], bgPositions[i], 0, canvas.width, canvas.height);
    ctx.drawImage(
      bgImages[i],
      bgPositions[i] + canvas.width,
      0,
      canvas.width,
      canvas.height
    );
    ctx.drawImage(bgImages[i], bgPositions[i], 0, canvas.width, canvas.height);
  }
}

//powerups constructor
function Powerup(x, y, side, type, img) {
  this.x = x;
  this.y = y;
  this.side = side;
  this.type = type;
  this.img = img;
}
//powerups generator
function generatePowerups() {
  let randomType = Math.floor(Math.random() * (2 - 0 + 1)); //generate powerups from 0 to 2(excluding 3 which is a coin)
  let newPowerup = new Powerup(
    canvas.width,
    Math.floor(Math.random() * (canvas.height - powerupSize + 1)),
    powerupSize,
    powerupsArray[randomType].name,
    powerupsArray[randomType].image
  );
  allPowerups.push(newPowerup);
}
//draw powerups
function drawPowerups() {
  allPowerups.forEach((powerup) => {
    let powerupImg = new Image();
    powerupImg.src = powerup.img;
    powerup.x--;
    ctx.drawImage(powerupImg, powerup.x, powerup.y, powerup.side, powerup.side);
  });
}

let powerupsArray = [
  {
    name: "health",
    image: "src/powerup/health.png",
  },
  {
    name: "shield",
    image: "src/powerup/shield2.png",
  },
  {
    name: "upgradeBullet",
    image: "src/powerup/upgrade.png",
  },
  {
    name: "coin",
    image: "src/goldCoin/goldCoin5.png",
  },
];

let uiLength = 400;
let uiGap = 10;
//health UI
function drawHealth() {
  let UIheight = 10;
  if (newBird.health < 0) newBird.health = 0;
  //empty health bar
  ctx.beginPath();
  ctx.fillStyle = "#8B0000";
  ctx.moveTo(powerupSize / 2, UIheight);
  ctx.lineTo(powerupSize / 2 + uiLength, UIheight);
  ctx.lineTo(uiLength - powerupSize / 2, UIheight + 15); ////\\\\
  ctx.lineTo(powerupSize / 2, UIheight + 15);
  ctx.strokeStyle = "#8B0000";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  //filled health bar
  if (newBird.health > 0.1) {
    //beyond 0.1 the shield bar goes berserk
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.moveTo(powerupSize / 2, UIheight + 1);
    ctx.lineTo(
      powerupSize / 2 + (newBird.health / birdHealth) * uiLength,
      UIheight + 1
    );
    ctx.lineTo(
      (newBird.health / birdHealth) * uiLength - powerupSize / 2,
      UIheight + 14
    );
    ctx.lineTo(powerupSize / 2, UIheight + 14);
    ctx.fill();
    ctx.closePath();
  }

  //drawing health icon
  let healthImg = new Image();
  healthImg.src = "src/powerup/health.png";
  ctx.drawImage(
    healthImg,
    0 + 5,
    0 - 2,
    powerupSize * 0.65,
    powerupSize * 0.65
  );
}
//shield UI
function drawShield() {
  let UIheight = 30;
  //empty shield bar
  ctx.beginPath();
  ctx.fillStyle = "#1b003d";
  ctx.moveTo(powerupSize / 2, UIheight);
  ctx.lineTo(uiLength - uiGap - powerupSize / 2, UIheight);
  ctx.lineTo(uiLength - (3 * powerupSize) / 2 - uiGap, UIheight + 15);
  ctx.lineTo(powerupSize / 2, UIheight + 15);
  ctx.strokeStyle = "#1b003d";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fill();
  ctx.closePath();
  //filled shield bar
  if (newBird.shield > 0.7) {
    //beyond 0.7 the shield bar goes berserk
    ctx.beginPath();
    ctx.fillStyle = "#2596be";
    ctx.moveTo(powerupSize / 2, UIheight + 1);
    ctx.lineTo(
      (newBird.shield / birdShield) * uiLength - uiGap - powerupSize / 2,
      UIheight
    );
    ctx.lineTo(
      (newBird.shield / birdShield) * uiLength - (3 * powerupSize) / 2 - uiGap,
      UIheight + 14
    );
    ctx.lineTo(powerupSize / 2, UIheight + 14);
    ctx.fill();
    ctx.closePath();
  }
  //drawing shield icon
  let shieldImg = new Image();
  shieldImg.src = "src/powerup/shield2.png";
  ctx.drawImage(shieldImg, 0 - 2, UIheight / 2 - 2, powerupSize, powerupSize);
}
//coins UI
function drawCoins() {
  let UIheight = 50;

  ctx.beginPath();

  ctx.beginPath();
  ctx.fillStyle = "#FFBF00";
  ctx.moveTo(powerupSize / 2, UIheight);
  ctx.lineTo(uiLength - powerupSize - 20 - 3 * uiGap, UIheight);
  ctx.lineTo(uiLength - 3 * powerupSize - 10 - 3 * uiGap, UIheight + 20);
  ctx.lineTo(powerupSize / 2, UIheight + 20);
  ctx.fill();
  ctx.closePath();
  ctx.closePath();

  let goldCoinImg = new Image();
  goldCoinImg.src = "src/goldCoin/goldCoin5.png";
  ctx.drawImage(
    goldCoinImg,
    0 + 2,
    UIheight - 10,
    powerupSize * 0.8,
    powerupSize * 0.8
  );
  ctx.font = `bold ${25}px Arial`;
  ctx.fillStyle = "black";
  ctx.fillText(totalCoins, powerupSize * 0.7, UIheight + 18);
}
//score UI
function drawScore() {
  let UIheight = canvas.height - powerupSize + 20;
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0)"; //transparent style
  ctx.lineWidth = 0.5; //sets width of stroke line
  ctx.setLineDash([1, 1]); //[dash_length, gap_length]
  ctx.moveTo(powerupSize / 2, UIheight);
  ctx.lineTo(uiLength - powerupSize / 2 - 2 * uiGap, UIheight);
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  //drawing score icon
  let scoreImg = new Image();
  scoreImg.src = "src/star.png";
  ctx.drawImage(
    scoreImg,
    0 - 10,
    UIheight - 20,
    powerupSize * 1.3,
    powerupSize * 1.3
  );

  //display score
  ctx.font = "25px Ariel";
  ctx.fillStyle = "white";
  ctx.fillText(score, powerupSize - 10, UIheight + 22);
}

//game loop
function gameLoop() {
  if (!gameOver) {
    if (!isPaused) {
      moveBackgrounds(); //moving background function
      drawBackgrounds(); //drawing backgrounds
      rockMovement(); //rock movement function
      birdMovement(); //bird movement function
      bulletMovement(); //bullet movement function
      enemyMoveTo(); //enemy random movement function
      enemyBulletMovement(); //enemy bullet movement function
      drawPowerups(); //drawing powerups
      //UI
      drawHealth();
      drawShield();
      drawScore();
      drawCoins();

      allRocks.forEach((rock, i) => {
        let rockX = rock.x,
          rockY = rock.y;
        //rock collision check with bird
        if (
          checkCollision(
            newBird.x,
            newBird.y,
            newBird.radius,
            rock.x,
            rock.y,
            rock.radius
          )
        ) {
          if (newBird.shield <= 0) {
            //very straightforward
            allRocks.splice(i, 1);
            newBird.health = 0;
          } else {
            allRocks.splice(i, 1);
            newBird.shield = 0;
          }
        }
        //rock collision check with bullets
        allBullets.forEach((element, index) => {
          if (
            checkCollision(
              element.x,
              element.y,
              element.width / 2,
              rock.x,
              rock.y,
              rock.radius
            )
          ) {
            //decreasing rock health
            rock.health -= birdBulletDamage;
            //bullets disappearing when colliding with rocks
            allBullets.splice(index, 1);
          }
        });
        //rocks destroyed when health below zero
        if (rock.health <= 0) {
          allRocks.splice(i, 1);
          //generate a coin when rocks broken
          //let randomType=Math.floor(Math.random()*(3-0+1));
          let newPowerup = new Powerup(
            rockX,
            rockY,
            powerupSize,
            powerupsArray[3].name,
            powerupsArray[3].image
          );
          allPowerups.push(newPowerup);
        }
      });

      allEnemies.forEach((enemy, i) => {
        //enemy collision check with bullets
        allBullets.forEach((bullet, index) => {
          if (
            checkCollision(
              bullet.x,
              bullet.y,
              bullet.width / 2,
              enemy.x,
              enemy.y + enemy.height / 2,
              enemy.height / 1.5
            )
          ) {
            //decreasing rock enemy
            enemy.health -= birdBulletDamage;
            //bullets disappearing when colliding with enemies
            allBullets.splice(index, 1);
            //debug
            console.log("enemy is hit");
          }
        });
        //bird health reduced to half and enemy destroyed when the bird collides with enemy
        if (
          checkCollision(
            newBird.x,
            newBird.y,
            newBird.width / 2,
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2,
            enemy.height
          )
        ) {
          //damage done is 'birdHealth/2'
          if (newBird.shield > 0) newBird.shield -= birdHealth / 2;
          else newBird.health -= birdHealth / 2;
          enemy.health = 0;
          birdBulletDamage--;
        }
        //enemy destroyed when health below zero
        if (enemy.health <= 0) allEnemies.splice(i, 1);
      });

      //bird collision with bullets
      allEnemies.forEach((enemy) => {
        enemy.allBullets.forEach((bullet, index) => {
          if (
            checkCollision(
              newBird.x,
              newBird.y - newBird.height / 2,
              newBird.height / 2,
              bullet.x,
              bullet.y,
              bullet.height / 2
            )
          ) {
            //bullets disappearing when colliding with enemies
            enemy.allBullets.splice(index, 1);
            if (newBird.shield > 0) newBird.shield -= enemyBulletDamage;
            else newBird.health -= enemyBulletDamage;
          }
          if (newBird.health <= 0) gameOver = true;
        });
      });
      //bullet collision with bullets
      allBullets.forEach((element, i) => {
        allEnemies.forEach((enemy) => {
          enemy.allBullets.forEach((bullet, index) => {
            if (
              checkCollision(
                element.x,
                element.y - element.height / 2,
                element.height / 2,
                bullet.x,
                bullet.y,
                bullet.height / 2
              )
            ) {
              enemy.allBullets.splice(index, 1);
              allBullets.splice(i, 1);
            }
          });
        });
      });

      //bird collision with powerups
      allPowerups.forEach((powerup, index) => {
        if (
          checkCollision(
            newBird.x,
            newBird.y - newBird.height / 2,
            newBird.height / 2,
            powerup.x,
            powerup.y,
            powerup.side
          )
        ) {
          console.log("powerup is hit"); //for debug
          //the powerup is deleted
          allPowerups.splice(index, 1);
          //actions for specific powerups
          if (powerup.type == "health") {
            newBird.health += 0.75 * birdHealth;
            if (newBird.health > 5) newBird.health = 5;
          }
          if (powerup.type == "upgradeBullet") {
            birdBulletDamage++;
            switch (birdBulletDamage) {
              case 2:
                playerBullet.src = "src/double_bullet.png";
                break;
              case 3:
                playerBullet.src = "src/triple_bullet.png";
            }
          }
          if (powerup.type == "coin") {
            totalCoins++;
          }
          if (powerup.type == "shield") {
            newBird.shield = birdShield;
          }
        }
      });

      //redrawing the health bar coz it wont update if the player is ded
      if (newBird.health <= 0) {
        newBird.health = 0;
        drawHealth();
        gameOver = true;
      }
      //frontfacing shield and non-shield image toggler
      if (keyIsUp) {
        if (newBird.shield > 0) bird.src = "src/player_frontface_shield.png";
        else bird.src = "src/player_frontface.png";
      }
    }
  }
  console.log(newBird.health);
  requestAnimationFrame(gameLoop);
}
loadBackgroundImages();
gameLoop();
startIntervals();
