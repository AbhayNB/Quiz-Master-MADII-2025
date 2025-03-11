import { BarChart } from '../components/charts.js';
import { PieChart } from '../components/charts.js';

export const SummaryPage = {
    components: {
      'bar-chart': BarChart,
      'pie-chart': PieChart
    },
    template: `
      <div class="container mt-4">
        <h2 class="text-center mb-4">Performance Summary</h2>
        
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
                <h2 class="card-text">{{averageScore}}%</h5>
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
            <h5>Recent Quiz History</h5>
            <button class="btn btn-primary btn-sm" @click="$router.push('/summary')">
              View All
            </button>
          </div>
          <div class="card-body">
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
                  <td>{{quiz.date}}</td>
                  <td>
                    <span :class="getStatusClass(quiz.status)">
                      {{quiz.status}}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        totalQuizzes: 39,
        averageScore: 78,
        quizzesThisMonth: 12,
        bestSubject: 'Math',
        subjectData: {
          labels: ['Math', 'Science', 'History', 'Geography', 'English', 'Computer Science'],
          datasets: [{
            label: 'Average Score (%)',
            data: [85, 72, 68, 77, 82, 90],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        monthData: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June'],
          datasets: [{
            label: 'Quizzes Completed',
            data: [10, 15, 8, 12, 20, 14],
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        recentQuizzes: [
          { id: 1, name: 'Algebra Basics', subject: 'Math', questions: 20, score: 92, date: '2023-06-15', status: 'Passed' },
          { id: 2, name: 'Chemical Reactions', subject: 'Science', questions: 15, score: 78, date: '2023-06-14', status: 'Passed' },
          { id: 3, name: 'World War II', subject: 'History', questions: 25, score: 65, date: '2023-06-13', status: 'Failed' },
          { id: 4, name: 'Programming Basics', subject: 'Computer Science', questions: 30, score: 88, date: '2023-06-12', status: 'Passed' },
          { id: 5, name: 'Grammar Rules', subject: 'English', questions: 20, score: 82, date: '2023-06-11', status: 'Passed' }
        ]
      };
    },
    methods: {
      getStatusClass(status) {
        return {
          'badge bg-success': status === 'Passed',
          'badge bg-danger': status === 'Failed'
        };
      }
    }
  };