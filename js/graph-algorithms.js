class GraphNode {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.neighbors = [];
        this.visited = false;
        this.distance = Infinity;
        this.previous = null;
        this.heuristic = 0;
    }
}

class GraphAlgorithmsVisualizer {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.startNode = null;
        this.endNode = null;
        this.currentAlgorithm = 'bfs';
        this.isRunning = false;
        this.mode = 'view'; // 'view', 'setStart', 'setEnd'
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateRandomGraph();
    }

    setupEventListeners() {
        // Algorithm tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchAlgorithm(e.target.dataset.algorithm);
            });
        });

        // Control buttons
        document.getElementById('generateGraph').addEventListener('click', () => this.generateRandomGraph());
        document.getElementById('setStart').addEventListener('click', () => this.setMode('setStart'));
        document.getElementById('setEnd').addEventListener('click', () => this.setMode('setEnd'));
        document.getElementById('startAlgorithm').addEventListener('click', () => this.startAlgorithm());
        document.getElementById('resetGraph').addEventListener('click', () => this.resetGraph());

        // Graph visualization clicks
        document.getElementById('graphVisualization').addEventListener('click', (e) => this.handleGraphClick(e));
    }

    switchAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-algorithm="${algorithm}"]`).classList.add('active');
        
        // Update current algorithm display
        document.getElementById('currentAlgorithm').textContent = algorithm.toUpperCase();
        
        this.resetGraph();
    }

    setMode(mode) {
        this.mode = mode;
        
        // Update button states
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        if (mode === 'setStart') {
            document.getElementById('setStart').classList.add('active');
        } else if (mode === 'setEnd') {
            document.getElementById('setEnd').classList.add('active');
        }
    }

    generateRandomGraph() {
        this.nodes = [];
        this.edges = [];
        this.startNode = null;
        this.endNode = null;
        
        const container = document.getElementById('graphVisualization');
        const rect = container.getBoundingClientRect();
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        
        // Generate random nodes
        const nodeCount = 12;
        for (let i = 0; i < nodeCount; i++) {
            const x = 50 + Math.random() * (width - 100);
            const y = 50 + Math.random() * (height - 100);
            this.nodes.push(new GraphNode(i, x, y));
        }
        
        // Generate edges (connect nearby nodes)
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const distance = this.calculateDistance(this.nodes[i], this.nodes[j]);
                if (distance < 150 && Math.random() > 0.4) {
                    this.nodes[i].neighbors.push(this.nodes[j]);
                    this.nodes[j].neighbors.push(this.nodes[i]);
                    this.edges.push({ from: this.nodes[i], to: this.nodes[j], weight: Math.round(distance) });
                }
            }
        }
        
        // Set default start and end nodes
        this.startNode = this.nodes[0];
        this.endNode = this.nodes[this.nodes.length - 1];
        
        this.renderGraph();
        this.resetStats();
    }

    calculateDistance(node1, node2) {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handleGraphClick(e) {
        if (this.isRunning) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find clicked node
        const clickedNode = this.nodes.find(node => {
            const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
            return distance <= 20;
        });
        
        if (clickedNode) {
            if (this.mode === 'setStart') {
                this.startNode = clickedNode;
                this.mode = 'view';
                document.getElementById('setStart').classList.remove('active');
            } else if (this.mode === 'setEnd') {
                this.endNode = clickedNode;
                this.mode = 'view';
                document.getElementById('setEnd').classList.remove('active');
            }
            
            this.renderGraph();
        }
    }

    async startAlgorithm() {
        if (this.isRunning || !this.startNode || !this.endNode) return;
        
        this.isRunning = true;
        this.resetGraph();
        
        const startTime = Date.now();
        let path = [];
        
        try {
            switch (this.currentAlgorithm) {
                case 'bfs':
                    path = await this.breadthFirstSearch();
                    break;
                case 'dfs':
                    path = await this.depthFirstSearch();
                    break;
                case 'dijkstra':
                    path = await this.dijkstraSearch();
                    break;
                case 'astar':
                    path = await this.aStarSearch();
                    break;
            }
            
            const endTime = Date.now();
            document.getElementById('algorithmTime').textContent = `${endTime - startTime}ms`;
            
            if (path.length > 0) {
                await this.animatePath(path);
                document.getElementById('pathLength').textContent = path.length - 1;
                this.showResult(`Path found! Length: ${path.length - 1}`, 'success');
            } else {
                this.showResult('No path found!', 'error');
            }
            
        } catch (error) {
            console.error('Algorithm error:', error);
        } finally {
            this.isRunning = false;
        }
    }

    async breadthFirstSearch() {
        const queue = [this.startNode];
        const visited = new Set();
        const parent = new Map();
        
        visited.add(this.startNode);
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            this.highlightNode(current, 'current');
            await DSAUniverse.delay(300);
            
            if (current === this.endNode) {
                return this.reconstructPath(parent, this.endNode);
            }
            
            for (const neighbor of current.neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent.set(neighbor, current);
                    queue.push(neighbor);
                    
                    this.highlightNode(neighbor, 'visited');
                    document.getElementById('visitedCount').textContent = visited.size;
                }
            }
            
            this.highlightNode(current, 'visited');
            await DSAUniverse.delay(200);
        }
        
        return [];
    }

    async depthFirstSearch() {
        const stack = [this.startNode];
        const visited = new Set();
        const parent = new Map();
        
        while (stack.length > 0) {
            const current = stack.pop();
            
            if (visited.has(current)) continue;
            
            visited.add(current);
            this.highlightNode(current, 'current');
            await DSAUniverse.delay(300);
            
            if (current === this.endNode) {
                return this.reconstructPath(parent, this.endNode);
            }
            
            for (const neighbor of current.neighbors) {
                if (!visited.has(neighbor)) {
                    parent.set(neighbor, current);
                    stack.push(neighbor);
                }
            }
            
            this.highlightNode(current, 'visited');
            document.getElementById('visitedCount').textContent = visited.size;
            await DSAUniverse.delay(200);
        }
        
        return [];
    }

    async dijkstraSearch() {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set(this.nodes);
        
        // Initialize distances
        this.nodes.forEach(node => {
            distances.set(node, node === this.startNode ? 0 : Infinity);
        });
        
        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let current = null;
            let minDistance = Infinity;
            
            for (const node of unvisited) {
                if (distances.get(node) < minDistance) {
                    minDistance = distances.get(node);
                    current = node;
                }
            }
            
            if (current === null || minDistance === Infinity) break;
            
            unvisited.delete(current);
            this.highlightNode(current, 'current');
            await DSAUniverse.delay(300);
            
            if (current === this.endNode) {
                return this.reconstructPath(previous, this.endNode);
            }
            
            for (const neighbor of current.neighbors) {
                if (unvisited.has(neighbor)) {
                    const edge = this.edges.find(e => 
                        (e.from === current && e.to === neighbor) || 
                        (e.from === neighbor && e.to === current)
                    );
                    const weight = edge ? edge.weight : this.calculateDistance(current, neighbor);
                    const alt = distances.get(current) + weight;
                    
                    if (alt < distances.get(neighbor)) {
                        distances.set(neighbor, alt);
                        previous.set(neighbor, current);
                        this.highlightNode(neighbor, 'visited');
                    }
                }
            }
            
            this.highlightNode(current, 'visited');
            document.getElementById('visitedCount').textContent = this.nodes.length - unvisited.size;
            await DSAUniverse.delay(200);
        }
        
        return [];
    }

    async aStarSearch() {
        const openSet = [this.startNode];
        const closedSet = new Set();
        const gScore = new Map();
        const fScore = new Map();
        const previous = new Map();
        
        // Initialize scores
        this.nodes.forEach(node => {
            gScore.set(node, node === this.startNode ? 0 : Infinity);
            fScore.set(node, node === this.startNode ? this.heuristic(node, this.endNode) : Infinity);
        });
        
        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (fScore.get(openSet[i]) < fScore.get(current)) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            openSet.splice(currentIndex, 1);
            closedSet.add(current);
            
            this.highlightNode(current, 'current');
            await DSAUniverse.delay(300);
            
            if (current === this.endNode) {
                return this.reconstructPath(previous, this.endNode);
            }
            
            for (const neighbor of current.neighbors) {
                if (closedSet.has(neighbor)) continue;
                
                const edge = this.edges.find(e => 
                    (e.from === current && e.to === neighbor) || 
                    (e.from === neighbor && e.to === current)
                );
                const weight = edge ? edge.weight : this.calculateDistance(current, neighbor);
                const tentativeGScore = gScore.get(current) + weight;
                
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(neighbor)) {
                    continue;
                }
                
                previous.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, this.endNode));
                
                this.highlightNode(neighbor, 'visited');
            }
            
            this.highlightNode(current, 'visited');
            document.getElementById('visitedCount').textContent = closedSet.size;
            await DSAUniverse.delay(200);
        }
        
        return [];
    }

    heuristic(node1, node2) {
        return this.calculateDistance(node1, node2);
    }

    reconstructPath(parent, endNode) {
        const path = [];
        let current = endNode;
        
        while (current) {
            path.unshift(current);
            current = parent.get(current);
        }
        
        return path;
    }

    async animatePath(path) {
        for (let i = 0; i < path.length; i++) {
            this.highlightNode(path[i], 'path');
            
            if (i > 0) {
                this.highlightEdge(path[i - 1], path[i], 'path');
            }
            
            await DSAUniverse.delay(200);
        }
    }

    highlightNode(node, className) {
        const nodeElement = document.getElementById(`node-${node.id}`);
        if (nodeElement) {
            nodeElement.className = `graph-node ${className}`;
            
            // Keep start/end styling
            if (node === this.startNode) {
                nodeElement.classList.add('start');
            } else if (node === this.endNode) {
                nodeElement.classList.add('end');
            }
        }
    }

    highlightEdge(from, to, className) {
        const edgeElement = document.getElementById(`edge-${from.id}-${to.id}`) || 
                          document.getElementById(`edge-${to.id}-${from.id}`);
        if (edgeElement) {
            edgeElement.classList.add(className);
        }
    }

    resetGraph() {
        // Reset node states
        this.nodes.forEach(node => {
            node.visited = false;
            node.distance = Infinity;
            node.previous = null;
        });
        
        this.renderGraph();
        this.resetStats();
    }

    resetStats() {
        document.getElementById('visitedCount').textContent = '0';
        document.getElementById('pathLength').textContent = '0';
        document.getElementById('algorithmTime').textContent = '0ms';
    }

    renderGraph() {
        const container = document.getElementById('graphVisualization');
        container.innerHTML = '';
        
        // Render edges first (so they appear behind nodes)
        this.edges.forEach((edge, index) => {
            const edgeElement = document.createElement('div');
            edgeElement.className = 'graph-edge';
            edgeElement.id = `edge-${edge.from.id}-${edge.to.id}`;
            
            const dx = edge.to.x - edge.from.x;
            const dy = edge.to.y - edge.from.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            edgeElement.style.left = `${edge.from.x}px`;
            edgeElement.style.top = `${edge.from.y}px`;
            edgeElement.style.width = `${length}px`;
            edgeElement.style.transform = `rotate(${angle}deg)`;
            
            container.appendChild(edgeElement);
        });
        
        // Render nodes
        this.nodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'graph-node';
            nodeElement.id = `node-${node.id}`;
            nodeElement.textContent = node.id;
            nodeElement.style.left = `${node.x - 20}px`;
            nodeElement.style.top = `${node.y - 20}px`;
            
            if (node === this.startNode) {
                nodeElement.classList.add('start');
            } else if (node === this.endNode) {
                nodeElement.classList.add('end');
            }
            
            container.appendChild(nodeElement);
        });
    }

    showResult(message, type) {
        const resultElement = document.getElementById('algorithmResult');
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
    new GraphAlgorithmsVisualizer();
});