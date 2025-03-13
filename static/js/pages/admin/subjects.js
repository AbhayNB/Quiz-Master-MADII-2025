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
            searchQuery: '',
            loading: false,
            isLoading: true
        };
    },
    computed: {
        filteredSubjects() {
            const subjects = this.subjects['subjects'] || [];
            return subjects.filter(subject => 
                subject.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                subject.description.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
        subjects() {
            return store.state.subjects;
        }
    },
    methods: {
        async addSubject() {
            if (!this.newSubject.name) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/create_subject`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newSubject)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to add subject');
                }
                
                store.commit('addSubject');
                
                // Reset form
                this.newSubject.name = '';
                this.newSubject.description = '';
                
                // Close modal
                document.getElementById('addSubjectModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                console.error('Error adding subject:', error);
            } finally {
                this.loading = false;
            }
        },
        async editSubject() {
            if (!this.editingSubject || !this.editingSubject.name) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/update_subject/${this.editingSubject.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this.editingSubject.name,
                        description: this.editingSubject.description
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update subject');
                }

                store.commit('updateSubject', this.editingSubject);

                // Close modal
                document.getElementById('editSubjectModal').querySelector('[data-bs-dismiss="modal"]').click();
                this.editingSubject = null;
            } catch (error) {
                console.error('Error updating subject:', error);
            } finally {
                this.loading = false;
            }
        },
        async deleteSubject(subjectId) {
            if (!confirm('Are you sure you want to delete this subject? This action cannot be undone.')) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/delete_subject/${subjectId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete subject');
                }

                store.commit('deleteSubject', subjectId);
            } catch (error) {
                console.error('Error deleting subject:', error);
            } finally {
                this.loading = false;
            }
        },
        startEdit(subject) {
            this.editingSubject = { ...subject };
        },
        viewChapters(subject) {
            // Navigate to chapters page using Vue Router
            this.$router.push(`/subjects/${subject.id}/chapters`);
        }
    },
    async created() {
        this.isLoading = true;
        await store.dispatch('subjects');
        this.isLoading = false;
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Manage Subjects</h2>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addSubjectModal">
                <i class="bi bi-plus-lg"></i> Add New Subject
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
                        placeholder="Search subjects..."
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

        <!-- Subjects Grid -->
        <div v-else class="row row-cols-1 row-cols-md-3 g-4">
            <div v-if="filteredSubjects.length === 0" class="col-12 text-center">
                <p class="text-muted">No subjects found.</p>
            </div>
            <div class="col" v-for="subject in filteredSubjects" :key="subject.id">
                <SubjectCard 
                    :subject=subject
                    :name=subject.name
                    @edit="startEdit"
                    @delete="deleteSubject"
                    @view-chapters="viewChapters"
                />
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
                        <form @submit.prevent="addSubject">
                            <div class="mb-3">
                                <label class="form-label">Subject Name</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="newSubject.name"
                                    required
                                >
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="newSubject.description" 
                                    rows="3"
                                ></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button 
                            type="button" 
                            class="btn btn-primary" 
                            @click="addSubject"
                            :disabled="loading || !newSubject.name"
                        >
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                            Add Subject
                        </button>
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
                    <div class="modal-body" v-if="editingSubject">
                        <form @submit.prevent="editSubject">
                            <div class="mb-3">
                                <label class="form-label">Subject Name</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="editingSubject.name"
                                    required
                                >
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="editingSubject.description" 
                                    rows="3"
                                ></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button 
                            type="button" 
                            class="btn btn-primary" 
                            @click="editSubject"
                            :disabled="loading || !editingSubject?.name"
                        >
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                            Save Changes
                        </button>
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