// ==================== INVENTORY STATUS MODULE ====================

const InventoryModule = (() => {
  let lowStockOnly = false;

  const render = (container) => {
    const products = window.ERPState.products || [];
    const warehouses = window.ERPState.warehouses || [];

    // Calculate metrics
    const lowStockList = products.filter(p => p.stock <= p.minStock);
    const totalPhysicalItems = products.reduce((sum, p) => sum + p.stock, 0);
    const totalReservedItems = products.reduce((sum, p) => sum + p.reservedStock, 0);
    
    // Filtered lists
    const displayList = lowStockOnly ? lowStockList : products;

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Inventory Logistics & Reserves</h2>
          <p class="text-muted">Monitor available vs committed stock ratios, verify safety reserves, and check warehouse depot capacities.</p>
        </div>
      </div>

      <!-- INVENTORY METRICS CARDS -->
      <div class="bento-grid mb-6">
        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Total Physical Stock</span>
            <div class="card-stat-icon primary"><i data-lucide="package"></i></div>
          </div>
          <div class="card-stat-value">${totalPhysicalItems.toLocaleString()} units</div>
          <div class="card-stat-footer">
            <span class="trend-label">Allocated across 5 warehouse racks</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Reserved / Committed</span>
            <div class="card-stat-icon warning"><i data-lucide="lock"></i></div>
          </div>
          <div class="card-stat-value">${totalReservedItems.toLocaleString()} units</div>
          <div class="card-stat-footer">
            <span class="trend-label">Linked to active approved sales orders</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Available To Sell</span>
            <div class="card-stat-icon success"><i data-lucide="check-square"></i></div>
          </div>
          <div class="card-stat-value">${(totalPhysicalItems - totalReservedItems).toLocaleString()} units</div>
          <div class="card-stat-footer">
            <span class="trend-label">Free stock ready for invoicing</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Critical Low Stocks</span>
            <div class="card-stat-icon danger"><i data-lucide="alert-octagon"></i></div>
          </div>
          <div class="card-stat-value">${lowStockList.length} Items</div>
          <div class="card-stat-footer">
            <span class="trend-label" style="color:var(--danger); font-weight:600;">Below safety threshold</span>
          </div>
        </div>
      </div>

      <!-- WAREHOUSE UTILIZATION & STOCK DETAILS -->
      <div class="grid-cols-3 mb-6">
        
        <!-- Warehouse capacity chart -->
        <div class="card" style="padding: 20px;">
          <h3 class="mb-6">Depot Space Utilization</h3>
          <div style="position: relative; height: 260px; width: 100%;">
            <canvas id="chart-wh-capacity"></canvas>
          </div>
        </div>

        <!-- Stock items table -->
        <div class="card span-2" style="padding: 20px;">
          <div class="d-flex justify-between align-center mb-6">
            <h3>Stock Registry</h3>
            <label class="checkbox-container" style="font-size:0.85rem;">
              <input type="checkbox" id="chk-low-stock" ${lowStockOnly ? "checked" : ""}>
              <span class="checkmark"></span>
              Show Low Stock Alerts Only
            </label>
          </div>

          <div class="table-container" style="box-shadow:none; border:none; margin-bottom:0;">
            <table class="custom-table" style="font-size:0.82rem;">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>In Hand</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Safety Min</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody style="max-height:280px; overflow-y:auto;">
                ${displayList.slice(0, 8).map(p => {
                  const avVal = p.stock - p.reservedStock;
                  const isLow = p.stock <= p.minStock;

                  return `
                    <tr>
                      <td style="font-weight:600;">${p.name}</td>
                      <td><code>${p.sku}</code></td>
                      <td>${p.stock}</td>
                      <td style="color:var(--warning); font-weight:600;">${p.reservedStock}</td>
                      <td style="color:var(--success); font-weight:700;">${avVal}</td>
                      <td>${p.minStock}</td>
                      <td>
                        <span class="badge ${isLow ? 'badge-danger' : 'badge-success'}" style="font-size:0.65rem; padding:1px 6px;">
                          ${isLow ? 'Low Stock' : 'Good'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join("") || `
                  <tr>
                    <td colspan="7" class="text-center text-muted" style="padding: 40px;">No stocks match selection.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    lucide.createIcons();
    attachEvents(container);
    renderInventoryCharts(warehouses);
  };

  const attachEvents = (container) => {
    document.getElementById("chk-low-stock").addEventListener("change", (e) => {
      lowStockOnly = e.target.checked;
      render(container);
    });
  };

  const renderInventoryCharts = (warehouses) => {
    if (!window.activeChartInstances) window.activeChartInstances = {};
    if (window.activeChartInstances["whCapacity"]) window.activeChartInstances["whCapacity"].destroy();

    const ctx = document.getElementById("chart-wh-capacity").getContext("2d");
    
    const labels = warehouses.map(w => w.name.split(" ")[0] + " " + w.name.split(" ")[w.name.split(" ").length - 1]);
    const data = warehouses.map(w => w.utilization);

    window.activeChartInstances["whCapacity"] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Depot Space Occupied (%)',
          data: data,
          backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#9CA3AF'],
          borderRadius: 6,
          borderWidth: 0
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
            max: 100,
            grid: { color: 'rgba(0,0,0,0.03)' },
            ticks: { font: { family: 'Inter', size: 10 } }
          },
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Inter', size: 10 } }
          }
        }
      }
    });
  };

  return {
    render
  };
})();
