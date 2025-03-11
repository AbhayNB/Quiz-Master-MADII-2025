// Store
import {store} from './store.js';

// Components
import { Navbar } from './components/navbar.js';


// Pages
import { Home } from './pages/home.js';
import { SummaryPage } from './pages/summary.js';




const QuizPage = {
  data() {
    return {
      timeLeft: 10, // 30 minutes in seconds
      currentQuestion: 0,
      category: 'Mathematics',
      topic: 'Basic Arithmetic',
      description: 'Test your knowledge of basic arithmetic operations',
      questions: [
        {
          id: 1,
          text: "What is the capital of France?",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: 2,
          selectedAnswer: null
        },
        {
          id: 2,
          text: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correctAnswer: 1,
          selectedAnswer: null
        },
        {
          id: 3,
          text: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
          selectedAnswer: null
        }
      ],
      timer: null,
      quizSubmitted: false,
      quizResults: {
        score: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        timeSpent: '',
        status: ''
      }
    };
  },
  computed: {
    formattedTime() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    },
    currentQuestionData() {
      return this.questions[this.currentQuestion];
    },
    isLastQuestion() {
      return this.currentQuestion === this.questions.length - 1;
    },
    progress() {
      return ((this.currentQuestion + 1) / this.questions.length) * 100;
    }
  },
  methods: {
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.submitQuiz();
        }
      }, 1000);
    },
    saveAndNext() {
      if (!this.isLastQuestion) {
        this.currentQuestion++;
      }
    },
    previousQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--;
      }
    },
    submitQuiz() {
      clearInterval(this.timer);
      
      // Calculate score and statistics
      const totalQuestions = this.questions.length;
      const correctAnswers = this.questions.reduce((total, question) => {
        return total + (question.selectedAnswer === question.correctAnswer ? 1 : 0);
      }, 0);
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Calculate time spent
      const totalSeconds = 10 - this.timeLeft; // 10 is initial time
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      // Set quiz results
      this.quizResults = {
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        incorrectAnswers: totalQuestions - correctAnswers,
        timeSpent: `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`,
        status: score >= 60 ? 'Passed' : 'Failed'
      };

      // Set submitted state after updating results
      this.quizSubmitted = true;
    },
    selectAnswer(optionIndex) {
      this.questions[this.currentQuestion].selectedAnswer = optionIndex;
    }
  },
  mounted() {
    this.startTimer();
    // Add required CSS
    const style = document.createElement('style');
    style.textContent = `
      .quiz-page {
        background-color: #f8f9fa;
        min-height: 100vh;
      }

      .quiz-header-card {
        border: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .timer-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        border: 3px solid #28a745;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        transition: all 0.3s ease;
      }

      .timer-circle.warning {
        border-color: #dc3545;
        animation: pulse 1s infinite;
      }

      .timer-content {
        text-align: center;
      }

      .progress-circle {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: conic-gradient(#007bff var(--progress), #e9ecef var(--progress));
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
      }

      .progress-content {
        background: white;
        border-radius: 50%;
        width: 80%;
        height: 80%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .question-card {
        border: none;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .question-number {
        font-size: 1.5rem;
        font-weight: bold;
        color: #007bff;
      }

      .options-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
      }

      .option-item {
        border: 2px solid #dee2e6;
        border-radius: 10px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .option-item:hover {
        border-color: #007bff;
        transform: translateY(-2px);
      }

      .option-item.selected {
        border-color: #007bff;
        background-color: #f8f9fa;
      }

      .option-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .option-marker {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }

      .option-text {
        font-size: 1.1rem;
      }

      .score-circle {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border: 8px solid #28a745;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        transition: all 0.3s ease;
      }

      .score-circle.excellent { border-color: #28a745; }
      .score-circle.good { border-color: #ffc107; }
      .score-circle.poor { border-color: #dc3545; }

      .stat-card {
        background: white;
        border-radius: 10px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
      }

      .stat-label {
        color: #6c757d;
        font-size: 0.9rem;
      }

      .fade-out {
        animation: fadeOut 0.3s forwards;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }

      @keyframes fadeOut {
        to { opacity: 0; }
      }

      .animate__animated {
        animation-duration: 0.5s;
      }

      .actions {
        margin-top: 2rem;
      }

      .btn-lg {
        padding: 0.75rem 1.5rem;
        font-size: 1.1rem;
      }
    `;
    document.head.appendChild(style);
  },
  template: `
    <div class="quiz-page py-4">
      <div class="container">
        <div v-if="!quizSubmitted">
          <!-- Quiz Header Card -->
          <div class="card mb-4 quiz-header-card">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-4">
                 <p> <i class="bi bi-bookmark-fill"></i> {{category}}<p>

                  <h3 class="mb-0">{{topic}}</h3>
                  <p class="text-muted mb-0">{{description}}</p>
                </div>
                <div class="col-md-4 text-center">
                  <div class="timer-circle" :class="{ 'warning': timeLeft < 300 }">
                    <div class="timer-content">
                      <i class="bi bi-clock display-6"></i>
                      <div class="h4 mb-0">{{ formattedTime }}</div>
                      <small>remaining</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 text-end">
                  <div class="progress-circle" :style="{ '--progress': progress + '%' }">
                    <div class="progress-content">
                      <div class="h4 mb-0">{{ currentQuestion + 1 }}/{{ questions.length }}</div>
                      <small>Question</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Question Card -->
          <div class="card question-card">
            <div class="card-body">
              <!-- Question Text -->
              <div class="question-text mb-4">
                <span class="question-number">Q{{ currentQuestion + 1 }}.</span>
                <h4 class="d-inline-block ms-2">{{ currentQuestionData.text }}</h4>
              </div>

              <!-- Options Grid -->
              <div class="options-grid">
                <div v-for="(option, index) in currentQuestionData.options" 
                     :key="index" 
                     class="option-item"
                     :class="{ 'selected': currentQuestionData.selectedAnswer === index }"
                     @click="selectAnswer(index)">
                  <div class="option-content">
                    <div class="option-marker">{{ String.fromCharCode(65 + index) }}</div>
                    <div class="option-text">{{ option }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Card Footer with Navigation -->
            <div class="card-footer">
              <div class="d-flex justify-content-between align-items-center">
                <button class="btn btn-outline-primary btn-lg" 
                        @click="previousQuestion"
                        :disabled="currentQuestion === 0">
                  <i class="bi bi-arrow-left me-2"></i>Previous
                </button>
                <div>
                  <button v-if="!isLastQuestion" 
                          class="btn btn-primary btn-lg me-2" 
                          @click="saveAndNext">
                    Next<i class="bi bi-arrow-right ms-2"></i>
                  </button>
                  <button class="btn btn-success btn-lg" 
                          @click="submitQuiz" 
                          v-if="isLastQuestion || timeLeft < 300">
                    <i class="bi bi-check-circle me-2"></i>Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quiz Results -->
        <div v-else class="quiz-results animate__animated animate__fadeIn">
          <div class="card result-card">
            <div class="card-body text-center">
              <!-- Score Circle -->
              <div class="score-circle mx-auto mb-4"
                   :class="{
                     'excellent': quizResults.score >= 80,
                     'good': quizResults.score >= 60 && quizResults.score < 80,
                     'poor': quizResults.score < 60
                   }">
                <div class="score-content">
                  <div class="display-1 fw-bold">{{quizResults.score}}%</div>
                  <h4 class="mb-0">{{quizResults.status}}</h4>
                </div>
              </div>

              <!-- Detailed Statistics -->
              <div class="row statistics g-4 mb-4">
                <div class="col-md-3">
                  <div class="stat-card">
                    <div class="stat-icon bg-light">
                      <i class="bi bi-list-ol"></i>
                    </div>
                    <div class="stat-details">
                      <div class="stat-value">{{quizResults.totalQuestions}}</div>
                      <div class="stat-label">Total Questions</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card">
                    <div class="stat-icon bg-success text-white">
                      <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="stat-details">
                      <div class="stat-value text-success">{{quizResults.correctAnswers}}</div>
                      <div class="stat-label">Correct</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card">
                    <div class="stat-icon bg-danger text-white">
                      <i class="bi bi-x-circle"></i>
                    </div>
                    <div class="stat-details">
                      <div class="stat-value text-danger">{{quizResults.incorrectAnswers}}</div>
                      <div class="stat-label">Incorrect</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stat-card">
                    <div class="stat-icon bg-info text-white">
                      <i class="bi bi-clock-history"></i>
                    </div>
                    <div class="stat-details">
                      <div class="stat-value text-info">{{quizResults.timeSpent}}</div>
                      <div class="stat-label">Time Spent</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="actions">
                <button class="btn btn-outline-primary btn-lg me-3" @click="$router.push('/')">
                  <i class="bi bi-house me-2"></i>Back to Home
                </button>
                <button class="btn btn-primary btn-lg" @click="$router.push('/scores')">
                  <i class="bi bi-trophy me-2"></i>View All Scores
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

const ScorePage = {
  data() {
    return {
      quizHistory: [
        { id: 1, name: 'Algebra Basics', subject: 'Math', questions: 20, score: 92, date: '2023-06-15', status: 'Passed', timeSpent: '25:30' },
        { id: 2, name: 'Chemical Reactions', subject: 'Science', questions: 15, score: 78, date: '2023-06-14', status: 'Passed', timeSpent: '18:45' },
        { id: 3, name: 'World War II', subject: 'History', questions: 25, score: 65, date: '2023-06-13', status: 'Failed', timeSpent: '28:15' },
        { id: 4, name: 'Programming Basics', subject: 'Computer Science', questions: 30, score: 88, date: '2023-06-12', status: 'Passed', timeSpent: '27:50' },
        { id: 5, name: 'Grammar Rules', subject: 'English', questions: 20, score: 82, date: '2023-06-11', status: 'Passed', timeSpent: '22:10' }
      ],
      filterSubject: 'All',
      filterStatus: 'All',
      searchQuery: '',
      sortBy: 'date',
      sortOrder: 'desc'
    };
  },
  computed: {
    subjects() {
      const subjects = new Set(this.quizHistory.map(quiz => quiz.subject));
      return ['All', ...Array.from(subjects)];
    },
    filteredAndSortedHistory() {
      return this.quizHistory
        .filter(quiz => {
          const matchesSubject = this.filterSubject === 'All' || quiz.subject === this.filterSubject;
          const matchesStatus = this.filterStatus === 'All' || quiz.status === this.filterStatus;
          const matchesSearch = quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              quiz.subject.toLowerCase().includes(this.searchQuery.toLowerCase());
          return matchesSubject && matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
          let comparison = 0;
          switch(this.sortBy) {
            case 'date':
              comparison = new Date(b.date) - new Date(a.date);
              break;
            case 'score':
              comparison = b.score - a.score;
              break;
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
          }
          return this.sortOrder === 'desc' ? comparison : -comparison;
        });
    },
    averageScore() {
      const scores = this.filteredAndSortedHistory.map(quiz => quiz.score);
      return scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
    },
    passRate() {
      const passed = this.filteredAndSortedHistory.filter(quiz => quiz.status === 'Passed').length;
      return this.filteredAndSortedHistory.length 
        ? Math.round((passed / this.filteredAndSortedHistory.length) * 100) 
        : 0;
    }
  },
  methods: {
    getStatusClass(status) {
      return {
        'badge bg-success': status === 'Passed',
        'badge bg-danger': status === 'Failed'
      };
    },
    setSorting(field) {
      if (this.sortBy === field) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
      } else {
        this.sortBy = field;
        this.sortOrder = 'desc';
      }
    },
    getSortIcon(field) {
      if (this.sortBy !== field) return 'bi bi-arrow-down-up';
      return this.sortOrder === 'desc' ? 'bi bi-arrow-down' : 'bi bi-arrow-up';
    }
  },
  template: `
    <div class="container mt-4">
      <h2 class="text-center mb-4">Quiz Score History</h2>
      
      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <h5 class="card-title">Average Score</h5>
              <h2>{{averageScore}}%</h2>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-success text-white">
            <div class="card-body">
              <h5 class="card-title">Pass Rate</h5>
              <h2>{{passRate}}%</h2>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <select class="form-select" v-model="filterSubject">
                <option v-for="subject in subjects" :key="subject">{{subject}}</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select" v-model="filterStatus">
                <option>All</option>
                <option>Passed</option>
                <option>Failed</option>
              </select>
            </div>
            <div class="col-md-6">
              <input type="text" class="form-control" v-model="searchQuery" 
                     placeholder="Search by quiz name or subject...">
            </div>
          </div>
        </div>
      </div>

      <!-- Score Table -->
      <div class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th @click="setSorting('name')" style="cursor: pointer">
                    Quiz Name <i :class="getSortIcon('name')"></i>
                  </th>
                  <th @click="setSorting('subject')" style="cursor: pointer">
                    Subject <i :class="getSortIcon('subject')"></i>
                  </th>
                  <th>Questions</th>
                  <th @click="setSorting('score')" style="cursor: pointer">
                    Score <i :class="getSortIcon('score')"></i>
                  </th>
                  <th>Time Spent</th>
                  <th @click="setSorting('date')" style="cursor: pointer">
                    Date <i :class="getSortIcon('date')"></i>
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="quiz in filteredAndSortedHistory" :key="quiz.id">
                  <td>{{quiz.name}}</td>
                  <td>{{quiz.subject}}</td>
                  <td>{{quiz.questions}}</td>
                  <td>{{quiz.score}}%</td>
                  <td>{{quiz.timeSpent}}</td>
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
    </div>
  `
};

const LoginPage = {
  data() {
    return {
      email: '',
      password: '',
      error: null,
      loading: false
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${window.API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Store tokens and user data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('email', data.email);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        
        // Update Vuex store
        this.$store.commit('setLogged', true);
        
        // Redirect to home
        this.$router.push('/');
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  },
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">Login</h2>
              
              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>

              <form @submit.prevent="login">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    v-model="email" 
                    required
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    v-model="password" 
                    required
                  >
                </div>

                <button 
                  type="submit" 
                  class="btn btn-primary w-100" 
                  :disabled="loading"
                >
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </form>

              <div class="text-center mt-3">
                <p>Don't have an account? 
                  <router-link to="/register">Register</router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

const RegisterPage = {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      error: null,
      loading: false
    };
  },
  methods: {
    async register() {
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${window.API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            email: this.email,
            password: this.password,
            name: this.name
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        // Redirect to login page
        this.$router.push('/login');
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  },
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">Register</h2>
              
              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>

              <form @submit.prevent="register">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="username" 
                    required
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="name" 
                    required
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    v-model="email" 
                    required
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    v-model="password" 
                    required
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    v-model="confirmPassword" 
                    required
                  >
                </div>

                <button 
                  type="submit" 
                  class="btn btn-primary w-100" 
                  :disabled="loading"
                >
                  {{ loading ? 'Creating account...' : 'Register' }}
                </button>
              </form>

              <div class="text-center mt-3">
                <p>Already have an account? 
                  <router-link to="/login">Login</router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

// Update routes array with new components
const routes = [
  { 
    path: '/', 
    component: Home,
    beforeEnter: (to, from, next) => {
      const loggedIn = store.getters.logged;
      if (loggedIn) {
        next();
      } else {
        next('/login');
      }
    }
  },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/summary', component: SummaryPage },
  { path: '/quiz', component: QuizPage },
  { path: '/scores', component: ScorePage },
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(), // or createWebHistory() for HTML5 History mode
    routes
  });
  
const app = Vue.createApp({
    data() {
        return {
            appInfo: 'Welcome to Knowlympics ! Test your knowledge across various subjects with our interactive quizzes. Track your progress, compete with others, and improve your skills. Whether you\'re a student preparing for exams or just love learning, Quiz Master has something for everyone!',
            appName: 'Knowlympics',
            quizCategories: [
                { id: 1, name: 'Mathematics', description: 'Test your math skills with these quizzes' },
                { id: 2, name: 'Science', description: 'Explore the world of science with these quizzes' },
                { id: 3, name: 'History', description: 'Learn about historical events and figures' },
                { id: 4, name: 'Geography', description: 'Discover the world and its wonders' },
                { id: 5, name: 'English', description: 'Improve your English language skills' },
                { id: 6, name: 'Computer Science', description: 'Test your knowledge of computers and technology' }
            ],
        };
    },
    components: {
        'navbar': Navbar,
    },
    created() {
        const access_token = localStorage.getItem('access_token');
        if (access_token) {
            this.$store.commit('setLogged', true);
        }

    }
});
app.use(store);
app.use(router);
// app.use(router);
app.mount('#app');