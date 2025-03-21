export const UsersPage = {
    data() {
        return {
            loading: false,
            error: null
        }
    },
    computed: {
        users() {
            return this.$store.getters.users;
        }
    },
    methods: {
        formatDate(dateString) {
            return new Date(dateString).toLocaleString();
        }
    },
    async created() {
        try {
            this.loading = true;
            await this.$store.dispatch('fetchUsers');
        } catch (error) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    },
    template: `
    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="bi bi-people me-2"></i>Users</h2>
        </div>

        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <div class="card shadow-sm">
            <div class="card-body">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>

                <div v-else-if="users && users.length" class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined On</th>
                                <th>Last Active</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user.id">
                                <td>{{ user.username }}</td>
                                <td>{{ user.name }}</td>
                                <td>{{ user.email }}</td>
                                <td>
                                    <span :class="[
                                        'badge',
                                        user.role === 'admin' ? 'bg-danger' : 'bg-primary'
                                    ]">
                                        {{ user.role }}
                                    </span>
                                </td>
                                <td>{{ formatDate(user.created_at) }}</td>
                                <td>{{ formatDate(user.last_active) }}</td>
                                <td>
                                    <span :class="[
                                        'badge',
                                        user.is_active ? 'bg-success' : 'bg-secondary'
                                    ]">
                                        {{ user.is_active ? 'Active' : 'Inactive' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="text-center py-5">
                    <i class="bi bi-people display-1 text-muted"></i>
                    <p class="lead mt-3">No users found</p>
                </div>
            </div>
        </div>
    </div>
    `
};