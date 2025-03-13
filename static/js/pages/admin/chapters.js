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
                description: '',
                subject_id: null
            },
            editingChapter: null,
            loading: false,
            error: null
        }
    },
    computed: {
        chapters() {
            return this.$store.getters.chapters(parseInt(this.id));
        },
        subject() {
            return this.$store.getters.subjects.find(s => s.id === parseInt(this.id));
        }
    },
    methods: {
        async createChapter() {
            try {
                this.newChapter.subject_id = parseInt(this.id);
                await this.$store.dispatch('createChapter', this.newChapter);
                this.newChapter = { name: '', description: '', subject_id: null };
                // Close modal
                document.getElementById('addChapterModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                this.error = error.message;
            }
        },
        startEdit(chapter) {
            this.editingChapter = { ...chapter };
        },
        async updateChapter() {
            if (!this.editingChapter) return;
            
            try {
                await this.$store.dispatch('updateChapter', {
                    id: this.editingChapter.id,
                    chapter: {
                        name: this.editingChapter.name,
                        description: this.editingChapter.description
                    },
                    subjectId: parseInt(this.id)
                });
                this.editingChapter = null;
                // Close modal
                document.getElementById('editChapterModal').querySelector('[data-bs-dismiss="modal"]').click();
            } catch (error) {
                this.error = error.message;
            }
        },
        async deleteChapter(chapterId) {
            if (!confirm('Are you sure you want to delete this chapter?')) return;
            
            try {
                await this.$store.dispatch('deleteChapter', {
                    id: chapterId,
                    subjectId: parseInt(this.id)
                });
            } catch (error) {
                this.error = error.message;
            }
        },
        navigateToQuizzes(chapterId) {
            this.$router.push(`/chapters/${chapterId}/quizzes`);
        }
    },
    mounted() {
        // Load chapters when component is mounted
        this.$store.dispatch('fetchChapters', parseInt(this.id));
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2>{{ subject?.name }} - Chapters</h2>
                <p class="text-muted">{{ subject?.description }}</p>
            </div>
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addChapterModal">
                <i class="bi bi-plus-lg"></i> Add Chapter
            </button>
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <!-- Chapters Grid -->
        <div class="row row-cols-1 row-cols-md-3 g-4">
            <div v-for="chapter in chapters" :key="chapter.id" class="col">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">{{ chapter.name }}</h5>
                        <p class="card-text">{{ chapter.description }}</p>
                        <div class="mt-2">
                            <span class="badge bg-info">{{ chapter.quizCount }} Quizzes</span>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0">
                        <div class="btn-group" role="group">
                            <button class="btn btn-primary" @click="navigateToQuizzes(chapter.id)">
                                <i class="bi bi-collection"></i> Quizzes
                            </button>
                            <button class="btn btn-outline-primary" @click="startEdit(chapter)" data-bs-toggle="modal" data-bs-target="#editChapterModal">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger" @click="deleteChapter(chapter.id)">
                                <i class="bi bi-trash"></i>
                            </button>
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
                        <form @submit.prevent="createChapter">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" v-model="newChapter.name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" v-model="newChapter.description" rows="3" required></textarea>
                            </div>
                            <div class="modal-footer px-0 pb-0">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    {{ loading ? 'Creating...' : 'Create Chapter' }}
                                </button>
                            </div>
                        </form>
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
                    <div class="modal-body">
                        <form @submit.prevent="updateChapter" v-if="editingChapter">
                            <div class="mb-3">
                                <label class="form-label">Name</label>
                                <input type="text" class="form-control" v-model="editingChapter.name" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" v-model="editingChapter.description" rows="3" required></textarea>
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