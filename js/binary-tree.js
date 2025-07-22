class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

class BinarySearchTreeVisualizer {
    constructor() {
        this.root = null;
        this.nodePositions = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('insertNode').addEventListener('click', () => this.insertNode());
        document.getElementById('deleteNode').addEventListener('click', () => this.deleteNode());
        document.getElementById('searchNode').addEventListener('click', () => this.searchNode());
        document.getElementById('inorderTraversal').addEventListener('click', () => this.traverseTree('inorder'));
        document.getElementById('preorderTraversal').addEventListener('click', () => this.traverseTree('preorder'));
        document.getElementById('postorderTraversal').addEventListener('click', () => this.traverseTree('postorder'));
        document.getElementById('clearTree').addEventListener('click', () => this.clearTree());

        document.getElementById('nodeValue').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.insertNode();
        });
    }

    async insertNode() {
        const value = parseInt(document.getElementById('nodeValue').value);
        if (isNaN(value)) return;

        if (this.root === null) {
            this.root = new TreeNode(value);
        } else {
            this.insertRecursive(this.root, value);
        }

        await this.renderTree();
        this.showResult(`Inserted ${value} into the tree`, 'success');
        
        // Auto-increment value
        document.getElementById('nodeValue').value = value + 1;
    }

    insertRecursive(node, value) {
        if (value < node.value) {
            if (node.left === null) {
                node.left = new TreeNode(value);
            } else {
                this.insertRecursive(node.left, value);
            }
        } else if (value > node.value) {
            if (node.right === null) {
                node.right = new TreeNode(value);
            } else {
                this.insertRecursive(node.right, value);
            }
        }
    }

    async deleteNode() {
        const value = parseInt(document.getElementById('nodeValue').value);
        if (isNaN(value) || this.root === null) return;

        this.root = this.deleteRecursive(this.root, value);
        await this.renderTree();
        this.showResult(`Deleted ${value} from the tree`, 'success');
    }

    deleteRecursive(node, value) {
        if (node === null) return null;

        if (value < node.value) {
            node.left = this.deleteRecursive(node.left, value);
        } else if (value > node.value) {
            node.right = this.deleteRecursive(node.right, value);
        } else {
            // Node to be deleted found
            if (node.left === null) return node.right;
            if (node.right === null) return node.left;

            // Node has two children
            const minValue = this.findMin(node.right);
            node.value = minValue;
            node.right = this.deleteRecursive(node.right, minValue);
        }
        return node;
    }

    findMin(node) {
        while (node.left !== null) {
            node = node.left;
        }
        return node.value;
    }

    async searchNode() {
        const value = parseInt(document.getElementById('nodeValue').value);
        if (isNaN(value) || this.root === null) return;

        const found = this.searchRecursive(this.root, value);
        
        if (found) {
            this.highlightNode(value);
            this.showResult(`Found ${value} in the tree`, 'success');
        } else {
            this.showResult(`${value} not found in the tree`, 'error');
        }
    }

    searchRecursive(node, value) {
        if (node === null) return false;
        if (node.value === value) return true;
        
        if (value < node.value) {
            return this.searchRecursive(node.left, value);
        } else {
            return this.searchRecursive(node.right, value);
        }
    }

    async traverseTree(type) {
        if (this.root === null) {
            this.showResult('Tree is empty', 'error');
            return;
        }

        const sequence = [];
        
        switch (type) {
            case 'inorder':
                this.inorderRecursive(this.root, sequence);
                break;
            case 'preorder':
                this.preorderRecursive(this.root, sequence);
                break;
            case 'postorder':
                this.postorderRecursive(this.root, sequence);
                break;
        }

        this.showTraversalResult(type, sequence);
        await this.animateTraversal(sequence);
    }

    inorderRecursive(node, sequence) {
        if (node !== null) {
            this.inorderRecursive(node.left, sequence);
            sequence.push(node.value);
            this.inorderRecursive(node.right, sequence);
        }
    }

    preorderRecursive(node, sequence) {
        if (node !== null) {
            sequence.push(node.value);
            this.preorderRecursive(node.left, sequence);
            this.preorderRecursive(node.right, sequence);
        }
    }

    postorderRecursive(node, sequence) {
        if (node !== null) {
            this.postorderRecursive(node.left, sequence);
            this.postorderRecursive(node.right, sequence);
            sequence.push(node.value);
        }
    }

    async animateTraversal(sequence) {
        for (let i = 0; i < sequence.length; i++) {
            this.highlightNode(sequence[i]);
            await DSAUniverse.delay(800);
            this.removeHighlight(sequence[i]);
        }
    }

    clearTree() {
        this.root = null;
        this.renderTree();
        this.hideTraversalResult();
        this.showResult('Tree cleared', 'success');
    }

    async renderTree() {
        const container = document.getElementById('treeVisualization');
        container.innerHTML = '';

        if (this.root === null) {
            container.innerHTML = '<div style="color: var(--text-secondary); font-style: italic; margin: auto;">Tree is empty - Insert nodes to build the tree</div>';
            return;
        }

        this.nodePositions.clear();
        this.calculatePositions(this.root, 400, 50, 200);
        this.renderNodes(container);
        this.renderEdges(container);
    }

    calculatePositions(node, x, y, offset) {
        if (node === null) return;

        this.nodePositions.set(node.value, { x, y });

        if (node.left) {
            this.calculatePositions(node.left, x - offset, y + 80, offset / 2);
        }
        if (node.right) {
            this.calculatePositions(node.right, x + offset, y + 80, offset / 2);
        }
    }

    renderNodes(container) {
        this.nodePositions.forEach((pos, value) => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'tree-node';
            nodeElement.textContent = value;
            nodeElement.id = `node-${value}`;
            nodeElement.style.left = `${pos.x - 25}px`;
            nodeElement.style.top = `${pos.y - 25}px`;
            container.appendChild(nodeElement);
        });
    }

    renderEdges(container) {
        this.renderEdgesRecursive(this.root, container);
    }

    renderEdgesRecursive(node, container) {
        if (node === null) return;

        const nodePos = this.nodePositions.get(node.value);

        if (node.left) {
            const leftPos = this.nodePositions.get(node.left.value);
            this.createEdge(container, nodePos, leftPos);
            this.renderEdgesRecursive(node.left, container);
        }

        if (node.right) {
            const rightPos = this.nodePositions.get(node.right.value);
            this.createEdge(container, nodePos, rightPos);
            this.renderEdgesRecursive(node.right, container);
        }
    }

    createEdge(container, from, to) {
        const edge = document.createElement('div');
        edge.className = 'tree-edge';
        
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        edge.style.left = `${from.x}px`;
        edge.style.top = `${from.y}px`;
        edge.style.width = `${length}px`;
        edge.style.transform = `rotate(${angle}deg)`;
        
        container.appendChild(edge);
    }

    highlightNode(value) {
        const node = document.getElementById(`node-${value}`);
        if (node) {
            node.classList.add('highlight');
        }
    }

    removeHighlight(value) {
        const node = document.getElementById(`node-${value}`);
        if (node) {
            node.classList.remove('highlight');
        }
    }

    showTraversalResult(type, sequence) {
        const resultContainer = document.getElementById('traversalResult');
        const titleElement = document.getElementById('traversalTitle');
        const sequenceElement = document.getElementById('traversalSequence');
        
        titleElement.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Traversal:`;
        sequenceElement.textContent = sequence.join(' → ');
        resultContainer.style.display = 'block';
    }

    hideTraversalResult() {
        document.getElementById('traversalResult').style.display = 'none';
    }

    showResult(message, type) {
        const resultElement = document.getElementById('operationResult');
        resultElement.textContent = message;
        resultElement.className = `operation-result result-${type}`;
        resultElement.style.display = 'block';
        
        setTimeout(() => {
            resultElement.style.display = 'none';
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BinarySearchTreeVisualizer();
});