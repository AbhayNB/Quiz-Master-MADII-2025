// Store
import {store} from './store.js';
import {api} from './services/api.js';

// Components
import { Navbar } from './components/navbar.js';

// Pages
import { SubjectsPage } from './pages/admin/subjects.js';
import { AdminDashboard } from './pages/admin/dashboard.js';
import { ChaptersPage } from './pages/admin/chapters.js';
import { QuizzesPage } from './pages/admin/quizzes.js';
import { QuestionsPage } from './pages/admin/questions.js';
import { AnalyticsPage } from './pages/admin/analytics.js';

// auth
const LoginPage = {
    data() {
        return {
            email: '',
            password: '',
            error: null,
            loading: false
        }
    },
    methods: {
        async login() {
            this.loading = true;
            this.error = null;
            try {
                const data = await api.auth.login({
                    email: this.email,
                    password: this.password
                });

                if (data.role !== 'admin') {
                    throw new Error('Access denied. Admin privileges required.');
                }

                // Store tokens and user data
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('email', data.email);
                localStorage.setItem('username', data.username);
                localStorage.setItem('role', data.role);
                
                // Update Vuex store
                this.$store.commit('setLogged', true);
                
                // Redirect to admin dashboard
                this.$router.push('/');
            } catch (err) {
                this.error = err.message;
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-body p-5">
                        <h2 class="text-center mb-4">Admin Login</h2>
                        
                        <div v-if="error" class="alert alert-danger">
                            {{ error }}
                        </div>

                        <form @submit.prevent="login">
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input 
                                    type="email" 
                                    class="form-control" 
                                    v-model="email"
                                    required
                                >
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Password</label>
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    v-model="password"
                                    required
                                >
                            </div>

                            <button 
                                type="submit" 
                                class="btn btn-primary w-100"
                                :disabled="loading"
                            >
                                {{ loading ? 'Logging in...' : 'Admin Login' }}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
};

// Update routes array with new components
const routes = [
    { 
        path: '/', 
        component: AdminDashboard,
        beforeEnter: (to, from, next) => {
            const loggedIn = store.getters.logged;
            const role = localStorage.getItem('role');
            if (loggedIn && role === 'admin') {
                next();
            } else {
                next('/login');
            }
        }
    },
    { path: '/login', component: LoginPage },
    { 
        path: '/subjects', 
        component: SubjectsPage,
        beforeEnter: (to, from, next) => {
            const loggedIn = store.getters.logged;
            const role = localStorage.getItem('role');
            if (loggedIn && role === 'admin') {
                next();
            } else {
                next('/login');
            }
        }
    },
    { 
        path: '/subjects/:id/chapters', 
        component: ChaptersPage,
        beforeEnter: (to, from, next) => {
            const loggedIn = store.getters.logged;
            const role = localStorage.getItem('role');
            if (loggedIn && role === 'admin') {
                next();
            } else {
                next('/login');
            }
        },
        props: true
    },
    { 
        path: '/chapters/:id/quizzes', 
        component: QuizzesPage,
        beforeEnter: (to, from, next) => {
            const loggedIn = store.getters.logged;
            const role = localStorage.getItem('role');
            if (loggedIn && role === 'admin') {
                next();
            } else {
                next('/login');
            }
        },
        props: true
    },
    { 
        path: '/quizzes/:id/questions', 
        component: QuestionsPage,
        beforeEnter: (to, from, next) => {
            const loggedIn = store.getters.logged;
            const role = localStorage.getItem('role');
            if (loggedIn && role === 'admin') {
                next();
            } else {
                next('/login');
            }
        },
        props: true
    },
    { 
        path: '/analytics', 
        component: AnalyticsPage,
        beforeEnter: (to, from, next) => {
            const loggedIn = store.getters.logged;
            const role = localStorage.getItem('role');
            if (loggedIn && role === 'admin') {
                next();
            } else {
                next('/login');
            }
        }
    }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});

const app = Vue.createApp({
    data() {
        return {
            API_URL: ''
        }
    },
    computed: {
        navLinks() {
            const links = [
                { name: 'Dashboard', path: '#/', icon: 'bi bi-speedometer2' },
                { name: 'Subjects', path: '#/subjects', icon: 'bi bi-book' },
                { name: 'Analytics', path: '#/analytics', icon: 'bi bi-graph-up' }
            ];

            // Add profile menu
            links.push({
                name: localStorage.getItem('username') || 'Profile',
                icon: 'bi bi-person-circle',
                children: [
                    { name: 'Settings', path: '#/profile-settings', icon: 'bi bi-gear' },
                    { name: 'My Profile', path: '#/profile', icon: 'bi bi-person-circle' },
                    { 
                        name: 'Logout', 
                        action: () => {
                            localStorage.clear();
                            this.$store.commit('setLogged', false);
                            this.$router.push('/login');
                        }, 
                        icon: 'bi bi-box-arrow-right', 
                        class: 'text-danger' 
                    }
                ]
            });

            return links;
        }
    },
    components: {
        'navbar': Navbar,
    },
    created() {
        const logged = localStorage.getItem('access_token') !== null;
        this.$store.commit('setLogged', logged);
    }
});

app.use(store);
app.use(router);
app.mount('#app');