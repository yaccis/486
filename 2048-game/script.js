const SIZE = 4;
const WIN_TILE = 2048;
let board = [];
let score = 0;
let bestScore = Number(localStorage.getItem('2048-best-score') || 0);
let gameOver = false;
let won = false;

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const messageEl = document.getElementById('message');
const newGameBtn = document.getElementById('new-game-btn');

function initBoard() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  score = 0;
  gameOver = false;
  won = false;
  messageEl.classList.add('hidden');
  messageEl.textContent = '';
  addRandomTile();
  addRandomTile();
  updateBoard();
}

function getEmptyCells() {
  const empty = [];
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] === 0) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
}

function addRandomTile() {
  const emptyCells = getEmptyCells();
  if (!emptyCells.length) return;
  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  board[row][col] = Math.random() < 0.9 ? 2 : 4;
}

function updateBoard() {
  boardEl.innerHTML = '';
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row][col];
      const cell = document.createElement('div');
      cell.className = `cell ${value === 0 ? 'empty' : ''}`;
      cell.dataset.value = value || 0;
      cell.textContent = value === 0 ? '' : value;
      boardEl.appendChild(cell);
    }
  }

  scoreEl.textContent = String(score);
  bestScoreEl.textContent = String(bestScore);
}

function slideAndMerge(line) {
  const filtered = line.filter((v) => v !== 0);
  const merged = [];

  for (let i = 0; i < filtered.length; i += 1) {
    if (filtered[i] !== 0 && filtered[i] === filtered[i + 1]) {
      const mergedValue = filtered[i] * 2;
      merged.push(mergedValue);
      score += mergedValue;
      bestScore = Math.max(bestScore, score);
      localStorage.setItem('2048-best-score', String(bestScore));
      i += 1;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < SIZE) {
    merged.push(0);
  }

  return merged;
}

function move(direction) {
  if (gameOver) return;

  const original = board.map((row) => [...row]);
  let moved = false;

  if (direction === 'left' || direction === 'right') {
    for (let row = 0; row < SIZE; row += 1) {
      let line = [...board[row]];
      if (direction === 'right') {
        line.reverse();
      }
      const mergedLine = slideAndMerge(line);
      const finalLine = direction === 'right' ? mergedLine.reverse() : mergedLine;
      board[row] = finalLine;
      if (JSON.stringify(board[row]) !== JSON.stringify(line)) {
        moved = true;
      }
    }
  } else {
    for (let col = 0; col < SIZE; col += 1) {
      const line = [];
      for (let row = 0; row < SIZE; row += 1) {
        line.push(board[row][col]);
      }
      const processedLine = direction === 'down' ? slideAndMerge([...line].reverse()).reverse() : slideAndMerge(line);
      for (let row = 0; row < SIZE; row += 1) {
        board[row][col] = processedLine[row];
      }
      if (JSON.stringify(board.map((row) => row[col])) !== JSON.stringify(line)) {
        moved = true;
      }
    }
  }

  if (!moved) {
    if (isBoardFull()) {
      checkGameStatus();
    }
    return;
  }

  if (hasTile(WIN_TILE)) {
    won = true;
    messageEl.textContent = '恭喜！你达到了 2048 ！';
    messageEl.classList.remove('hidden');
  }

  addRandomTile();
  updateBoard();
  checkGameStatus();
}

function isBoardFull() {
  return getEmptyCells().length === 0;
}

function hasTile(value) {
  return board.some((row) => row.some((cell) => cell === value));
}

function checkGameStatus() {
  if (hasTile(WIN_TILE) && !won) {
    won = true;
    messageEl.textContent = '恭喜！你达到了 2048 ！';
    messageEl.classList.remove('hidden');
  }

  if (isBoardFull() && !canMove()) {
    gameOver = true;
    messageEl.textContent = '游戏结束，点击新游戏再来一局！';
    messageEl.classList.remove('hidden');
  }
}

function canMove() {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const value = board[row][col];
      if (value === 0) return true;
      if (row < SIZE - 1 && board[row + 1][col] === value) return true;
      if (col < SIZE - 1 && board[row][col + 1] === value) return true;
    }
  }
  return false;
}

function onKeyDown(event) {
  const keyMap = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    a: 'left',
    d: 'right',
    w: 'up',
    s: 'down',
  };

  const direction = keyMap[event.key];
  if (!direction) return;

  event.preventDefault();
  move(direction);
}

function getTouchStart(event) {
  const touch = event.changedTouches[0];
  return { x: touch.clientX, y: touch.clientY };
}

let touchStart = null;

function onTouchStart(event) {
  touchStart = getTouchStart(event);
}

function onTouchEnd(event) {
  if (!touchStart) return;

  const touchEnd = getTouchStart(event);
  const deltaX = touchEnd.x - touchStart.x;
  const deltaY = touchEnd.y - touchStart.y;

  if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
    touchStart = null;
    return;
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    move(deltaX > 0 ? 'right' : 'left');
  } else {
    move(deltaY > 0 ? 'down' : 'up');
  }

  touchStart = null;
}

document.addEventListener('keydown', onKeyDown);
boardEl.addEventListener('touchstart', onTouchStart, { passive: true });
boardEl.addEventListener('touchend', onTouchEnd, { passive: true });
newGameBtn.addEventListener('click', initBoard);

bestScoreEl.textContent = String(bestScore);
initBoard();
