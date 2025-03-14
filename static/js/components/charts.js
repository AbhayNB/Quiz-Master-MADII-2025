export const BarChart = {
    props: ['data'],
    template: `
      <div class="chart-container" style="position: relative; height:300px; width:100%">
        <canvas ref="barChart"></canvas>
      </div>
    `,
    mounted() {
      this.renderChart();
    },
    methods: {
      renderChart() {
        const ctx = this.$refs.barChart.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: this.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1000,
              easing: 'easeInOutQuart'
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  callback: function(value) {
                    return value + '%';
                  }
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return context.dataset.label + ': ' + context.parsed.y + '%';
                  }
                }
              }
            }
          }
        });
      }
    },
    watch: {
      data: {
        deep: true,
        handler() {
          this.renderChart();
        }
      }
    }
  };
  
export const PieChart = {
    props: ['data'],
    template: `
      <div class="chart-container" style="position: relative; height:300px; width:100%">
        <canvas ref="pieChart"></canvas>
      </div>
    `,
    mounted() {
      this.renderChart();
    },
    methods: {
      renderChart() {
        const ctx = this.$refs.pieChart.getContext('2d');
        new Chart(ctx, {
          type: 'doughnut',
          data: this.data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              animateRotate: true,
              animateScale: true
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value * 100) / total) + '%';
                    return label + ': ' + percentage;
                  }
                }
              }
            },
            cutout: '60%'
          }
        });
      }
    },
    watch: {
      data: {
        deep: true,
        handler() {
          this.renderChart();
        }
      }
    }
  };