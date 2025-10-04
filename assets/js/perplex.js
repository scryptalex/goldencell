// Perplexity-derived interactions: charts and minor visuals
(function(){
  function initCharts(){
    var gm = document.getElementById('globalMarketChart');
    var cm = document.getElementById('cancerMarketChart');
    if (gm && window.Chart){
      new Chart(gm.getContext('2d'), {
        type: 'bar',
        data: {
          labels: ['NA', 'EU', 'APAC', 'LATAM'],
          datasets: [{
            label: 'Biopharma Market (B$)',
            data: [180, 160, 220, 40],
            backgroundColor: ['#FFD700', '#FFA500', '#B8860B', '#E6B800'],
            borderColor: ['#B8860B', '#DAA520', '#8B6C0E', '#B8860B'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleColor: '#FFD700',
              bodyColor: '#fff'
            }
          },
          scales: {
            y: { beginAtZero: true, ticks: { color: '#5D4E37' } },
            x: { ticks: { color: '#5D4E37' } }
          }
        }
      });
    }
    if (cm && window.Chart){
      new Chart(cm.getContext('2d'), {
        type: 'line',
        data: {
          labels: ['2021','2022','2023','2024','2025','2026'],
          datasets: [{
            label: 'Oncology Market Growth',
            data: [100,110,123,139,158,180],
            borderColor: '#DAA520',
            backgroundColor: 'rgba(255, 215, 0, 0.25)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleColor: '#FFD700',
              bodyColor: '#fff'
            }
          },
          scales: {
            y: { beginAtZero: false, ticks: { color: '#5D4E37' } },
            x: { ticks: { color: '#5D4E37' } }
          }
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initCharts);
})();

