const totalProducts = document.getElementById('total-products');
const instanceId = document.getElementById('instance-id');
const cacheStatus = document.getElementById('cache-status');
const loadStatsBtn = document.getElementById('load-stats-btn');

async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    const data = await response.json();

    totalProducts.textContent = data.totalProducts;
    instanceId.textContent = data.instanceId;
    cacheStatus.textContent = response.headers.get('X-Upstream-Server') || 'brak';
  } catch (error) {
    totalProducts.textContent = 'błąd';
    instanceId.textContent = 'błąd';
    cacheStatus.textContent = 'błąd';
  }
}

loadStatsBtn.addEventListener('click', loadStats);
loadStats();