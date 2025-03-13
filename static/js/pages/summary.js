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
            label: 'Average Score (%)',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        monthData: {
          labels: [],
          datasets: [{
            label: 'Quizzes Completed',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1
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
          this.totalQuizzes = response.total_quizzes;
          this.averageScore = response.average_score;
          this.quizzesThisMonth = response.quizzes_this_month;
          this.bestSubject = response.best_subject;
          
          // Update subject performance chart
          this.subjectData.labels = response.subject_performance.map(s => s.subject);
          this.subjectData.datasets[0].data = response.subject_performance.map(s => s.average_score);
          
          // Update monthly activity chart
          this.monthData.labels = response.monthly_activity.map(m => m.month);
          this.monthData.datasets[0].data = response.monthly_activity.map(m => m.count);
          this.monthData.datasets[0].backgroundColor = this.generateColors(response.monthly_activity.length);
          this.monthData.datasets[0].borderColor = this.generateColors(response.monthly_activity.length, 1);
          
          // Update recent quizzes
          this.recentQuizzes = response.recent_quizzes;
        } catch (error) {
          this.error = error.message;
        } finally {
          this.loading = false;
        }
      },
      generateColors(count, alpha = 0.2) {
        const colors = [
          'rgba(255, 99, 132, ' + alpha + ')',
          'rgba(54, 162, 235, ' + alpha + ')',
          'rgba(255, 206, 86, ' + alpha + ')',
          'rgba(75, 192, 192, ' + alpha + ')',
          'rgba(153, 102, 255, ' + alpha + ')',
          'rgba(255, 159, 64, ' + alpha + ')'
        ];
        return Array(count).fill().map((_, i) => colors[i % colors.length]);
      },
      getStatusClass(status) {
        return {
          'bg-success': status === 'Passed',
          'bg-danger': status === 'Failed'
        };
      }
    },
    created() {
      this.loadSummary();
    },
    template: `
      <div class="container mt-4">
        <h2 class="text-center mb-4">Performance Summary</h2>
        
        <!-- Loading and Error States -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else>
          <div class="row">
            <!-- Quick Stats Cards -->
            <div class="col-md-3 mb-4">
              <div class="card text-white bg-primary">
                <div class="card-body">
                  <h5 class="card-title">Total Quizzes</h5>
                  <h2 class="card-text">{{totalQuizzes}}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="card text-white bg-success">
                <div class="card-body">
                  <h5 class="card-title">Average Score</h5>
                  <h2 class="card-text">{{averageScore}}%</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="card text-white bg-info">
                <div class="card-body">
                  <h5 class="card-title">Quizzes This Month</h5>
                  <h2 class="card-text">{{quizzesThisMonth}}</h2>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-4">
              <div class="card text-white bg-warning">
                <div class="card-body">
                  <h5 class="card-title">Best Subject</h5>
                  <h2 class="card-text">{{bestSubject}}</h2>
                </div>
              </div>
            </div>
          </div>
    
          <div class="row mb-4">
            <!-- Subject Performance -->
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5>Performance by Subject</h5>
                </div>
                <div class="card-body">
                  <bar-chart :data="subjectData"></bar-chart>
                </div>
              </div>
            </div>
            
            <!-- Monthly Progress -->
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h5>Monthly Activity Distribution</h5>
                </div>
                <div class="card-body">
                  <pie-chart :data="monthData"></pie-chart>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Recent Quiz History -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Recent Quiz History</h5>
              <button class="btn btn-primary btn-sm" @click="$router.push('/scores')">
                View All
              </button>
            </div>
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Quiz Name</th>
                    <th>Subject</th>
                    <th>Questions</th>
                    <th>Score</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quiz in recentQuizzes" :key="quiz.id">
                    <td>{{quiz.name}}</td>
                    <td>{{quiz.subject}}</td>
                    <td>{{quiz.questions}}</td>
                    <td>{{quiz.score}}%</td>
                    <td>{{new Date(quiz.date).toLocaleDateString()}}</td>
                    <td>
                      <span class="badge" :class="getStatusClass(quiz.status)">
                        {{quiz.status}}
                      </span>
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