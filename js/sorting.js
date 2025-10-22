const DSAUniverse = {
    generateRandomArray(size, min, max) {
        let arr = [];
        for (let i = 0; i < size; i++) {
            arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return arr;
    },
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

class SortingRace {
    constructor() {
        this.arraySize = 10;
        this.speed = 300;
        this.originalArray = [];
        this.isRunning = false;
        this.algorithms = ['bubble', 'insertion', 'merge', 'quick'];
        this.stats = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateNewArray();
        this.resetStats();
    }

    setupEventListeners() {
        const arraySizeSlider = document.getElementById('arraySize');
        const speedSlider = document.getElementById('speed');
        const generateBtn = document.getElementById('generateArray');
        const startBtn = document.getElementById('startRace');
        const resetBtn = document.getElementById('reset');

        arraySizeSlider.addEventListener('input', (e) => {
            this.arraySize = parseInt(e.target.value);
            document.getElementById('arraySizeValue').textContent = this.arraySize;
            if (!this.isRunning) {
                this.generateNewArray();
            }
        });

        speedSlider.addEventListener('input', (e) => {
            this.speed = 1100 - parseInt(e.target.value);
        });

        generateBtn.addEventListener('click', () => {
            if (!this.isRunning) {
                this.generateNewArray();
                this.resetStats();
            }
        });

        startBtn.addEventListener('click', () => {
            if (!this.isRunning) {
                this.startRace();
            }
        });

        resetBtn.addEventListener('click', () => {
            this.reset();
        });
    }

    generateNewArray() {
        this.originalArray = DSAUniverse.generateRandomArray(this.arraySize, 5, 95);
        this.renderBoxes();
    }

    renderBoxes() {
        this.algorithms.forEach(algorithm => {
            const container = document.getElementById(`${algorithm}Bars`);
            container.innerHTML = '';
            this.originalArray.forEach((value, index) => {
                const box = document.createElement('div');
                box.className = 'box';
                box.textContent = value;
                box.id = `${algorithm}-box-${index}`;
                container.appendChild(box);
            });
        });
    }

    resetStats() {
        this.algorithms.forEach(algorithm => {
            this.stats[algorithm] = { comparisons: 0, swaps: 0, time: 0, finished: false };
            document.getElementById(`${algorithm}Comparisons`).textContent = '0';
            document.getElementById(`${algorithm}Swaps`).textContent = '0';
            document.getElementById(`${algorithm}Time`).textContent = '0ms';
        });
        document.getElementById('totalComparisons').textContent = '0';
        document.getElementById('totalSwaps').textContent = '0';
        document.getElementById('winner').textContent = '-';
        document.getElementById('raceTime').textContent = '0ms';
        this.algorithms.forEach(algorithm => {
            document.getElementById(`${algorithm}-sort`).classList.remove('winner');
        });
    }

    async startRace() {
        this.isRunning = true;
        this.resetStats();
        const startTime = Date.now();
        const promises = [
            this.bubbleSort([...this.originalArray]),
            this.insertionSort([...this.originalArray]),
            this.mergeSort([...this.originalArray]),
            this.quickSort([...this.originalArray])
        ];
        try {
            await Promise.all(promises);
            const endTime = Date.now();
            let winner = '';
            let minTime = Infinity;
            this.algorithms.forEach(algorithm => {
                if (this.stats[algorithm].time < minTime) {
                    minTime = this.stats[algorithm].time;
                    winner = algorithm;
                }
            });
            document.getElementById(`${winner}-sort`).classList.add('winner');
            document.getElementById('winner').textContent = winner.charAt(0).toUpperCase() + winner.slice(1) + ' Sort';
            document.getElementById('raceTime').textContent = `${endTime - startTime}ms`;
            const totalComparisons = this.algorithms.reduce((sum, alg) => sum + this.stats[alg].comparisons, 0);
            const totalSwaps = this.algorithms.reduce((sum, alg) => sum + this.stats[alg].swaps, 0);
            document.getElementById('totalComparisons').textContent = totalComparisons;
            document.getElementById('totalSwaps').textContent = totalSwaps;
        } catch (error) {}
        finally { this.isRunning = false; }
    }

    reset() {
        this.isRunning = false;
        this.generateNewArray();
        this.resetStats();
    }

    async bubbleSort(array) {
        const startTime = Date.now();
        const n = array.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.isRunning) return;
                this.highlightBoxes('bubble', [j, j + 1], 'comparing');
                this.stats.bubble.comparisons++;
                document.getElementById('bubbleComparisons').textContent = this.stats.bubble.comparisons;
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    this.stats.bubble.swaps++;
                    document.getElementById('bubbleSwaps').textContent = this.stats.bubble.swaps;
                    await this.swapBoxes('bubble', j, j + 1);
                }
                await DSAUniverse.delay(this.speed);
                this.clearHighlights('bubble');
            }
            this.highlightBoxes('bubble', [n - i - 1], 'sorted');
        }
        this.highlightBoxes('bubble', [0], 'sorted');
        const endTime = Date.now();
        this.stats.bubble.time = endTime - startTime;
        document.getElementById('bubbleTime').textContent = `${this.stats.bubble.time}ms`;
    }

    async insertionSort(array) {
        const startTime = Date.now();
        const n = array.length;
        for (let i = 1; i < n; i++) {
            if (!this.isRunning) return;
            let key = array[i];
            let j = i - 1;
            this.highlightBoxes('insertion', [i], 'highlight');
            while (j >= 0) {
                if (!this.isRunning) return;
                this.highlightBoxes('insertion', [j], 'comparing');
                this.stats.insertion.comparisons++;
                document.getElementById('insertionComparisons').textContent = this.stats.insertion.comparisons;
                if (array[j] <= key) break;
                array[j + 1] = array[j];
                this.stats.insertion.swaps++;
                document.getElementById('insertionSwaps').textContent = this.stats.insertion.swaps;
                await this.updateBox('insertion', j + 1, array[j]);
                await DSAUniverse.delay(this.speed);
                j--;
            }
            array[j + 1] = key;
            await this.updateBox('insertion', j + 1, key);
            this.clearHighlights('insertion');
            this.highlightBoxes('insertion', Array.from({length: i + 1}, (_, k) => k), 'sorted');
            await DSAUniverse.delay(this.speed);
        }
        const endTime = Date.now();
        this.stats.insertion.time = endTime - startTime;
        document.getElementById('insertionTime').textContent = `${this.stats.insertion.time}ms`;
    }

    async mergeSort(array) {
        const startTime = Date.now();
        await this.mergeSortHelper(array, 0, array.length - 1);
        this.highlightBoxes('merge', Array.from({length: array.length}, (_, i) => i), 'sorted');
        const endTime = Date.now();
        this.stats.merge.time = endTime - startTime;
        document.getElementById('mergeTime').textContent = `${this.stats.merge.time}ms`;
    }

    async mergeSortHelper(array, left, right) {
        if (!this.isRunning || left >= right) return;
        const mid = Math.floor((left + right) / 2);
        await this.mergeSortHelper(array, left, mid);
        await this.mergeSortHelper(array, mid + 1, right);
        await this.merge(array, left, mid, right);
    }

    async merge(array, left, mid, right) {
        if (!this.isRunning) return;
        const leftArray = array.slice(left, mid + 1),
            rightArray = array.slice(mid + 1, right + 1);
        let i = 0, j = 0, k = left;
        while (i < leftArray.length && j < rightArray.length) {
            if (!this.isRunning) return;
            this.stats.merge.comparisons++;
            document.getElementById('mergeComparisons').textContent = this.stats.merge.comparisons;
            if (leftArray[i] <= rightArray[j]) {
                array[k] = leftArray[i]; i++;
            } else {
                array[k] = rightArray[j]; j++;
            }
            this.stats.merge.swaps++;
            document.getElementById('mergeSwaps').textContent = this.stats.merge.swaps;
            await this.updateBox('merge', k, array[k]);
            this.highlightBoxes('merge', [k], 'highlight');
            await DSAUniverse.delay(this.speed);
            k++;
        }
        while (i < leftArray.length) {
            if (!this.isRunning) return;
            array[k] = leftArray[i]; await this.updateBox('merge', k, array[k]); i++; k++;
        }
        while (j < rightArray.length) {
            if (!this.isRunning) return;
            array[k] = rightArray[j]; await this.updateBox('merge', k, array[k]); j++; k++;
        }
        this.clearHighlights('merge');
    }

    async quickSort(array) {
        const startTime = Date.now();
        await this.quickSortHelper(array, 0, array.length - 1);
        this.highlightBoxes('quick', Array.from({length: array.length}, (_, i) => i), 'sorted');
        const endTime = Date.now();
        this.stats.quick.time = endTime - startTime;
        document.getElementById('quickTime').textContent = `${this.stats.quick.time}ms`;
    }

    async quickSortHelper(array, low, high) {
        if (!this.isRunning || low >= high) return;
        const pi = await this.partition(array, low, high);
        await this.quickSortHelper(array, low, pi - 1);
        await this.quickSortHelper(array, pi + 1, high);
    }

    async partition(array, low, high) {
        if (!this.isRunning) return high;
        const pivot = array[high];
        this.highlightBoxes('quick', [high], 'highlight');
        let i = low - 1;
        for (let j = low; j < high; j++) {
            if (!this.isRunning) return high;
            this.highlightBoxes('quick', [j], 'comparing');
            this.stats.quick.comparisons++;
            document.getElementById('quickComparisons').textContent = this.stats.quick.comparisons;
            if (array[j] < pivot) {
                i++;
                if (i !== j) {
                    [array[i], array[j]] = [array[j], array[i]];
                    this.stats.quick.swaps++;
                    document.getElementById('quickSwaps').textContent = this.stats.quick.swaps;
                    await this.swapBoxes('quick', i, j);
                }
            }
            await DSAUniverse.delay(this.speed);
        }
        [array[i + 1], array[high]] = [array[high], array[i + 1]];
        this.stats.quick.swaps++;
        document.getElementById('quickSwaps').textContent = this.stats.quick.swaps;
        await this.swapBoxes('quick', i + 1, high);
        this.clearHighlights('quick');
        return i + 1;
    }

    highlightBoxes(algorithm, indices, className) {
        indices.forEach(index => {
            const box = document.getElementById(`${algorithm}-box-${index}`);
            if (box) box.className = `box ${className}`;
        });
    }

    clearHighlights(algorithm) {
        const container = document.getElementById(`${algorithm}Bars`);
        const boxes = container.querySelectorAll('.box');
        boxes.forEach(box => box.className = 'box');
    }

    async swapBoxes(algorithm, i, j) {
        const box1 = document.getElementById(`${algorithm}-box-${i}`);
        const box2 = document.getElementById(`${algorithm}-box-${j}`);
        if (box1 && box2) {
            const tempContent = box1.textContent;
            box1.textContent = box2.textContent;
            box2.textContent = tempContent;
        }
        await DSAUniverse.delay(100);
    }

    async updateBox(algorithm, index, value) {
        const box = document.getElementById(`${algorithm}-box-${index}`);
        if (box) { box.textContent = value; }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SortingRace();
});
