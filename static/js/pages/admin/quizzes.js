import { store } from "../../store.js";

export const QuizzesPage = {
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            newQuiz: {
                name: '',
                description: '',
                duration: 30,
                difficulty: 'Medium'
            },
            editingQuiz: null,
            searchQuery: '',
            loading: false,
            isLoading: true
        };
    },
    computed: {
        chapter() {
            return store.getters.getChapter(this.id) || {};
        },
        quizzes() {
            return store.getters.getQuizzes(this.id) || [];
        },
        filteredQuizzes() {
            return this.quizzes.filter(quiz => 
                quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                quiz.description.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },
    methods: {
        async addQuiz() {
            if (!this.newQuiz.name) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/create_quiz`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this.newQuiz.name,
                        description: this.newQuiz.description,
                        duration: this.newQuiz.duration,
                        difficulty: this.newQuiz.difficulty,
                        chapter_id: this.id
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to add Quiz');
                }
                
                const data = await response.json();
                store.commit('addQuiz', { 
                    chapterId: this.id,
                    quiz: data.quiz
                });
                
                // Reset form
                this.newQuiz = {
                    name: '',
                    description: '',
                    duration: 30,
                    difficulty: 'Medium'
                };
                
                // Close modal
                document.getElementById('addQuizModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                console.error('Error adding quiz:', error);
            } finally {
                this.loading = false;
            }
        },
        async editQuiz() {
            if (!this.editingQuiz || !this.editingQuiz.name) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/update_quiz/${this.editingQuiz.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this.editingQuiz.name,
                        description: this.editingQuiz.description,
                        duration: this.editingQuiz.duration,
                        difficulty: this.editingQuiz.difficulty
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update quiz');
                }

                store.commit('updateQuiz', {
                    chapterId: this.id,
                    quiz: this.editingQuiz
                });

                // Close modal
                document.getElementById('editQuizModal').querySelector('[data-bs-dismiss="modal"]').click();
                this.editingQuiz = null;
            } catch (error) {
                console.error('Error updating quiz:', error);
            } finally {
                this.loading = false;
            }
        },
        async deleteQuiz(quizId) {
            if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/delete_quiz/${quizId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete quiz');
                }

                store.commit('deleteQuiz', { 
                    chapterId: this.id,
                    quizId
                });
            } catch (error) {
                console.error('Error deleting quiz:', error);
            } finally {
                this.loading = false;
            }
        },
        startEdit(quiz) {
            this.editingQuiz = { ...quiz };
        },
        getDifficultyClass(difficulty) {
            return {
                'bg-success': difficulty === 'Easy',
                'bg-warning': difficulty === 'Medium',
                'bg-danger': difficulty === 'Hard'
            };
        },
        viewQuestions(quizId) {
            this.$router.push(`/quizzes/${quizId}/questions`);
        }
    },
    async created() {
        this.isLoading = true;
        await store.dispatch('quizzes', this.id);
        this.isLoading = false;
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>{{chapter.name}} - Quizzes</h2>
                <p>{{chapter.description}}</p>
                <button class="btn btn-link p-0" @click="$router.push('/chapters')">
                    <i class="bi bi-arrow-left"></i> Back to Chapters
                </button>
            </div>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addQuizModal">
                <i class="bi bi-plus-lg"></i> Add New Quiz
            </button>
        </div>

        <!-- Search Bar -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="bi bi-search"></i>
                    </span>
                    <input 
                        type="text" 
                        class="form-control" 
                        v-model="searchQuery"
                        placeholder="Search quizzes..."
                    >
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <!-- Quizzes Grid -->
        <div v-else>
            <div v-if="filteredQuizzes.length === 0" class="text-center">
                <p class="text-muted">No quizzes found.</p>
            </div>
            <div class="row g-4">
                <div class="col-md-4" v-for="quiz in filteredQuizzes" :key="quiz.id">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title mb-0">{{quiz.name}}</h5>
                                <div class="dropdown">
                                    <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown">
                                        <i class="bi bi-three-dots-vertical"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <button class="dropdown-item" @click="viewQuestions(quiz.id)">
                                                <i class="bi bi-list-check me-2"></i> Manage Questions
                                            </button>
                                        </li>
                                        <li>
                                            <button class="dropdown-item" @click="startEdit(quiz)" data-bs-toggle="modal" data-bs-target="#editQuizModal">
                                                <i class="bi bi-pencil-square me-2"></i> Edit Quiz
                                            </button>
                                        </li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li>
                                            <button class="dropdown-item text-danger" @click="deleteQuiz(quiz.id)">
                                                <i class="bi bi-trash me-2"></i> Delete Quiz
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <p class="card-text text-muted">{{quiz.description}}</p>
                            <div class="d-flex align-items-center mt-3 gap-2">
                                <span class="badge" :class="getDifficultyClass(quiz.difficulty)">
                                    <i class="bi bi-star-fill me-1"></i> {{quiz.difficulty}}
                                </span>
                                <span class="badge bg-info">
                                    <i class="bi bi-clock-fill me-1"></i> {{quiz.duration}} mins
                                </span>
                                <span class="badge bg-primary">
                                    <i class="bi bi-question-circle-fill me-1"></i> {{quiz.questionCount}} Questions
                                </span>
                            </div>
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
                        <form @submit.prevent="addQuiz">
                            <div class="mb-3">
                                <label class="form-label">Quiz Name</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="newQuiz.name"
                                    required
                                >
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="newQuiz.description" 
                                    rows="3"
                                ></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Duration (minutes)</label>
                                    <input 
                                        type="number" 
                                        class="form-control" 
                                        v-model="newQuiz.duration"
                                        min="1"
                                        required
                                    >
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Difficulty</label>
                                    <select class="form-select" v-model="newQuiz.difficulty">
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button 
                            type="button" 
                            class="btn btn-primary" 
                            @click="addQuiz"
                            :disabled="loading || !newQuiz.name"
                        >
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                            Add Quiz
                        </button>
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
                    <div class="modal-body" v-if="editingQuiz">
                        <form @submit.prevent="editQuiz">
                            <div class="mb-3">
                                <label class="form-label">Quiz Name</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="editingQuiz.name"
                                    required
                                >
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="editingQuiz.description" 
                                    rows="3"
                                ></textarea>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Duration (minutes)</label>
                                    <input 
                                        type="number" 
                                        class="form-control" 
                                        v-model="editingQuiz.duration"
                                        min="1"
                                        required
                                    >
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Difficulty</label>
                                    <select class="form-select" v-model="editingQuiz.difficulty">
                                        <option>Easy</option>
                                        <option>Medium</option>
                                        <option>Hard</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button 
                            type="button" 
                            class="btn btn-primary" 
                            @click="editQuiz"
                            :disabled="loading || !editingQuiz?.name"
                        >
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};