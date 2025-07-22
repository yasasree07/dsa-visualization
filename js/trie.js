class TrieNode {
    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

class TrieVisualizer {
    constructor() {
        this.root = new TrieNode();
        this.words = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('addWord').addEventListener('click', () => this.addWord());
        document.getElementById('loadSampleWords').addEventListener('click', () => this.loadSampleWords());
        document.getElementById('clearTrie').addEventListener('click', () => this.clearTrie());
        
        document.getElementById('wordInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addWord();
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('searchInput').addEventListener('keydown', (e) => {
            this.handleSearchKeydown(e);
        });
    }

    addWord() {
        const word = document.getElementById('wordInput').value.trim().toLowerCase();
        if (!word) return;

        if (this.words.includes(word)) {
            this.showResult(`"${word}" is already in the trie`, 'error');
            return;
        }

        this.insertWord(word);
        this.words.push(word);
        this.renderWordList();
        this.renderTrieStructure();
        this.showResult(`Added "${word}" to the trie`, 'success');
        
        document.getElementById('wordInput').value = '';
    }

    insertWord(word) {
        let current = this.root;
        
        for (const char of word) {
            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }
        
        current.isEndOfWord = true;
    }

    loadSampleWords() {
        const sampleWords = [
            'apple', 'application', 'apply', 'appreciate', 'approach',
            'banana', 'band', 'bandana', 'bank', 'banner',
            'cat', 'car', 'card', 'care', 'careful', 'carry',
            'dog', 'door', 'down', 'download', 'dragon',
            'elephant', 'email', 'empty', 'end', 'energy',
            'fire', 'fish', 'flag', 'flower', 'food',
            'game', 'garden', 'gate', 'gift', 'girl',
            'house', 'happy', 'heart', 'help', 'home'
        ];

        this.clearTrie();
        
        sampleWords.forEach(word => {
            this.insertWord(word);
            this.words.push(word);
        });

        this.renderWordList();
        this.renderTrieStructure();
        this.showResult(`Loaded ${sampleWords.length} sample words`, 'success');
    }

    clearTrie() {
        this.root = new TrieNode();
        this.words = [];
        this.renderWordList();
        this.renderTrieStructure();
        document.getElementById('suggestions').innerHTML = '';
        document.getElementById('searchInput').value = '';
        this.showResult('Trie cleared', 'success');
    }

    handleSearch(prefix) {
        const suggestions = this.getSuggestions(prefix);
        this.renderSuggestions(suggestions, prefix);
        this.highlightTriePath(prefix);
    }

    handleSearchKeydown(e) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        const highlighted = document.querySelector('.suggestion-item.highlight');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (highlighted) {
                highlighted.classList.remove('highlight');
                const next = highlighted.nextElementSibling;
                if (next) {
                    next.classList.add('highlight');
                } else {
                    suggestions[0]?.classList.add('highlight');
                }
            } else {
                suggestions[0]?.classList.add('highlight');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (highlighted) {
                highlighted.classList.remove('highlight');
                const prev = highlighted.previousElementSibling;
                if (prev) {
                    prev.classList.add('highlight');
                } else {
                    suggestions[suggestions.length - 1]?.classList.add('highlight');
                }
            } else {
                suggestions[suggestions.length - 1]?.classList.add('highlight');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlighted) {
                document.getElementById('searchInput').value = highlighted.textContent;
                document.getElementById('suggestions').innerHTML = '';
            }
        }
    }

    getSuggestions(prefix) {
        if (!prefix) return [];
        
        const suggestions = [];
        const node = this.findNode(prefix);
        
        if (node) {
            this.collectWords(node, prefix, suggestions);
        }
        
        return suggestions.sort().slice(0, 10); // Limit to 10 suggestions
    }

    findNode(prefix) {
        let current = this.root;
        
        for (const char of prefix) {
            if (!current.children[char]) {
                return null;
            }
            current = current.children[char];
        }
        
        return current;
    }

    collectWords(node, prefix, suggestions) {
        if (node.isEndOfWord) {
            suggestions.push(prefix);
        }
        
        for (const [char, childNode] of Object.entries(node.children)) {
            this.collectWords(childNode, prefix + char, suggestions);
        }
    }

    renderSuggestions(suggestions, prefix) {
        const container = document.getElementById('suggestions');
        container.innerHTML = '';
        
        if (suggestions.length === 0) {
            if (prefix) {
                container.innerHTML = '<div style="padding: var(--spacing-sm); color: var(--text-secondary); font-style: italic;">No suggestions found</div>';
            }
            return;
        }
        
        suggestions.forEach((suggestion, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            
            item.addEventListener('click', () => {
                document.getElementById('searchInput').value = suggestion;
                container.innerHTML = '';
            });
            
            container.appendChild(item);
        });
    }

    highlightTriePath(prefix) {
        // Remove previous highlights
        document.querySelectorAll('.trie-node').forEach(node => {
            node.classList.remove('highlight');
        });
        
        if (!prefix) return;
        
        // Highlight path for current prefix
        let current = this.root;
        let path = '';
        
        for (const char of prefix) {
            if (!current.children[char]) break;
            
            path += char;
            current = current.children[char];
            
            const nodeElement = document.getElementById(`trie-node-${path}`);
            if (nodeElement) {
                nodeElement.classList.add('highlight');
            }
        }
    }

    renderWordList() {
        const container = document.getElementById('wordList');
        container.innerHTML = '';
        
        if (this.words.length === 0) {
            container.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); font-style: italic;">No words added yet</div>';
            return;
        }
        
        this.words.sort().forEach((word, index) => {
            const item = document.createElement('div');
            item.className = 'word-item';
            item.textContent = word;
            
            // Highlight newly added word
            if (index === this.words.length - 1) {
                item.classList.add('new');
            }
            
            container.appendChild(item);
        });
    }

    renderTrieStructure() {
        const container = document.getElementById('trieVisualization');
        container.innerHTML = '';
        
        if (this.words.length === 0) {
            container.innerHTML = '<div style="color: var(--text-secondary); font-style: italic;">Trie is empty - Add words to see the structure</div>';
            return;
        }
        
        const rootElement = document.createElement('div');
        rootElement.textContent = 'Root';
        rootElement.style.fontWeight = 'bold';
        rootElement.style.color = 'var(--primary-color)';
        container.appendChild(rootElement);
        
        this.renderTrieNode(this.root, '', container, 0);
    }

    renderTrieNode(node, prefix, container, depth) {
        const sortedChildren = Object.entries(node.children).sort();
        
        for (const [char, childNode] of sortedChildren) {
            const currentPrefix = prefix + char;
            const nodeElement = document.createElement('div');
            nodeElement.className = 'trie-node';
            nodeElement.id = `trie-node-${currentPrefix}`;
            nodeElement.style.marginLeft = `${(depth + 1) * 20}px`;
            
            let nodeText = '├─ ' + char;
            if (childNode.isEndOfWord) {
                nodeText += ' (end)';
                nodeElement.classList.add('end-word');
            }
            
            nodeElement.textContent = nodeText;
            container.appendChild(nodeElement);
            
            this.renderTrieNode(childNode, currentPrefix, container, depth + 1);
        }
    }

    showResult(message, type) {
        const resultElement = document.getElementById('trieResult');
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
    new TrieVisualizer();
});