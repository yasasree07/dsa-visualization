class DataStructuresVisualizer {
    constructor() {
        this.stack = [];
        this.queue = [];
        this.linkedList = [];
        this.currentTab = 'stack';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderStack();
        this.renderQueue();
        this.renderLinkedList();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Stack operations
        document.getElementById('stackPush').addEventListener('click', () => this.stackPush());
        document.getElementById('stackPop').addEventListener('click', () => this.stackPop());
        document.getElementById('stackPeek').addEventListener('click', () => this.stackPeek());
        document.getElementById('stackClear').addEventListener('click', () => this.stackClear());

        // Queue operations
        document.getElementById('queueEnqueue').addEventListener('click', () => this.queueEnqueue());
        document.getElementById('queueDequeue').addEventListener('click', () => this.queueDequeue());
        document.getElementById('queueFront').addEventListener('click', () => this.queueFront());
        document.getElementById('queueClear').addEventListener('click', () => this.queueClear());

        // Linked List operations
        document.getElementById('listInsert').addEventListener('click', () => this.listInsert());
        document.getElementById('listDelete').addEventListener('click', () => this.listDelete());
        document.getElementById('listSearch').addEventListener('click', () => this.listSearch());
        document.getElementById('listClear').addEventListener('click', () => this.listClear());

        // Enter key support
        document.getElementById('stackValue').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.stackPush();
        });
        document.getElementById('queueValue').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.queueEnqueue();
        });
        document.getElementById('listValue').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.listInsert();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    // Stack Operations
    async stackPush() {
        const value = parseInt(document.getElementById('stackValue').value);
        if (isNaN(value)) return;

        this.stack.push(value);
        await this.renderStack();
        this.showResult('stack', `Pushed ${value} to stack`, 'success');
        
        // Auto-increment value
        document.getElementById('stackValue').value = value + 1;
    }

    async stackPop() {
        if (this.stack.length === 0) {
            this.showResult('stack', 'Stack is empty!', 'error');
            return;
        }

        const value = this.stack.pop();
        await this.renderStack();
        this.showResult('stack', `Popped ${value} from stack`, 'success');
    }

    stackPeek() {
        if (this.stack.length === 0) {
            this.showResult('stack', 'Stack is empty!', 'error');
            return;
        }

        const value = this.stack[this.stack.length - 1];
        this.highlightTop('stack');
        this.showResult('stack', `Top element: ${value}`, 'success');
    }

    async stackClear() {
        this.stack = [];
        await this.renderStack();
        this.showResult('stack', 'Stack cleared', 'success');
    }

    async renderStack() {
        const container = document.getElementById('stackVisualization');
        container.innerHTML = '';

        if (this.stack.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); font-style: italic;">Stack is empty</div>';
            return;
        }

        this.stack.forEach((value, index) => {
            const node = document.createElement('div');
            node.className = 'node';
            node.textContent = value;
            node.id = `stack-node-${index}`;
            
            if (index === this.stack.length - 1) {
                node.classList.add('new');
            }
            
            container.appendChild(node);
        });

        await DSAUniverse.delay(300);
    }

    // Queue Operations
    async queueEnqueue() {
        const value = parseInt(document.getElementById('queueValue').value);
        if (isNaN(value)) return;

        this.queue.push(value);
        await this.renderQueue();
        this.showResult('queue', `Enqueued ${value} to queue`, 'success');
        
        // Auto-increment value
        document.getElementById('queueValue').value = value + 1;
    }

    async queueDequeue() {
        if (this.queue.length === 0) {
            this.showResult('queue', 'Queue is empty!', 'error');
            return;
        }

        const value = this.queue.shift();
        await this.renderQueue();
        this.showResult('queue', `Dequeued ${value} from queue`, 'success');
    }

    queueFront() {
        if (this.queue.length === 0) {
            this.showResult('queue', 'Queue is empty!', 'error');
            return;
        }

        const value = this.queue[0];
        this.highlightTop('queue');
        this.showResult('queue', `Front element: ${value}`, 'success');
    }

    async queueClear() {
        this.queue = [];
        await this.renderQueue();
        this.showResult('queue', 'Queue cleared', 'success');
    }

    async renderQueue() {
        const container = document.getElementById('queueVisualization');
        container.innerHTML = '';

        if (this.queue.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); font-style: italic;">Queue is empty</div>';
            return;
        }

        this.queue.forEach((value, index) => {
            const node = document.createElement('div');
            node.className = 'node';
            node.textContent = value;
            node.id = `queue-node-${index}`;
            
            if (index === this.queue.length - 1) {
                node.classList.add('new');
            }
            
            container.appendChild(node);

            if (index < this.queue.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                container.appendChild(arrow);
            }
        });

        await DSAUniverse.delay(300);
    }

    // Linked List Operations
    async listInsert() {
        const value = parseInt(document.getElementById('listValue').value);
        const position = parseInt(document.getElementById('listPosition').value);
        
        if (isNaN(value)) return;
        
        if (position < 0 || position > this.linkedList.length) {
            this.showResult('list', `Invalid position! Must be between 0 and ${this.linkedList.length}`, 'error');
            return;
        }

        this.linkedList.splice(position, 0, value);
        await this.renderLinkedList();
        this.showResult('list', `Inserted ${value} at position ${position}`, 'success');
        
        // Auto-increment value
        document.getElementById('listValue').value = value + 1;
    }

    async listDelete() {
        const position = parseInt(document.getElementById('listPosition').value);
        
        if (position < 0 || position >= this.linkedList.length) {
            this.showResult('list', `Invalid position! Must be between 0 and ${this.linkedList.length - 1}`, 'error');
            return;
        }

        const value = this.linkedList.splice(position, 1)[0];
        await this.renderLinkedList();
        this.showResult('list', `Deleted ${value} from position ${position}`, 'success');
    }

    listSearch() {
        const value = parseInt(document.getElementById('listValue').value);
        if (isNaN(value)) return;

        const index = this.linkedList.indexOf(value);
        
        if (index === -1) {
            this.showResult('list', `${value} not found in list`, 'error');
        } else {
            this.highlightNode('list', index);
            this.showResult('list', `Found ${value} at position ${index}`, 'success');
        }
    }

    async listClear() {
        this.linkedList = [];
        await this.renderLinkedList();
        this.showResult('list', 'Linked list cleared', 'success');
    }

    async renderLinkedList() {
        const container = document.getElementById('listVisualization');
        container.innerHTML = '';

        if (this.linkedList.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); font-style: italic;">Linked list is empty</div>';
            return;
        }

        this.linkedList.forEach((value, index) => {
            const node = document.createElement('div');
            node.className = 'node';
            node.textContent = value;
            node.id = `list-node-${index}`;
            container.appendChild(node);

            if (index < this.linkedList.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                container.appendChild(arrow);
            }
        });

        await DSAUniverse.delay(300);
    }

    highlightTop(type) {
        setTimeout(() => {
            if (type === 'stack' && this.stack.length > 0) {
                const topNode = document.getElementById(`stack-node-${this.stack.length - 1}`);
                if (topNode) {
                    topNode.classList.add('highlight');
                    setTimeout(() => topNode.classList.remove('highlight'), 2000);
                }
            } else if (type === 'queue' && this.queue.length > 0) {
                const frontNode = document.getElementById('queue-node-0');
                if (frontNode) {
                    frontNode.classList.add('highlight');
                    setTimeout(() => frontNode.classList.remove('highlight'), 2000);
                }
            }
        }, 100);
    }

    highlightNode(type, index) {
        setTimeout(() => {
            const node = document.getElementById(`${type}-node-${index}`);
            if (node) {
                node.classList.add('highlight');
                setTimeout(() => node.classList.remove('highlight'), 2000);
            }
        }, 100);
    }

    showResult(type, message, resultType) {
        const resultElement = document.getElementById(`${type}Result`);
        resultElement.textContent = message;
        resultElement.className = `operation-result result-${resultType}`;
        resultElement.style.display = 'block';
        
        setTimeout(() => {
            resultElement.style.display = 'none';
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DataStructuresVisualizer();
});