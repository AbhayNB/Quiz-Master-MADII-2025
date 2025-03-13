import { store } from "../../store.js";

export const SubjectCard = {
    props: {
        name:{
            type:String
        },
        subject: {
            type: Object,
            required: true
        }
    },
    emits: ['edit', 'delete', 'view-chapters'],
    template: `
        <div class="card h-100 shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">{{name}}</h5>
                    <div class="dropdown">
                        <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <button class="dropdown-item" @click="$emit('edit', subject)" data-bs-toggle="modal" data-bs-target="#editSubjectModal">
                                    <i class="bi bi-pencil-square me-2"></i> Edit Subject
                                </button>
                            </li>
                            <li>
                                <button class="dropdown-item" @click="$emit('view-chapters', subject)">
                                    <i class="bi bi-collection me-2"></i> View Chapters
                                </button>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <button class="dropdown-item text-danger" @click="$emit('delete', subject.id)">
                                    <i class="bi bi-trash me-2"></i> Delete Subject
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
                <p class="card-text text-muted">{{subject.description}}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-journal-text me-2"></i>
                        <span class="badge bg-primary">{{subject.quizCount}} Quizzes</span>
                    </div>
                    <button class="btn btn-outline-primary btn-sm" @click="$emit('view-chapters', subject)">
                        <i class="bi bi-book"></i> View Chapters
                    </button>
                </div>
            </div>
        </div>
    `
};

export const SubjectsPage = {
    data() {
        return {
            newSubject: {
                name: '',
                description: ''
            },
            editingSubject: null,
            loading: false,
            error: null
        }
    },
    computed: {
        subjects() {
            return this.$store.getters.subjects;
        }
    },
    methods: {
        async createSubject() {
            try {
                await this.$store.dispatch('createSubject', this.newSubject);
                this.newSubject = { name: '', description: '' };
                // Close modal
                document.getElementById('addSubjectModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                this.error = error.message;
            }
        },
        startEdit(subject) {
            this.editingSubject = { ...subject };
        },
        async updateSubject() {
            if (!this.editingSubject) return;
            
            try {
                await this.$store.dispatch('updateSubject', {
                    id: this.editingSubject.id,
                    subject: {
                        name: this.editingSubject.name,
                        description: this.editingSubject.description
                    }
                });
                this.editingSubject = null;
                // Close modal
                document.getElementById('editSubjectModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                this.error = error.message;
            }
        },
        async deleteSubject(id) {
            if (!confirm('Are you sure you want to delete this subject?')) return;
            
            try {
                await this.$store.dispatch('deleteSubject', id);
            } catch (error) {
                this.error = error.message;
            }
        },
        navigateToChapters(subjectId) {
            this.$router.push(`/subjects/${subjectId}/chapters`);
        }
    },
    mounted() {
        // Load subjects when component is mounted
        this.$store.dispatch('fetchSubjects');
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Subjects</h2>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addSubjectModal">
                <i class="bi bi-plus-lg"></i> Add Subject
            </button>
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <!-- Subjects Grid -->
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <div v-for="subject in subjects" :key="subject.id" class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">{{ subject.name }}</h5>
                        <p class="card-text">{{ subject.description }}</p>
                    </div>
                    <div class="card-footer bg-transparent border-0">
                        <div class="btn-group" role="group">
                            <button class="btn btn-primary" @click="navigateToChapters(subject.id)">
                                <i class="bi bi-journal-text"></i> Chapters
                            </button>
                            <button class="btn btn-outline-primary" @click="startEdit(subject)" data-bs-toggle="modal" data-bs-target="#editSubjectModal">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" @click="deleteSubject(subject.id)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Subject Modal -->
        <div class="modal fade" id="addSubjectModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Subject</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="createSubject">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" v-model="newSubject.name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" v-model="newSubject.description" rows="3" required></textarea>
                            </div>
                            <div class="modal-footer px-0 pb-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    {{ loading ? 'Creating...' : 'Create Subject' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Subject Modal -->
        <div class="modal fade" id="editSubjectModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Subject</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="updateSubject" v-if="editingSubject">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" v-model="editingSubject.name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" v-model="editingSubject.description" rows="3" required></textarea>
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
    `,
    components: {
        SubjectCard
    }
};