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
                question: '',
                option1: '',
                option2: '',
                option3: '',
                option4: '',
                correct_option: '1'
            },
            editingQuestion: null,
            loading: false,
            error: null
        }
    },
    computed: {
        questions() {
            return this.$store.getters.questions(parseInt(this.id));
        },
        quiz() {
            const chapterId = this.$store.getters.subjects.reduce((acc, subject) => {
                const chapter = subject.chapters?.find(c => 
                    c.quizzes?.some(q => q.id === parseInt(this.id))
                );
                return chapter ? chapter.id : acc;
            }, null);
            
            if (chapterId) {
                return this.$store.getters.quizzes(chapterId)
                    .find(q => q.id === parseInt(this.id));
            }
            return null;
        }
    },
    methods: {
        async createQuestion() {
            try {
                await this.$store.dispatch('createQuestion', {
                    quizId: parseInt(this.id),
                    question: this.newQuestion
                });
                this.newQuestion = {
                    question: '',
                    option1: '',
                    option2: '',
                    option3: '',
                    option4: '',
                    correct_option: '1'
                };
                // Close modal
                document.getElementById('addQuestionModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                this.error = error.message;
            }
        },
        startEdit(question) {
            this.editingQuestion = { ...question };
        },
        async updateQuestion() {
            if (!this.editingQuestion) return;
            
            try {
                await this.$store.dispatch('updateQuestion', {
                    id: this.editingQuestion.id,
                    question: {
                        question: this.editingQuestion.question,
                        option1: this.editingQuestion.option1,
                        option2: this.editingQuestion.option2,
                        option3: this.editingQuestion.option3,
                        option4: this.editingQuestion.option4,
                        correct_option: this.editingQuestion.correct_option
                    },
                    quizId: parseInt(this.id)
                });
                this.editingQuestion = null;
                // Close modal
                document.getElementById('editQuestionModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                this.error = error.message;
            }
        },
        async deleteQuestion(questionId) {
            if (!confirm('Are you sure you want to delete this question?')) return;
            
            try {
                await this.$store.dispatch('deleteQuestion', {
                    id: questionId,
                    quizId: parseInt(this.id)
                });
            } catch (error) {
                this.error = error.message;
            }
        }
    },
    mounted() {
        // Load questions when component is mounted
        this.$store.dispatch('fetchQuestions', parseInt(this.id));
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>{{ quiz?.name }} - Questions</h2>
                <p class="text-muted">{{ quiz?.description }}</p>
                <div class="d-flex gap-2">
                    <span class="badge bg-primary">{{ questions.length }} Questions</span>
                    <span class="badge bg-info">{{ quiz?.duration }} minutes</span>
                    <span class="badge" :class="{
                        'bg-success': quiz?.difficulty === 'easy',
                        'bg-warning': quiz?.difficulty === 'medium',
                        'bg-danger': quiz?.difficulty === 'hard'
                    }">{{ quiz?.difficulty }}</span>
                </div>
            </div>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addQuestionModal">
                <i class="bi bi-plus-lg"></i> Add Question
            </button>
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <!-- Questions List -->
        <div class="list-group">
            <div v-for="(question, index) in questions" :key="question.id" class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between align-items-start mb-2">
                    <h5 class="mb-1">
                        <span class="badge bg-secondary me-2">Q{{ index + 1 }}</span>
                        {{ question.question }}
                    </h5>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" @click="startEdit(question)" data-bs-toggle="modal" data-bs-target="#editQuestionModal">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteQuestion(question.id)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="ms-5">
                    <div class="form-check" v-for="n in 4" :key="n">
                        <input class="form-check-input" type="radio" :name="'question-'+question.id" :checked="question.correct_option === ''+n" disabled>
                        <label class="form-check-label" :class="{ 'text-success fw-bold': question.correct_option === ''+n }">
                            {{ question['option'+n] }}
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Question Modal -->
        <div class="modal fade" id="addQuestionModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Question</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="createQuestion">
                            <div class="mb-3">
                                <label class="form-label">Question</label>
                                <textarea class="form-control" v-model="newQuestion.question" rows="2" required></textarea>
                            </div>
                            <div v-for="n in 4" :key="n" class="mb-3">
                                <label class="form-label">Option {{ n }}</label>
                                <input type="text" class="form-control" v-model="newQuestion['option'+n]" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Correct Option</label>
                                <select class="form-select" v-model="newQuestion.correct_option" required>
                                    <option value="1">Option 1</option>
                                    <option value="2">Option 2</option>
                                    <option value="3">Option 3</option>
                                    <option value="4">Option 4</option>
                                </select>
                            </div>
                            <div class="modal-footer px-0 pb-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    {{ loading ? 'Creating...' : 'Add Question' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Question Modal -->
        <div class="modal fade" id="editQuestionModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Question</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="updateQuestion" v-if="editingQuestion">
                            <div class="mb-3">
                                <label class="form-label">Question</label>
                                <textarea class="form-control" v-model="editingQuestion.question" rows="2" required></textarea>
                            </div>
                            <div v-for="n in 4" :key="n" class="mb-3">
                                <label class="form-label">Option {{ n }}</label>
                                <input type="text" class="form-control" v-model="editingQuestion['option'+n]" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Correct Option</label>
                                <select class="form-select" v-model="editingQuestion.correct_option" required>
                                    <option value="1">Option 1</option>
                                    <option value="2">Option 2</option>
                                    <option value="3">Option 3</option>
                                    <option value="4">Option 4</option>
                                </select>
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