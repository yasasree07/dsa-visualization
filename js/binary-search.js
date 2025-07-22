class BinarySearchVisualizer {
    constructor() {
        this.arraySize = 10;
        this.speed = 1000;
        this.targetValue = 50;
        this.array = [];
        this.isRunning = false;
        this.currentStep = 0;
        this.comparisons = 0;
        this.steps = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateNewArray();
        this.reset();
    }

    setupEventListeners() {
        const arraySizeSlider = document.getElementById('arraySize');
        const speedSlider = document.getElementById('speed');
        const targetInput = document.getElementById('targetValue');
        const generateBtn = document.getElementById('generateArray');
        const startBtn = document.getElementById('startSearch');
        const resetBtn = document.getElementById('reset');

        arraySizeSlider.addEventListener('input', (e) => {
            this.arraySize = parseInt(e.target.value);
            document.getElementById('arraySizeValue').textContent = this.arraySize;
            if (!this.isRunning) {
                this.generateNewArray();
            }
        });

        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
        });

        targetInput.addEventListener('input', (e) => {
            this.targetValue = parseInt(e.target.value);
            if (!this.isRunning) {
                this.highlightTarget();
            }
        });

        generateBtn.addEventListener('click', () => {
            if (!this.isRunning) {
                this.generateNewArray();
            }
        });

        startBtn.addEventListener('click', () => {
            if (!this.isRunning) {
                this.startSearch();
            }
        });

        resetBtn.addEventListener('click', () => {
            this.reset();
        });
    }

    generateNewArray() {
        // Generate sorted array for binary search
        this.array = [];
        const step = Math.floor(100 / this.arraySize);
        
        for (let i = 0; i < this.arraySize; i++) {
            this.array.push((i + 1) * step + Math.floor(Math.random() * 5));
        }
        
        // Ensure array is sorted
        this.array.sort((a, b) => a - b);
        
        this.renderArray();
        this.highlightTarget();
    }

    renderArray() {
        const container = document.getElementById('arrayVisualization');
        container.innerHTML = '';
        
        this.array.forEach((value, index) => {
            const element = document.createElement('div');
            element.className = 'array-element';
            element.textContent = value;
            element.id = `element-${index}`;
            container.appendChild(element);
        });
    }

    highlightTarget() {
        // Remove previous highlights
        document.querySelectorAll('.array-element').forEach(el => {
            el.classList.remove('target');
        });
        
        // Highlight target if it exists in array
        const targetIndex = this.array.indexOf(this.targetValue);
        if (targetIndex !== -1) {
            document.getElementById(`element-${targetIndex}`).classList.add('target');
        }
    }

    reset() {
        this.isRunning = false;
        this.currentStep = 0;
        this.comparisons = 0;
        this.steps = [];
        
        // Clear all highlights
        document.querySelectorAll('.array-element').forEach(el => {
            el.className = 'array-element';
        });
        
        // Reset info display
        document.getElementById('currentStep').textContent = '0';
        document.getElementById('comparisons').textContent = '0';
        document.getElementById('lowPointer').textContent = '-';
        document.getElementById('highPointer').textContent = '-';
        document.getElementById('midPointer').textContent = '-';
        
        // Clear step list
        document.getElementById('stepList').innerHTML = '';
        
        // Hide result message
        document.getElementById('resultMessage').style.display = 'none';
        
        this.highlightTarget();
    }

    async startSearch() {
        this.isRunning = true;
        this.reset();
        
        let low = 0;
        let high = this.array.length - 1;
        let found = false;
        let foundIndex = -1;
        
        this.addStep(`Starting binary search for ${this.targetValue}`);
        this.addStep(`Array: [${this.array.join(', ')}]`);
        
        while (low <= high && this.isRunning) {
            this.currentStep++;
            this.comparisons++;
            
            const mid = Math.floor((low + high) / 2);
            
            // Update pointers display
            document.getElementById('currentStep').textContent = this.currentStep;
            document.getElementById('comparisons').textContent = this.comparisons;
            document.getElementById('lowPointer').textContent = low;
            document.getElementById('highPointer').textContent = high;
            document.getElementById('midPointer').textContent = mid;
            
            // Clear previous highlights
            document.querySelectorAll('.array-element').forEach(el => {
                el.classList.remove('low', 'high', 'mid', 'eliminated');
            });
            
            // Highlight current pointers
            document.getElementById(`element-${low}`).classList.add('low');
            document.getElementById(`element-${high}`).classList.add('high');
            document.getElementById(`element-${mid}`).classList.add('mid');
            
            this.addStep(`Step ${this.currentStep}: Checking middle element at index ${mid} (value: ${this.array[mid]})`);
            
            await DSAUniverse.delay(this.speed);
            
            if (this.array[mid] === this.targetValue) {
                // Found the target
                found = true;
                foundIndex = mid;
                document.getElementById(`element-${mid}`).classList.add('found');
                this.addStep(`🎉 Found ${this.targetValue} at index ${mid}!`);
                break;
            } else if (this.array[mid] < this.targetValue) {
                // Target is in the right half
                this.addStep(`${this.array[mid]} < ${this.targetValue}, search right half`);
                
                // Mark eliminated elements
                for (let i = low; i <= mid; i++) {
                    document.getElementById(`element-${i}`).classList.add('eliminated');
                }
                
                low = mid + 1;
            } else {
                // Target is in the left half
                this.addStep(`${this.array[mid]} > ${this.targetValue}, search left half`);
                
                // Mark eliminated elements
                for (let i = mid; i <= high; i++) {
                    document.getElementById(`element-${i}`).classList.add('eliminated');
                }
                
                high = mid - 1;
            }
            
            await DSAUniverse.delay(this.speed);
        }
        
        // Show result
        const resultMessage = document.getElementById('resultMessage');
        resultMessage.style.display = 'block';
        
        if (found) {
            resultMessage.textContent = `✅ Found ${this.targetValue} at index ${foundIndex} in ${this.currentStep} steps!`;
            resultMessage.className = 'result-message result-success';
            this.addStep(`✅ Search completed successfully in ${this.currentStep} steps!`);
        } else {
            resultMessage.textContent = `❌ ${this.targetValue} not found in the array after ${this.currentStep} steps.`;
            resultMessage.className = 'result-message result-not-found';
            this.addStep(`❌ ${this.targetValue} is not in the array.`);
        }
        
        this.isRunning = false;
    }

    addStep(description) {
        this.steps.push(description);
        const stepList = document.getElementById('stepList');
        
        const stepItem = document.createElement('li');
        stepItem.className = 'step-item active';
        stepItem.textContent = description;
        stepList.appendChild(stepItem);
        
        // Mark previous steps as completed
        const previousSteps = stepList.querySelectorAll('.step-item:not(:last-child)');
        previousSteps.forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
        
        // Scroll to latest step
        stepItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BinarySearchVisualizer();
});