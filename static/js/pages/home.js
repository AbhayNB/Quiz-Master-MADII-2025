import {QuizCard,SubjectCard,StatsCard} from '../components/cards.js';
import {store} from '../store.js';

export const HomePage = {
    components: {
      'stats-card': StatsCard,
      'subject-card': SubjectCard,
      'quiz-card': QuizCard
    },
    data() {
      return {
        loading: false,
        error: null,
        selectedSubject: 'All',
        selectedChapter: 'All',
        searchQuery: '',
        subscribedSubjects: new Set(JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')),
        activeTab: 'available',
        aiQuizForm: {
          subject: '',
          chapter: '',
          numQuestions: 10,
          duration: 30,
          difficulty: 'Medium'
        }
      };
    },
    computed: {
      subjects() {
        return this.$store.getters.subjects;
      },
      allQuizzes() {
        let allQuizzes = [];
        this.subjects.forEach(subject => {
          const chapters = this.$store.getters.chapters(subject.id) || [];
          chapters.forEach(chapter => {
            const chapterQuizzes = this.$store.getters.quizzes(chapter.id) || [];
            allQuizzes = [...allQuizzes, ...chapterQuizzes.map(quiz => ({
              ...quiz,
              subject: subject.name,
              chapter: chapter.name
            }))];
          });
        });
        return allQuizzes;
      },
      activeQuizzes() {
        const now = new Date();
        return this.filteredQuizzes.filter(quiz => {
          if (quiz.start_time && new Date(quiz.start_time) > now) {
            return false;
          }
          const end = quiz.end_time ? new Date(quiz.end_time) : null;
          return !end || end > now;
        });
      },
      upcomingQuizzes() {
        const now = new Date();
        return this.filteredQuizzes.filter(quiz => {
          if (!quiz.start_time) return false;
          const start = new Date(quiz.start_time);
          return start > now;
        });
      },
      filteredQuizzes() {
        return this.allQuizzes.filter(quiz => {
          const matchesSubject = this.selectedSubject === 'All' || quiz.subject === this.selectedSubject;
          const matchesChapter = this.selectedChapter === 'All' || quiz.chapter === this.selectedChapter;
          const matchesSearch = quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              quiz.description.toLowerCase().includes(this.searchQuery.toLowerCase());
          return matchesSubject && matchesChapter && matchesSearch;
        });
      },
      active_users() {
        return this.$store.getters.activeUsers;
      },
      availableChapters() {
        if (this.selectedSubject === 'All') return ['All'];
        const selectedSubjectData = this.subjects.find(s => s.name === this.selectedSubject);
        if (!selectedSubjectData) return ['All'];
        const chapters = this.$store.getters.chapters(selectedSubjectData.id) || [];
        return ['All', ...chapters.map(c => c.name)];
      }
    },
    methods: {
      async loadData() {
        this.loading = true;
        this.error = null;
        try {
          await this.$store.dispatch('fetchSubjects');
          if (this.subjects && this.subjects.length > 0) {
            for (const subject of this.subjects) {
              await this.$store.dispatch('fetchChapters', subject.id);
              const chapters = this.$store.getters.chapters(subject.id);
              for (const chapter of chapters) {
                await this.$store.dispatch('fetchQuizzes', chapter.id);
              }
            }
          }
          await this.$store.dispatch('fetchActiveUsers');
        } catch (error) {
          console.error('Error loading data:', error);
          this.error = 'Failed to load quiz data. Please try refreshing the page.';
        } finally {
          this.loading = false;
        }
      },
      getDifficultyBadgeClass(difficulty) {
        return {
          'bg-success': difficulty.toLowerCase() === 'easy',
          'bg-warning': difficulty.toLowerCase() === 'medium',
          'bg-danger': difficulty.toLowerCase() === 'hard'
        };
      },
      startQuiz(quizId) {
        if (!quizId || isNaN(quizId)) {
          console.error('Invalid quiz ID:', quizId);
          return;
        }
        this.$router.push(`/quiz/${quizId}`);
      },
      toggleSubscription(subjectId) {
        if (this.subscribedSubjects.has(subjectId)) {
          this.subscribedSubjects.delete(subjectId);
        } else {
          this.subscribedSubjects.add(subjectId);
        }
        localStorage.setItem('subscribedSubjects', JSON.stringify([...this.subscribedSubjects]));
      },
      isSubscribed(subjectId) {
        return this.subscribedSubjects.has(subjectId);
      },
      async generateAIQuiz() {
        try {
          // TODO: Implement AI quiz generation logic
          const response = await this.$store.dispatch('generateAIQuiz', this.aiQuizForm);
          // Close modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('generateAIQuizModal'));
          modal.hide();
          // Reset form
          this.aiQuizForm = {
            subject: '',
            chapter: '',
            numQuestions: 10,
            duration: 30,
            difficulty: 'Medium'
          };
          // Show success message
          alert('If time left, will implement it at last');
        } catch (error) {
          console.error('Error generating quiz:', error);
          alert('Failed to generate quiz. Please try again.');
        }
      },
      formatDateTime(date) {
        return date ? new Date(date).toLocaleString() : 'No Expiry';
      }
    },
    created() {
      this.loadData();
    },
    template: `
    <div>
      <div class="bg-primary text-white py-5 mb-4">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="display-4">Welcome to Knowlympics</h1>
              <p class="lead">Challenge yourself with our diverse collection of quizzes across multiple subjects. Perfect for students, professionals, and knowledge enthusiasts!</p>
              <p class="mb-4">Track your progress, compete with others, and improve your knowledge.</p>
            </div>
            <div class="col-md-4">
              <div class="text-center">
                <i class="bi bi-lightbulb display-1 mb-3"></i>
                <div>
                  <strong>Want something else? Generate Custom Quiz from our AI</strong>
                  <br>
                  <button class="btn btn-light btn-lg mt-3" data-bs-toggle="modal" data-bs-target="#generateAIQuizModal">
                    <i class="bi bi-robot"></i> AI Quiz Generator
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <!-- Loading and Error States -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 text-muted">Loading quiz data...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <div v-else>
          <!-- Quick Stats -->
          <div class="row mb-4">
            <div class="col-md-3">
              <stats-card 
                icon="bi-journal-text"
                title="Subjects"
                :value="subjects.length"
                bg-color="bg-primary"
                text-color="text-white"/>
            </div>
            <div class="col-md-3">
              <stats-card 
                icon="bi-pencil-square"
                title="Available Quizzes"
                :value="allQuizzes.length"
                bg-color="bg-success"
                text-color="text-white"/>
            </div>
            <div class="col-md-3">
              <stats-card 
                icon="bi-clock-history"
                title="Minutes Average"
                value="30+"
                bg-color="bg-info"
                text-color="text-white"/>
            </div>
            <div class="col-md-3">
              <stats-card 
                icon="bi-trophy"
                title="Active Users"
                :value="active_users || 0"
                bg-color="bg-warning"
                text-color="text-dark"/>
            </div>
          </div>

          <!-- Search and Filter -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <select class="form-select" v-model="selectedSubject">
                    <option value="All">All Subjects</option>
                    <option v-for="subject in subjects" :key="subject.id" :value="subject.name">
                      {{ subject.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <select class="form-select" v-model="selectedChapter">
                    <option value="All">All Chapters</option>
                    <option v-for="chapter in availableChapters" :key="chapter" :value="chapter">
                      {{ chapter }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" v-model="searchQuery" 
                           placeholder="Search quizzes by name or description...">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quiz Subjects -->
          <h3 class="mb-3">Quiz Subjects</h3>
          <div class="row mb-4">
            <div v-if="subjects.length === 0" class="col-12 text-center py-5">
              <i class="bi bi-journal-x display-1 text-muted"></i>
              <p class="lead mt-3 text-muted">No subjects available at the moment.</p>
            </div>
            <div v-else class="col-md-4 mb-3" v-for="subject in subjects" :key="subject.id">
              <subject-card 
                :subject="subject"
                :is-subscribed="isSubscribed(subject.id)"
                @toggle-subscription="toggleSubscription"/>
            </div>
          </div>

          <!-- Quiz Tabs -->
          <div class="card">
            <div class="card-header">
              <ul class="nav nav-tabs card-header-tabs">
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'available' }"
                     @click.prevent="activeTab = 'available'" href="#">
                     <i class="bi bi-play-circle me-1"></i>
                     Available Quizzes
                     <span class="badge bg-primary ms-1">{{ activeQuizzes.length }}</span>
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" :class="{ active: activeTab === 'upcoming' }"
                     @click.prevent="activeTab = 'upcoming'" href="#">
                     <i class="bi bi-calendar-event me-1"></i>
                     Upcoming Quizzes
                     <span class="badge bg-primary ms-1">{{ upcomingQuizzes.length }}</span>
                  </a>
                </li>
              </ul>
            </div>
            <div class="card-body">
              <!-- Available Quizzes Tab -->
              <div v-show="activeTab === 'available'">
                <div v-if="activeQuizzes.length === 0" class="text-center py-5">
                  <i class="bi bi-inbox display-1 text-muted"></i>
                  <p class="lead mt-3 text-muted">No active quizzes available at the moment.</p>
                </div>
                <div v-else class="row row-cols-1 row-cols-md-3 g-4">
                  <div class="col" v-for="quiz in activeQuizzes" :key="quiz.id">
                    <quiz-card :quiz="quiz">
                      <div class="small text-muted mt-2" v-if="quiz.end_time">
                        Ends: {{ formatDateTime(quiz.end_time) }}
                      </div>
                    </quiz-card>
                  </div>
                </div>
              </div>

              <!-- Upcoming Quizzes Tab -->
              <div v-show="activeTab === 'upcoming'">
                <div v-if="upcomingQuizzes.length === 0" class="text-center py-5">
                  <i class="bi bi-calendar-x display-1 text-muted"></i>
                  <p class="lead mt-3 text-muted">No upcoming quizzes scheduled.</p>
                </div>
                <div v-else class="row row-cols-1 row-cols-md-3 g-4">
                  <div class="col" v-for="quiz in upcomingQuizzes" :key="quiz.id">
                    <quiz-card :quiz="quiz">
                      <div class="small text-muted mt-2">
                        Starts: {{ formatDateTime(quiz.start_time) }}
                      </div>
                    </quiz-card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Quiz Generation Modal -->
        <div class="modal fade" id="generateAIQuizModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Generate AI Quiz</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="generateAIQuiz">
                  <div class="mb-3">
                    <label class="form-label">Subject</label>
                    <input type="text" class="form-control" v-model="aiQuizForm.subject" 
                           placeholder="Enter subject name" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Chapter</label>
                    <input type="text" class="form-control" v-model="aiQuizForm.chapter" 
                           placeholder="Enter chapter name" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Number of Questions</label>
                    <input type="number" class="form-control" v-model="aiQuizForm.numQuestions" 
                           min="5" max="50" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Duration (minutes)</label>
                    <input type="number" class="form-control" v-model="aiQuizForm.duration" 
                           min="5" max="120" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Difficulty</label>
                    <select class="form-select" v-model="aiQuizForm.difficulty" required>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div class="modal-footer px-0 pb-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-robot"></i> Generate Quiz
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};