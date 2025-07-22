class ComplexityVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.inputSize = 10;
        this.maxInputSize = 100;
        this.isAnimating = false;
        this.activeComplexities = new Set(['constant', 'logarithmic', 'linear', 'linearithmic', 'quadratic', 'exponential']);
        
        this.complexityFunctions = {
            constant: (n) => 1,
            logarithmic: (n) => Math.log2(n),
            linear: (n) => n,
            linearithmic: (n) => n * Math.log2(n),
            quadratic: (n) => n * n,
            exponential: (n) => Math.pow(2, Math.min(n, 20)) // Cap to prevent overflow
        };

        this.complexityColors = {
            constant: '#10b981',
            logarithmic: '#3b82f6',
            linear: '#f59e0b',
            linearithmic: '#8b5cf6',
            quadratic: '#ef4444',
            exponential: '#dc2626'
        };

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.drawChart();
        this.updateOperationsDisplay();
    }

    setupCanvas() {
        this.canvas = document.getElementById('complexityChart');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth;
        this.canvas.height = container.offsetHeight;
        
        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    setupEventListeners() {
        document.getElementById('inputSize').addEventListener('input', (e) => {
            this.inputSize = parseInt(e.target.value);
            document.getElementById('inputSizeValue').textContent = this.inputSize;
            this.drawChart();
            this.updateOperationsDisplay();
        });

        document.getElementById('animateGrowth').addEventListener('click', () => {
            this.animateGrowth();
        });

        document.getElementById('resetChart').addEventListener('click', () => {
            this.resetChart();
        });

        // Legend item toggles
        document.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const complexity = e.currentTarget.dataset.complexity;
                this.toggleComplexity(complexity);
            });
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.drawChart();
        });
    }

    toggleComplexity(complexity) {
        const item = document.querySelector(`[data-complexity="${complexity}"]`);
        
        if (this.activeComplexities.has(complexity)) {
            this.activeComplexities.delete(complexity);
            item.classList.remove('active');
        } else {
            this.activeComplexities.add(complexity);
            item.classList.add('active');
        }
        
        this.drawChart();
        this.updateOperationsDisplay();
    }

    drawChart() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw grid and axes
        this.drawGrid(width, height);
        this.drawAxes(width, height);
        
        // Draw complexity curves
        this.drawComplexityCurves(width, height);
        
        // Draw current input size indicator
        this.drawCurrentInputIndicator(width, height);
    }

    drawGrid(width, height) {
        const padding = 60;
        const gridColor = '#e5e7eb';
        
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i / 10) * (width - 2 * padding);
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding);
            this.ctx.lineTo(x, height - padding);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i <= 10; i++) {
            const y = padding + (i / 10) * (height - 2 * padding);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(width - padding, y);
            this.ctx.stroke();
        }
    }

    drawAxes(width, height) {
        const padding = 60;
        
        this.ctx.strokeStyle = '#374151';
        this.ctx.lineWidth = 2;
        this.ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillStyle = '#374151';
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(padding, height - padding);
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.stroke();
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(padding, padding);
        this.ctx.lineTo(padding, height - padding);
        this.ctx.stroke();
        
        // X-axis labels
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i / 10) * (width - 2 * padding);
            const value = Math.round((i / 10) * this.maxInputSize);
            this.ctx.fillText(value.toString(), x - 10, height - padding + 20);
        }
        
        // Y-axis label
        this.ctx.save();
        this.ctx.translate(20, height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText('Operations', -30, 0);
        this.ctx.restore();
        
        // X-axis label
        this.ctx.fillText('Input Size (n)', width / 2 - 40, height - 20);
    }

    drawComplexityCurves(width, height) {
        const padding = 60;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Calculate maximum value for scaling
        let maxValue = 0;
        for (const complexity of this.activeComplexities) {
            const func = this.complexityFunctions[complexity];
            for (let n = 1; n <= this.maxInputSize; n++) {
                maxValue = Math.max(maxValue, func(n));
            }
        }
        
        // Draw each complexity curve
        for (const complexity of this.activeComplexities) {
            this.drawComplexityCurve(complexity, padding, chartWidth, chartHeight, maxValue);
        }
    }

    drawComplexityCurve(complexity, padding, chartWidth, chartHeight, maxValue) {
        const func = this.complexityFunctions[complexity];
        const color = this.complexityColors[complexity];
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        let firstPoint = true;
        for (let n = 1; n <= this.maxInputSize; n++) {
            const x = padding + (n / this.maxInputSize) * chartWidth;
            const value = func(n);
            const y = padding + chartHeight - (value / maxValue) * chartHeight;
            
            if (firstPoint) {
                this.ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }

    drawCurrentInputIndicator(width, height) {
        const padding = 60;
        const chartWidth = width - 2 * padding;
        
        const x = padding + (this.inputSize / this.maxInputSize) * chartWidth;
        
        // Vertical line
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(x, padding);
        this.ctx.lineTo(x, height - padding);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw points for each active complexity at current input size
        for (const complexity of this.activeComplexities) {
            const func = this.complexityFunctions[complexity];
            const color = this.complexityColors[complexity];
            const value = func(this.inputSize);
            
            // Calculate max value for scaling
            let maxValue = 0;
            for (const comp of this.activeComplexities) {
                const f = this.complexityFunctions[comp];
                for (let n = 1; n <= this.maxInputSize; n++) {
                    maxValue = Math.max(maxValue, f(n));
                }
            }
            
            const y = padding + (height - 2 * padding) - (value / maxValue) * (height - 2 * padding);
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // White border
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    updateOperationsDisplay() {
        const container = document.getElementById('operationsDisplay');
        container.innerHTML = '';
        
        for (const complexity of this.activeComplexities) {
            const func = this.complexityFunctions[complexity];
            const value = func(this.inputSize);
            const color = this.complexityColors[complexity];
            
            const card = document.createElement('div');
            card.className = 'operation-card';
            
            const valueElement = document.createElement('div');
            valueElement.className = 'operation-value';
            valueElement.style.color = color;
            valueElement.textContent = this.formatNumber(value);
            
            const labelElement = document.createElement('div');
            labelElement.className = 'operation-label';
            labelElement.textContent = this.getComplexityLabel(complexity);
            
            card.appendChild(valueElement);
            card.appendChild(labelElement);
            container.appendChild(card);
        }
    }

    formatNumber(num) {
        if (num < 1000) {
            return Math.round(num).toString();
        } else if (num < 1000000) {
            return (num / 1000).toFixed(1) + 'K';
        } else if (num < 1000000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else {
            return (num / 1000000000).toFixed(1) + 'B';
        }
    }

    getComplexityLabel(complexity) {
        const labels = {
            constant: 'O(1)',
            logarithmic: 'O(log n)',
            linear: 'O(n)',
            linearithmic: 'O(n log n)',
            quadratic: 'O(n²)',
            exponential: 'O(2ⁿ)'
        };
        return labels[complexity];
    }

    async animateGrowth() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const startSize = 1;
        const endSize = this.maxInputSize;
        const duration = 3000; // 3 seconds
        const steps = 60;
        const stepDuration = duration / steps;
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const currentSize = Math.round(startSize + (endSize - startSize) * progress);
            
            this.inputSize = currentSize;
            document.getElementById('inputSize').value = currentSize;
            document.getElementById('inputSizeValue').textContent = currentSize;
            
            this.drawChart();
            this.updateOperationsDisplay();
            
            await DSAUniverse.delay(stepDuration);
        }
        
        this.isAnimating = false;
    }

    resetChart() {
        this.inputSize = 10;
        document.getElementById('inputSize').value = 10;
        document.getElementById('inputSizeValue').textContent = 10;
        
        // Reset all complexities to active
        this.activeComplexities = new Set(['constant', 'logarithmic', 'linear', 'linearithmic', 'quadratic', 'exponential']);
        document.querySelectorAll('.legend-item').forEach(item => {
            item.classList.add('active');
        });
        
        this.drawChart();
        this.updateOperationsDisplay();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ComplexityVisualizer();
});