class BiosAnalyticsApp {
    constructor() {
        this.apiBaseUrl = 'https://code-efficiency-reporter-tunnel-z4lvajnr.devinapps.com';
        this.currentSection = 'dashboard';
        this.data = {
            items: [],
            analytics: {
                totalItems: 0,
                lastUpdated: new Date()
            }
        };
        this.charts = {};
        this.currentEditId = null;
        this.currentDeleteId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.initializeCharts();
        this.showSection('dashboard');
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        const refreshBtn = document.querySelector('button[onclick="loadData()"]');
        if (refreshBtn) {
            refreshBtn.onclick = () => this.loadData();
        }

        const addBtn = document.querySelector('button[onclick="addNewItem()"]');
        if (addBtn) {
            addBtn.onclick = () => this.addNewItem();
        }

        const testBtn = document.querySelector('button[onclick="testEndpoint()"]');
        if (testBtn) {
            testBtn.onclick = () => this.testEndpoint();
        }

        const researchForm = document.getElementById('research-form');
        if (researchForm) {
            researchForm.addEventListener('submit', (e) => this.submitResearchForm(e));
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal('research-modal');
                this.closeModal('delete-modal');
            }
        });
    }

    showSection(sectionName) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        this.currentSection = sectionName;

        if (sectionName === 'data') {
            this.loadData();
        } else if (sectionName === 'analytics') {
            this.loadAnalytics();
        }
    }

    async loadInitialData() {
        this.showLoading(true);
        try {
            await this.loadData();
            this.updateDashboard();
            this.addActivity('Data loaded successfully', 'success');
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showToast('Failed to load initial data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/research/items/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.data.items = data.items || [];
            this.data.analytics.totalItems = data.total || this.data.items.length;
            this.data.analytics.lastUpdated = new Date();
            
            this.updateDataTable();
            this.updateDashboard();
            this.addActivity(`Loaded ${this.data.items.length} research items`, 'info');
            this.showToast('Data refreshed successfully', 'success');
            
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showToast('Failed to load data from API', 'error');
            this.addActivity('Failed to load data', 'error');
            
            try {
                const fallbackResponse = await fetch(`${this.apiBaseUrl}/items/`);
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    this.data.items = Object.entries(fallbackData).map(([id, item]) => ({
                        id: parseInt(id),
                        ...item,
                        category: item.category || 'Research Item',
                        research_type: item.research_type || 'Study',
                        status: item.status || 'active'
                    }));
                    this.data.analytics.totalItems = this.data.items.length;
                    this.updateDataTable();
                    this.updateDashboard();
                    this.addActivity(`Loaded ${this.data.items.length} items via fallback`, 'info');
                }
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        }
    }

    updateDataTable() {
        const tbody = document.getElementById('data-table-body');
        if (!tbody) return;

        if (this.data.items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No research data available</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.items.map(item => `
            <tr>
                <td><strong>${item.id}</strong></td>
                <td>${item.name}</td>
                <td>${item.description}</td>
                <td><span class="badge">${item.category || item.type}</span></td>
                <td><span class="badge">${item.research_type || 'Research Item'}</span></td>
                <td><span class="status-badge ${item.status || 'active'}">${item.status || 'active'}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="app.editItem('${item.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="app.deleteItem('${item.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateDashboard() {
        const totalItemsEl = document.getElementById('total-items');
        if (totalItemsEl) {
            totalItemsEl.textContent = this.data.analytics.totalItems;
        }

        if (this.charts && this.charts.dataChart) {
            this.updateDataChart();
        }
    }

    initializeCharts() {
        this.charts = {};
        
        const dataChartCtx = document.getElementById('dataChart');
        if (dataChartCtx) {
            this.charts.dataChart = new Chart(dataChartCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Research Items',
                        data: [12, 19, 8, 15, 22, 18],
                        borderColor: '#059669',
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Analysis Complete',
                        data: [8, 15, 6, 12, 18, 14],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Healthcare Research Progress'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        }
                    }
                }
            });
        }

        this.initializeAnalyticsCharts();
    }

    initializeAnalyticsCharts() {
        const distributionCtx = document.getElementById('distributionChart');
        if (distributionCtx) {
            this.charts.distributionChart = new Chart(distributionCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Natural Medicine', 'Clinical Trials', 'Data Analysis', 'Research Papers'],
                    datasets: [{
                        data: [35, 25, 20, 20],
                        backgroundColor: [
                            '#059669',
                            '#2563eb',
                            '#0891b2',
                            '#d97706'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        const trendCtx = document.getElementById('trendChart');
        if (trendCtx) {
            this.charts.trendChart = new Chart(trendCtx, {
                type: 'bar',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [{
                        label: 'Research Activity',
                        data: [65, 78, 82, 95],
                        backgroundColor: 'rgba(5, 150, 105, 0.8)',
                        borderColor: '#059669',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    updateDataChart() {
        if (!this.charts.dataChart) return;
        
        const chart = this.charts.dataChart;
        chart.data.datasets[0].data = [
            this.data.analytics.totalItems,
            this.data.analytics.totalItems + 2,
            this.data.analytics.totalItems - 1,
            this.data.analytics.totalItems + 3,
            this.data.analytics.totalItems + 1,
            this.data.analytics.totalItems
        ];
        chart.update();
    }

    async loadAnalytics() {
        this.addActivity('Loading advanced analytics...', 'info');
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/analytics/summary`);
            if (response.ok) {
                const analytics = await response.json();
                this.updateAnalyticsCharts(analytics);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
        
        if (this.charts.distributionChart) {
            const total = this.data.analytics.totalItems;
            this.charts.distributionChart.data.datasets[0].data = [
                Math.floor(total * 0.4),
                Math.floor(total * 0.3),
                Math.floor(total * 0.2),
                Math.floor(total * 0.1)
            ];
            this.charts.distributionChart.update();
        }
    }

    updateAnalyticsCharts(analytics) {
        if (this.charts.distributionChart && analytics.categories) {
            const categories = Object.keys(analytics.categories);
            const values = Object.values(analytics.categories);
            
            this.charts.distributionChart.data.labels = categories;
            this.charts.distributionChart.data.datasets[0].data = values;
            this.charts.distributionChart.update();
        }
    }

    async testEndpoint() {
        const select = document.getElementById('endpoint-select');
        const responseEl = document.getElementById('api-response');
        
        if (!select || !responseEl) return;
        
        const endpoint = select.value;
        responseEl.textContent = 'Testing endpoint...';
        
        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`);
            const data = await response.json();
            
            responseEl.textContent = JSON.stringify(data, null, 2);
            this.addActivity(`API test successful: ${endpoint}`, 'success');
            
        } catch (error) {
            responseEl.textContent = `Error: ${error.message}`;
            this.addActivity(`API test failed: ${endpoint}`, 'error');
        }
    }

    addNewItem() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'Add New Research Item';
        document.getElementById('submit-text').textContent = 'Add Research Item';
        document.getElementById('research-form').reset();
        document.getElementById('research-status').value = 'active';
        this.showModal('research-modal');
        this.addActivity('Add new item form opened', 'info');
    }

    editItem(id) {
        const item = this.data.items.find(item => item.id == id);
        if (!item) return;

        this.currentEditId = id;
        document.getElementById('modal-title').textContent = 'Edit Research Item';
        document.getElementById('submit-text').textContent = 'Update Research Item';
        
        document.getElementById('research-name').value = item.name;
        document.getElementById('research-description').value = item.description;
        document.getElementById('research-category').value = item.category || '';
        document.getElementById('research-type').value = item.research_type || '';
        document.getElementById('research-status').value = item.status || 'active';
        
        this.showModal('research-modal');
        this.addActivity(`Editing item: ${item.name}`, 'info');
    }

    deleteItem(id) {
        const item = this.data.items.find(item => item.id == id);
        if (!item) return;

        this.currentDeleteId = id;
        document.getElementById('delete-item-name').textContent = item.name;
        this.showModal('delete-modal');
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
    }

    async submitResearchForm(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            category: formData.get('category'),
            research_type: formData.get('research_type'),
            status: formData.get('status')
        };

        try {
            let response;
            if (this.currentEditId) {
                response = await fetch(`${this.apiBaseUrl}/research/items/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            } else {
                response = await fetch(`${this.apiBaseUrl}/research/items/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.closeModal('research-modal');
                await this.loadData();
                this.showToast(result.message, 'success');
                this.addActivity(result.message, 'success');
            } else {
                throw new Error(result.message || 'Failed to save research item');
            }
        } catch (error) {
            console.error('Failed to save research item:', error);
            this.showToast('Failed to save research item', 'error');
            this.addActivity('Failed to save research item', 'error');
        }
    }

    async confirmDelete() {
        if (!this.currentDeleteId) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/research/items/${this.currentDeleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.closeModal('delete-modal');
                await this.loadData();
                this.showToast(result.message, 'success');
                this.addActivity(result.message, 'success');
            } else {
                throw new Error(result.message || 'Failed to delete research item');
            }
        } catch (error) {
            console.error('Failed to delete research item:', error);
            this.showToast('Failed to delete research item', 'error');
            this.addActivity('Failed to delete research item', 'error');
        }
    }

    viewItem(id) {
        const item = this.data.items.find(item => item.id === id);
        if (item) {
            this.showToast(`Viewing item: ${item.name}`, 'info');
            this.addActivity(`Viewed item: ${item.name}`, 'info');
        }
    }

    addActivity(message, type = 'info') {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };

        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="${iconMap[type] || iconMap.info}"></i>
            <span>${message}</span>
            <time>${new Date().toLocaleTimeString()}</time>
        `;

        activityList.insertBefore(activityItem, activityList.firstChild);

        while (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    showLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new BiosAnalyticsApp();
});

function loadData() {
    if (window.app) {
        window.app.loadData();
    }
}

function addNewItem() {
    if (window.app) {
        window.app.addNewItem();
    }
}

function testEndpoint() {
    if (window.app) {
        window.app.testEndpoint();
    }
}

function closeResearchModal() {
    if (window.app) {
        window.app.closeModal('research-modal');
    }
}

function closeDeleteModal() {
    if (window.app) {
        window.app.closeModal('delete-modal');
    }
}

function confirmDelete() {
    if (window.app) {
        window.app.confirmDelete();
    }
}
