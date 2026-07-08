// ==================== ANALYTICS MODULE ====================

const AnalyticsModule = (() => {

  const render = (container) => {
    const orders = window.ERPState.orders || [];
    const products = window.ERPState.products || [];
    
    // Calculate metrics
    const totalOrderCount = orders.length;
    const completedOrders = orders.filter(o => o.status === "Dispatched");
    
    const grossTotalSales = orders
      .filter(o => o.status !== "Cancelled")
      .reduce((sum, o) => sum + o.grandTotal, 0);

    const averageOrderValue = totalOrderCount > 0 ? (grossTotalSales / totalOrderCount) : 0;
    
    // Conversion funnel data
    // Pending -> Approved -> Processing -> Shipped
    const pending = orders.filter(o => o.status === "Pending").length;
    const approved = orders.filter(o => ["Approved", "Processing", "Quality Check", "Ready to Ship", "Dispatched"].includes(o.status)).length;
    const processing = orders.filter(o => ["Processing", "Quality Check", "Ready to Ship", "Dispatched"].includes(o.status)).length;
    const shipped = orders.filter(o => o.status === "Dispatched").length;

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Operational Analytics & Business Intelligence</h2>
          <p class="text-muted">Analyze factory hardware efficiency quotients, monitor sales conversion pipelines, and review average order indices.</p>
        </div>
      </div>

      <!-- ANALYTICS HIGHLIGHTS -->
      <div class="bento-grid mb-6">
        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Average Order Value</span>
            <div class="card-stat-icon primary"><i data-lucide="trending-up"></i></div>
          </div>
          <div class="card-stat-value">${ERPUtils.formatCurrency(averageOrderValue)}</div>
          <div class="card-stat-footer">
            <span class="trend-label">Calculated across gross sales orders</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Conversion Flow Rate</span>
            <div class="card-stat-icon success"><i data-lucide="percent"></i></div>
          </div>
          <div class="card-stat-value">
            ${totalOrderCount > 0 ? Math.round((shipped / totalOrderCount) * 100) : 0}%
          </div>
          <div class="card-stat-footer">
            <span class="trend-label">Orders successfully shipped</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Gross Revenue Target</span>
            <div class="card-stat-icon warning"><i data-lucide="dollar-sign"></i></div>
          </div>
          <div class="card-stat-value">${ERPUtils.formatCurrency(grossTotalSales)}</div>
          <div class="card-stat-footer">
            <span class="trend-label">Sales values excluding cancelled</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Factory OEE Quotient</span>
            <div class="card-stat-icon success"><i data-lucide="shield-check"></i></div>
          </div>
          <div class="card-stat-value">86.2%</div>
          <div class="card-stat-footer">
            <span class="trend-label">Operational equipment effectiveness</span>
          </div>
        </div>
      </div>

      <!-- ANALYTICS CHARTS GRID -->
      <div class="grid-cols-3 mb-6">
        <!-- 1. QUARTERLY COMPARISON -->
        <div class="card">
          <h3 class="mb-6">Quarterly Revenue Growth</h3>
          <div style="position: relative; height: 260px; width: 100%;">
            <canvas id="chart-quarterly-rev"></canvas>
          </div>
        </div>

        <!-- 2. SALES FUNNEL -->
        <div class="card">
          <h3 class="mb-6">Pipeline Funnel Distribution</h3>
          <div style="position: relative; height: 260px; width: 100%;">
            <canvas id="chart-sales-funnel"></canvas>
          </div>
        </div>

        <!-- 3. FACTORY EFFICIENCY -->
        <div class="card">
          <h3 class="mb-6">Weekly Factory Efficiency</h3>
          <div style="position: relative; height: 260px; width: 100%;">
            <canvas id="chart-factory-oee"></canvas>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    renderAnalyticsCharts(pending, approved, processing, shipped);
  };

  const renderAnalyticsCharts = (pending, approved, processing, shipped) => {
    if (!window.activeChartInstances) window.activeChartInstances = {};
    if (window.activeChartInstances["qtrRev"]) window.activeChartInstances["qtrRev"].destroy();
    if (window.activeChartInstances["funnel"]) window.activeChartInstances["funnel"].destroy();
    if (window.activeChartInstances["oee"]) window.activeChartInstances["oee"].destroy();

    // Chart 1: Quarterly Sales Revenue Bar
    const ctxQtr = document.getElementById("chart-quarterly-rev").getContext("2d");
    window.activeChartInstances["qtrRev"] = new Chart(ctxQtr, {
      type: 'bar',
      data: {
        labels: ["Q1 2026", "Q2 2026", "Q3 2026"],
        datasets: [{
          label: 'Revenue ($)',
          data: [180000, 310000, 145000],
          backgroundColor: ['#6B7280', '#3B82F6', '#22C55E'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { family: 'Inter', size: 9 } } },
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 9 } } }
        }
      }
    });

    // Chart 2: Pipeline Funnel Horizontal Bar
    const ctxFunnel = document.getElementById("chart-sales-funnel").getContext("2d");
    window.activeChartInstances["funnel"] = new Chart(ctxFunnel, {
      type: 'bar',
      data: {
        labels: ["Created / Pending", "Approved / Confirmed", "Active Assembly", "Dispatched Hub"],
        datasets: [{
          data: [pending + approved, approved, processing, shipped],
          backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E'],
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { family: 'Inter', size: 9 } } },
          y: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 9 } } }
        }
      }
    });

    // Chart 3: Weekly OEE Line
    const ctxOee = document.getElementById("chart-factory-oee").getContext("2d");
    window.activeChartInstances["oee"] = new Chart(ctxOee, {
      type: 'line',
      data: {
        labels: ["Wk 23", "Wk 24", "Wk 25", "Wk 26", "Wk 27"],
        datasets: [{
          label: 'Factory Efficiency (%)',
          data: [81, 84, 88, 85, 86.2],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#10B981',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 70, max: 100, grid: { color: 'rgba(0,0,0,0.03)' }, ticks: { font: { family: 'Inter', size: 9 } } },
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 9 } } }
        }
      }
    });
  };

  return {
    render
  };
})();
