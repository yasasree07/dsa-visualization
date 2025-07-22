class JobSchedulingVisualizer {
    constructor() {
        this.jobs = [];
        this.scheduledJobs = [];
        this.currentAlgorithm = 'sjf';
        this.isRunning = false;
        this.jobCounter = 1;
        
        this.algorithmDescriptions = {
            sjf: 'Shortest Job First (SJF): Schedules jobs in order of increasing execution time to minimize average waiting time.',
            edf: 'Earliest Deadline First (EDF): Schedules jobs in order of earliest deadline to minimize missed deadlines.',
            priority: 'Priority Scheduling: Schedules jobs based on priority level (1 = highest priority, 10 = lowest priority).',
            fcfs: 'First Come First Serve (FCFS): Schedules jobs in the order they arrive (simple queue-based scheduling).'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateJobsList();
        this.updateStats();
    }

    setupEventListeners() {
        // Algorithm tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchAlgorithm(e.target.dataset.algorithm);
            });
        });

        // Job management
        document.getElementById('addJob').addEventListener('click', () => this.addJob());
        document.getElementById('scheduleJobs').addEventListener('click', () => this.scheduleJobs());
        document.getElementById('loadSampleJobs').addEventListener('click', () => this.loadSampleJobs());
        document.getElementById('clearJobs').addEventListener('click', () => this.clearJobs());

        // Enter key support
        document.getElementById('jobName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addJob();
        });
    }

    switchAlgorithm(algorithm) {
        this.currentAlgorithm = algorithm;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-algorithm="${algorithm}"]`).classList.add('active');
        
        // Update description
        document.getElementById('algorithmDescription').innerHTML = 
            `<strong>${this.getAlgorithmName(algorithm)}:</strong> ${this.algorithmDescriptions[algorithm]}`;
        
        // Clear previous scheduling
        this.clearScheduling();
    }

    getAlgorithmName(algorithm) {
        const names = {
            sjf: 'Shortest Job First (SJF)',
            edf: 'Earliest Deadline First (EDF)',
            priority: 'Priority Scheduling',
            fcfs: 'First Come First Serve (FCFS)'
        };
        return names[algorithm];
    }

    addJob() {
        const name = document.getElementById('jobName').value.trim() || `Job ${this.jobCounter}`;
        const duration = parseInt(document.getElementById('jobDuration').value);
        const deadline = parseInt(document.getElementById('jobDeadline').value);
        const priority = parseInt(document.getElementById('jobPriority').value);
        
        if (duration < 100 || deadline < 500) {
            this.showResult('Invalid job parameters', 'error');
            return;
        }

        const job = {
            id: Date.now(),
            name,
            duration,
            deadline,
            priority,
            arrivalTime: Date.now(),
            waitTime: 0,
            completionTime: 0,
            color: this.generateJobColor()
        };

        this.jobs.push(job);
        this.jobCounter++;
        
        // Auto-increment job name
        document.getElementById('jobName').value = `Job ${this.jobCounter}`;
        
        this.updateJobsList();
        this.updateStats();
        this.clearScheduling();
        this.showResult(`Added ${name}`, 'success');
    }

    generateJobColor() {
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#4ade80', '#fbbf24', 
            '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f59e0b'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    loadSampleJobs() {
        this.jobs = [
            { id: 1, name: 'Compile Code', duration: 2000, deadline: 5000, priority: 2, arrivalTime: 0, waitTime: 0, completionTime: 0, color: '#667eea' },
            { id: 2, name: 'Run Tests', duration: 1500, deadline: 4000, priority: 1, arrivalTime: 0, waitTime: 0, completionTime: 0, color: '#4ade80' },
            { id: 3, name: 'Deploy App', duration: 3000, deadline: 8000, priority: 3, arrivalTime: 0, waitTime: 0, completionTime: 0, color: '#f59e0b' },
            { id: 4, name: 'Send Email', duration: 500, deadline: 2000, priority: 4, arrivalTime: 0, waitTime: 0, completionTime: 0, color: '#ef4444' },
            { id: 5, name: 'Backup Data', duration: 2500, deadline: 10000, priority: 5, arrivalTime: 0, waitTime: 0, completionTime: 0, color: '#8b5cf6' }
        ];
        
        this.jobCounter = 6;
        this.updateJobsList();
        this.updateStats();
        this.clearScheduling();
        this.showResult('Loaded sample jobs', 'success');
    }

    clearJobs() {
        this.jobs = [];
        this.jobCounter = 1;
        this.updateJobsList();
        this.updateStats();
        this.clearScheduling();
        document.getElementById('jobName').value = 'Job 1';
        this.showResult('All jobs cleared', 'success');
    }

    deleteJob(jobId) {
        this.jobs = this.jobs.filter(job => job.id !== jobId);
        this.updateJobsList();
        this.updateStats();
        this.clearScheduling();
        this.showResult('Job deleted', 'success');
    }

    async scheduleJobs() {
        if (this.isRunning || this.jobs.length === 0) return;
        
        this.isRunning = true;
        this.clearScheduling();
        
        // Sort jobs based on selected algorithm
        let sortedJobs = [...this.jobs];
        
        switch (this.currentAlgorithm) {
            case 'sjf':
                sortedJobs.sort((a, b) => a.duration - b.duration);
                break;
            case 'edf':
                sortedJobs.sort((a, b) => a.deadline - b.deadline);
                break;
            case 'priority':
                sortedJobs.sort((a, b) => a.priority - b.priority);
                break;
            case 'fcfs':
                sortedJobs.sort((a, b) => a.arrivalTime - b.arrivalTime);
                break;
        }
        
        // Simulate scheduling
        let currentTime = 0;
        this.scheduledJobs = [];
        
        for (let i = 0; i < sortedJobs.length; i++) {
            const job = { ...sortedJobs[i] };
            
            // Highlight current job
            this.highlightJob(job.id, 'current');
            await DSAUniverse.delay(500);
            
            job.waitTime = currentTime;
            job.startTime = currentTime;
            job.completionTime = currentTime + job.duration;
            
            this.scheduledJobs.push(job);
            
            // Update timeline
            this.updateTimeline();
            
            // Highlight as scheduled
            this.highlightJob(job.id, 'scheduled');
            
            currentTime += job.duration;
            await DSAUniverse.delay(300);
        }
        
        this.updateStats();
        this.showResult(`Scheduled ${this.jobs.length} jobs using ${this.getAlgorithmName(this.currentAlgorithm)}`, 'success');
        this.isRunning = false;
    }

    updateJobsList() {
        const container = document.getElementById('jobsList');
        container.innerHTML = '';
        
        if (this.jobs.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); font-style: italic;">No jobs added yet</div>';
            return;
        }
        
        this.jobs.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.className = 'job-item';
            jobElement.id = `job-${job.id}`;
            
            jobElement.innerHTML = `
                <div class="job-info">
                    <div class="job-name">${job.name}</div>
                    <div class="job-details">
                        Duration: ${job.duration}ms | Deadline: ${job.deadline}ms | Priority: ${job.priority}
                    </div>
                </div>
                <button class="delete-job" onclick="jobScheduler.deleteJob(${job.id})">×</button>
            `;
            
            container.appendChild(jobElement);
        });
    }

    highlightJob(jobId, className) {
        // Remove previous highlights
        document.querySelectorAll('.job-item').forEach(item => {
            item.classList.remove('current', 'scheduled');
        });
        
        // Add new highlight
        const jobElement = document.getElementById(`job-${jobId}`);
        if (jobElement) {
            jobElement.classList.add(className);
        }
    }

    updateTimeline() {
        const container = document.getElementById('timelineVisualization');
        container.innerHTML = '';
        
        if (this.scheduledJobs.length === 0) {
            container.innerHTML = '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-secondary); font-style: italic;">Schedule jobs to see timeline</div>';
            return;
        }
        
        const totalTime = Math.max(...this.scheduledJobs.map(job => job.completionTime));
        const containerWidth = container.offsetWidth;
        const scale = containerWidth / totalTime;
        
        this.scheduledJobs.forEach(job => {
            const jobElement = document.createElement('div');
            jobElement.className = 'timeline-job';
            jobElement.style.left = `${job.startTime * scale}px`;
            jobElement.style.width = `${job.duration * scale}px`;
            jobElement.style.backgroundColor = job.color;
            jobElement.textContent = job.name;
            jobElement.title = `${job.name}: ${job.startTime}ms - ${job.completionTime}ms`;
            
            container.appendChild(jobElement);
        });
        
        // Update scale indicator
        document.getElementById('timelineScale').textContent = `Scale: 1px = ${(1/scale).toFixed(1)}ms`;
    }

    clearScheduling() {
        this.scheduledJobs = [];
        this.updateTimeline();
        
        // Remove highlights from jobs
        document.querySelectorAll('.job-item').forEach(item => {
            item.classList.remove('current', 'scheduled');
        });
    }

    updateStats() {
        document.getElementById('totalJobs').textContent = this.jobs.length;
        
        if (this.scheduledJobs.length === 0) {
            document.getElementById('totalTime').textContent = '0ms';
            document.getElementById('avgWaitTime').textContent = '0ms';
            document.getElementById('missedDeadlines').textContent = '0';
            return;
        }
        
        const totalTime = Math.max(...this.scheduledJobs.map(job => job.completionTime));
        const avgWaitTime = this.scheduledJobs.reduce((sum, job) => sum + job.waitTime, 0) / this.scheduledJobs.length;
        const missedDeadlines = this.scheduledJobs.filter(job => job.completionTime > job.deadline).length;
        
        document.getElementById('totalTime').textContent = `${totalTime}ms`;
        document.getElementById('avgWaitTime').textContent = `${Math.round(avgWaitTime)}ms`;
        document.getElementById('missedDeadlines').textContent = missedDeadlines;
    }

    showResult(message, type) {
        const resultElement = document.getElementById('schedulingResult');
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
    window.jobScheduler = new JobSchedulingVisualizer();
});