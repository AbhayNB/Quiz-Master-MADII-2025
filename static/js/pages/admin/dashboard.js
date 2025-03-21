export const AdminDashboard = {
    data() {
        return {
            loading: false,
            error: null
        }
    },
    computed: {
        subjects() {
            return this.$store.getters.subjects;
        },
        activeUsers() {
            return this.$store.getters.activeUsers;
        },
        totalChapters() {
            return this.subjects.reduce((total, subject) => {
                return total + (this.$store.getters.chapters(subject.id)?.length || 0);
            }, 0);
        },
        totalQuizzes() {
            let total = 0;
            this.subjects.forEach(subject => {
                const chapters = this.$store.getters.chapters(subject.id) || [];
                chapters.forEach(chapter => {
                    total += this.$store.getters.quizzes(chapter.id)?.length || 0;
                });
            });
            return total;
        }
    },
    methods: {
        async refreshData() {
            this.loading = true;
            this.error = null;
            try {
                await Promise.all([
                    this.$store.dispatch('fetchSubjects'),
                    this.$store.dispatch('fetchActiveUsers'),
                    
                ]);
                
                // Load chapters for each subject
                for (const subject of this.subjects) {
                    await this.$store.dispatch('fetchChapters', subject.id);
                    
                    // Load quizzes for each chapter
                    const chapters = this.$store.getters.chapters(subject.id);
                    for (const chapter of chapters) {
                        await this.$store.dispatch('fetchQuizzes', chapter.id);
                    }
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        navigateToSubjects() {
            this.$router.push('/subjects');
        },
        navigateToUsers() {
            this.$router.push('/users');
        }
    },
    mounted() {
        this.refreshData();
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Admin Dashboard</h2>
            <button class="btn btn-primary" @click="refreshData" :disabled="loading">
                <i class="bi bi-arrow-clockwise" :class="{ 'spinner-border spinner-border-sm': loading }"></i>
                Refresh Data
            </button>
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <!-- Statistics Cards -->
        <div class="row row-cols-1 row-cols-md-4 g-4 mb-4">
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total Subjects</h6>
                                <h2 class="card-title mb-0">{{ subjects.length }}</h2>
                            </div>
                            <i class="bi bi-book fs-1 text-primary opacity-25"></i>
                        </div>
                        <button class="btn btn-sm btn-outline-primary mt-3" @click="navigateToSubjects">
                            View Subjects
                        </button>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total Chapters</h6>
                                <h2 class="card-title mb-0">{{ totalChapters }}</h2>
                            </div>
                            <i class="bi bi-journal-text fs-1 text-success opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Total Quizzes</h6>
                                <h2 class="card-title mb-0">{{ totalQuizzes }}</h2>
                            </div>
                            <i class="bi bi-collection fs-1 text-info opacity-25"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-subtitle mb-2 text-muted">Active Users</h6>
                                <h2 class="card-title mb-0">{{ activeUsers }}</h2>
                            </div>
                            <i class="bi bi-people fs-1 text-warning opacity-25"></i>
                        </div>
                        <button class="btn btn-sm btn-outline-primary mt-3" @click="navigateToUsers">
                            View Users
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subjects Overview -->
        <div class="card shadow-sm">
            <div class="card-header bg-transparent">
                <h5 class="mb-0">Subjects Overview</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Subject Name</th>
                                <th>Description</th>
                                <th>Chapters</th>
                                <th>Total Quizzes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="subject in subjects" :key="subject.id">
                                <td>{{ subject.name }}</td>
                                <td>{{ subject.description }}</td>
                                <td>{{ $store.getters.chapters(subject.id)?.length || 0 }}</td>
                                <td>
                                    {{ ($store.getters.chapters(subject.id) || []).reduce((total, chapter) => 
                                        total + ($store.getters.quizzes(chapter.id)?.length || 0), 0) 
                                    }}
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-primary" @click="$router.push('/subjects/'+subject.id+'/chapters')">
                                        <i class="bi bi-arrow-right"></i> View Details
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="subjects.length === 0">
                                <td colspan="5" class="text-center py-4">
                                    <div class="text-muted">
                                        <i class="bi bi-info-circle me-2"></i>
                                        No subjects found. Add your first subject to get started!
                                    </div>
                                    <button class="btn btn-primary mt-3" @click="navigateToSubjects">
                                        <i class="bi bi-plus-lg"></i> Add Subject
                                    </button>
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