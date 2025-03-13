import {QuizCard,SubjectCard,StatsCard} from '../components/cards.js';
import {store} from '../store.js';

export const Home = {
    components: {
      'stats-card': StatsCard,
      'subject-card': SubjectCard,
      'quiz-card': QuizCard
    },
    data() {
      return {
        selectedSubject: 'All',
        selectedChapter: 'All',
        searchQuery: '',
        subscribedSubjects: JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')
      };
    },
    computed: {
      subjects() {
        return this.$store.getters.subjects;
      },
      chapters() {
        if (this.selectedSubject === 'All') return [];
        const subject = this.subjects.find(s => s.name === this.selectedSubject);
        return subject ? this.$store.getters.chapters(subject.id) : [];
      },
      availableChapters() {
        if (this.selectedSubject === 'All') {
          return ['All'];
        }
        return ['All', ...this.chapters.map(c => c.name)];
      },
      quizzes() {
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
      filteredQuizzes() {
        return this.quizzes.filter(quiz => {
          const matchesSubject = this.selectedSubject === 'All' || quiz.subject === this.selectedSubject;
          const matchesChapter = this.selectedChapter === 'All' || quiz.chapter === this.selectedChapter;
          const matchesSearch = quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              quiz.description.toLowerCase().includes(this.searchQuery.toLowerCase());
          return matchesSubject && matchesChapter && matchesSearch;
        });
      },
      active_users() {
        return this.$store.getters.activeUsers;
      }
    },
    methods: {
      async loadData() {
        try {
          await this.$store.dispatch('fetchSubjects');
          for (const subject of this.subjects) {
            await this.$store.dispatch('fetchChapters', subject.id);
            const chapters = this.$store.getters.chapters(subject.id);
            for (const chapter of chapters) {
              await this.$store.dispatch('fetchQuizzes', chapter.id);
            }
          }
          await this.$store.dispatch('fetchActiveUsers');
        } catch (error) {
          console.error('Error loading data:', error);
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
        this.$router.push(`/quiz/${quizId}`);
      },
      toggleSubscription(subjectId) {
        const index = this.subscribedSubjects.indexOf(subjectId);
        if (index === -1) {
          this.subscribedSubjects.push(subjectId);
        } else {
          this.subscribedSubjects.splice(index, 1);
        }
        localStorage.setItem('subscribedSubjects', JSON.stringify(this.subscribedSubjects));
      },
      isSubscribed(subjectId) {
        return this.subscribedSubjects.includes(subjectId);
      }
    },
    created() {
      this.loadData();
    },
    template: `
      <div>
        <!-- Hero Section -->
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
                  <i class="bi bi-lightbulb display-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div class="container">
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
                :value="quizzes.length"
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
            <div class="col-md-4 mb-3" v-for="subject in subjects" :key="subject.id">
              <subject-card 
                :subject="subject"
                :is-subscribed="isSubscribed(subject.id)"
                @toggle-subscription="toggleSubscription"/>
            </div>
          </div>
  
          <!-- Available Quizzes -->
          <h3 class="mb-3">Featured Quizzes</h3>
          <div class="row">
            <div class="col-md-4 mb-4" v-for="quiz in filteredQuizzes" :key="quiz.id">
              <quiz-card :quiz="quiz" :id="quiz.id"/>
            </div>
          </div>
        </div>
      </div>
    `
  };
