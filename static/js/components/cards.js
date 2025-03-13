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
    },
    id: {
      type: Number,
      required: true
    },
  },
  methods: {
    getDifficultyBadgeClass(difficulty) {
      return {
        'bg-success': difficulty === 'Easy',
        'bg-warning': difficulty === 'Medium',
        'bg-danger': difficulty === 'Hard'
      };
    }
  },
  template: `
    <div class="card h-100 shadow-sm">
      <div class="card-body">
        <h5 class="card-title text-primary">{{ quiz.name }}</h5>
        <h6 class="card-subtitle mb-2 text-muted">
          <i class="bi bi-bookmark-fill"></i> {{ quiz.subject }} - {{ quiz.chapter }}
        </h6>
        <p class="card-text">{{ quiz.description }}</p>
        <div class="mb-3">
          <span class="badge" :class="getDifficultyBadgeClass(quiz.difficulty)">
            <i class="bi bi-star-fill me-1"></i> {{ quiz.difficulty }}
          </span>
          <span class="badge bg-info ms-2">
            <i class="bi bi-question-circle-fill me-1"></i> {{ quiz.questions }} Questions
          </span>
          <span class="badge bg-secondary ms-2">
            <i class="bi bi-clock-fill me-1"></i> {{ quiz.duration }}
          </span>
        </div>
        <button class="btn btn-primary w-100" @click="$router.push('/quiz/' + id)">
          <i class="bi bi-play-fill"></i> Start Quiz
        </button>
      </div>
    </div>
  `
};