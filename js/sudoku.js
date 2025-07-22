class SudokuSolver {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.isRunning = false;
        this.animationSpeed = 200;
        this.attempts = 0;
        this.backtracks = 0;
        
        this.puzzles = {
            easy: [
                [5,3,0,0,7,0,0,0,0],
                [6,0,0,1,9,5,0,0,0],
                [0,9,8,0,0,0,0,6,0],
                [8,0,0,0,6,0,0,0,3],
                [4,0,0,8,0,3,0,0,1],
                [7,0,0,0,2,0,0,0,6],
                [0,6,0,0,0,0,2,8,0],
                [0,0,0,4,1,9,0,0,5],
                [0,0,0,0,8,0,0,7,9]
            ],
            medium: [
                [0,0,0,6,0,0,4,0,0],
                [7,0,0,0,0,3,6,0,0],
                [0,0,0,0,9,1,0,8,0],
                [0,0,0,0,0,0,0,0,0],
                [0,5,0,1,8,0,0,0,3],
                [0,0,0,3,0,6,0,4,5],
                [0,4,0,2,0,0,0,6,0],
                [9,0,3,0,0,0,0,0,0],
                [0,2,0,0,0,0,1,0,0]
            ],
            hard: [
                [0,0,0,0,0,0,0,1,0],
                [4,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,6,0,2],
                [0,0,0,0,3,0,0,7,0],
                [5,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,8,0,4,0],
                [0,0,0,2,0,0,0,0,0],
                [0,6,0,0,0,0,0,0,5],
                [0,0,4,0,0,0,0,0,0]
            ],
            expert: [
                [0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,3,0,8,5],
                [0,0,1,0,2,0,0,0,0],
                [0,0,0,5,0,7,0,0,0],
                [0,0,4,0,0,0,1,0,0],
                [0,9,0,0,0,0,0,0,0],
                [5,0,0,0,0,0,0,7,3],
                [0,0,2,0,1,0,0,0,0],
                [0,0,0,0,4,0,0,0,9]
            ]
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createGrid();
        this.loadPuzzle('easy');
    }

    setupEventListeners() {
        document.getElementById('animationSpeed').addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
        });

        document.getElementById('solveSudoku').addEventListener('click', () => this.solveSudoku());
        document.getElementById('clearGrid').addEventListener('click', () => this.clearGrid());
        document.getElementById('validateSudoku').addEventListener('click', () => this.validateSudoku());

        // Preset puzzle buttons
        document.querySelectorAll('.preset-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                this.loadPuzzle(difficulty);
            });
        });

        // Grid cell clicks for manual input
        document.getElementById('sudokuGrid').addEventListener('click', (e) => {
            if (e.target.classList.contains('sudoku-cell') && !this.isRunning) {
                this.handleCellClick(e.target);
            }
        });
    }

    createGrid() {
        const gridElement = document.getElementById('sudokuGrid');
        gridElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.id = `cell-${row}-${col}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridElement.appendChild(cell);
            }
        }
    }

    loadPuzzle(difficulty) {
        if (this.isRunning) return;
        
        this.grid = this.puzzles[difficulty].map(row => [...row]);
        this.originalGrid = this.puzzles[difficulty].map(row => [...row]);
        this.renderGrid();
        this.resetStats();
        this.showResult(`Loaded ${difficulty} puzzle`, 'success');
    }

    renderGrid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                const value = this.grid[row][col];
                
                cell.textContent = value === 0 ? '' : value;
                cell.className = 'sudoku-cell';
                
                if (this.originalGrid[row][col] !== 0) {
                    cell.classList.add('given');
                }
            }
        }
        
        this.updateFilledCells();
    }

    handleCellClick(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // Don't allow editing given numbers
        if (this.originalGrid[row][col] !== 0) return;
        
        const currentValue = this.grid[row][col];
        const newValue = currentValue === 9 ? 0 : currentValue + 1;
        
        this.grid[row][col] = newValue;
        cell.textContent = newValue === 0 ? '' : newValue;
        this.updateFilledCells();
    }

    async solveSudoku() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.resetStats();
        document.getElementById('solvingIndicator').style.display = 'block';
        
        const startTime = Date.now();
        const solved = await this.solve();
        const endTime = Date.now();
        
        document.getElementById('solveTime').textContent = `${endTime - startTime}ms`;
        document.getElementById('solvingIndicator').style.display = 'none';
        
        if (solved) {
            this.showResult('Sudoku solved successfully!', 'success');
        } else {
            this.showResult('No solution exists for this puzzle', 'error');
        }
        
        this.isRunning = false;
    }

    async solve() {
        const emptyCell = this.findEmptyCell();
        
        if (!emptyCell) {
            return true; // Puzzle solved
        }
        
        const [row, col] = emptyCell;
        
        for (let num = 1; num <= 9; num++) {
            this.attempts++;
            document.getElementById('attempts').textContent = this.attempts;
            
            // Highlight current cell being tried
            this.highlightCell(row, col, 'solving');
            await DSAUniverse.delay(this.animationSpeed);
            
            if (this.isValidMove(row, col, num)) {
                // Place number
                this.grid[row][col] = num;
                this.updateCell(row, col, num, 'solved');
                this.updateFilledCells();
                await DSAUniverse.delay(this.animationSpeed);
                
                // Recursively solve
                if (await this.solve()) {
                    return true;
                }
                
                // Backtrack
                this.backtracks++;
                document.getElementById('backtracks').textContent = this.backtracks;
                
                this.grid[row][col] = 0;
                this.updateCell(row, col, '', 'backtrack');
                this.updateFilledCells();
                await DSAUniverse.delay(this.animationSpeed);
            } else {
                // Show conflict
                this.highlightConflicts(row, col, num);
                await DSAUniverse.delay(this.animationSpeed / 2);
                this.clearConflicts();
            }
            
            this.clearCellHighlight(row, col);
        }
        
        return false; // No solution found
    }

    findEmptyCell() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    isValidMove(row, col, num) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (this.grid[row][c] === num) {
                return false;
            }
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
            if (this.grid[r][col] === num) {
                return false;
            }
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (this.grid[r][c] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }

    highlightConflicts(row, col, num) {
        // Highlight conflicting cells in row
        for (let c = 0; c < 9; c++) {
            if (this.grid[row][c] === num) {
                this.highlightCell(row, c, 'conflict');
            }
        }
        
        // Highlight conflicting cells in column
        for (let r = 0; r < 9; r++) {
            if (this.grid[r][col] === num) {
                this.highlightCell(r, col, 'conflict');
            }
        }
        
        // Highlight conflicting cells in 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if (this.grid[r][c] === num) {
                    this.highlightCell(r, c, 'conflict');
                }
            }
        }
    }

    clearConflicts() {
        document.querySelectorAll('.sudoku-cell.conflict').forEach(cell => {
            cell.classList.remove('conflict');
        });
    }

    highlightCell(row, col, className) {
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (cell) {
            cell.classList.add(className);
        }
    }

    clearCellHighlight(row, col) {
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (cell) {
            cell.classList.remove('solving', 'solved', 'backtrack', 'conflict');
        }
    }

    updateCell(row, col, value, className) {
        const cell = document.getElementById(`cell-${row}-${col}`);
        if (cell) {
            cell.textContent = value;
            cell.className = 'sudoku-cell';
            if (this.originalGrid[row][col] !== 0) {
                cell.classList.add('given');
            }
            if (className) {
                cell.classList.add(className);
            }
        }
    }

    validateSudoku() {
        if (this.isRunning) return;
        
        let isValid = true;
        let emptyCount = 0;
        
        // Clear previous highlights
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('conflict');
        });
        
        // Check for empty cells and conflicts
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const value = this.grid[row][col];
                
                if (value === 0) {
                    emptyCount++;
                    continue;
                }
                
                // Temporarily remove the value to check if it's valid
                this.grid[row][col] = 0;
                if (!this.isValidMove(row, col, value)) {
                    this.highlightCell(row, col, 'conflict');
                    isValid = false;
                }
                this.grid[row][col] = value;
            }
        }
        
        if (emptyCount === 0 && isValid) {
            this.showResult('Congratulations! Sudoku is solved correctly!', 'success');
        } else if (isValid) {
            this.showResult(`Sudoku is valid so far. ${emptyCount} cells remaining.`, 'success');
        } else {
            this.showResult('Sudoku has conflicts! Check highlighted cells.', 'error');
        }
    }

    clearGrid() {
        if (this.isRunning) return;
        
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.renderGrid();
        this.resetStats();
        this.showResult('Grid cleared', 'success');
    }

    updateFilledCells() {
        let count = 0;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] !== 0) {
                    count++;
                }
            }
        }
        document.getElementById('filledCells').textContent = count;
    }

    resetStats() {
        this.attempts = 0;
        this.backtracks = 0;
        document.getElementById('attempts').textContent = '0';
        document.getElementById('backtracks').textContent = '0';
        document.getElementById('solveTime').textContent = '0ms';
        this.updateFilledCells();
    }

    showResult(message, type) {
        const resultElement = document.getElementById('sudokuResult');
        resultElement.textContent = message;
        resultElement.className = `operation-result result-${type}`;
        resultElement.style.display = 'block';
        
        setTimeout(() => {
            resultElement.style.display = 'none';
        }, 4000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SudokuSolver();
});