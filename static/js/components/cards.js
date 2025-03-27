export const StatsCard = {
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    bgColor: {
      type: String,
      default: 'bg-light'
    },
    textColor: {
      type: String,
      default: 'text-dark'
    }
  },
  template: `
    <div class="card" :class="[bgColor, textColor]">
      <div class="card-body text-center">
        <i :class="'bi ' + icon + ' display-4'"></i>
        <h3 class="card-title mt-2">{{value}}</h3>
        <p class="card-text">{{title}}</p>
      </div>
    </div>
  `
};

export const SubjectCard = {
  props: {
    subject: {
      type: Object,
      required: true
    },
    isSubscribed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-subscription'],
  template: `
    <div class="card h-100 border-primary">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center">
            <i class="bi bi-folder2 text-primary h3 mb-0 me-2"></i>
            <h5 class="card-title mb-0">{{ subject.name }}</h5>
          </div>
          <button 
            class="btn btn-sm"
            :class="isSubscribed ? 'btn-success' : 'btn-outline-primary'"
            @click="$emit('toggle-subscription', subject.id)"
          >
            <i class="bi" :class="isSubscribed ? 'bi-bell-fill' : 'bi-bell'"></i>
            {{ isSubscribed ? 'Subscribed' : 'Subscribe' }}
          </button>
        </div>
        <p class="card-text">{{ subject.description }}</p>
      </div>
    </div>
  `
};

export const QuizCard = {
  props: {
    quiz: {
      type: Object,
      required: true
    }
  },
  computed: {
    isUpcoming() {
      if (!this.quiz.start_time) return false;
      const now = new Date();
      const start = new Date(this.quiz.start_time);
      return start > now;
    },
    startTimeFormatted() {
      if (!this.quiz.start_time) return '';
      return new Date(this.quiz.start_time).toLocaleString();
    }
  },
  template: `
    <div class="card h-100">
      <div class="card-body">
        <h5 class="card-title">{{ quiz.name }}</h5>
        <p class="card-text">{{ quiz.description }}</p>
        <div class="mb-3">
          <span class="badge" :class="{
            'bg-success': quiz.difficulty.toLowerCase() === 'easy',
            'bg-warning': quiz.difficulty.toLowerCase() === 'medium',
            'bg-danger': quiz.difficulty.toLowerCase() === 'hard'
          }">
            {{ quiz.difficulty }}
          </span>
          <span class="badge bg-secondary ms-2">
            <i class="bi bi-clock-fill me-1"></i> {{ quiz.duration }} minutes
          </span>
          <span class="badge bg-primary ms-2">
            <i class="bi bi-book me-1"></i> {{ quiz.subject }}
          </span>
          <span class="badge bg-info ms-2">
            <i class="bi bi-journal me-1"></i> {{ quiz.chapter }}
          </span>
        </div>
        <div v-if="isUpcoming" class="text-muted small mb-2">
          <i class="bi bi-calendar-event me-1"></i>
          Available from: {{ startTimeFormatted }}
        </div>
        <button 
          class="btn w-100" 
          :class="isUpcoming ? 'btn-secondary' : 'btn-primary'"
          :disabled="isUpcoming"
          @click="$router.push('/quiz/' + quiz.id)"
        >
          <i class="bi" :class="isUpcoming ? 'bi-clock-history' : 'bi-play-fill'"></i>
          {{ isUpcoming ? 'Coming Soon' : 'Start Quiz' }}
        </button>
      </div>
    </div>
  `
};