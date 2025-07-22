class HashTableVisualizer {
    constructor() {
        this.tableSize = 10;
        this.table = Array(this.tableSize).fill(null).map(() => []);
        this.collisionMethod = 'chaining';
        this.itemCount = 0;
        this.collisionCount = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTable();
        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('insertItem').addEventListener('click', () => this.insertItem());
        document.getElementById('searchItem').addEventListener('click', () => this.searchItem());
        document.getElementById('deleteItem').addEventListener('click', () => this.deleteItem());
        document.getElementById('clearTable').addEventListener('click', () => this.clearTable());

        document.getElementById('keyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.insertItem();
        });

        document.getElementById('valueInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.insertItem();
        });

        // Collision method buttons
        document.querySelectorAll('.method-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.setCollisionMethod(e.target.dataset.method);
            });
        });
    }

    setCollisionMethod(method) {
        this.collisionMethod = method;
        
        // Update button states
        document.querySelectorAll('.method-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-method="${method}"]`).classList.add('active');
        
        // Clear and re-render table for different collision handling
        this.clearTable();
        this.showResult(`Switched to ${method} collision resolution`, 'success');
    }

    hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            const char = key.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) % this.tableSize;
    }

    async insertItem() {
        const key = document.getElementById('keyInput').value.trim();
        const value = document.getElementById('valueInput').value.trim();
        
        if (!key || !value) {
            this.showResult('Please enter both key and value', 'error');
            return;
        }

        const index = this.hash(key);
        let inserted = false;
        let finalIndex = index;

        // Clear previous highlights
        this.clearHighlights();

        // Highlight the initial hash position
        this.highlightBucket(index);
        await DSAUniverse.delay(500);

        switch (this.collisionMethod) {
            case 'chaining':
                inserted = await this.insertWithChaining(key, value, index);
                finalIndex = index;
                break;
            case 'linear':
                const linearResult = await this.insertWithLinearProbing(key, value, index);
                inserted = linearResult.inserted;
                finalIndex = linearResult.index;
                break;
            case 'quadratic':
                const quadraticResult = await this.insertWithQuadraticProbing(key, value, index);
                inserted = quadraticResult.inserted;
                finalIndex = quadraticResult.index;
                break;
        }

        if (inserted) {
            this.itemCount++;
            this.updateStats();
            this.showResult(`Inserted "${key}: ${value}" at index ${finalIndex}`, 'success');
            
            // Clear inputs
            document.getElementById('keyInput').value = '';
            document.getElementById('valueInput').value = '';
        }

        this.clearHighlights();
    }

    async insertWithChaining(key, value, index) {
        const bucket = this.table[index];
        
        // Check if key already exists
        const existingIndex = bucket.findIndex(item => item.key === key);
        if (existingIndex !== -1) {
            bucket[existingIndex].value = value;
            this.showResult(`Updated "${key}" with new value`, 'success');
            this.renderTable();
            return true;
        }

        // Check for collision
        if (bucket.length > 0) {
            this.collisionCount++;
            this.highlightBucket(index, 'collision');
            await DSAUniverse.delay(500);
        }

        bucket.push({ key, value, new: true });
        this.renderTable();
        
        // Remove new flag after animation
        setTimeout(() => {
            bucket.forEach(item => delete item.new);
            this.renderTable();
        }, 1000);

        return true;
    }

    async insertWithLinearProbing(key, value, originalIndex) {
        let index = originalIndex;
        let probeCount = 0;

        while (probeCount < this.tableSize) {
            const bucket = this.table[index];
            
            // If bucket is empty or contains the same key
            if (bucket.length === 0 || (bucket[0] && bucket[0].key === key)) {
                if (bucket.length > 0 && bucket[0].key === key) {
                    bucket[0].value = value;
                    this.showResult(`Updated "${key}" with new value`, 'success');
                } else {
                    if (index !== originalIndex) {
                        this.collisionCount++;
                    }
                    bucket.push({ key, value, new: true });
                    
                    // Remove new flag after animation
                    setTimeout(() => {
                        bucket.forEach(item => delete item.new);
                        this.renderTable();
                    }, 1000);
                }
                
                this.renderTable();
                return { inserted: true, index };
            }

            // Collision - highlight and move to next
            this.highlightBucket(index, 'collision');
            await DSAUniverse.delay(300);
            
            index = (index + 1) % this.tableSize;
            probeCount++;
        }

        this.showResult('Hash table is full!', 'error');
        return { inserted: false, index: originalIndex };
    }

    async insertWithQuadraticProbing(key, value, originalIndex) {
        let probeCount = 0;

        while (probeCount < this.tableSize) {
            const index = (originalIndex + probeCount * probeCount) % this.tableSize;
            const bucket = this.table[index];
            
            // If bucket is empty or contains the same key
            if (bucket.length === 0 || (bucket[0] && bucket[0].key === key)) {
                if (bucket.length > 0 && bucket[0].key === key) {
                    bucket[0].value = value;
                    this.showResult(`Updated "${key}" with new value`, 'success');
                } else {
                    if (probeCount > 0) {
                        this.collisionCount++;
                    }
                    bucket.push({ key, value, new: true });
                    
                    // Remove new flag after animation
                    setTimeout(() => {
                        bucket.forEach(item => delete item.new);
                        this.renderTable();
                    }, 1000);
                }
                
                this.renderTable();
                return { inserted: true, index };
            }

            // Collision - highlight and move to next quadratic position
            this.highlightBucket(index, 'collision');
            await DSAUniverse.delay(300);
            
            probeCount++;
        }

        this.showResult('Hash table is full!', 'error');
        return { inserted: false, index: originalIndex };
    }

    async searchItem() {
        const key = document.getElementById('keyInput').value.trim();
        if (!key) {
            this.showResult('Please enter a key to search', 'error');
            return;
        }

        const index = this.hash(key);
        this.clearHighlights();
        this.highlightBucket(index);

        let found = false;
        let foundIndex = -1;

        switch (this.collisionMethod) {
            case 'chaining':
                const bucket = this.table[index];
                const item = bucket.find(item => item.key === key);
                if (item) {
                    found = true;
                    foundIndex = index;
                    this.showResult(`Found "${key}: ${item.value}" at index ${index}`, 'success');
                }
                break;
                
            case 'linear':
                const linearResult = await this.searchWithLinearProbing(key, index);
                found = linearResult.found;
                foundIndex = linearResult.index;
                break;
                
            case 'quadratic':
                const quadraticResult = await this.searchWithQuadraticProbing(key, index);
                found = quadraticResult.found;
                foundIndex = quadraticResult.index;
                break;
        }

        if (!found) {
            this.showResult(`"${key}" not found in hash table`, 'error');
        }

        setTimeout(() => this.clearHighlights(), 2000);
    }

    async searchWithLinearProbing(key, originalIndex) {
        let index = originalIndex;
        let probeCount = 0;

        while (probeCount < this.tableSize) {
            const bucket = this.table[index];
            
            if (bucket.length === 0) {
                return { found: false, index: -1 };
            }
            
            if (bucket[0] && bucket[0].key === key) {
                this.showResult(`Found "${key}: ${bucket[0].value}" at index ${index}`, 'success');
                return { found: true, index };
            }

            this.highlightBucket(index, 'collision');
            await DSAUniverse.delay(300);
            
            index = (index + 1) % this.tableSize;
            probeCount++;
        }

        return { found: false, index: -1 };
    }

    async searchWithQuadraticProbing(key, originalIndex) {
        let probeCount = 0;

        while (probeCount < this.tableSize) {
            const index = (originalIndex + probeCount * probeCount) % this.tableSize;
            const bucket = this.table[index];
            
            if (bucket.length === 0) {
                return { found: false, index: -1 };
            }
            
            if (bucket[0] && bucket[0].key === key) {
                this.showResult(`Found "${key}: ${bucket[0].value}" at index ${index}`, 'success');
                return { found: true, index };
            }

            this.highlightBucket(index, 'collision');
            await DSAUniverse.delay(300);
            
            probeCount++;
        }

        return { found: false, index: -1 };
    }

    async deleteItem() {
        const key = document.getElementById('keyInput').value.trim();
        if (!key) {
            this.showResult('Please enter a key to delete', 'error');
            return;
        }

        const index = this.hash(key);
        this.clearHighlights();
        this.highlightBucket(index);

        let deleted = false;

        switch (this.collisionMethod) {
            case 'chaining':
                const bucket = this.table[index];
                const itemIndex = bucket.findIndex(item => item.key === key);
                if (itemIndex !== -1) {
                    bucket.splice(itemIndex, 1);
                    deleted = true;
                    this.itemCount--;
                }
                break;
                
            case 'linear':
            case 'quadratic':
                // For open addressing, we need to find and remove the item
                // This is simplified - in practice, deletion in open addressing is more complex
                deleted = await this.deleteWithProbing(key, index);
                break;
        }

        if (deleted) {
            this.updateStats();
            this.renderTable();
            this.showResult(`Deleted "${key}" from hash table`, 'success');
            document.getElementById('keyInput').value = '';
        } else {
            this.showResult(`"${key}" not found in hash table`, 'error');
        }

        setTimeout(() => this.clearHighlights(), 2000);
    }

    async deleteWithProbing(key, originalIndex) {
        // Simplified deletion for demonstration
        for (let i = 0; i < this.tableSize; i++) {
            const bucket = this.table[i];
            if (bucket.length > 0 && bucket[0].key === key) {
                bucket.splice(0, 1);
                this.itemCount--;
                return true;
            }
        }
        return false;
    }

    clearTable() {
        this.table = Array(this.tableSize).fill(null).map(() => []);
        this.itemCount = 0;
        this.collisionCount = 0;
        this.updateStats();
        this.renderTable();
        this.showResult('Hash table cleared', 'success');
    }

    renderTable() {
        const container = document.getElementById('hashTable');
        container.innerHTML = '';

        for (let i = 0; i < this.tableSize; i++) {
            // Index column
            const indexElement = document.createElement('div');
            indexElement.className = 'bucket-index';
            indexElement.textContent = i;
            container.appendChild(indexElement);

            // Bucket column
            const bucketElement = document.createElement('div');
            bucketElement.className = 'bucket';
            bucketElement.id = `bucket-${i}`;

            const bucket = this.table[i];
            if (bucket.length === 0) {
                bucketElement.innerHTML = '<span style="color: var(--text-light); font-style: italic;">empty</span>';
            } else {
                bucket.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = `hash-item ${item.new ? 'new' : ''}`;
                    itemElement.textContent = `${item.key}: ${item.value}`;
                    bucketElement.appendChild(itemElement);
                });
            }

            container.appendChild(bucketElement);
        }
    }

    highlightBucket(index, type = 'highlight') {
        const bucket = document.getElementById(`bucket-${index}`);
        if (bucket) {
            bucket.classList.add(type);
        }
    }

    clearHighlights() {
        document.querySelectorAll('.bucket').forEach(bucket => {
            bucket.classList.remove('highlight', 'collision');
        });
    }

    updateStats() {
        document.getElementById('itemCount').textContent = this.itemCount;
        document.getElementById('loadFactor').textContent = (this.itemCount / this.tableSize).toFixed(2);
        document.getElementById('collisionCount').textContent = this.collisionCount;
        document.getElementById('tableSize').textContent = this.tableSize;
    }

    showResult(message, type) {
        const resultElement = document.getElementById('hashResult');
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
    new HashTableVisualizer();
});