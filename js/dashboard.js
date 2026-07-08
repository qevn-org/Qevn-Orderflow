// ==================== DASHBOARD MODULE ====================

const DashboardModule = (() => {

  const render = (container) => {
    // 1. CALCULATE LIVE METRICS FROM STATE
    const orders = window.ERPState.orders || [];
    const products = window.ERPState.products || [];
    const machines = window.ERPState.machines || [];
    const invoices = window.ERPState.invoices || [];

    // Filter metrics
    const today = new Date().toDateString();
    
    const todayOrders = orders.filter(o => new Date(o.createdDate).toDateString() === today);
    const pendingOrders = orders.filter(o => o.status === "Pending");
    const runningMachines = machines.filter(m => m.status === "Running");
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
    
    // Revenue calculations (all completed invoices + dispatch orders subtotal)
    const paidInvoicesTotal = invoices
      .filter(i => i.status === "Paid" || i.status === "Partial")
      .reduce((sum, i) => sum + (i.amount - i.outstandingAmount), 0);

    const pendingPaymentTotal = invoices
      .filter(i => i.status === "Unpaid" || i.status === "Overdue" || i.status === "Partial")
      .reduce((sum, i) => sum + i.outstandingAmount, 0);

    const dispatchTodayCount = orders.filter(o => {
      const isDispatched = o.status === "Dispatched";
      const isToday = new Date(o.expectedDelivery).toDateString() === today; // Expected delivery equals today
      return isDispatched && isToday;
    }).length;

    // Render HTML Scaffold
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p class="text-muted">Welcome back! Here's what's happening across your manufacturing suite today.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" id="dash-quick-order-btn">
            <i data-lucide="plus-circle"></i> Create Sales Order
          </button>
        </div>
      </div>

      <!-- BENTO GRID SYSTEM -->
      <div class="bento-grid mb-6">
        
        <!-- Stats Row -->
        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Today's Orders</span>
            <div class="card-stat-icon primary"><i data-lucide="shopping-cart"></i></div>
          </div>
          <div class="card-stat-value">${todayOrders.length}</div>
          <div class="card-stat-footer">
            <span class="trend-badge up"><i data-lucide="trending-up"></i> +12%</span>
            <span class="trend-label">vs yesterday</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Pending Approvals</span>
            <div class="card-stat-icon warning"><i data-lucide="clock"></i></div>
          </div>
          <div class="card-stat-value">${pendingOrders.length}</div>
          <div class="card-stat-footer">
            <span class="trend-badge down"><i data-lucide="trending-down"></i> -4%</span>
            <span class="trend-label">since morning</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Total Revenue Collected</span>
            <div class="card-stat-icon success"><i data-lucide="dollar-sign"></i></div>
          </div>
          <div class="card-stat-value" style="font-size: 1.65rem;">${ERPUtils.formatCurrency(paidInvoicesTotal)}</div>
          <div class="card-stat-footer">
            <span class="trend-badge up"><i data-lucide="trending-up"></i> +8.2%</span>
            <span class="trend-label">this fiscal month</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Production Active</span>
            <div class="card-stat-icon primary"><i data-lucide="cpu"></i></div>
          </div>
          <div class="card-stat-value">${runningMachines.length} / ${machines.length}</div>
          <div class="card-stat-footer">
            <span class="trend-label">Running CNC & SMT lines</span>
          </div>
        </div>

        <!-- Bento Span Columns -->
        
        <!-- Column 1: Financial Area Trend Chart -->
        <div class="card span-2 row-span-2">
          <h3 class="mb-6">Monthly Revenue & Sales Performance</h3>
          <div style="position: relative; height: 280px; width: 100%;">
            <canvas id="chart-revenue-trend"></canvas>
          </div>
        </div>

        <!-- Column 2: Calendar & Weather Widget -->
        <div class="card">
          <h3 style="font-size: 0.85rem; font-weight:600; color:var(--text-secondary); text-transform:uppercase; margin-bottom:12px;">Operational Briefing</h3>
          <div class="widget-weather-calendar">
            <div class="widget-calendar-side">
              <span class="cal-month">${new Date().toLocaleDateString("en-US", { month: "short" })}</span>
              <span class="cal-day">${new Date().getDate()}</span>
              <span class="cal-weekday">${new Date().toLocaleDateString("en-US", { weekday: "long" })}</span>
            </div>
            <div class="widget-weather-side">
              <div class="weather-header"><i data-lucide="cloud-sun"></i> San Jose</div>
              <div class="weather-temp">72°F</div>
              <div class="weather-desc">Partly Cloudy</div>
              <div style="font-size: 0.65rem; color:var(--text-muted); margin-top:4px;">Factory humidity: 45%</div>
            </div>
          </div>
        </div>

        <!-- Column 3: Quick Action Launchpad -->
        <div class="card">
          <h3 style="font-size: 0.85rem; font-weight:600; color:var(--text-secondary); text-transform:uppercase; margin-bottom:12px;">Quick Launchpad</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button class="btn btn-secondary" id="action-go-customers" style="flex-direction: column; padding: 12px; gap: 6px;">
              <i data-lucide="users" style="width: 20px; height: 20px;"></i>
              <span style="font-size: 0.75rem;">Customers</span>
            </button>
            <button class="btn btn-secondary" id="action-go-manufacturing" style="flex-direction: column; padding: 12px; gap: 6px;">
              <i data-lucide="cpu" style="width: 20px; height: 20px;"></i>
              <span style="font-size: 0.75rem;">Production</span>
            </button>
            <button class="btn btn-secondary" id="action-go-dispatch" style="flex-direction: column; padding: 12px; gap: 6px;">
              <i data-lucide="truck" style="width: 20px; height: 20px;"></i>
              <span style="font-size: 0.75rem;">Dispatch</span>
            </button>
            <button class="btn btn-secondary" id="action-go-invoices" style="flex-direction: column; padding: 12px; gap: 6px;">
              <i data-lucide="receipt" style="width: 20px; height: 20px;"></i>
              <span style="font-size: 0.75rem;">Invoices</span>
            </button>
          </div>
        </div>

        <!-- Bento Span Columns Lower Row -->
        
        <!-- Category Sales Donut -->
        <div class="card">
          <h3 style="font-size: 0.85rem; font-weight:600; color:var(--text-secondary); text-transform:uppercase; margin-bottom:16px;">Product Category Mix</h3>
          <div style="position: relative; height: 180px; width: 100%;">
            <canvas id="chart-product-mix"></canvas>
          </div>
        </div>

        <!-- Inventory Alerts Box -->
        <div class="card">
          <div class="d-flex justify-between align-center mb-6">
            <h3 style="font-size: 0.85rem; font-weight:600; color:var(--text-secondary); text-transform:uppercase;">Inventory Health</h3>
            <span class="badge ${lowStockCount > 0 ? 'badge-danger' : 'badge-success'}">${lowStockCount} Critical</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px; max-height:170px; overflow-y:auto;">
            ${products
              .filter(p => p.stock <= p.minStock)
              .slice(0, 4)
              .map(p => `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; padding:6px 0; border-bottom:1px solid var(--border-color);">
                  <div>
                    <div style="font-weight:600;">${p.name}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted);">SKU: ${p.sku}</div>
                  </div>
                  <div style="text-align:right;">
                    <div class="badge badge-danger">${p.stock} units</div>
                    <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">Min: ${p.minStock}</div>
                  </div>
                </div>
              `).join("") || `
                <div class="text-center text-muted" style="padding: 20px 0;">
                  <i data-lucide="check-circle" style="width:28px; height:28px; color:var(--success); margin-bottom:4px;"></i>
                  <p style="font-size:0.8rem;">All stocks above limits</p>
                </div>
              `}
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="card">
          <h3 style="font-size: 0.85rem; font-weight:600; color:var(--text-secondary); text-transform:uppercase; margin-bottom:16px;">System Activity Log</h3>
          <div class="timeline-feed" style="max-height: 220px; overflow-y: auto; padding-right: 4px;">
            <div class="timeline-item active">
              <div class="timeline-point"></div>
              <div class="timeline-meta">Just now</div>
              <div class="timeline-content">Sales Dashboard loaded by ${ERPApp.getActiveRole()}</div>
            </div>
            <div class="timeline-item success">
              <div class="timeline-point"></div>
              <div class="timeline-meta">3 hrs ago</div>
              <div class="timeline-content">Dispatch Complete for ORD-2026-0182</div>
            </div>
            <div class="timeline-item">
              <div class="timeline-point"></div>
              <div class="timeline-meta">5 hrs ago</div>
              <div class="timeline-content">QC inspection passed for Motor Unit #45</div>
            </div>
            <div class="timeline-item success">
              <div class="timeline-point"></div>
              <div class="timeline-meta">1 day ago</div>
              <div class="timeline-content">Invoice INV-2026-0095 generated ($4,520)</div>
            </div>
          </div>
        </div>

        <!-- Recent Orders Table Spanning Full Grid Width -->
        <div class="card span-4">
          <div class="d-flex justify-between align-center mb-6">
            <h3>Recent Sales Orders</h3>
            <button class="btn btn-secondary btn-text" id="dash-view-all-orders-btn">View All Orders</button>
          </div>
          
          <div class="table-container" style="margin-bottom:0; box-shadow:none; border:none; border-radius:0;">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Order Date</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${orders.slice(0, 5).map(o => {
                  let badgeType = "badge-neutral";
                  if (o.status === "Approved") badgeType = "badge-primary";
                  else if (o.status === "Processing" || o.status === "Quality Check") badgeType = "badge-warning";
                  else if (o.status === "Ready to Ship" || o.status === "Dispatched") badgeType = "badge-success";
                  else if (o.status === "Cancelled") badgeType = "badge-danger";

                  return `
                    <tr>
                      <td style="font-weight:600; color:var(--primary);">${o.id}</td>
                      <td>${o.customerName}</td>
                      <td>${ERPUtils.formatDate(o.createdDate)}</td>
                      <td>${o.products.length} products</td>
                      <td style="font-weight:600;">${ERPUtils.formatCurrency(o.grandTotal)}</td>
                      <td><span class="badge ${badgeType}">${o.status}</span></td>
                      <td>
                        <button class="btn btn-secondary btn-sm select-dash-order" data-order-id="${o.id}">
                          <i data-lucide="eye" style="width:14px; height:14px;"></i> View
                        </button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    lucide.createIcons();

    // 2. ATTACH EVENTS & NAVIGATION
    document.getElementById("dash-quick-order-btn").addEventListener("click", () => {
      ERPApp.navigateTo("orders");
      setTimeout(() => {
        const addBtn = document.getElementById("add-order-btn");
        if (addBtn) addBtn.click();
      }, 300);
    });

    document.getElementById("dash-view-all-orders-btn").addEventListener("click", () => {
      ERPApp.navigateTo("orders");
    });

    // Row clicks view details
    container.querySelectorAll(".select-dash-order").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const ordId = btn.getAttribute("data-order-id");
        OrdersModule.showOrderDetails(ordId);
      });
    });

    // Launchpad clicks
    document.getElementById("action-go-customers").addEventListener("click", () => ERPApp.navigateTo("customers"));
    document.getElementById("action-go-manufacturing").addEventListener("click", () => ERPApp.navigateTo("manufacturing"));
    document.getElementById("action-go-dispatch").addEventListener("click", () => ERPApp.navigateTo("dispatch"));
    document.getElementById("action-go-invoices").addEventListener("click", () => ERPApp.navigateTo("billing"));

    // 3. RENDER CHARTS
    renderDashboardCharts(orders);
  };

  const renderDashboardCharts = (orders) => {
    // Make sure to clean old instances
    if (!window.activeChartInstances) {
      window.activeChartInstances = {};
    }

    if (window.activeChartInstances["dashTrend"]) window.activeChartInstances["dashTrend"].destroy();
    if (window.activeChartInstances["dashMix"]) window.activeChartInstances["dashMix"].destroy();

    // Chart 1: Revenue Trend Line Area
    const ctxTrend = document.getElementById("chart-revenue-trend").getContext("2d");
    
    // Group orders by month to compute data
    const monthlySales = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    orders.forEach(o => {
      const d = new Date(o.createdDate);
      const mLabel = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      if (!monthlySales[mLabel]) monthlySales[mLabel] = 0;
      if (o.status !== "Cancelled") {
        monthlySales[mLabel] += o.grandTotal;
      }
    });

    const labels = Object.keys(monthlySales).reverse().slice(-5); // Last 5 months active
    const data = labels.map(l => monthlySales[l]);

    window.activeChartInstances["dashTrend"] = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales Revenue',
          data: data,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3B82F6',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            grid: { color: 'rgba(0,0,0,0.03)' },
            ticks: {
              font: { family: 'Inter', size: 10 },
              callback: (value) => '$' + (value / 1000) + 'k'
            }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 10 } }
          }
        }
      }
    });

    // Chart 2: Product mix category donut
    const ctxMix = document.getElementById("chart-product-mix").getContext("2d");
    
    const catMix = {};
    orders.forEach(o => {
      o.products.forEach(p => {
        const prodDetails = window.ERPState.products.find(prod => prod.id === p.productId);
        const cat = prodDetails ? prodDetails.category : "Motors";
        if (!catMix[cat]) catMix[cat] = 0;
        catMix[cat] += p.quantity;
      });
    });

    const mixLabels = Object.keys(catMix);
    const mixData = Object.values(catMix);

    window.activeChartInstances["dashMix"] = new Chart(ctxMix, {
      type: 'doughnut',
      data: {
        labels: mixLabels,
        datasets: [{
          data: mixData,
          backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#9CA3AF'],
          borderWidth: 2,
          borderColor: document.documentElement.getAttribute("data-theme") === "dark" ? "#151D30" : "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 10,
              font: { family: 'Inter', size: 9 },
              color: document.documentElement.getAttribute("data-theme") === "dark" ? "#9CA3AF" : "#6B7280"
            }
          }
        },
        cutout: '70%'
      }
    });
  };

  return {
    render
  };
})();
