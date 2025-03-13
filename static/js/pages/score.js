export const ScorePage = {
    data() {
      return {
        quizHistory: [
          { id: 1, name: 'Algebra Basics', subject: 'Math', questions: 20, score: 92, date: '2023-06-15', status: 'Passed', timeSpent: '25:30' },
          { id: 2, name: 'Chemical Reactions', subject: 'Science', questions: 15, score: 78, date: '2023-06-14', status: 'Passed', timeSpent: '18:45' },
          { id: 3, name: 'World War II', subject: 'History', questions: 25, score: 65, date: '2023-06-13', status: 'Failed', timeSpent: '28:15' },
          { id: 4, name: 'Programming Basics', subject: 'Computer Science', questions: 30, score: 88, date: '2023-06-12', status: 'Passed', timeSpent: '27:50' },
          { id: 5, name: 'Grammar Rules', subject: 'English', questions: 20, score: 82, date: '2023-06-11', status: 'Passed', timeSpent: '22:10' }
        ],
        filterSubject: 'All',
        filterStatus: 'All',
        searchQuery: '',
        sortBy: 'date',
        sortOrder: 'desc'
      };
    },
    computed: {
      subjects() {
        const subjects = new Set(this.quizHistory.map(quiz => quiz.subject));
        return ['All', ...Array.from(subjects)];
      },
      filteredAndSortedHistory() {
        return this.quizHistory
          .filter(quiz => {
            const matchesSubject = this.filterSubject === 'All' || quiz.subject === this.filterSubject;
            const matchesStatus = this.filterStatus === 'All' || quiz.status === this.filterStatus;
            const matchesSearch = quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                quiz.subject.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesSubject && matchesStatus && matchesSearch;
          })
          .sort((a, b) => {
            let comparison = 0;
            switch(this.sortBy) {
              case 'date':
                comparison = new Date(b.date) - new Date(a.date);
                break;
              case 'score':
                comparison = b.score - a.score;
                break;
              case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            }
            return this.sortOrder === 'desc' ? comparison : -comparison;
          });
      },
      averageScore() {
        const scores = this.filteredAndSortedHistory.map(quiz => quiz.score);
        return scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
      },
      passRate() {
        const passed = this.filteredAndSortedHistory.filter(quiz => quiz.status === 'Passed').length;
        return this.filteredAndSortedHistory.length 
          ? Math.round((passed / this.filteredAndSortedHistory.length) * 100) 
          : 0;
      }
    },
    methods: {
      getStatusClass(status) {
        return {
          'badge bg-success': status === 'Passed',
          'badge bg-danger': status === 'Failed'
        };
      },
      setSorting(field) {
        if (this.sortBy === field) {
          this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
        } else {
          this.sortBy = field;
          this.sortOrder = 'desc';
        }
      },
      getSortIcon(field) {
        if (this.sortBy !== field) return 'bi bi-arrow-down-up';
        return this.sortOrder === 'desc' ? 'bi bi-arrow-down' : 'bi bi-arrow-up';
      }
    },
    template: `
      <div class="container mt-4">
        <h2 class="text-center mb-4">Quiz Score History</h2>
        
        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <h5 class="card-title">Average Score</h5>
                <h2>{{averageScore}}%</h2>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card bg-success text-white">
              <div class="card-body">
                <h5 class="card-title">Pass Rate</h5>
                <h2>{{passRate}}%</h2>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Filters -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-3">
                <select class="form-select" v-model="filterSubject">
                  <option v-for="subject in subjects" :key="subject">{{subject}}</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="filterStatus">
                  <option>All</option>
                  <option>Passed</option>
                  <option>Failed</option>
                </select>
              </div>
              <div class="col-md-6">
                <input type="text" class="form-control" v-model="searchQuery" 
                       placeholder="Search by quiz name or subject...">
              </div>
            </div>
          </div>
        </div>
  
        <!-- Score Table -->
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th @click="setSorting('name')" style="cursor: pointer">
                      Quiz Name <i :class="getSortIcon('name')"></i>
                    </th>
                    <th @click="setSorting('subject')" style="cursor: pointer">
                      Subject <i :class="getSortIcon('subject')"></i>
                    </th>
                    <th>Questions</th>
                    <th @click="setSorting('score')" style="cursor: pointer">
                      Score <i :class="getSortIcon('score')"></i>
                    </th>
                    <th>Time Spent</th>
                    <th @click="setSorting('date')" style="cursor: pointer">
                      Date <i :class="getSortIcon('date')"></i>
                    </th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quiz in filteredAndSortedHistory" :key="quiz.id">
                    <td>{{quiz.name}}</td>
                    <td>{{quiz.subject}}</td>
                    <td>{{quiz.questions}}</td>
                    <td>{{quiz.score}}%</td>
                    <td>{{quiz.timeSpent}}</td>
                    <td>{{quiz.date}}</td>
                    <td>
                      <span :class="getStatusClass(quiz.status)">
                        {{quiz.status}}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `
  };