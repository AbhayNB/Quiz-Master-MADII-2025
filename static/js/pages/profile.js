const ProfilePage = {
    template: `
        <div class="container mt-5">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="card shadow">
                        <div class="card-body">
                            <h2 class="text-center mb-4">Profile</h2>
                            
                            <div v-if="error" class="alert alert-danger">
                                {{ error }}
                            </div>
                            
                            <div v-if="success" class="alert alert-success">
                                {{ success }}
                            </div>

                            <form @submit.prevent="updateProfile" v-if="profile">
                                <div class="mb-3">
                                    <label class="form-label">Username</label>
                                    <input 
                                        type="text" 
                                        class="form-control"
                                        v-model="profile.username"
                                        disabled
                                    >
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input 
                                        type="email" 
                                        class="form-control"
                                        v-model="profile.email"
                                        required
                                    >
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">Name</label>
                                    <input 
                                        type="text" 
                                        class="form-control"
                                        v-model="profile.name"
                                    >
                                </div>

                                <div class="mb-3">
                                    <label class="form-label">New Password (leave empty to keep current)</label>
                                    <input 
                                        type="password" 
                                        class="form-control"
                                        v-model="newPassword"
                                    >
                                </div>

                                <button 
                                    type="submit" 
                                    class="btn btn-primary"
                                    :disabled="loading"
                                >
                                    {{ loading ? 'Saving...' : 'Save Changes' }}
                                </button>
                            </form>

                            <div v-if="!profile" class="text-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            profile: null,
            newPassword: '',
            error: null,
            success: null,
            loading: false
        }
    },
    methods: {
        async loadProfile() {
            try {
                const response = await fetch('/api/profile', {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    }
                });
                if (!response.ok) throw new Error('Failed to load profile');
                const data = await response.json();
                this.profile = data;
            } catch (err) {
                this.error = err.message;
            }
        },
        async updateProfile() {
            try {
                this.loading = true;
                this.error = null;
                this.success = null;
                
                const data = {
                    email: this.profile.email,
                    name: this.profile.name
                };
                
                if (this.newPassword) {
                    data.password = this.newPassword;
                }
                
                const response = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                    },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.msg || 'Failed to update profile');
                }
                
                this.success = 'Profile updated successfully';
                this.newPassword = '';
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        }
    },
    created() {
        this.loadProfile();
    }
};

// Export the component
export { ProfilePage };