// Store
import {store} from './store.js';

// Components
import { Navbar } from './components/navbar.js';

// Pages
import { Home } from './pages/home.js';
import { SummaryPage } from './pages/summary.js';
import { QuizPage } from './pages/quiz.js';
import { ScorePage } from './pages/score.js';

// auth

const LoginPage = {
  data() {
    return {
      email: '',
      password: '',
      error: null,
      loading: false
    };
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;
      try {
        const response = await fetch(`${window.API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Store tokens and user data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('email', data.email);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        
        // Update Vuex store
        this.$store.commit('setLogged', true);
        
        // Redirect to home
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
              <h2 class="text-center mb-4">Login</h2>
              
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
                  {{ loading ? 'Logging in...' : 'Login' }}
                </button>
              </form>

              <div class="text-center mt-3">
                <p>Don't have an account? 
                  <router-link to="/register">Register</router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

const RegisterPage = {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      error: null,
      loading: false
    };
  },
  methods: {
    async register() {
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${window.API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.username,
            email: this.email,
            password: this.password,
            name: this.name
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        // Redirect to login page
        this.$router.push('/login');
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
              <h2 class="text-center mb-4">Register</h2>
              
              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>

              <form @submit.prevent="register">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="username" 
                    required
                  >
                </div>

                <div class="mb-3">
                  <label class="form-label">Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="name" 
                    required
                  >
                </div>

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

                <div class="mb-3">
                  <label class="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    v-model="confirmPassword" 
                    required
                  >
                </div>

                <button 
                  type="submit" 
                  class="btn btn-primary w-100" 
                  :disabled="loading"
                >
                  {{ loading ? 'Creating account...' : 'Register' }}
                </button>
              </form>

              <div class="text-center mt-3">
                <p>Already have an account? 
                  <router-link to="/login">Login</router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};


const Subscriptions = {
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="text-center mb-4">Subscriptions</h2>
              <p>Coming soon...</p>
            </div>
          </div>
        </div>  
      </div>  
    </div>
  `
}

// Update routes array with new components
const routes = [
  { 
    path: '/', 
    component: Home,
    beforeEnter: (to, from, next) => {
      const loggedIn = store.getters.logged;
      if (loggedIn) {
        next();
      } else {
        next('/login');
      }
    }
  },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
  { path: '/summary', component: SummaryPage },
  { path: '/quiz/:id', component: QuizPage, props: true },
  { path: '/scores', component: ScorePage },
  { path: '/subscriptions', component: Subscriptions },
  // { 
  //   path: '/admin', 
  //   component: AdminPage,
  //   beforeEnter: (to, from, next) => {
  //     const loggedIn = store.getters.logged;
  //     const role = localStorage.getItem('role');
  //     if (loggedIn && role === 'admin') {
  //       next();
  //     } else {
  //       next('/');
  //     }
  //   }
  // }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(), // or createWebHistory() for HTML5 History mode
    routes
  });
  
const app = Vue.createApp({
    data() {
        return {
            appInfo: 'Welcome to Knowlympics ! Test your knowledge across various subjects with our interactive quizzes. Track your progress, compete with others, and improve your skills. Whether you\'re a student preparing for exams or just love learning, Quiz Master has something for everyone!',
            appName: 'Knowlympics',
            quizCategories: [
                { id: 1, name: 'Mathematics', description: 'Test your math skills with these quizzes' },
                { id: 2, name: 'Science', description: 'Explore the world of science with these quizzes' },
                { id: 3, name: 'History', description: 'Learn about historical events and figures' },
                { id: 4, name: 'Geography', description: 'Discover the world and its wonders' },
                { id: 5, name: 'English', description: 'Improve your English language skills' },
                { id: 6, name: 'Computer Science', description: 'Test your knowledge of computers and technology' }
            ],
        };
    },
    computed: {
        navLinks() {
            const isAdmin = localStorage.getItem('role') === 'admin';
            const links = [
                { name: 'Home', path: '#/', icon: 'bi bi-house', active: true },
                { name: 'Subscriptions', path: '#/subscriptions', icon: 'bi bi-speedometer2', active: true },
                { name: 'Scores', path: '#/scores', icon: 'bi bi-graph-up' },
                { name: 'Summary', path: '#/summary', icon: 'bi bi-columns-gap' }
            ];
            
            if (isAdmin) {
                links.push({ name: 'Admin', path: '/admin', icon: 'bi bi-gear-fill' });
            }
            
            links.push({
                name: localStorage.getItem('username') || 'Profile',
                icon: 'bi bi-person-circle',
                children: [
                    { name: 'Settings', path: '#/profile-settings', icon: 'bi bi-gear' },
                    { name: 'My Profile', path: '#/profile', icon: 'bi bi-person-circle' },
                    { name: 'Logout', action: () => {
                        localStorage.clear();
                        this.$store.commit('setLogged', false);
                        this.$router.push('/login');
                    }, icon: 'bi bi-box-arrow-right', class: 'text-danger' }
                ]
            });
            
            return this.$store.getters.logged ? links : [];
        }
    },
    components: {
        'navbar': Navbar,
    },
    created() {
        const access_token = localStorage.getItem('access_token');
        if (access_token) {
            this.$store.commit('setLogged', true);
        }

    }
});
app.use(store);
app.use(router);
// app.use(router);
app.mount('#app');