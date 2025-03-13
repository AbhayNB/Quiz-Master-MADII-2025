export const QuizPage = {
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
