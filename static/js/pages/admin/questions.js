import { store } from "../../store.js";

export const QuestionsPage = {
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            newQuestion: {
                text: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                explanation: ''
            },
            editingQuestion: null,
            searchQuery: '',
            loading: false,
            isLoading: true
        };
    },
    computed: {
        quiz() {
            return store.getters.getQuiz(this.id) || {};
        },
        questions() {
            return store.getters.getQuestions(this.id) || [];
        },
        filteredQuestions() {
            return this.questions.filter(question => 
                question.text.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                question.explanation.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },
    methods: {
        async addQuestion() {
            if (!this.newQuestion.text || this.newQuestion.options.some(opt => !opt)) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/create_question`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...this.newQuestion,
                        quiz_id: this.id
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to add Question');
                }
                
                const data = await response.json();
                store.commit('addQuestion', { 
                    quizId: this.id,
                    question: data.question
                });
                
                // Reset form
                this.newQuestion = {
                    text: '',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    explanation: ''
                };
                
                // Close modal
                document.getElementById('addQuestionModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                console.error('Error adding question:', error);
            } finally {
                this.loading = false;
            }
        },
        async editQuestion() {
            if (!this.editingQuestion || !this.editingQuestion.text || 
                this.editingQuestion.options.some(opt => !opt)) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/update_question/${this.editingQuestion.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: this.editingQuestion.text,
                        options: this.editingQuestion.options,
                        correctAnswer: this.editingQuestion.correctAnswer,
                        explanation: this.editingQuestion.explanation
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update question');
                }

                store.commit('updateQuestion', {
                    quizId: this.id,
                    question: this.editingQuestion
                });

                // Close modal
                document.getElementById('editQuestionModal').querySelector('[data-bs-dismiss="modal"]').click();
                this.editingQuestion = null;
            } catch (error) {
                console.error('Error updating question:', error);
            } finally {
                this.loading = false;
            }
        },
        async deleteQuestion(questionId) {
            if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/delete_question/${questionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete question');
                }

                store.commit('deleteQuestion', { 
                    quizId: this.id,
                    questionId
                });
            } catch (error) {
                console.error('Error deleting question:', error);
            } finally {
                this.loading = false;
            }
        },
        startEdit(question) {
            this.editingQuestion = { ...question };
        }
    },
    async created() {
        this.isLoading = true;
        await store.dispatch('questions', this.id);
        this.isLoading = false;
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>{{quiz.name}} - Questions</h2>
                <p>{{quiz.description}}</p>
                <button class="btn btn-link p-0" @click="$router.push('/quizzes')">
                    <i class="bi bi-arrow-left"></i> Back to Quizzes
                </button>
            </div>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addQuestionModal">
                <i class="bi bi-plus-lg"></i> Add New Question
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
                        placeholder="Search questions..."
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

        <!-- Questions List -->
        <div v-else>
            <div v-if="filteredQuestions.length === 0" class="text-center">
                <p class="text-muted">No questions found.</p>
            </div>
            <div class="questions-list">
                <div class="card mb-3" v-for="(question, index) in filteredQuestions" :key="question.id">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title mb-0">
                                <span class="badge bg-primary me-2">Q{{index + 1}}</span>
                                {{question.text}}
                            </h5>
                            <div class="dropdown">
                                <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button class="dropdown-item" @click="startEdit(question)" data-bs-toggle="modal" data-bs-target="#editQuestionModal">
                                            <i class="bi bi-pencil-square me-2"></i> Edit Question
                                        </button>
                                    </li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li>
                                        <button class="dropdown-item text-danger" @click="deleteQuestion(question.id)">
                                            <i class="bi bi-trash me-2"></i> Delete Question
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Options -->
                        <div class="row g-3 mb-3">
                            <div class="col-md-6" v-for="(option, optIndex) in question.options" :key="optIndex">
                                <div class="option-card p-2 rounded" 
                                     :class="{ 'correct-answer': optIndex === question.correctAnswer }">
                                    <div class="d-flex align-items-center">
                                        <div class="option-marker me-2">
                                            {{String.fromCharCode(65 + optIndex)}}
                                        </div>
                                        <div>{{option}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Explanation -->
                        <div v-if="question.explanation" class="mt-3">
                            <small class="text-muted">
                                <i class="bi bi-info-circle me-1"></i> Explanation: {{question.explanation}}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Question Modal -->
        <div class="modal fade" id="addQuestionModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Question</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="addQuestion">
                            <div class="mb-3">
                                <label class="form-label">Question Text</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="newQuestion.text"
                                    rows="2"
                                    required
                                ></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Options</label>
                                <div class="row g-3">
                                    <div class="col-md-6" v-for="(option, index) in newQuestion.options" :key="index">
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                {{String.fromCharCode(65 + index)}}
                                            </span>
                                            <input 
                                                type="text" 
                                                class="form-control"
                                                v-model="newQuestion.options[index]"
                                                :placeholder="'Option ' + String.fromCharCode(65 + index)"
                                                required
                                            >
                                            <div class="input-group-append">
                                                <div class="input-group-text">
                                                    <input 
                                                        type="radio" 
                                                        :value="index"
                                                        v-model="newQuestion.correctAnswer"
                                                        name="correctAnswer"
                                                        required
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Explanation (Optional)</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="newQuestion.explanation"
                                    rows="2"
                                    placeholder="Explain why the correct answer is right..."
                                ></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button 
                            type="button" 
                            class="btn btn-primary" 
                            @click="addQuestion"
                            :disabled="loading || !newQuestion.text || newQuestion.options.some(opt => !opt)"
                        >
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                            Add Question
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Question Modal -->
        <div class="modal fade" id="editQuestionModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Question</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" v-if="editingQuestion">
                        <form @submit.prevent="editQuestion">
                            <div class="mb-3">
                                <label class="form-label">Question Text</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="editingQuestion.text"
                                    rows="2"
                                    required
                                ></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Options</label>
                                <div class="row g-3">
                                    <div class="col-md-6" v-for="(option, index) in editingQuestion.options" :key="index">
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                {{String.fromCharCode(65 + index)}}
                                            </span>
                                            <input 
                                                type="text" 
                                                class="form-control"
                                                v-model="editingQuestion.options[index]"
                                                :placeholder="'Option ' + String.fromCharCode(65 + index)"
                                                required
                                            >
                                            <div class="input-group-append">
                                                <div class="input-group-text">
                                                    <input 
                                                        type="radio" 
                                                        :value="index"
                                                        v-model="editingQuestion.correctAnswer"
                                                        name="editCorrectAnswer"
                                                        required
                                                    >
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Explanation (Optional)</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="editingQuestion.explanation"
                                    rows="2"
                                    placeholder="Explain why the correct answer is right..."
                                ></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button 
                            type="button" 
                            class="btn btn-primary" 
                            @click="editQuestion"
                            :disabled="loading || !editingQuestion?.text || editingQuestion?.options.some(opt => !opt)"
                        >
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <style>
        .option-card {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        .option-card.correct-answer {
            background-color: #d4edda;
            border-color: #c3e6cb;
        }
        .option-marker {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.875rem;
        }
        .questions-list .card:hover {
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            transition: box-shadow 0.3s ease-in-out;
        }
        </style>
    </div>
    `
};