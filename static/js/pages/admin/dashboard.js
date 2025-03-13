export const AdminDashboard = {
    data() {
        return {
            stats: {
                totalSubjects: 6,
                totalQuizzes: 25,
                activeUsers: 150,
                averageScore: 78
            },
            recentActivity: [
                { type: 'quiz_added', subject: 'Mathematics', name: 'Advanced Calculus', date: '2024-02-20' },
                { type: 'user_registered', name: 'John Doe', date: '2024-02-19' },
                { type: 'subject_added', name: 'Computer Science', date: '2024-02-18' }
            ]
        };
    },
    template: `
        <div class="container mt-4">
            <h2 class="mb-4">Admin Dashboard</h2>
            
            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h6 class="card-title">Total Subjects</h6>
                            <h2>{{stats.totalSubjects}}</h2>
                            <small>Active subjects</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h6 class="card-title">Total Quizzes</h6>
                            <h2>{{stats.totalQuizzes}}</h2>
                            <small>Across all subjects</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h6 class="card-title">Active Users</h6>
                            <h2>{{stats.activeUsers}}</h2>
                            <small>Registered users</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning">
                        <div class="card-body">
                            <h6 class="card-title">Average Score</h6>
                            <h2>{{stats.averageScore}}%</h2>
                            <small>Across all quizzes</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <router-link to="/subjects" class="btn btn-primary">
                                    <i class="bi bi-journal-plus"></i> Manage Subjects
                                </router-link>
                                <button class="btn btn-success">
                                    <i class="bi bi-plus-circle"></i> Create New Quiz
                                </button>
                                <button class="btn btn-info text-white">
                                    <i class="bi bi-people"></i> View User List
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Recent Activity</h5>
                        </div>
                        <div class="card-body">
                            <div class="activity-feed">
                                <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item mb-3">
                                    <div class="d-flex align-items-center">
                                        <div :class="['activity-icon me-3', 
                                            activity.type === 'quiz_added' ? 'text-success' :
                                            activity.type === 'user_registered' ? 'text-info' : 'text-primary']">
                                            <i :class="['bi', 
                                                activity.type === 'quiz_added' ? 'bi-file-plus' :
                                                activity.type === 'user_registered' ? 'bi-person-plus' : 'bi-journal-text']">
                                            </i>
                                        </div>
                                        <div>
                                            <div class="fw-bold">
                                                {{activity.type === 'quiz_added' ? 'New Quiz Added' :
                                                  activity.type === 'user_registered' ? 'New User Registered' : 'New Subject Added'}}
                                            </div>
                                            <div class="text-muted">
                                                {{activity.type === 'quiz_added' ? activity.name + ' in ' + activity.subject :
                                                  activity.type === 'user_registered' ? activity.name : activity.name}}
                                            </div>
                                            <small class="text-muted">{{activity.date}}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};