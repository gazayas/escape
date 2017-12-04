// TODO: オブジェクティブ指向で書いてください

var smallWindow = false;
var checkWindowSizeId = setInterval(function() { smallWindow = checkWindowSize(); }, 10);

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var backgroundColor = '#000';

var scoreTag = document.getElementById('score');
var levelTag = document.getElementById('level');

var dpad = document.getElementById('dPad');
var resetButton = document.getElementById('reset');

var escapeMp3 = new Audio('escape.mp3');
var bakuhatsu = new Audio('bakuhatsu.mp3')
escapeMp3.volume = 0.2;
bakuhatsu.volume = 0.15;

var level = 1;
var score = 0;
var filledIn = false; // For level design

var hero = null;

if(smallWindow) {
  hero['x'] = canvas.width / 2;
  hero['y'] = canvas.height / 2;
  resetButton.className = 'hidden-xs';
}

var enemies = [];
var enemyColor = 'blue';
var enemyMovement = 30;
var enemyDimensions = 10; // 幅と高さ

// TODO: 必要に応じてidを割り当ててください。いらないやつをそのままsetIntervalだけを定義したらいいかな
var moveId = false;
var moveEnemiesId = false;
var checkCollisionId = false;
var levelUpId = false;
var displayScoreId = false;
var displayLevelId = false;
var changeDesignId = false;

setInterval(function() { resetSongTime(); }, 20);

function checkWindowSize() {
  if(window.outerWidth < 800 && canvas.width != 370) {
    canvas.width = 370;
    canvas.height = 420;
    return true;
  } else {
    return false;
  } 
}

// TODO: classがsmだったら、canvasの幅を変えること
// これをsetIntervalで実現してください

function startGame() {
  hero = {
    'direction': false,
    'x': canvas.width / 2,
    'y': canvas.height / 2,
    'width': 10,
    'height': 10,
    'color': 'white',
    'velocity': 5,
    'score': 0
  };

  escapeMp3.play()

  // heroを描画する
  drawRect(canvas.width/2, canvas.height/2, 10, 10, hero['color']);
  for(var i = 0; i < 5; i++) { spawnEnemy(); }

  moveId = setInterval(function() { move(hero, hero['direction']); }, 20);
  moveEnemiesId = setInterval(function() { moveEnemies(); }, enemyMovement);
  checkCollisionId = setInterval(function() { checkCollision(); }, 1);
  levelUpId = setInterval(function() { levelUp(); }, 5000);
  displayScoreId = setInterval(function() { displayScore(); }, 100);
  displayLevelId = setInterval(function() { displayLevel(); }, 100);
  changeDesignId = setInterval(function() { changeDesign(); }, 100);
}

// TODO: なんかバグってる
// #initializeGameと#startGameを完成させてから、その二つの関数をここ入れるだけにしようかな
function resetGame() {
  escapeMp3.currentTime = 0;
  escapeMp3.play();

  dpad.className = 'col-xs-8 hidden-lg';
  resetButton.className = 'hidden-xs col-lg-2'
  backgroundColor = 'black';
  enemyColor = 'blue';

  clearInterval(moveId);
  clearInterval(moveEnemiesId);
  clearInterval(checkCollisionId);
  clearInterval(levelUpId);
  clearInterval(displayScoreId);
  

  ctx.fillStyle = 'black';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(0, 0, canvas.width, canvas.height);

  bakuhatsu = new Audio('bakuhatsu.mp3')

  level = 1;
  score = 0;
  scoreTag.innerHTML = '';

  hero = {
    'direction': false,
    'x': canvas.width / 2,
    'y': canvas.height / 2,
    'width': 10,
    'height': 10,
    'color': 'white',
    'velocity': 5,
    'score': 0
  };

  enemies = [];
  enemyMovement = 20;
  for(var i = 0; i < 5; i++) { spawnEnemy(); }

  // heroを描画する
  drawRect(canvas.width/2, canvas.height/2, hero['width'], hero['height'], hero['color']);
  moveId = setInterval(function() { move(hero, hero['direction']); }, 20);
  moveEnemiesId = setInterval(function() { moveEnemies(); }, enemyMovement);
  checkCollisionId = setInterval(function() { checkCollision(); }, 1);
  levelUpId = setInterval(function() { levelUp(); }, 5000);
  displayScoreId = setInterval(function() { displayScore(); }, 100);
}

function onKeyDown() {
  console.log(window.event.keyCode + "は押された");
  if(window.event.keyCode == 13) {
    console.log('エンターキーが押された');
    startGame();
  } else if (window.event.keyCode == 82) {
    console.log('"r"が押された');
    resetGame();
  }
  change_direction_of(hero, false);
}

function stop() {
  hero['direction'] = false;
}

function change_direction_of(object, collision) {
  if(collision == typeof(HTMLElement)) {
    alert(collision);
  }
  if(typeof(object['direction']) == 'number' || object['direction'] == false) {
    // 38 = up, 40 = down, 37 = left, 39 = right
    if(window.event.keyCode >= 37 && window.event.keyCode <= 40) {
      object['direction'] = window.event.keyCode;
      console.log("object[direction]: " + object['direction']);
    } else if (window.event.keyCode == 32) {
      object['direction'] = false;
    }
  } else {
    // TODO: on collision, random 方向に行くように。逆方向だけじゃなくて
    switch(object['direction']) {
      case 'up':
        object['direction'] = 'down';
        break;
      case 'right':
        object['direction'] = 'left';
        break;
      case 'down':
        object['direction'] = 'up';
        break;
      case 'left':
        object['direction'] = 'right';
        break;

      // With collision data
      case 'upRight':
        if(collision == 'up') {
          object['direction'] = 'downRight';
        } else {
          object['direction'] = 'upLeft';
        }
        break;
      case 'downRight':
        if(collision == 'down') {
          object['direction'] = 'upRight';  
        } else {
          object['direction'] = 'downLeft';
        }
        break;
      case 'downLeft':
        if(collision == 'left') {
          object['direction'] = 'downRight';  
        } else {
          object['direction'] = 'upLeft';
        }
        break;
      case 'upLeft':
        if(collision == 'left') {
          object['direction'] = 'upRight';
        } else {
          object['direction'] = 'downLeft';
        }
        break;
    }
  }
}

function move(object, direction) {
  if (object['direction'] == false || object['direction'] == 32 /* spacebar */) {
    // Do nothing/Stop
  } else {
    drawRect(object['x'], object['y'], object.width, object.height, backgroundColor);
    switch(direction) {
      case 40:
        object['y'] += object['velocity'];
        checkBoundaries(object);
        drawRect(object['x'], object['y'], object['width'], object['height'], object['color']);
        break;
      case 38:
        object['y'] -= object['velocity'];
        checkBoundaries(object);
        drawRect(object['x'], object['y'], object['width'], object['height'], object['color']);
        break;
      case 37:
        object['x'] -= object['velocity'];
        checkBoundaries(object);
        drawRect(object['x'], object['y'], object['width'], object['height'], object['color']);
        break;
      case 39:
        object['x'] += object['velocity'];
        checkBoundaries(object);
        drawRect(object['x'], object['y'], object['width'], object['height'], object['color']);
        break;
    }
  }
}

function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function checkBoundaries(object) {
  // 敵用の変数
  var hitWall = false;
  var collision = '';

  if (object['x'] < 0) {
    object['x'] += object['velocity'];
    hitWall = true
    collision = 'left';
  } else if (object['x'] > canvas.width - 10) {
    object['x'] -= object['velocity'];
    hitWall = true;
    collision = 'right'
  } else if (object['y'] < 0) {
    object['y'] += object['velocity'];
    hitWall = true;
    collision = 'up';
  } else if (object['y'] > canvas.height - 10) {
    object['y'] -= object['velocity'];
    hitWall = true;
    collision = 'bottom';
  }

  return {'hitWall': hitWall, 'collision': collision};
}

function rand(num) {
  return Math.floor(Math.random() * num);
}

function spawnEnemy() {
  var directions = ['up', 'upRight', 'right', 'downRight', 'down', 'downLeft', 'left', 'upLeft'];
  var enemy = {
    'direction': directions[rand(8)],
    'x': rand(canvas.width),
    'y': rand(canvas.height),
    'width': enemyDimensions,
    'height': enemyDimensions,
    'color': enemyColor,
    'velocity': 5
  }
  
  checkBoundaries(enemy);

  enemies.push(enemy);
  drawRect(enemy['x'], enemy['y'], enemy['width'], enemy['height'], enemy['color']);
}

function moveEnemies() {
  for(var i = 0; i < enemies.length; i++) {
    var hitWall = false;
    // console.log(enemies[i]['direction']);

    drawRect(enemies[i]['x'], enemies[i]['y'], enemies[i]['width'], enemies[i]['height'], backgroundColor);
    switch(enemies[i]['direction']) {
      case 'up':
        enemies[i]['y'] -= enemies[i]['velocity'];
        break;
      case 'upRight':
        enemies[i]['x'] += enemies[i]['velocity'];
        enemies[i]['y'] -= enemies[i]['velocity'];
        break;
      case 'right':
        enemies[i]['x'] += enemies[i]['velocity'];
        break;
      case 'downRight':
        enemies[i]['x'] += enemies[i]['velocity'];
        enemies[i]['y'] += enemies[i]['velocity'];
        break;
      case 'down':
        enemies[i]['y'] += enemies[i]['velocity'];
        break;
      case 'downLeft':
        enemies[i]['x'] -= enemies[i]['velocity'];
        enemies[i]['y'] += enemies[i]['velocity'];
        break;
      case 'left':
        enemies[i]['x'] -= enemies[i]['velocity'];
        break;
      case 'upLeft':
        enemies[i]['x'] -= enemies[i]['velocity'];
        enemies[i]['y'] -= enemies[i]['velocity'];
        break;
    }

    collisionData = checkBoundaries(enemies[i]);
    if(collisionData['hitWall']) { change_direction_of(enemies[i], collisionData['collision']); }

    drawRect(enemies[i]['x'], enemies[i]['y'], enemies[i]['width'], enemies[i]['height'], enemies[i]['color']);
  }
}

function checkCollision() {
  for(var i = 0; i < enemies.length; i++) {
    if(  // TODO: 同じロジックを使って敵を離れた場所で生成されるようにしてください
        (enemies[i]['x'] >= hero['x'] - 10) && (enemies[i]['x'] <= hero['x'] + 10)
        &&
        (enemies[i]['y'] >= hero['y'] - 10) && (enemies[i]['y'] <= hero['y'] + 10)
      ) {
      console.log('死んだよ');
      escapeMp3.pause();
      escapeMp3.currentTime = 0;
      bakuhatsu.play();
      gameOver();
    }
  }
}

function gameOver() {
  // STOP EVERYTHING
  clearInterval(moveId);
  clearInterval(moveEnemiesId);
  clearInterval(checkCollisionId);
  clearInterval(levelUpId);
  clearInterval(displayScoreId);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.style.backgroundColor = enemyColor;
  if(smallWindow) {
    dpad.className = 'hidden-xs hidden-lg';
    resetButton.className = 'col-xs-4';
  }
}

function levelUp() {
  level += 1;
  filledIn = false;
  // レベレ12で敵の生成を終える。それ以降、敵の動作が速くなるだけ
  if (level <= 12) {
    spawnEnemy();
    spawnEnemy();
  }

  if (level % 3 == 0) {
    clearInterval(moveEnemiesId);
    enemyMovement -= 0.5;
    moveEnemiesId = setInterval(function() { moveEnemies(); }, enemyMovement );
  }
}

function changeDesign() {
  if (level == 3 && !filledIn) {
    hero['color'] = 'blue';
    enemyColor = 'white';
    for(var i = 0; i < enemies.length; i++) { enemies[i]['color'] = enemyColor; }  
  } else if (level == 6 && !filledIn) {
    hero['color'] = 'green';
    enemyColor = 'gray';
    for(var i = 0; i < enemies.length; i++) { enemies[i]['color'] = enemyColor; }
  } else if (level == 9) {
    hero['color'] = 'Crimson';
    enemyColor = 'DarkCyan';
    for(var i = 0; i < enemies.length; i++) { enemies[i]['color'] = enemyColor; }
  } else if (level == 12) {
    hero['color'] = 'Chartreuse';
    enemyColor = 'Chartreuse';
    for(var i = 0; i < enemies.length; i++) { enemies[i]['color'] = enemyColor; }
  } else if (level == 15) {
    enemyDimensions = 25;
    for(var i = 0; i < enemies.length; i++) { enemies[i]['width'] = enemyDimensions; enemies[i]['height'] = enemyDimensions; }
  }

  filledIn = true;
}

function displayScore() {
  scoreTag.innerHTML = Number(scoreTag.innerHTML) + 1;
}

function displayLevel() {
  levelTag.innerHTML = level;
}

function resetSongTime() {
  console.log(escapeMp3.currentTime);
  if (escapeMp3.currentTime >= 45.1) {
    escapeMp3.currentTime = 0;
    escapeMp3.play();
  }
}

window.addEventListener('keydown', onKeyDown, false);
