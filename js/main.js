// Main application JavaScript
class DSAUniverse {
    constructor() {
        this.modules = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeModules();
    }

    setupEventListeners() {
        // Module card click handlers
        document.querySelectorAll('.module-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const module = e.currentTarget.dataset.module;
                this.navigateToModule(module);
            });

            // Add keyboard navigation
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const module = e.currentTarget.dataset.module;
                    this.navigateToModule(module);
                }
            });

            // Make cards focusable
            card.setAttribute('tabindex', '0');
        });
    }

    initializeModules() {
        // Define module configurations
        this.modules.set('sorting', {
            name: 'Sorting Race',
            file: 'modules/sorting.html',
            description: 'Visualize and compare different sorting algorithms'
        });

        this.modules.set('binary-search', {
            name: 'Binary Search',
            file: 'modules/binary-search.html',
            description: 'Interactive binary search visualization'
        });

        this.modules.set('data-structures', {
            name: 'Linear Data Structures',
            file: 'modules/data-structures.html',
            description: 'Stack, Queue, and Linked List operations'
        });

        this.modules.set('binary-tree', {
            name: 'Binary Search Tree',
            file: 'modules/binary-tree.html',
            description: 'BST operations and traversals'
        });

        this.modules.set('graph-algorithms', {
            name: 'Graph Algorithms',
            file: 'modules/graph-algorithms.html',
            description: 'BFS, DFS, Dijkstra, and A* pathfinding'
        });

        this.modules.set('trie', {
            name: 'Trie Autocomplete',
            file: 'modules/trie.html',
            description: 'Prefix tree for string operations'
        });

        this.modules.set('hash-table', {
            name: 'Hash Table',
            file: 'modules/hash-table.html',
            description: 'Hashing and collision resolution'
        });

        this.modules.set('complexity', {
            name: 'Time Complexity',
            file: 'modules/complexity.html',
            description: 'Big O notation visualizer'
        });

        this.modules.set('n-queens', {
            name: 'N-Queens Problem',
            file: 'modules/n-queens.html',
            description: 'Backtracking algorithm visualization'
        });

        this.modules.set('sudoku', {
            name: 'Sudoku Solver',
            file: 'modules/sudoku.html',
            description: 'Constraint satisfaction with backtracking'
        });

        this.modules.set('job-scheduling', {
            name: 'Job Scheduling',
            file: 'modules/job-scheduling.html',
            description: 'Greedy algorithm for task optimization'
        });
    }

    navigateToModule(moduleKey) {
        const module = this.modules.get(moduleKey);
        if (module) {
            // Store current module in sessionStorage for back navigation
            sessionStorage.setItem('currentModule', moduleKey);
            window.location.href = module.file;
        }
    }

    // Utility function for creating animated elements
    static createAnimatedElement(type, className = '', content = '') {
        const element = document.createElement(type);
        element.className = `animated-element ${className}`;
        element.textContent = content;
        return element;
    }

    // Utility function for delays in animations
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Utility function for generating random arrays
    static generateRandomArray(size, min = 1, max = 100) {
        return Array.from({ length: size }, () => 
            Math.floor(Math.random() * (max - min + 1)) + min
        );
    }

    // Utility function for shuffling arrays
    static shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DSAUniverse();
});

// Export for use in modules
window.DSAUniverse = DSAUniverse;