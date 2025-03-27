export const ScorePage = {
    data() {
      return {
        loading: false,
        error: null,
        sortField: 'date',
        sortOrder: 'desc',
        searchQuery: '',
        selectedSubject: 'All',
        quizHistory: [],
        exportStatus: null,
        exportTaskId: null,
        exportPollingInterval: null
      };
    },
    computed: {
      subjects() {
        return ['All', ...new Set(this.quizHistory.map(quiz => quiz.subject))];
      },
      filteredAndSortedHistory() {
        return this.quizHistory
          .filter(quiz => {
            const matchesSearch = quiz.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                                quiz.subject.toLowerCase().includes(this.searchQuery.toLowerCase());
            const matchesSubject = this.selectedSubject === 'All' || quiz.subject === this.selectedSubject;
            return matchesSearch && matchesSubject;
          })
          .sort((a, b) => {
            let aValue = a[this.sortField];
            let bValue = b[this.sortField];
            
            if (this.sortField === 'date') {
              aValue = new Date(aValue);
              bValue = new Date(bValue);
            }
            
            if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
      },
      averageScore() {
        if (!this.quizHistory.length) return 0;
        const total = this.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0);
        return Math.round(total / this.quizHistory.length);
      },
      passRate() {
        if (!this.quizHistory.length) return 0;
        const passed = this.quizHistory.filter(quiz => quiz.status === 'Passed').length;
        return Math.round((passed / this.quizHistory.length) * 100);
      }
    },
    methods: {
      async loadHistory() {
        try {
          this.loading = true;
          const response = await this.$store.dispatch('fetchQuizHistory');
          this.quizHistory = response.history;
        } catch (error) {
          this.error = error.message;
        } finally {
          this.loading = false;
        }
      },
      getStatusClass(status) {
        return {
          'bg-success': status === 'Passed',
          'bg-danger': status === 'Failed'
        };
      },
      setSorting(field) {
        if (this.sortField === field) {
          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortField = field;
          this.sortOrder = 'asc';
        }
      },
      getSortIcon(field) {
        if (this.sortField !== field) return 'bi-arrow-down-up';
        return this.sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
      },
      formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
      },
      async exportToCSV() {
        try {
          this.exportStatus = 'starting';
          const response = await fetch('/export_attempts_csv', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          });
          
          if (!response.ok) throw new Error('Failed to start export');
          
          const data = await response.json();
          this.exportTaskId = data.task_id;
          this.exportStatus = 'processing';
          
          // Start polling for completion
          this.pollExportStatus();
          
        } catch (error) {
          this.error = error.message;
          this.exportStatus = null;
        }
      },
      
      async pollExportStatus() {
        if (this.exportPollingInterval) {
          clearInterval(this.exportPollingInterval);
        }
        
        this.exportPollingInterval = setInterval(async () => {
          try {
            const response = await fetch(`/get_export/${this.exportTaskId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              }
            });
            
            const contentType = response.headers.get('content-type');
            
            if (response.status === 400) {
              // Handle error response
              const data = await response.json();
              throw new Error(data.msg || 'Export failed');
            }
            
            if (!response.ok) {
              throw new Error('Failed to check export status');
            }
            
            // If we received CSV data
            if (contentType && contentType.includes('text/csv')) {
              // Clear polling
              clearInterval(this.exportPollingInterval);
              this.exportPollingInterval = null;
              
              // Download the CSV file
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'quiz_history.csv';
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              
              // Clear status after successful download
              this.exportStatus = null;
              this.exportTaskId = null;
              return;
            }
            
            // If we received JSON status update
            const data = await response.json();
            if (!data.ready && data.status === 'processing') {
              // Still processing, continue polling
              return;
            }
            
            // If there was an error
            if (data.status === 'error') {
              throw new Error(data.msg || 'Export failed');
            }
            
          } catch (error) {
            clearInterval(this.exportPollingInterval);
            this.exportPollingInterval = null;
            this.error = error.message;
            this.exportStatus = null;
            this.exportTaskId = null;
          }
        }, 1000); // Poll every second
      }
    },
    beforeDestroy() {
      if (this.exportPollingInterval) {
        clearInterval(this.exportPollingInterval);
      }
    },
    created() {
      this.loadHistory();
    },
    template: `
      <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0">Quiz Score History</h2>
          <button class="btn btn-success" 
                  @click="exportToCSV" 
                  :disabled="exportStatus !== null">
            <span v-if="exportStatus === 'processing'" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="bi bi-download me-2"></i>
            {{ exportStatus === 'processing' ? 'Generating CSV...' : 'Export to CSV' }}
          </button>
        </div>
        
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

        <!-- Loading and Error States -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>

        <!-- Filters -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control" v-model="searchQuery" 
                         placeholder="Search by quiz name or subject...">
                </div>
              </div>
              <div class="col-md-6">
                <select class="form-select" v-model="selectedSubject">
                  <option v-for="subject in subjects" :key="subject" :value="subject">
                    {{ subject }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Quiz History Table -->
        <div class="card">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th @click="setSorting('name')" style="cursor: pointer">
                    Quiz Name <i :class="'bi ' + getSortIcon('name')"></i>
                  </th>
                  <th @click="setSorting('subject')" style="cursor: pointer">
                    Subject <i :class="'bi ' + getSortIcon('subject')"></i>
                  </th>
                  <th>Questions</th>
                  <th @click="setSorting('score')" style="cursor: pointer">
                    Score <i :class="'bi ' + getSortIcon('score')"></i>
                  </th>
                  <th>Time Spent</th>
                  <th @click="setSorting('date')" style="cursor: pointer">
                    Date <i :class="'bi ' + getSortIcon('date')"></i>
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="quiz in filteredAndSortedHistory" :key="quiz.id">
                  <td>{{ quiz.name }}</td>
                  <td>{{ quiz.subject }}</td>
                  <td>{{ quiz.questions }}</td>
                  <td>{{ quiz.score }}%</td>
                  <td>{{ formatTime(quiz.timespent) }}</td>
                  <td>{{ new Date(quiz.date).toLocaleDateString() }}</td>
                  <td>
                    <span class="badge" :class="getStatusClass(quiz.status)">
                      {{ quiz.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `
};