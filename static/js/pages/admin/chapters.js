import { store } from "../../store.js";

export const ChaptersPage = {
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            newChapter: {
                name: '',
                description: ''
            },
            editingChapter: null,
            searchQuery: '',
            loading: false,
            isLoading: true
        };
    },
    computed: {
        subject() {
            return (store.state.subjects['subjects'] || []).find(s => s.id === Number(this.id)) || {};
        },
        chapters() {
            return store.getters.getChapters(this.id) || [];
        },
        filteredChapters() {
            return this.chapters.filter(chapter => 
                chapter.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                chapter.description.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },
    methods: {
        async addChapter() {
            if (!this.newChapter.name) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/create_chapter`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this.newChapter.name,
                        description: this.newChapter.description,
                        subject_id: this.id
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to add Chapter');
                }
                
                const data = await response.json();
                store.commit('addChapter', { 
                    subjectId: this.id,
                    chapter: data.chapter
                });
                
                // Reset form
                this.newChapter.name = '';
                this.newChapter.description = '';
                
                // Close modal
                document.getElementById('addChapterModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                console.error('Error adding chapter:', error);
            } finally {
                this.loading = false;
            }
        },
        async editChapter() {
            if (!this.editingChapter || !this.editingChapter.name) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/update_chapter/${this.editingChapter.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this.editingChapter.name,
                        description: this.editingChapter.description
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update chapter');
                }

                store.commit('updateChapter', {
                    subjectId: this.id,
                    chapter: this.editingChapter
                });

                // Close modal
                document.getElementById('editChapterModal').querySelector('[data-bs-dismiss="modal"]').click();
                this.editingChapter = null;
            } catch (error) {
                console.error('Error updating chapter:', error);
            } finally {
                this.loading = false;
            }
        },
        async deleteChapter(chapterId) {
            if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) return;
            
            this.loading = true;
            try {
                const response = await fetch(`${window.API_URL}/delete_chapter/${chapterId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete chapter');
                }

                store.commit('deleteChapter', { 
                    subjectId: this.id,
                    chapterId
                });
            } catch (error) {
                console.error('Error deleting chapter:', error);
            } finally {
                this.loading = false;
            }
        },
        startEdit(chapter) {
            this.editingChapter = { ...chapter };
        },
        viewQuizzes(chapter) {
            this.$router.push(`/chapters/${chapter.id}/quizzes`);
        }
    },
    async created() {
        this.isLoading = true;
        await store.dispatch('chapters', this.id);
        this.isLoading = false;
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>{{subject.name}} - Chapters</h2>
                <p>{{subject.description}}</p>
                <button class="btn btn-link p-0" @click="$router.push('/subjects')">
                    <i class="bi bi-arrow-left"></i> Back to Subjects
                </button>
            </div>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addChapterModal">
                <i class="bi bi-plus-lg"></i> Add New Chapter
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
                        placeholder="Search chapters..."
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

        <!-- Chapters Grid -->
        <div v-else>
            <div v-if="filteredChapters.length === 0" class="text-center">
                <p class="text-muted">No chapters found.</p>
            </div>
            <div class="row g-4">
                <div class="col-md-4" v-for="chapter in filteredChapters" :key="chapter.id">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title mb-0">{{chapter.name}}</h5>
                                <div class="dropdown">
                                    <button class="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown">
                                        <i class="bi bi-three-dots-vertical"></i>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li>
                                            <button class="dropdown-item" @click="viewQuizzes(chapter)">
                                                <i class="bi bi-collection me-2"></i> Manage Quizzes
                                            </button>
                                        </li>
                                        <li>
                                            <button class="dropdown-item" @click="startEdit(chapter)" data-bs-toggle="modal" data-bs-target="#editChapterModal">
                                                <i class="bi bi-pencil-square me-2"></i> Edit Chapter
                                            </button>
                                        </li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li>
                                            <button class="dropdown-item text-danger" @click="deleteChapter(chapter.id)">
                                                <i class="bi bi-trash me-2"></i> Delete Chapter
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <p class="card-text text-muted">{{chapter.description}}</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-journal-text me-2"></i>
                                    <span class="badge bg-primary">{{chapter.quizCount}} Quizzes</span>
                                </div>
                                <button class="btn btn-outline-primary btn-sm" @click="viewQuizzes(chapter)">
                                    <i class="bi bi-collection"></i> View Quizzes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Chapter Modal -->
        <div class="modal fade" id="addChapterModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Chapter</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="addChapter">
                            <div class="mb-3">
                                <label class="form-label">Chapter Name</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="newChapter.name"
                                    required
                                >
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="newChapter.description" 
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
                            @click="addChapter"
                            :disabled="loading || !newChapter.name"
                        >
                            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                            Add Chapter
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Chapter Modal -->
        <div class="modal fade" id="editChapterModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Chapter</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body" v-if="editingChapter">
                        <form @submit.prevent="editChapter">
                            <div class="mb-3">
                                <label class="form-label">Chapter Name</label>
                                <input 
                                    type="text" 
                                    class="form-control" 
                                    v-model="editingChapter.name"
                                    required
                                >
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea 
                                    class="form-control" 
                                    v-model="editingChapter.description" 
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
                            @click="editChapter"
                            :disabled="loading || !editingChapter?.name"
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