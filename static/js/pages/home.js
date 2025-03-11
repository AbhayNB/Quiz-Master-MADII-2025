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
        quizSubjects: [
          { id: 1, name: 'Mathematics', description: 'Test your math skills from basic arithmetic to advanced calculus' },
          { id: 2, name: 'Science', description: 'Explore various science topics including Physics, Chemistry and Biology' },
          { id: 3, name: 'Computer Science', description: 'Programming concepts, algorithms, and technology fundamentals' },
          { id: 4, name: 'General Knowledge', description: 'Wide range of topics from current affairs to history' },
          { id: 5, name: 'English', description: 'Grammar, vocabulary, and language comprehension' }
        ],
        chapters: {
          'Mathematics': ['Arithmetic', 'Algebra', 'Geometry', 'Calculus', 'Statistics'],
          'Science': ['Physics', 'Chemistry', 'Biology', 'Earth Science', 'Astronomy'],
          'Computer Science': ['Programming Basics', 'Data Structures', 'Algorithms', 'Web Development', 'Database'],
          'General Knowledge': ['History', 'Geography', 'Current Affairs', 'Politics', 'Culture'],
          'English': ['Grammar', 'Vocabulary', 'Literature', 'Writing', 'Comprehension']
        },
        availableQuizzes: [
          {
            id: 1,
            name: 'Basic Mathematics',
            subject: 'Mathematics',
            chapter: 'Arithmetic',
            questions: 20,
            duration: '30 mins',
            difficulty: 'Easy',
            description: 'Cover basic arithmetic, fractions, and percentages'
          },
          {
            id: 2,
            name: 'Advanced Physics',
            subject: 'Science',
            chapter: 'Physics',
            questions: 25,
            duration: '45 mins',
            difficulty: 'Hard',
            description: 'Mechanics, thermodynamics, and modern physics'
          },
          {
            id: 3,
            name: 'Programming Basics',
            subject: 'Computer Science',
            chapter: 'Programming Basics',
            questions: 30,
            duration: '40 mins',
            difficulty: 'Medium',
            description: 'Basic programming concepts and problem solving'
          },
          {
            id: 4,
            name: 'World History',
            subject: 'General Knowledge',
            chapter: 'History',
            questions: 20,
            duration: '30 mins',
            difficulty: 'Medium',
            description: 'Major historical events and civilizations'
          },
          {
            id: 5,
            name: 'Grammar Master',
            subject: 'English',
            chapter: 'Grammar',
            questions: 25,
            duration: '35 mins',
            difficulty: 'Medium',
            description: 'English grammar rules and usage'
          }
        ],
        selectedSubject: 'All',
        selectedChapter: 'All',
        searchQuery: '',
        subscribedSubjects: JSON.parse(localStorage.getItem('subscribedSubjects') || '[]')
      };
    },
    computed: {
      active_users() {
        return store.state.activeUsers;  // Access state directly with default value
      },
      availableChapters() {
        if (this.selectedSubject === 'All') {
          return ['All'];
        }
        return ['All', ...this.chapters[this.selectedSubject] || []];
      },
      filteredQuizzes() {
        return this.availableQuizzes.filter(quiz => {
          const matchesSubject = this.selectedSubject === 'All' || quiz.subject === this.selectedSubject;
          const matchesChapter = this.selectedChapter === 'All' || quiz.chapter === this.selectedChapter;
          const matchesSearch = quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                              quiz.description.toLowerCase().includes(this.searchQuery.toLowerCase());
          return matchesSubject && matchesChapter && matchesSearch;
        });
      }
    },
    created() {
      store.dispatch('activeUsers');  // Fetch active users when component is created
    },
    methods: {
      getDifficultyBadgeClass(difficulty) {
        return {
          'bg-success': difficulty === 'Easy',
          'bg-warning': difficulty === 'Medium',
          'bg-danger': difficulty === 'Hard'
        };
      },
      startQuiz(quizId) {
        this.$router.push('/quiz');
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
                :value="quizSubjects.length"
                bg-color="bg-primary"
                text-color="text-white"/>
            </div>
            <div class="col-md-3">
              <stats-card 
                icon="bi-pencil-square"
                title="Available Quizzes"
                :value="availableQuizzes.length"
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
                    <option v-for="subject in quizSubjects" :key="subject.id" :value="subject.name">
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
            <div class="col-md-4 mb-3" v-for="subject in quizSubjects" :key="subject.id">
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
              <quiz-card :quiz="quiz"/>
            </div>
          </div>
        </div>
      </div>
    `
  };
  