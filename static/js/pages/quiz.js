export const QuizPage = {
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      quiz: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      correctAnswers: {},
      timer: null,
      timeLeft: 0,
      quizSubmitted: false,
      loading: false,
      error: null,
      result: {
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
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    progress() {
      return (this.currentQuestionIndex + 1) / this.questions.length * 100;
    },
    isLastQuestion() {
      return this.currentQuestionIndex === this.questions.length - 1;
    },
    isQuizAvailable() {
      if (!this.quiz) return false;
      const now = new Date();
      
      if (this.quiz.start_time && new Date(this.quiz.start_time) > now) {
        this.error = `This quiz will be available from ${new Date(this.quiz.start_time).toLocaleString()}`;
        return false;
      }
      
      if (this.quiz.end_time && new Date(this.quiz.end_time) < now) {
        this.error = `This quiz expired on ${new Date(this.quiz.end_time).toLocaleString()}`;
        return false;
      }
      
      return true;
    }
  },
  methods: {
    async loadQuiz() {
      try {
        this.loading = true;
        const quizId = parseInt(this.id);
        
        if (isNaN(quizId)) {
          throw new Error('Invalid quiz ID');
        }

        const quiz = await this.$store.dispatch('fetchQuiz', quizId);
        
        if (!quiz) {
          throw new Error('Quiz not found');
        }

        this.quiz = quiz;
        
        if (!this.isQuizAvailable) {
          this.loading = false;
          return;
        }
        
        await this.$store.dispatch('fetchQuestions', quizId);
        this.questions = this.$store.getters.questions(quizId);
        
        if (!this.questions || this.questions.length === 0) {
          throw new Error('No questions found for this quiz');
        }

        this.timeLeft = this.quiz.duration * 60; // Convert minutes to seconds
        this.startTimer();
      } catch (error) {
        this.error = error.message;
        console.error('Error loading quiz:', error);
      } finally {
        this.loading = false;
      }
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.submitQuiz();
        }
      }, 1000);
    },
    selectAnswer(optionIndex) {
      this.answers[this.currentQuestion.id] = optionIndex;
      this.correctAnswers[this.currentQuestion.id] = this.currentQuestion.correct_option;
      console.log(this.correctAnswers);
      console.log(this.answers);
      console.log(this.currentQuestion.id);
    },
    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    },
    async submitQuiz() {
      try {
        clearInterval(this.timer);
        
        const timeSpent = this.quiz.duration * 60 - this.timeLeft;
        
        // Format answers as a proper JSON object
        const formattedAnswers = {};
        for (const [questionId, answer] of Object.entries(this.answers)) {
          formattedAnswers[questionId] = {
            selectedOption: answer,
            correctOption: this.correctAnswers[questionId],
            isCorrect: answer == this.correctAnswers[questionId]
          };
        }
        
        let tentetive_score = 0;
        for (const [key, value] of Object.entries(this.answers)) {
          if (value == this.correctAnswers[key]) {
            tentetive_score += 1;
          }
        }
        let final_score = (tentetive_score / this.questions.length) * 100;
        
        const submission = {
          quiz_id: this.quiz.id,
          answers: formattedAnswers,
          time_spent: timeSpent,
          score: final_score,
          totalQuestions: this.questions.length,
          correctAnswers: tentetive_score,
          status: final_score >= 40 ? 'Passed' : 'Failed'
        };
        console.log(submission);
        // Submit attempt to backend
        const response = await fetch('/submit_quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify(submission)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.msg || 'Failed to submit quiz');
        }
        
        this.result = {
          score: submission.score,
          totalQuestions: this.questions.length,
          correctAnswers: tentetive_score,
          incorrectAnswers: this.questions.length - tentetive_score,
          timeSpent: `${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`,
          status: submission.status
        };
        this.quizSubmitted = true;
      } catch (error) {
        this.error = error.message;
      }
    }
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  created() {
    this.loadQuiz();
  },
  template: `
    <div class="quiz-page py-4">
      <div class="container">
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else-if="!isQuizAvailable" class="alert alert-info" role="alert">
          {{ error }}
        </div>

        <div v-else>
          <div v-if="!quizSubmitted">
            <!-- Quiz Header -->
            <div class="card mb-4">
              <div class="card-body">
                <div class="row align-items-center">
                  <div class="col-md-6">
                    <h2 class="card-title mb-0">{{ quiz?.name }}</h2>
                    <p class="text-muted mb-0">{{ quiz?.description }}</p>
                  </div>
                  <div class="col-md-6 text-end">
                    <div class="d-flex justify-content-end align-items-center">
                      <div class="me-4">
                        <span class="badge bg-primary">Question {{ currentQuestionIndex + 1 }}/{{ questions.length }}</span>
                      </div>
                      <div>
                        <h4 class="mb-0 text-danger">{{ formattedTime }}</h4>
                        <small class="text-muted">Time Remaining</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="progress mb-4" style="height: 10px;">
              <div class="progress-bar" role="progressbar" :style="{ width: progress + '%' }">
                {{ Math.round(progress) }}%
              </div>
            </div>

            <!-- Question Card -->
            <div class="card mb-4" v-if="currentQuestion">
              <div class="card-body">
                <h4 class="card-title">{{ currentQuestion.question }}</h4>
                <div class="options mt-4">
                  <div class="form-check mb-3" v-for="(option, index) in [
                    currentQuestion.option1,
                    currentQuestion.option2,
                    currentQuestion.option3,
                    currentQuestion.option4
                  ]" :key="index">
                    <input class="form-check-input" 
                           type="radio" 
                           :name="'question'+currentQuestion.id" 
                           :id="'option'+index"
                           :checked="answers[currentQuestion.id] === index + 1"
                           @change="selectAnswer(index + 1)">
                    <label class="form-check-label" :for="'option'+index">
                      {{ option }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="d-flex justify-content-between">
              <button class="btn btn-outline-primary" 
                      @click="previousQuestion"
                      :disabled="currentQuestionIndex === 0">
                <i class="bi bi-arrow-left me-2"></i>Previous
              </button>
              <button v-if="!isLastQuestion" 
                      class="btn btn-primary"
                      @click="nextQuestion">
                Next<i class="bi bi-arrow-right ms-2"></i>
              </button>
              <button v-else 
                      class="btn btn-success"
                      @click="submitQuiz">
                Submit Quiz
              </button>
            </div>
          </div>

          <!-- Quiz Results -->
          <div v-else class="quiz-results">
            <div class="card">
              <div class="card-body text-center">
                <h2 class="mb-4">Quiz Results</h2>
                
                <div class="row mb-4">
                  <div class="col-md-4">
                    <div class="result-card bg-primary text-white p-4 rounded">
                      <h3 class="display-4">{{ result.score }}%</h3>
                      <p class="mb-0">Final Score</p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="result-card bg-success text-white p-4 rounded">
                      <h3 class="display-4">{{ result.correctAnswers }}</h3>
                      <p class="mb-0">Correct Answers</p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="result-card bg-danger text-white p-4 rounded">
                      <h3 class="display-4">{{ result.incorrectAnswers }}</h3>
                      <p class="mb-0">Incorrect Answers</p>
                    </div>
                  </div>
                </div>

                <div class="result-details mb-4">
                  <p class="mb-2">
                    <strong>Time Spent:</strong> {{ result.timeSpent }}
                  </p>
                  <p class="mb-2">
                    <strong>Status:</strong> 
                    <span :class="result.status === 'Passed' ? 'text-success' : 'text-danger'">
                      {{ result.status }}
                    </span>
                  </p>
                </div>

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
    </div>
  `
};
