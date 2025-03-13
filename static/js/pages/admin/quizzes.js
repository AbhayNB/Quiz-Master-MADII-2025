import { store } from "../../store.js";
import { api } from "../../services/api.js";
export const QuizzesPage = {
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            chapter: null,  // Initialize as null
            newQuiz: {
                name: '',
                description: '',
                difficulty: 'Medium',
                duration: 30,
                chapter_id: null
            },
            editingQuiz: null,
            loading: false,
            error: null
        }
    },
    computed: {
        quizzes() {
            return this.$store.getters.quizzes(parseInt(this.id));
        },
        
    },
    methods: {
        async gchapter() {
            try {
                return await api.chapter.getOne(this.id);
            } catch (error) {
                this.error = error.message;
                return null;
            }
        },
        async createQuiz() {
            try {
                this.newQuiz.chapter_id = parseInt(this.id);
                await this.$store.dispatch('createQuiz', this.newQuiz);
                this.newQuiz = {
                    name: '',
                    description: '',
                    difficulty: 'medium',
                    duration: 30,
                    chapter_id: null
                };
                // Close modal
                document.getElementById('addQuizModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                this.error = error.message;
            }
        },
        startEdit(quiz) {
            this.editingQuiz = { ...quiz };
        },
        async updateQuiz() {
            if (!this.editingQuiz) return;
            
            try {
                await this.$store.dispatch('updateQuiz', {
                    id: this.editingQuiz.id,
                    quiz: {
                        name: this.editingQuiz.name,
                        description: this.editingQuiz.description,
                        difficulty: this.editingQuiz.difficulty,
                        duration: this.editingQuiz.duration
                    },
                    chapterId: parseInt(this.id)
                });
                this.editingQuiz = null;
                // Close modal
                document.getElementById('editQuizModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                this.error = error.message;
            }
        },
        async deleteQuiz(quizId) {
            if (!confirm('Are you sure you want to delete this quiz?')) return;
            
            try {
                await this.$store.dispatch('deleteQuiz', {
                    id: quizId,
                    chapterId: parseInt(this.id)
                });
            } catch (error) {
                this.error = error.message;
            }
        },
        navigateToQuestions(quizId) {
            this.$router.push(`/quizzes/${quizId}/questions`);
        },
        getDifficultyBadgeClass(difficulty) {
            switch(difficulty.toLowerCase()) {
                case 'easy': return 'bg-success';
                case 'medium': return 'bg-warning';
                case 'hard': return 'bg-danger';
                default: return 'bg-secondary';
            }
        }
    },
    async mounted() {
        try {
            this.chapter = await this.gchapter();
            await this.$store.dispatch('fetchQuizzes', parseInt(this.id));
        } catch (error) {
            this.error = error.message;
        }
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>{{ chapter?.name || 'Loading...' }} - Quizzes</h2>
                <p class="text-muted">{{ chapter?.description || '' }}</p>
            </div>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addQuizModal">
                <i class="bi bi-plus-lg"></i> Add Quiz
            </button>
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <!-- Quizzes Grid -->
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <div v-for="quiz in quizzes" :key="quiz.id" class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">{{ quiz.name }}</h5>
                        <p class="card-text">{{ quiz.description }}</p>
                        <div class="mt-2 d-flex gap-2">
                            <span :class="['badge', getDifficultyBadgeClass(quiz.difficulty)]">
                                {{ quiz.difficulty }}
                            </span>
                            <span class="badge bg-info">
                                {{ quiz.duration }} minutes
                            </span>
                            <span class="badge bg-primary">
                                {{ quiz.questionCount }} Questions
                            </span>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0">
                        <div class="btn-group" role="group">
                            <button class="btn btn-primary" @click="navigateToQuestions(quiz.id)">
                                <i class="bi bi-list-check"></i> Questions
                            </button>
                            <button class="btn btn-outline-primary" @click="startEdit(quiz)" data-bs-toggle="modal" data-bs-target="#editQuizModal">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" @click="deleteQuiz(quiz.id)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Quiz Modal -->
        <div class="modal fade" id="addQuizModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Quiz</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="createQuiz">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" v-model="newQuiz.name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" v-model="newQuiz.description" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Difficulty</label>
                                <select class="form-select" v-model="newQuiz.difficulty" required>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Duration (minutes)</label>
                                <input type="number" class="form-control" v-model="newQuiz.duration" min="1" required>
                            </div>
                            <div class="modal-footer px-0 pb-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    {{ loading ? 'Creating...' : 'Create Quiz' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Quiz Modal -->
        <div class="modal fade" id="editQuizModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Quiz</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="updateQuiz" v-if="editingQuiz">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" v-model="editingQuiz.name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" v-model="editingQuiz.description" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Difficulty</label>
                                <select class="form-select" v-model="editingQuiz.difficulty" required>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Duration (minutes)</label>
                                <input type="number" class="form-control" v-model="editingQuiz.duration" min="1" required>
                            </div>
                            <div class="modal-footer px-0 pb-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    {{ loading ? 'Saving...' : 'Save Changes' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};