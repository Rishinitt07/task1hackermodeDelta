












































const board = document.getElementById('board');
const timer1Element = document.getElementById('timer1');
const timer2Element = document.getElementById('timer2');
const pauseButton = document.getElementById('pause');
const resumeButton = document.getElementById('resume');
const resetButton = document.getElementById('reset');
const moveRotatePopup = document.getElementById('move-rotate-popup');
const rotatePopup = document.getElementById('rotate-popup');
const moveButton = document.getElementById('move-button');
const rotateButton = document.getElementById('rotate-button');
const rotateRightButton = document.getElementById('rotate-right-button');
const rotateLeftButton = document.getElementById('rotate-left-button');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');


let timer1 = 300;
let timer2 = 300;
let currentPlayer = 1;
let interval;
let isPaused = false;

let selectedPiece = null;
let currentPieceElement = null;

const initialPositions = {
    player1: {
        titan: [0, 1],
        tank: [0, 2],
        ricochet: [0, 3],
        semirecochet: [0, 4],
        cannon: [0, 5]
    },
    player2: {
        titan: [7, 1],
        tank: [7, 2],
        ricochet: [7, 3],
        semirecochet: [7, 4],
        cannon: [7, 5]
    }
};

const pieceNames = {
    titan: 'Titan',
    tank: 'Tank',
    ricochet: 'Ricochet',
    semirecochet: 'Semi Ricochet',
    cannon: 'Cannon'
};

// building the board
function createBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            board.appendChild(cell);
        }
    }
    placePieces();
}


function placePieces() {
    const player1Pieces = initialPositions.player1;
    const player2Pieces = initialPositions.player2;

    placePiece(player1Pieces.titan, 'titan', 1);
    placePiece(player1Pieces.tank, 'tank', 1);
    placePiece(player1Pieces.ricochet, 'ricochet', 1);
    placePiece(player1Pieces.semirecochet, 'semirecochet', 1);
    placePiece(player1Pieces.cannon, 'cannon', 1);

    placePiece(player2Pieces.titan, 'titan', 2);
    placePiece(player2Pieces.tank, 'tank', 2);
    placePiece(player2Pieces.ricochet, 'ricochet', 2);
    placePiece(player2Pieces.semirecochet, 'semirecochet', 2);
    placePiece(player2Pieces.cannon, 'cannon', 2);
}

function placePiece(position, pieceType, player) {
    const cell = document.querySelector(`.cell[data-row="${position[0]}"][data-col="${position[1]}"]`);
    const piece = document.createElement('div');
    piece.classList.add('piece', `player${player}`);
    piece.dataset.type = pieceType;
    piece.dataset.row = position[0];
    piece.dataset.col = position[1];
    piece.dataset.player = player;
    piece.textContent = pieceNames[pieceType];
    if (pieceType === 'semirecochet' || pieceType === 'ricochet') {
        piece.textContent = '';
        piece.classList.add(pieceType);
    }


    const cannonSound = document.createElement('audio');
    cannonSound.src = 'bulletmusic.mp3'; // Replace with your audio file path
    cannonSound.preload = 'auto';
    if (pieceType === 'cannon') {
        piece.addEventListener('click', () => {
            cannonSound.play();
        });
    }    



  



    piece.addEventListener('click', (event) => handlePieceClick(event, piece, [position[0], position[1]]));
    

    cell.appendChild(piece);
}

function handlePieceClick(event, piece, position) {
    event.stopPropagation(); 
    currentPieceElement = piece;
    
    if (piece.dataset.type === 'ricochet' || piece.dataset.type === 'semirecochet') {
        showMoveRotatePopup(event.clientX, event.clientY);
    } else {
        showPossibleMoves(piece, position);
    }
}

function showMoveRotatePopup(x, y) {
    moveRotatePopup.style.left = `${x}px`;
    moveRotatePopup.style.top = `${y}px`;
    moveRotatePopup.style.display = 'block';
}

function movePiece(event) {
    const targetCell = event.currentTarget;
    const { piece, position } = selectedPiece;



    logMove(piece, position, [parseInt(targetCell.dataset.row), parseInt(targetCell.dataset.col)]);

    
    const originalCell = document.querySelector(`.cell[data-row="${position[0]}"][data-col="${position[1]}"]`);
    originalCell.removeChild(piece);
    
    
    targetCell.appendChild(piece);

    
    const newRow = parseInt(targetCell.dataset.row);
    const newCol = parseInt(targetCell.dataset.col);
    piece.dataset.row = newRow;
    piece.dataset.col = newCol;

    
    clearPossibleMoves();

   
    piece.addEventListener('click', (event) => handlePieceClick(event, piece, [newRow, newCol]));
    currentPlayer = currentPlayer === 1 ? 2 : 1;
}

function logMove(piece, fromPosition, toPosition) {
    const player = piece.dataset.player === "1" ? "Player 1 (Red)" : "Player 2 (Blue)";
    const pieceName = pieceNames[piece.dataset.type];
    const from = `[${fromPosition[0]}, ${fromPosition[1]}]`;
    const to = `[${toPosition[0]}, ${toPosition[1]}]`;
    const moveText = `${player} ${pieceName} from ${from} to ${to}`;

    const historyList = document.getElementById('historyList');
    const listItem = document.createElement('li');
    listItem.textContent = moveText;
    historyList.appendChild(listItem);
    moveHistory.push({ piece, from: fromPosition, to: toPosition });
    redoStack = [];
}


let moveHistory = [];
let redoStack = [];


function undoMove() {
    if (moveHistory.length > 0) {
        const lastMove = moveHistory.pop();
        redoStack.push(lastMove);

        const piece = lastMove.piece;
        const fromPosition = lastMove.from;
        const toPosition = lastMove.to;

        const fromCell = document.querySelector(`.cell[data-row="${fromPosition[0]}"][data-col="${fromPosition[1]}"]`);
        const toCell = document.querySelector(`.cell[data-row="${toPosition[0]}"][data-col="${toPosition[1]}"]`);

        toCell.removeChild(piece);
        fromCell.appendChild(piece);

        piece.dataset.row = fromPosition[0];
        piece.dataset.col = fromPosition[1];

        currentPlayer = currentPlayer === 1 ? 2 : 1;
    }
}

function redoMove() {
    if (redoStack.length > 0) {
        const lastRedoMove = redoStack.pop();
        moveHistory.push(lastRedoMove);

        const piece = lastRedoMove.piece;
        const fromPosition = lastRedoMove.from;
        const toPosition = lastRedoMove.to;

        const fromCell = document.querySelector(`.cell[data-row="${fromPosition[0]}"][data-col="${fromPosition[1]}"]`);
        const toCell = document.querySelector(`.cell[data-row="${toPosition[0]}"][data-col="${toPosition[1]}"]`);

        fromCell.removeChild(piece);
        toCell.appendChild(piece);

        piece.dataset.row = toPosition[0];
        piece.dataset.col = toPosition[1];

        currentPlayer = currentPlayer === 1 ? 2 : 1;
    }
}

undoButton.addEventListener('click', undoMove);
redoButton.addEventListener('click', redoMove);

function rotatePiece(piece, direction) {
    const currentRotation = parseInt(piece.dataset.rotation || 0);
    const newRotation = direction === 'right' ? currentRotation + 90 : currentRotation - 90;
    piece.dataset.rotation = newRotation;
    piece.style.transform = `rotate(${newRotation}deg)`;
}
function showRotatePopup(x, y) {
    rotatePopup.style.left = `${x}px`;
    rotatePopup.style.top = `${y}px`;
    rotatePopup.style.display = 'block';
}

function rotateRight() {
    rotatePiece(currentPieceElement, 'right');
}

function rotateLeft() {
    rotatePiece(currentPieceElement, 'left');
}

rotateButton.addEventListener('click', (event) => {
    moveRotatePopup.style.display = 'none';
    showRotatePopup(event.clientX, event.clientY);
});

moveButton.addEventListener('click', () => {
    moveRotatePopup.style.display = 'none';
    showPossibleMoves(currentPieceElement, [parseInt(currentPieceElement.dataset.row), parseInt(currentPieceElement.dataset.col)]);
});

rotateRightButton.addEventListener('click', () => {
    rotatePopup.style.display = 'none';
    rotateRight();
});

rotateLeftButton.addEventListener('click', () => {
    rotatePopup.style.display = 'none';
    rotateLeft();
});


function showPossibleMoves(piece, position) {
    clearPossibleMoves();

    selectedPiece = { piece, position };

    const [row, col] = position;
    let possibleMoves = [];

    if (piece.dataset.type === 'cannon') {
       
        for (let r = 0; r < 8; r++) {
            if (r !== row) {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${col}"]`);
                cell.classList.add('bullet-path');
            }
        }
        const bullet = document.createElement('div');
        bullet.classList.add('bullet');
        piece.appendChild(bullet);

      
        possibleMoves = [
            [row, col - 1], [row, col + 1]
        ];

        
        moveBullet(piece);
    } else {
        possibleMoves = [
            [row - 1, col - 1], [row - 1, col], [row - 1, col + 1],
            [row, col - 1], [row, col + 1],
            [row + 1, col - 1], [row + 1, col], [row + 1, col + 1]
        ];
    }

    possibleMoves.forEach(([r, c]) => {
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (cell && !cell.querySelector('.piece')) {
                cell.classList.add('possible-move');
                cell.addEventListener('click', movePiece);
            }
        }
    });
}


function moveBullet(piece) {
    const startRow = parseInt(piece.dataset.row);
    const startCol = parseInt(piece.dataset.col);
    const player = parseInt(piece.dataset.player);

    const bullet = piece.querySelector('.bullet');
    if (!bullet) return;

    let currentRow = startRow;
    let currentCol = startCol;
    let direction = player === 1 ? 1 : -1; 
    let isVertical = true; 

    bullet.dataset.direction = 'vertical'; 

    function animateBullet() {
        let nextRow = currentRow + (isVertical ? direction : 0);
        let nextCol = currentCol + (!isVertical ? direction : 0);

        bullet.style.transform = `translateY(${(nextRow - startRow) * 50}px) translateX(${(nextCol - startCol) * 50}px)`;
        currentRow = nextRow;
        currentCol = nextCol;

        if (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
            const nextCell = document.querySelector(`.cell[data-row="${nextRow}"][data-col="${nextCol}"]`);

            if (nextCell && nextCell.querySelector('.piece')) {
                const hitPiece = nextCell.querySelector('.piece');
                const rotation = parseInt(hitPiece.dataset.rotation || 0) % 360;

                if (hitPiece.dataset.type === 'semirecochet') {
                    if (!isVertical) {
                       
                        if (direction === -1) { // Horizontal +
                            switch (rotation) {
                                case 0:
                                    isVertical = true;
                                    direction = 1;
                                    break;
                                case 90:
                                case 180:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                                case 270:
                                    isVertical = true;
                                    direction = -1;
                                    break;
                            }
                            switch (-rotation) {
                                case 0:
                                    isVertical = true;
                                    direction = 1;
                                    break;
                                case 270:
                                case 180:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                                case 90:
                                    isVertical = true;
                                    direction = -1;
                                    break;
                            }
                        } else { // Horizontal -
                            switch (rotation) {
                                case 0:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                                case 90:
                                    isVertical = true;
                                    direction = 1;
                                    break;
                                case 180:
                                    isVertical = true;
                                    direction = -1;
                                    break;
                                case 270:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                            }
                            switch (-rotation) {
                                case 0:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                                case 270:
                                    isVertical = true;
                                    direction = 1;
                                    break;
                                case 180:
                                    isVertical = true;
                                    direction = -1;
                                    break;
                                case 90:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                            }
                        }
                    } else {
                       
                        if (direction === 1) { // Vertical +
                            switch (rotation) {
                                case 0:
                                case 90:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                                case 180:
                                    isVertical = false;
                                    direction = -1;
                                    break;
                                case 270:
                                    isVertical = false;
                                    direction = 1;
                                    break;
                            }
                            switch (-rotation) {
                                case 0:
                                case 270:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                                case 180:
                                    isVertical = false;
                                    direction = -1;
                                    break;
                                case 90:
                                    isVertical = false;
                                    direction = 1;
                                    break;
                            }
                        } 
                        
                        
                        else { // Vertical -
                            switch (rotation) {
                                case 270:
                                case 180:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                                case 90:
                                    isVertical = false;
                                    direction = -1;
                                    break;
                                case 0:
                                    isVertical = false;
                                    direction = 1;
                                    break;
                            }
                            switch (-rotation) {
                                case 90:
                                case 180:
                                    bullet.parentNode.removeChild(bullet);
                                    hitPiece.parentNode.removeChild(hitPiece);
                                    return;
                                case 270:
                                    isVertical = false;
                                    direction = -1;
                                    break;
                                case 0:
                                    isVertical = false;
                                    direction = 1;
                                    break;
                            }
                        }
                    }
                } else if (hitPiece.dataset.type === 'ricochet') {
                  
                    if (isVertical) {
                        
                        switch (rotation) {
                            case 0:
                            case 180:
                                if (direction === 1) {
                                    isVertical = false;
                                    direction = 1;
                                } else {
                                    isVertical = false;
                                    direction = -1;
                                }
                                break;
                            case 90:
                            case 270:
                                if (direction === 1) {
                                    isVertical = false;
                                    direction = -1;
                                } else {
                                    isVertical = false;
                                    direction = 1;
                                }
                                break;
                        }
                        switch (-rotation) {
                            case 0:
                            case 180:
                                if (direction === 1) {
                                    isVertical = false;
                                    direction = 1;
                                } else {
                                    isVertical = false;
                                    direction = -1;
                                }
                                break;
                            case 90:
                            case 270:
                                if (direction === 1) {
                                    isVertical = false;
                                    direction = -1;
                                } else {
                                    isVertical = false;
                                    direction = 1;
                                }
                                break;
                        }
                    } else {
                       
                        switch (rotation) {
                            case 0:
                                if (direction === 1) {
                                    isVertical = true;
                                    direction = 1;
                                } 
                                else {
                                    isVertical = true;
                                    direction = -1;
                                }
                                break;
                            case 90:
                                if (direction === 1) {
                                    isVertical = true;
                                    direction = -1;
                                } else {
                                    isVertical = true;
                                    direction = 1;
                                }
                                break;
                            case 180:
                                if (direction === 1) {
                                    isVertical = true;
                                    direction = 1;
                                } else {
                                    isVertical = true;
                                    direction = -1;
                                }
                                break;
                            case 270:
                                if (direction === 1) {
                                    isVertical = true;
                                    direction = -1;
                                } else {
                                    isVertical = true;
                                    direction = 1;
                                }
                                break;
                        }
                        switch (-rotation) {
                            case 0:
                                if (direction === 1) {
                                    isVertical = true;
                                    direction = 1;
                                } else {
                                    isVertical = true;
                                    direction = -1;
                                }
                                break;
                            case 90:
                                if (direction === 1) {
                                    isVertical = true;
                                    direction = -1;
                                } else {
                                    isVertical = true;
                                    direction = 1;
                                }
                                break;
                            case 180:
                                if (direction === 1) {
                                    isVertical = true;
                                    direction = 1;
                                } else {
                                    isVertical = true;
                                    direction = -1;
                                }
                                break;
                            case 270:
                                if (direction === 1) {
                                    isVertical = true;
                                    direction = -1;
                                } else {
                                    isVertical = true;
                                    direction = 1;
                                }
                                break;
                        }
                    }
                     
                } 
                else if (hitPiece.dataset.type === 'tank') {
                        if (isTankBetweenBulletAndTitan(nextRow, nextCol)) {
                            isBulletMoving = true;
                           
                            bullet.parentNode.removeChild(bullet);

                            
                            return;
                        }
                       
                     
                    
                }
               
                else if (hitPiece.dataset.type === 'titan') {
                  
                    if (bullet.parentNode) {
                        bullet.parentNode.removeChild(bullet);
                    }
                  
                    hitPiece.parentNode.removeChild(hitPiece);
                   
                    checkWinningCondition();
                } else {
                    
                }
            }
            setTimeout(() => {
                requestAnimationFrame(animateBullet);
            }, 100);
        } else {
          
            if (bullet.parentNode) {
                bullet.parentNode.removeChild(bullet);
            }
        }
    }
 
    function isTankBetweenBulletAndTitan(nextRow, nextCol) {
        const bulletRow = parseInt(bullet.dataset.row);
        const bulletCol = parseInt(bullet.dataset.col);
    
        const tankRow = parseInt(currentPieceElement.dataset.row);
        const tankCol = parseInt(currentPieceElement.dataset.col);
    
        const titanRow = nextRow;
        const titanCol = nextCol;
    
        
        if (
            (bulletRow === tankRow && tankRow === titanRow && ((tankCol < bulletCol && bulletCol < titanCol) || (tankCol > bulletCol && bulletCol > titanCol))) ||
            (bulletCol === tankCol && tankCol === titanCol && ((tankRow < bulletRow && bulletRow < titanRow) || (tankRow > bulletRow && bulletRow > titanRow)))
        ) {
            return false;
        }
        return true;
    }
    
    function checkWinningCondition() {
        const player1Titan = document.querySelector('.piece[data-type="titan"][data-player="1"]');
        const player2Titan = document.querySelector('.piece[data-type="titan"][data-player="2"]');
    
        if (!player1Titan) {
            alert('Player 2 Wins!');
        } else if (!player2Titan) {
            alert('Player 1 Wins!');
        }
    }

    requestAnimationFrame(animateBullet);
}


function clearPossibleMoves() {
    document.querySelectorAll('.possible-move').forEach(cell => {
        cell.classList.remove('possible-move');
        cell.removeEventListener('click', movePiece);
    });

    document.querySelectorAll('.bullet-path').forEach(cell => {
        cell.classList.remove('bullet-path');
    });
}
// Timer functions
function startTimer() {
    interval = setInterval(() => {
        if (!isPaused) {
            if (currentPlayer === 1) {
                timer1--;
                if (timer1 <= 0) {
                    alert('Player 2 wins!');
                    clearInterval(interval);
                }
                timer1Element.textContent = timer1;
            } else {
                timer2--;
                if (timer2 <= 0) {
                    alert('Player 1 wins!');
                    clearInterval(interval);
                }
                timer2Element.textContent = timer2;
            }
        }
    }, 1000);
}

function pauseTimer() {
    isPaused = true;
}

function resumeTimer() {
    isPaused = false;
}

function resetGame() {
    clearInterval(interval);
    timer1 = 300;
    timer2 = 300;
    timer1Element.textContent = timer1;
    timer2Element.textContent = timer2;
    currentPlayer = 1;
    historyList.textContent=""
    isPaused = false;
    clearPossibleMoves();
    document.querySelectorAll('.piece').forEach(piece => piece.remove());
    placePieces();
    startTimer();
}
pauseButton.addEventListener('click', pauseTimer);
resumeButton.addEventListener('click', resumeTimer);
resetButton.addEventListener('click', resetGame);


createBoard();
startTimer();

document.addEventListener('DOMContentLoaded', (event) => {
   
    const bgMusic = new Audio('bgmusic.mp3');
    bgMusic.loop = true;
    bgMusic.play().catch(err => {
        console.error('Autoplay failed:', err);
        document.body.addEventListener('click', () => {
            bgMusic.play();
        }, { once: true });
    });
});








































































































































































































