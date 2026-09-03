/* SMART USAGE ALERT - Chart.js Visualization Engine (Utilities & Resources Focus) */

const SmartCharts = {
  instances: {},

  // Default Chart Dark Theme Config
  defaultOptions: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: { family: 'Outfit', size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#0f1627',
        titleColor: '#00f2fe',
        bodyColor: '#f8fafc',
        borderColor: 'rgba(0, 242, 254, 0.3)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { family: 'Outfit' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { family: 'Outfit' } }
      }
    }
  },

  // 1. Dashboard Resource Overview Chart (Electricity, Water, LPG, Solar/Battery)
  initDashboardTrend: function(ctxId) {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return;

    if (this.instances[ctxId]) this.instances[ctxId].destroy();

    this.instances[ctxId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: '⚡ Electricity (kWh)',
            data: [18.2, 16.5, 14.8, 17.1, 15.4, 14.2, 13.5],
            borderColor: '#00f2fe',
            backgroundColor: 'rgba(0, 242, 254, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4
          },
          {
            label: '💧 Water (10x Liters)',
            data: [22.0, 21.5, 19.8, 24.1, 20.0, 18.5, 17.2],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            fill: true,
            tension: 0.4,
            borderWidth: 2.5,
            pointRadius: 3
          },
          {
            label: '🔥 LPG Gas (kg Scale x2)',
            data: [18.0, 17.6, 17.2, 16.8, 16.2, 16.0, 16.8],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            fill: false,
            tension: 0.3,
            borderDash: [4, 4],
            borderWidth: 2
          },
          {
            label: '☀️ Solar & Eco Generation (kWh)',
            data: [6.5, 7.2, 8.1, 5.8, 7.9, 8.4, 9.0],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            type: 'bar',
            borderRadius: 6,
            barThickness: 12
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          ...this.defaultOptions.plugins,
          legend: {
            position: 'top',
            labels: {
              color: '#f8fafc',
              font: { family: 'Outfit', size: 12, weight: '600' },
              usePointStyle: true,
              padding: 16
            }
          }
        }
      }
    });
  },

  // 2. Water Room Breakdown (Bar Chart)
  initWaterRoomChart: function(ctxId) {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return;
    if (this.instances[ctxId]) this.instances[ctxId].destroy();

    this.instances[ctxId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Master Bathroom', 'Kitchen & Sink', 'Garden Irrigation', 'Laundry Room'],
        datasets: [{
          label: 'Daily Liters Consumed',
          data: [82, 46, 37, 20],
          backgroundColor: ['#00f2fe', '#3b82f6', '#10b981', '#8b5cf6'],
          borderRadius: 8
        }]
      },
      options: this.defaultOptions
    });
  },

  // 3. Electricity Appliance Breakdown (Doughnut)
  initElectricityChart: function(ctxId) {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return;
    if (this.instances[ctxId]) this.instances[ctxId].destroy();

    this.instances[ctxId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Central HVAC', 'Water Heater Tank', 'Home Theater / Standby', 'Smart Refrigerator', 'EV Charger (Idle)'],
        datasets: [{
          data: [0.95, 0.42, 0.29, 0.18, 0.00],
          backgroundColor: ['#00f2fe', '#8b5cf6', '#ef4444', '#10b981', '#64748b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
        },
        cutout: '65%'
      }
    });
  },

  // 4. LPG Cylinder Weight Forecasting Chart (Line)
  initLPGDepletionChart: function(ctxId) {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return;
    if (this.instances[ctxId]) this.instances[ctxId].destroy();

    const historical = SmartData.lpgMetrics.weightHistory;
    const forecast = [8.0, 7.6, 7.2, 6.8, 6.4, 6.0, 5.6, 5.2, 4.8, 4.4, 4.0, 3.6, 3.2, 2.8, 2.4, 2.0, 1.6, 1.2, 0.8, 0.4, 0.0];

    this.instances[ctxId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({length: 35}, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'Actual Tank Weight (kg)',
            data: [...historical, ...Array(17).fill(null)],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.2
          },
          {
            label: 'Predicted Depletion Forecast',
            data: [...Array(17).fill(null), 8.4, ...forecast],
            borderColor: '#ef4444',
            borderDash: [5, 5],
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: this.defaultOptions
    });
  },

  // 5. Sustainability Radar Chart
  initCarbonRadarChart: function(ctxId) {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return;
    if (this.instances[ctxId]) this.instances[ctxId].destroy();

    this.instances[ctxId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Energy Efficiency', 'Water Conservation', 'LPG Optimization', 'Solar Generation', 'Filter Maintenance'],
        datasets: [
          {
            label: 'Your Smart Household',
            data: [92, 88, 90, 94, 84],
            borderColor: '#00f2fe',
            backgroundColor: 'rgba(0, 242, 254, 0.2)',
            pointBackgroundColor: '#00f2fe'
          },
          {
            label: 'District Average',
            data: [70, 68, 75, 60, 65],
            borderColor: '#64748b',
            backgroundColor: 'rgba(100, 116, 139, 0.1)',
            pointBackgroundColor: '#64748b'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            pointLabels: { color: '#94a3b8', font: { family: 'Outfit' } },
            ticks: { display: false, max: 100 }
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
        }
      }
    });
  },

  // 6. Reports Monthly Comparison Chart (Bar)
  initReportsChart: function(ctxId) {
    const ctx = document.getElementById(ctxId);
    if (!ctx) return;
    if (this.instances[ctxId]) this.instances[ctxId].destroy();

    this.instances[ctxId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Electricity ($)', 'Water ($)', 'LPG Gas ($)', 'Consumables & Filters ($)'],
        datasets: [
          {
            label: 'Previous Month ($304 total)',
            data: [112.00, 48.00, 26.00, 45.00],
            backgroundColor: 'rgba(100, 116, 139, 0.5)',
            borderRadius: 6
          },
          {
            label: 'Current Month ($151.40 total - Saved $152.60)',
            data: [84.50, 32.40, 18.50, 16.00],
            backgroundColor: '#00f260',
            borderRadius: 6
          }
        ]
      },
      options: this.defaultOptions
    });
  }
};
