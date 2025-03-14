import { BarChart } from '../components/charts.js';
import { PieChart } from '../components/charts.js';

export const SummaryPage = {
    components: {
      'bar-chart': BarChart,
      'pie-chart': PieChart
    },
    data() {
      return {
        loading: false,
        error: null,
        totalQuizzes: 0,
        averageScore: 0,
        quizzesThisMonth: 0,
        bestSubject: '',
        subjectData: {
          labels: [],
          datasets: [{
            label: 'Average Score',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            borderRadius: 5,
            hoverBackgroundColor: 'rgba(54, 162, 235, 0.4)'
          }]
        },
        monthData: {
          labels: [],
          datasets: [{
            label: 'Monthly Activity',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
            hoverOffset: 4
          }]
        },
        recentQuizzes: []
      };
    },
    methods: {
      async loadSummary() {
        try {
          this.loading = true;
          const response = await this.$store.dispatch('fetchUserSummary');
          
          // Update stats
          this.totalQuizzes = response.total_quizzes || 0;
          this.averageScore = Math.round(response.average_score) || 0;
          this.quizzesThisMonth = response.quizzes_this_month || 0;
          this.bestSubject = response.best_subject || 'N/A';
          
          // Update subject performance chart
          const subjects = response.subject_performance || [];
          this.subjectData.labels = subjects.map(s => s.subject);
          this.subjectData.datasets[0].data = subjects.map(s => Math.round(s.average_score));
          
          // Update monthly activity chart
          const monthlyActivity = response.monthly_activity || [];
          this.monthData.labels = monthlyActivity.map(m => m.month);
          const monthlyData = monthlyActivity.map(m => m.count);
          this.monthData.datasets[0].data = monthlyData;
          
          // Generate colors for monthly chart
          const colors = this.generateColors(monthlyData.length);
          this.monthData.datasets[0].backgroundColor = colors.background;
          this.monthData.datasets[0].borderColor = colors.border;
          
          // Update recent quizzes (limit to 5)
          this.recentQuizzes = (response.recent_quizzes || []).slice(0, 5);
        } catch (error) {
          this.error = error.message || 'Failed to load summary data';
        } finally {
          this.loading = false;
        }
      },
      generateColors(count) {
        const baseColors = [
          { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgba(255, 99, 132, 1)' },
          { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgba(54, 162, 235, 1)' },
          { bg: 'rgba(255, 206, 86, 0.2)', border: 'rgba(255, 206, 86, 1)' },
          { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgba(75, 192, 192, 1)' },
          { bg: 'rgba(153, 102, 255, 0.2)', border: 'rgba(153, 102, 255, 1)' },
          { bg: 'rgba(255, 159, 64, 0.2)', border: 'rgba(255, 159, 64, 1)' }
        ];
        
        const background = [];
        const border = [];
        
        for (let i = 0; i < count; i++) {
          const color = baseColors[i % baseColors.length];
          background.push(color.bg);
          border.push(color.border);
        }
        
        return { background, border };
      },
      getStatusClass(status) {
        return {
          'bg-success': status === 'Passed',
          'bg-danger': status === 'Failed',
          'bg-warning': status === 'In Progress'
        };
      },
      formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
      }
    },
    created() {
      this.loadSummary();
    },
    template: `
      <div class="container mt-4">
        <h2 class="text-center mb-4">Performance Summary</h2>
        
        <!-- Loading and Error States -->
        <div v-if="loading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading your performance data...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>

        <div v-else>
          <!-- Quick Stats Cards -->
          <div class="row g-4 mb-4">
            <div class="col-md-3">
              <div class="card border-0 shadow-sm h-100 bg-primary text-white">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="card-subtitle mb-2 opacity-75">Total Quizzes</h6>
                      <h2 class="card-title mb-0">{{totalQuizzes}}</h2>
                    </div>
                    <i class="bi bi-journal-text fs-1 opacity-25"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card border-0 shadow-sm h-100 bg-success text-white">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="card-subtitle mb-2 opacity-75">Average Score</h6>
                      <h2 class="card-title mb-0">{{averageScore}}%</h2>
                    </div>
                    <i class="bi bi-graph-up fs-1 opacity-25"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card border-0 shadow-sm h-100 bg-info text-white">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="card-subtitle mb-2 opacity-75">This Month</h6>
                      <h2 class="card-title mb-0">{{quizzesThisMonth}}</h2>
                    </div>
                    <i class="bi bi-calendar-check fs-1 opacity-25"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="card border-0 shadow-sm h-100 bg-warning">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="card-subtitle mb-2">Best Subject</h6>
                      <h2 class="card-title mb-0">{{bestSubject}}</h2>
                    </div>
                    <i class="bi bi-trophy fs-1 opacity-25"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          <div class="row g-4 mb-4">
            <!-- Subject Performance -->
            <div class="col-md-6">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-transparent border-0">
                  <h5 class="mb-0">
                    <i class="bi bi-bar-chart me-2"></i>
                    Performance by Subject
                  </h5>
                </div>
                <div class="card-body">
                  <bar-chart :data="subjectData"></bar-chart>
                </div>
              </div>
            </div>
            
            <!-- Monthly Progress -->
            <div class="col-md-6">
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-transparent border-0">
                  <h5 class="mb-0">
                    <i class="bi bi-pie-chart me-2"></i>
                    Monthly Activity
                  </h5>
                </div>
                <div class="card-body">
                  <pie-chart :data="monthData"></pie-chart>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Recent Quiz History -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-clock-history me-2"></i>
                Recent Quiz History
              </h5>
              <button class="btn btn-primary btn-sm" @click="$router.push('/scores')">
                View All
                <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Quiz Name</th>
                    <th>Subject</th>
                    <th class="text-center">Questions</th>
                    <th class="text-center">Score</th>
                    <th>Date</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quiz in recentQuizzes" :key="quiz.id">
                    <td>{{quiz.name}}</td>
                    <td>{{quiz.subject}}</td>
                    <td class="text-center">{{quiz.questions}}</td>
                    <td class="text-center">{{quiz.score}}%</td>
                    <td>{{formatDate(quiz.date)}}</td>
                    <td class="text-center">
                      <span class="badge rounded-pill" :class="getStatusClass(quiz.status)">
                        {{quiz.status}}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="recentQuizzes.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">
                      <i class="bi bi-info-circle me-2"></i>
                      No quiz attempts yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `
};