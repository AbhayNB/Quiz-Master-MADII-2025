// Analytics component for admin dashboard
export const AnalyticsPage = {
    data() {
        return {
            loading: false,
            error: null,
            userStats: null,
            quizStats: null,
            charts: {
                dailyActivity: null,
                subjectDistribution: null,
                performanceBySubject: null,
                userActivity: null
            }
        }
    },
    computed: {
        subjects() {
            return this.$store.getters.subjects;
        }
    },
    methods: {
        async fetchAnalytics() {
            this.loading = true;
            this.error = null;
            try {
                await Promise.all([
                    this.$store.dispatch('fetchUserSummary'),
                    this.$store.dispatch('fetchQuizHistory'),
                    this.$store.dispatch('fetchSubjects'),
                    this.$store.dispatch('fetchActiveUsers')
                ]);

                // Initialize charts after data is loaded
                this.$nextTick(() => {
                    this.initializeCharts();
                });
            } catch (error) {
                this.error = error.message;
                console.error('Error fetching analytics:', error);
            } finally {
                this.loading = false;
            }
        },

        initializeCharts() {
            // Clear existing charts
            Object.keys(this.charts).forEach(key => {
                if (this.charts[key]) {
                    this.charts[key].destroy();
                }
            });

            // Daily Activity Chart
            const dailyActivityCtx = document.getElementById('dailyActivityChart').getContext('2d');
            this.charts.dailyActivity = new Chart(dailyActivityCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Quiz Attempts',
                        data: [65, 59, 80, 81, 56, 55, 40],
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Daily Quiz Activity'
                        }
                    }
                }
            });

            // Subject Distribution Chart
            const subjectDistributionCtx = document.getElementById('subjectDistributionChart').getContext('2d');
            this.charts.subjectDistribution = new Chart(subjectDistributionCtx, {
                type: 'doughnut',
                data: {
                    labels: this.subjects.map(s => s.name),
                    datasets: [{
                        data: this.subjects.map(s => this.$store.getters.chapters(s.id)?.length || 0),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Content Distribution by Subject'
                        }
                    }
                }
            });

            // Performance by Subject Chart
            const performanceCtx = document.getElementById('performanceChart').getContext('2d');
            this.charts.performanceBySubject = new Chart(performanceCtx, {
                type: 'bar',
                data: {
                    labels: this.subjects.map(s => s.name),
                    datasets: [{
                        label: 'Average Score (%)',
                        data: this.subjects.map(() => Math.floor(Math.random() * 40) + 60), // Placeholder data
                        backgroundColor: 'rgba(75, 192, 192, 0.8)'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Average Performance by Subject'
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

            // User Activity Chart
            const userActivityCtx = document.getElementById('userActivityChart').getContext('2d');
            this.charts.userActivity = new Chart(userActivityCtx, {
                type: 'line',
                data: {
                    labels: ['Last 7 Days', 'Last 6 Days', 'Last 5 Days', 'Last 4 Days', 'Last 3 Days', 'Yesterday', 'Today'],
                    datasets: [{
                        label: 'Active Users',
                        data: [30, 35, 45, 40, 50, 45, 55],
                        fill: true,
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'User Activity Trend'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    },
    mounted() {
        this.fetchAnalytics();
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Analytics Dashboard</h2>
            <button class="btn btn-primary" @click="fetchAnalytics" :disabled="loading">
                <i class="bi bi-arrow-clockwise" :class="{ 'spinner-border spinner-border-sm': loading }"></i>
                Refresh Data
            </button>
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <!-- Key Metrics Cards -->
        <div class="row row-cols-1 row-cols-md-4 g-4 mb-4">
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total Users</h6>
                                <h2 class="card-title mb-0">{{ $store.getters.users?.length || 0 }}</h2>
                            </div>
                            <i class="bi bi-people fs-1 text-primary opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Active Users</h6>
                                <h2 class="card-title mb-0">{{ $store.getters.activeUsers }}</h2>
                            </div>
                            <i class="bi bi-person-check fs-1 text-success opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total Quizzes</h6>
                                <h2 class="card-title mb-0">{{ subjects.reduce((total, subject) => {
                                    const chapters = $store.getters.chapters(subject.id) || [];
                                    return total + chapters.reduce((t, chapter) => 
                                        t + ($store.getters.quizzes(chapter.id)?.length || 0), 0);
                                }, 0) }}</h2>
                            </div>
                            <i class="bi bi-journal-check fs-1 text-info opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total Subjects</h6>
                                <h2 class="card-title mb-0">{{ subjects.length }}</h2>
                            </div>
                            <i class="bi bi-book fs-1 text-warning opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Grid -->
        <div class="row g-4">
            <!-- Daily Activity Chart -->
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <canvas id="dailyActivityChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Subject Distribution Chart -->
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <canvas id="subjectDistributionChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Performance Chart -->
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <canvas id="performanceChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- User Activity Chart -->
            <div class="col-md-6">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <canvas id="userActivityChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};