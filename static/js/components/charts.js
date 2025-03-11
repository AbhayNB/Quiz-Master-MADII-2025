export const BarChart = {
    props: ['data'],
    template: `
      <div>
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
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  };
  
export const PieChart = {
    props: ['data'],
    template: `
      <div>
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
          type: 'pie',
          data: this.data
        });
      }
    }
  };