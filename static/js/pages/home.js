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
            activeTab: 'available'
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
        filteredQuizzes() {
            return this.allQuizzes.filter(quiz => {
                const matchesSubject = this.selectedSubject === 'All' || quiz.subject === this.selectedSubject;
                const matchesChapter = this.selectedChapter === 'All' || quiz.chapter === this.selectedChapter;
                const searchQuery = this.searchQuery.toLowerCase();
                const matchesSearch = quiz.name.toLowerCase().includes(searchQuery) ||
                                    quiz.description.toLowerCase().includes(searchQuery) ||
                                    quiz.subject.toLowerCase().includes(searchQuery) ||
                                    quiz.chapter.toLowerCase().includes(searchQuery);
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
                await this.$store.dispatch('fetchActiveUsers');
                
                const subjects = this.$store.getters.subjects;
                if (!subjects || subjects.length === 0) {
                    console.log('No subjects found or subjects not yet loaded');
                    return;
                }
                
                // Load chapters in sequence to prevent overwhelming the server
                for (const subject of subjects) {
                    try {
                        await this.$store.dispatch('fetchChapters', subject.id);
                        
                        // Load quizzes for each chapter
                        const chapters = this.$store.getters.chapters(subject.id);
                        if (chapters && chapters.length > 0) {
                            for (const chapter of chapters) {
                                try {
                                    await this.$store.dispatch('fetchQuizzes', chapter.id);
                                } catch (error) {
                                    console.error(`Error loading quizzes for chapter ${chapter.id}:`, error);
                                }
                            }
                        }
                    } catch (error) {
                        console.error(`Error loading chapters for subject ${subject.id}:`, error);
                    }
                }
            } catch (error) {
                this.error = 'Failed to load data. Please try again later.';
                console.error('Error loading data:', error);
            } finally {
                this.loading = false;
            }
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
        }
    },
    created() {
        this.loadData();
        // Add auto-refresh logic to periodically reload data
        setInterval(() => {
            if (!this.loading) {
                this.loadData();
            }
        }, 60000); // Refresh every minute
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
            <div v-if="loading" class="text-center">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
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
                            :value="filteredQuizzes.length"
                            bg-color="bg-success"
                            text-color="text-white"/>
                    </div>
                    <div class="col-md-3">
                        <stats-card 
                            icon="bi-clock-history"
                            title="Avg. Duration"
                            :value="'30 mins'"
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
                        <quiz-card :quiz="quiz"/>
                    </div>
                    <div v-if="filteredQuizzes.length === 0" class="col-12">
                        <div class="alert alert-info">
                            No quizzes found matching your criteria.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};