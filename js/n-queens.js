class NQueensVisualizer {
    constructor() {
        this.boardSize = 4;
        this.board = [];
        this.solutions = [];
        this.currentSolutionIndex = 0;
        this.isRunning = false;
        this.animationSpeed = 500;
        this.attempts = 0;
        this.backtrackCount = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createBoard();
        this.renderBoard();
    }

    setupEventListeners() {
        document.getElementById('boardSize').addEventListener('input', (e) => {
            this.boardSize = parseInt(e.target.value);
            document.getElementById('boardSizeValue').textContent = this.boardSize;
            if (!this.isRunning) {
                this.resetBoard();
            }
        });

        document.getElementById('animationSpeed').addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
        });

        document.getElementById('solveQueens').addEventListener('click', () => this.solveQueens());
        document.getElementById('findAllSolutions').addEventListener('click', () => this.findAllSolutions());
        document.getElementById('nextSolution').addEventListener('click', () => this.showNextSolution());
        document.getElementById('resetBoard').addEventListener('click', () => this.resetBoard());
    }

    createBoard() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
    }

    renderBoard() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';
        chessboard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;

        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.id = `square-${row}-${col}`;
                
                if (this.board[row][col] === 1) {
                    square.classList.add('queen');
                    square.textContent = '♛';
                }
                
                chessboard.appendChild(square);
            }
        }
    }

    async solveQueens() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.resetStats();
        this.createBoard();
        this.renderBoard();
        
        const solved = await this.solveNQueensBacktrack(0);
        
        if (solved) {
            this.showResult(`Solution found for ${this.boardSize}-Queens!`, 'success');
            this.solutions = [this.board.map(row => [...row])];
            this.updateSolutionInfo();
        } else {
            this.showResult(`No solution exists for ${this.boardSize}-Queens`, 'error');
        }
        
        this.isRunning = false;
    }

    async findAllSolutions() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.resetStats();
        this.solutions = [];
        this.createBoard();
        this.renderBoard();
        
        await this.findAllSolutionsBacktrack(0);
        
        if (this.solutions.length > 0) {
            this.showResult(`Found ${this.solutions.length} solution(s) for ${this.boardSize}-Queens!`, 'success');
            this.currentSolutionIndex = 0;
            this.displaySolution(0);
            document.getElementById('nextSolution').disabled = this.solutions.length <= 1;
        } else {
            this.showResult(`No solutions exist for ${this.boardSize}-Queens`, 'error');
        }
        
        this.updateSolutionInfo();
        this.isRunning = false;
    }

    async solveNQueensBacktrack(row) {
        if (row === this.boardSize) {
            return true; // All queens placed successfully
        }

        for (let col = 0; col < this.boardSize; col++) {
            this.attempts++;
            document.getElementById('attempts').textContent = this.attempts;
            
            // Highlight current position being tried
            this.highlightSquare(row, col, 'trying');
            await DSAUniverse.delay(this.animationSpeed);

            if (this.isSafe(row, col)) {
                // Place queen
                this.board[row][col] = 1;
                this.highlightSquare(row, col, 'queen');
                this.renderBoard();
                await DSAUniverse.delay(this.animationSpeed);

                // Recursively place queens in next row
                if (await this.solveNQueensBacktrack(row + 1)) {
                    return true;
                }

                // Backtrack
                this.backtrackCount++;
                document.getElementById('backtrackCount').textContent = this.backtrackCount;
                this.showBacktrackIndicator();
                
                this.board[row][col] = 0;
                this.clearSquareHighlight(row, col);
                this.renderBoard();
                await DSAUniverse.delay(this.animationSpeed);
            } else {
                // Show attacking positions
                this.showAttackingPositions(row, col);
                await DSAUniverse.delay(this.animationSpeed / 2);
                this.clearAttackingPositions();
                this.clearSquareHighlight(row, col);
            }
        }

        return false; // No solution found
    }

    async findAllSolutionsBacktrack(row) {
        if (row === this.boardSize) {
            // Found a solution, save it
            this.solutions.push(this.board.map(row => [...row]));
            document.getElementById('totalSolutions').textContent = this.solutions.length;
            return;
        }

        for (let col = 0; col < this.boardSize; col++) {
            this.attempts++;
            document.getElementById('attempts').textContent = this.attempts;
            
            // Highlight current position being tried
            this.highlightSquare(row, col, 'trying');
            await DSAUniverse.delay(this.animationSpeed / 2);

            if (this.isSafe(row, col)) {
                // Place queen
                this.board[row][col] = 1;
                this.highlightSquare(row, col, 'queen');
                this.renderBoard();
                await DSAUniverse.delay(this.animationSpeed / 2);

                // Recursively place queens in next row
                await this.findAllSolutionsBacktrack(row + 1);

                // Backtrack
                this.backtrackCount++;
                document.getElementById('backtrackCount').textContent = this.backtrackCount;
                
                this.board[row][col] = 0;
                this.clearSquareHighlight(row, col);
                this.renderBoard();
                await DSAUniverse.delay(this.animationSpeed / 4);
            } else {
                this.clearSquareHighlight(row, col);
            }
        }
    }

    isSafe(row, col) {
        // Check column
        for (let i = 0; i < row; i++) {
            if (this.board[i][col] === 1) {
                return false;
            }
        }

        // Check diagonal (top-left to bottom-right)
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (this.board[i][j] === 1) {
                return false;
            }
        }

        // Check diagonal (top-right to bottom-left)
        for (let i = row - 1, j = col + 1; i >= 0 && j < this.boardSize; i--, j++) {
            if (this.board[i][j] === 1) {
                return false;
            }
        }

        return true;
    }

    showAttackingPositions(row, col) {
        // Show column attacks
        for (let i = 0; i < this.boardSize; i++) {
            if (i !== row) {
                this.highlightSquare(i, col, 'attacking');
            }
        }

        // Show diagonal attacks
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (i !== row && j !== col) {
                    if (Math.abs(i - row) === Math.abs(j - col)) {
                        this.highlightSquare(i, j, 'attacking');
                    }
                }
            }
        }
    }

    clearAttackingPositions() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const square = document.getElementById(`square-${row}-${col}`);
                if (square) {
                    square.classList.remove('attacking');
                }
            }
        }
    }

    highlightSquare(row, col, className) {
        const square = document.getElementById(`square-${row}-${col}`);
        if (square) {
            square.classList.add(className);
            if (className === 'queen') {
                square.textContent = '♛';
            }
        }
    }

    clearSquareHighlight(row, col) {
        const square = document.getElementById(`square-${row}-${col}`);
        if (square) {
            square.classList.remove('trying', 'safe', 'attacking', 'queen');
            square.textContent = '';
        }
    }

    showBacktrackIndicator() {
        const indicator = document.getElementById('backtrackIndicator');
        indicator.style.display = 'block';
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 1000);
    }

    showNextSolution() {
        if (this.solutions.length === 0) return;
        
        this.currentSolutionIndex = (this.currentSolutionIndex + 1) % this.solutions.length;
        this.displaySolution(this.currentSolutionIndex);
        this.updateSolutionInfo();
    }

    displaySolution(index) {
        if (index >= this.solutions.length) return;
        
        this.board = this.solutions[index].map(row => [...row]);
        this.renderBoard();
    }

    resetBoard() {
        this.isRunning = false;
        this.createBoard();
        this.renderBoard();
        this.resetStats();
        this.solutions = [];
        this.currentSolutionIndex = 0;
        document.getElementById('nextSolution').disabled = true;
        document.getElementById('backtrackIndicator').style.display = 'none';
        this.showResult('Board reset', 'success');
    }

    resetStats() {
        this.attempts = 0;
        this.backtrackCount = 0;
        document.getElementById('attempts').textContent = '0';
        document.getElementById('backtrackCount').textContent = '0';
        document.getElementById('currentSolution').textContent = '0';
        document.getElementById('totalSolutions').textContent = '0';
    }

    updateSolutionInfo() {
        document.getElementById('currentSolution').textContent = this.solutions.length > 0 ? this.currentSolutionIndex + 1 : 0;
        document.getElementById('totalSolutions').textContent = this.solutions.length;
    }

    showResult(message, type) {
        const resultElement = document.getElementById('queensResult');
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
    new NQueensVisualizer();
});