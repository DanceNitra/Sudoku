// Sudoku Game - Main JavaScript File

// Game state
const gameState = {
    board: Array(9).fill().map(() => Array(9).fill(0)),
    solution: Array(9).fill().map(() => Array(9).fill(0)),
    initialBoard: Array(9).fill().map(() => Array(9).fill(0)),
    selectedCell: null,
    selectedNumber: null,
    notesMode: false,
    difficulty: 'easy',
    timer: 0,
    timerInterval: null,
    gameActive: false,
    gamesPlayed: 0,
    gamesWon: 0,
    hintsUsed: 0,
    bestTime: null,
    errors: 0
};

// Difficulty settings (number of cells to remove)
const difficultySettings = {
    easy: 40,
    medium: 50,
    hard: 55,
    expert: 60
};

// DOM Elements
const sudokuGrid = document.getElementById('sudoku-grid');
const timerElement = document.getElementById('timer');
const newGameButton = document.getElementById('new-game');
const checkSolutionButton = document.getElementById('check-solution');
const hintButton = document.getElementById('hint');
const solveButton = document.getElementById('solve');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const numberButtons = document.querySelectorAll('.number-btn');
const eraserButton = document.getElementById('eraser');
const notesToggleButton = document.getElementById('notes-toggle');
const notesStatusElement = document.getElementById('notes-status');
const gamesPlayedElement = document.getElementById('games-played');
const gamesWonElement = document.getElementById('games-won');
const hintsUsedElement = document.getElementById('hints-used');
const bestTimeElement = document.getElementById('best-time');
const gameStatusElement = document.getElementById('game-status');
const difficultyDisplayElement = document.getElementById('difficulty-display');
const statusEmojiElement = document.getElementById('status-emoji');
const messageModal = document.getElementById('message-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalEmoji = document.getElementById('modal-emoji');
const modalClose = document.getElementById('modal-close');
const modalNewGame = document.getElementById('modal-new-game');

// Initialize the game
function initGame() {
    createGrid();
    loadStatistics();
    setupEventListeners();
    generateNewGame();
}

// Create the Sudoku grid in the DOM
function createGrid() {
    sudokuGrid.innerHTML = '';
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'sudoku-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add thick borders for 3x3 blocks
            if (col === 2 || col === 5) {
                cell.classList.add('border-r-thick');
            }
            if (row === 2 || row === 5) {
                cell.classList.add('border-b-thick');
            }
            
            sudokuGrid.appendChild(cell);
        }
    }
}

// Generate a new Sudoku game
function generateNewGame() {
    // Reset game state
    gameState.board = Array(9).fill().map(() => Array(9).fill(0));
    gameState.solution = Array(9).fill().map(() => Array(9).fill(0));
    gameState.initialBoard = Array(9).fill().map(() => Array(9).fill(0));
    gameState.selectedCell = null;
    gameState.selectedNumber = null;
    gameState.errors = 0;
    
    // Stop any existing timer
    stopTimer();
    gameState.timer = 0;
    updateTimerDisplay();
    
    // Generate a complete solved board
    generateSolvedBoard();
    
    // Create a puzzle by removing numbers based on difficulty
    createPuzzle();
    
    // Update the display
    updateGridDisplay();
    
    // Start the timer
    startTimer();
    gameState.gameActive = true;
    
    // Update game status
    updateGameStatus('Playing', '🎮', 'Game in progress');
    
    // Increment games played
    gameState.gamesPlayed++;
    updateStatisticsDisplay();
}

// Generate a complete solved Sudoku board using backtracking
function generateSolvedBoard() {
    // Start with an empty board
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    // Fill diagonal 3x3 boxes first (they are independent)
    for (let i = 0; i < 9; i += 3) {
        fillBox(board, i, i);
    }
    
    // Fill the rest of the board using backtracking
    solveSudoku(board);
    
    // Copy to solution
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            gameState.solution[i][j] = board[i][j];
        }
    }
}

// Fill a 3x3 box with random numbers 1-9
function fillBox(board, row, col) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffleArray(numbers);
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            board[row + i][col + j] = numbers.pop();
        }
    }
}

// Shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Solve Sudoku using backtracking
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                shuffleArray(numbers);
                
                for (const num of numbers) {
                    if (isValidPlacement(board, row, col, num)) {
                        board[row][col] = num;
                        
                        if (solveSudoku(board)) {
                            return true;
                        }
                        
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Check if a number can be placed at a given position
function isValidPlacement(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }
    
    // Check column
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[boxRow + i][boxCol + j] === num) return false;
        }
    }
    
    return true;
}

// Create a puzzle by removing numbers from the solved board
function createPuzzle() {
    // Copy solution to board
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            gameState.board[i][j] = gameState.solution[i][j];
            gameState.initialBoard[i][j] = gameState.solution[i][j];
        }
    }
    
    // Remove numbers based on difficulty
    const cellsToRemove = difficultySettings[gameState.difficulty];
    let removed = 0;
    let attempts = 0;
    const maxAttempts = 200; // Prevent infinite loop
    
    while (removed < cellsToRemove && attempts < maxAttempts) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        // Skip if already empty
        if (gameState.board[row][col] === 0) {
            attempts++;
            continue;
        }
        
        // Store the value before removing
        const temp = gameState.board[row][col];
        gameState.board[row][col] = 0;
        gameState.initialBoard[row][col] = 0;
        
        // Check if the puzzle still has a unique solution
        const boardCopy = gameState.board.map(row => [...row]);
        const solutions = countSolutions(boardCopy, 2); // Stop after finding 2 solutions
        
        if (solutions === 1) {
            removed++;
            attempts = 0; // Reset attempts counter on success
        } else {
            // Restore the value if multiple solutions or no solution
            gameState.board[row][col] = temp;
            gameState.initialBoard[row][col] = temp;
            attempts++;
        }
    }
    
    // If we couldn't remove enough cells, use what we have
    console.log(`Created puzzle with ${removed} cells removed (target: ${cellsToRemove})`);
}

// Count the number of solutions for a Sudoku board (with optional maxSolutions limit)
function countSolutions(board, maxSolutions = 2) {
    let solutions = 0;
    
    function backtrack() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValidPlacement(board, row, col, num)) {
                            board[row][col] = num;
                            backtrack();
                            board[row][col] = 0;
                            
                            // Stop early if we've found enough solutions
                            if (solutions >= maxSolutions) return;
                        }
                    }
                    return;
                }
            }
        }
        solutions++;
    }
    
    backtrack();
    return solutions;
}

// Update the grid display
function updateGridDisplay() {
    const cells = document.querySelectorAll('.sudoku-cell');
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = gameState.board[row][col];
        const initialValue = gameState.initialBoard[row][col];
        
        // Reset cell classes
        cell.className = 'sudoku-cell';
        cell.innerHTML = '';
        
        // Add border classes
        if (col === 2 || col === 5) {
            cell.classList.add('border-r-thick');
        }
        if (row === 2 || row === 5) {
            cell.classList.add('border-b-thick');
        }
        
        // Set cell content and classes based on value
        if (value !== 0) {
            if (initialValue !== 0) {
                // Prefilled cell
                cell.classList.add('prefilled');
                cell.textContent = value;
            } else {
                // User-filled cell
                cell.classList.add('user-filled');
                cell.textContent = value;
                
                // Check if the value is correct
                if (value !== gameState.solution[row][col]) {
                    cell.classList.add('error');
                }
            }
        }
        
        // Highlight selected cell and related cells
        if (gameState.selectedCell) {
            const [selectedRow, selectedCol] = gameState.selectedCell;
            
            if (row === selectedRow && col === selectedCol) {
                cell.classList.add('selected');
            } else if (row === selectedRow || col === selectedCol || 
                      (Math.floor(row / 3) === Math.floor(selectedRow / 3) && 
                       Math.floor(col / 3) === Math.floor(selectedCol / 3))) {
                cell.classList.add('highlighted');
            }
        }
    });
    
    // Update number button active state
    updateNumberButtons();
}

// Update number buttons active state
function updateNumberButtons() {
    numberButtons.forEach(button => {
        const number = parseInt(button.dataset.number);
        button.classList.toggle('active', number === gameState.selectedNumber);
    });
}

// Handle cell selection
function selectCell(row, col) {
    // Deselect if clicking the same cell
    if (gameState.selectedCell && 
        gameState.selectedCell[0] === row && 
        gameState.selectedCell[1] === col) {
        gameState.selectedCell = null;
    } else {
        gameState.selectedCell = [row, col];
        
        // Don't allow selection of prefilled cells
        if (gameState.initialBoard[row][col] !== 0) {
            gameState.selectedCell = null;
        }
    }
    
    updateGridDisplay();
}

// Handle number input
function inputNumber(number) {
    if (!gameState.selectedCell || !gameState.gameActive) return;
    
    const [row, col] = gameState.selectedCell;
    
    // Don't allow editing of prefilled cells
    if (gameState.initialBoard[row][col] !== 0) return;
    
    if (gameState.notesMode) {
        // Toggle note for this number
        toggleNote(row, col, number);
    } else {
        // Set or clear the cell value
        if (gameState.board[row][col] === number) {
            gameState.board[row][col] = 0;
        } else {
            gameState.board[row][col] = number;
        }
        
        // Check if the game is complete
        checkGameCompletion();
    }
    
    updateGridDisplay();
    gameState.selectedNumber = number;
    updateNumberButtons();
}

// Toggle a note for a cell
function toggleNote(row, col, number) {
    // For simplicity, we'll just show the note in the cell
    // In a more advanced version, you could store notes separately
    const cell = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
    
    if (!cell.classList.contains('notes')) {
        cell.classList.add('notes');
        cell.innerHTML = `<div class="notes-grid"></div>`;
    }
    
    const notesGrid = cell.querySelector('.notes-grid');
    const noteElement = document.createElement('div');
    noteElement.className = 'note-number';
    noteElement.textContent = number;
    
    // Check if note already exists
    const existingNote = Array.from(notesGrid.children).find(child => child.textContent === number.toString());
    
    if (existingNote) {
        existingNote.remove();
        
        // Remove notes class if no notes left
        if (notesGrid.children.length === 0) {
            cell.classList.remove('notes');
            cell.innerHTML = '';
        }
    } else {
        notesGrid.appendChild(noteElement);
    }
}

// Check if the game is complete
function checkGameCompletion() {
    if (!gameState.gameActive) return;
    
    // Check if all cells are filled
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (gameState.board[row][col] === 0) {
                return false;
            }
        }
    }
    
    // Check if the solution is correct
    const isCorrect = isBoardCorrect();
    
    if (isCorrect) {
        gameState.gameActive = false;
        gameState.gamesWon++;
        stopTimer();
        
        // Update best time if applicable
        if (!gameState.bestTime || gameState.timer < gameState.bestTime) {
            gameState.bestTime = gameState.timer;
        }
        
        updateStatisticsDisplay();
        showMessage('Congratulations!', 'You solved the puzzle correctly!', '🎉');
        updateGameStatus('Solved!', '🏆', 'Puzzle completed successfully');
    }
    
    return isCorrect;
}

// Check if the current board matches the solution
function isBoardCorrect() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (gameState.board[row][col] !== gameState.solution[row][col]) {
                return false;
            }
        }
    }
    return true;
}

// Provide a hint
function provideHint() {
    if (!gameState.gameActive) return;
    
    // Find an empty cell
    const emptyCells = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (gameState.board[row][col] === 0) {
                emptyCells.push([row, col]);
            }
        }
    }
    
    if (emptyCells.length === 0) return;
    
    // Pick a random empty cell
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const [row, col] = emptyCells[randomIndex];
    
    // Fill it with the correct value
    gameState.board[row][col] = gameState.solution[row][col];
    gameState.hintsUsed++;
    
    updateStatisticsDisplay();
    updateGridDisplay();
    
    // Check if game is complete
    checkGameCompletion();
}

// Solve the entire puzzle
function solvePuzzle() {
    if (!gameState.gameActive) return;
    
    // Copy solution to board
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            gameState.board[row][col] = gameState.solution[row][col];
        }
    }
    
    gameState.gameActive = false;
    stopTimer();
    updateGridDisplay();
    showMessage('Puzzle Solved', 'The computer solved the puzzle for you.', '🤖');
    updateGameStatus('Solved by AI', '🤖', 'Puzzle solved automatically');
}

// Check the current solution
function checkCurrentSolution() {
    if (!gameState.gameActive) return;
    
    const isCorrect = isBoardCorrect();
    
    if (isCorrect) {
        showMessage('Correct!', 'Your solution is correct so far!', '✅');
    } else {
        showMessage('Incorrect', 'There are errors in your solution.', '❌');
        gameState.errors++;
    }
}

// Timer functions
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Add animation class when timer is running
    if (gameState.gameActive) {
        timerElement.classList.add('timer-running');
    } else {
        timerElement.classList.remove('timer-running');
    }
}

// Update game status display
function updateGameStatus(status, emoji, description) {
    gameStatusElement.textContent = status;
    statusEmojiElement.textContent = emoji;
    difficultyDisplayElement.textContent = `Difficulty: ${gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}`;
}

// Show message modal
function showMessage(title, message, emoji) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalEmoji.textContent = emoji;
    messageModal.classList.remove('hidden');
}

// Load statistics from localStorage
function loadStatistics() {
    const savedGamesPlayed = localStorage.getItem('sudokuGamesPlayed');
    const savedGamesWon = localStorage.getItem('sudokuGamesWon');
    const savedHintsUsed = localStorage.getItem('sudokuHintsUsed');
    const savedBestTime = localStorage.getItem('sudokuBestTime');
    
    if (savedGamesPlayed) gameState.gamesPlayed = parseInt(savedGamesPlayed);
    if (savedGamesWon) gameState.gamesWon = parseInt(savedGamesWon);
    if (savedHintsUsed) gameState.hintsUsed = parseInt(savedHintsUsed);
    if (savedBestTime) gameState.bestTime = parseInt(savedBestTime);
    
    updateStatisticsDisplay();
}

// Update statistics display and save to localStorage
function updateStatisticsDisplay() {
    gamesPlayedElement.textContent = gameState.gamesPlayed;
    gamesWonElement.textContent = gameState.gamesWon;
    hintsUsedElement.textContent = gameState.hintsUsed;
    
    if (gameState.bestTime !== null) {
        const minutes = Math.floor(gameState.bestTime / 60);
        const seconds = gameState.bestTime % 60;
        bestTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Save to localStorage
    localStorage.setItem('sudokuGamesPlayed', gameState.gamesPlayed);
    localStorage.setItem('sudokuGamesWon', gameState.gamesWon);
    localStorage.setItem('sudokuHintsUsed', gameState.hintsUsed);
    if (gameState.bestTime !== null) {
        localStorage.setItem('sudokuBestTime', gameState.bestTime);
    }
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Cell click events
    sudokuGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.sudoku-cell');
        if (cell) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            selectCell(row, col);
        }
    });
    
    // Number buttons
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            const number = parseInt(button.dataset.number);
            inputNumber(number);
        });
    });
    
    // Eraser button
    eraserButton.addEventListener('click', () => {
        if (gameState.selectedCell && gameState.gameActive) {
            const [row, col] = gameState.selectedCell;
            if (gameState.initialBoard[row][col] === 0) {
                gameState.board[row][col] = 0;
                updateGridDisplay();
            }
        }
    });
    
    // Notes toggle button
    notesToggleButton.addEventListener('click', () => {
        gameState.notesMode = !gameState.notesMode;
        notesToggleButton.classList.toggle('active', gameState.notesMode);
        
        if (gameState.notesMode) {
            notesStatusElement.innerHTML = 'Notes mode: <span class="font-medium text-blue-600">On</span>';
            notesToggleButton.classList.add('bg-blue-100', 'border-blue-400');
        } else {
            notesStatusElement.innerHTML = 'Notes mode: <span class="font-medium">Off</span>';
            notesToggleButton.classList.remove('bg-blue-100', 'border-blue-400');
        }
    });
    
    // Difficulty buttons
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const difficulty = button.dataset.difficulty;
            setDifficulty(difficulty);
            // Generate new game with selected difficulty
            generateNewGame();
        });
    });
    
    // Control buttons
    newGameButton.addEventListener('click', generateNewGame);
    checkSolutionButton.addEventListener('click', checkCurrentSolution);
    hintButton.addEventListener('click', provideHint);
    solveButton.addEventListener('click', solvePuzzle);
    
    // Modal buttons
    modalClose.addEventListener('click', () => {
        messageModal.classList.add('hidden');
    });
    
    modalNewGame.addEventListener('click', () => {
        messageModal.classList.add('hidden');
        generateNewGame();
    });
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!gameState.gameActive) return;
        
        // Number keys 1-9
        if (e.key >= '1' && e.key <= '9') {
            inputNumber(parseInt(e.key));
        }
        
        // Delete/Backspace for erasing
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (gameState.selectedCell) {
                const [row, col] = gameState.selectedCell;
                if (gameState.initialBoard[row][col] === 0) {
                    gameState.board[row][col] = 0;
                    updateGridDisplay();
                }
            }
        }
        
        // Arrow keys for navigation
        if (gameState.selectedCell) {
            const [row, col] = gameState.selectedCell;
            let newRow = row;
            let newCol = col;
            
            switch (e.key) {
                case 'ArrowUp': newRow = Math.max(0, row - 1); break;
                case 'ArrowDown': newRow = Math.min(8, row + 1); break;
                case 'ArrowLeft': newCol = Math.max(0, col - 1); break;
                case 'ArrowRight': newCol = Math.min(8, col + 1); break;
            }
            
            if (newRow !== row || newCol !== col) {
                selectCell(newRow, newCol);
            }
        }
    });
}

// Set difficulty level
function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    // Update active button
    difficultyButtons.forEach(button => {
        if (button.dataset.difficulty === difficulty) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Update display
    difficultyDisplayElement.textContent = `Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`;
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
