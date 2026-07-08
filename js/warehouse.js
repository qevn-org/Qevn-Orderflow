// ==================== WAREHOUSE MANAGEMENT MODULE ====================

const WarehouseModule = (() => {

  const render = (container) => {
    const warehouses = window.ERPState.warehouses || [];
    const products = window.ERPState.products || [];
    
    // Seed some static log logs if they don't exist
    if (!window.ERPState.stockMovements) {
      window.ERPState.stockMovements = [
        { date: new Date(Date.now() - 3600000).toISOString(), product: "Programmable PLC Unit", qty: 25, type: "Incoming Passed QC", rack: "A-12" },
        { date: new Date(Date.now() - 14400000).toISOString(), product: "High Torque Gearbox", qty: 5, type: "Reserved Sales Order", rack: "C-4" },
        { date: new Date(Date.now() - 86400000).toISOString(), product: "Direct Drive Motor", qty: 15, type: "Dispatched", rack: "B-2" },
        { date: new Date(Date.now() - 172800000).toISOString(), product: "Copper Spool Spindles", qty: 120, type: "Raw Inward Receipt", rack: "E-8" }
      ];
      ERPUtils.saveState();
    }

    const movements = window.ERPState.stockMovements;

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Warehouse Storage & Racks</h2>
          <p class="text-muted">Review space capacities, monitor stock placements on warehouse racks, and track incoming logs.</p>
        </div>
      </div>

      <!-- CAPACITY RACK OVERVIEW GRID -->
      <div class="bento-grid mb-6" style="grid-template-columns: repeat(5, 1fr);">
        ${warehouses.map(w => {
          let col = "var(--success)";
          if (w.utilization >= 85) col = "var(--danger)";
          else if (w.utilization >= 70) col = "var(--warning)";

          return `
            <div class="card" style="padding:16px;">
              <h4 style="font-weight:700; font-size:0.9rem; line-height:1.2; margin-bottom:10px;">${w.name}</h4>
              <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">City: <b>${w.location}</b></p>
              
              <div style="font-size:0.72rem; display:flex; justify-content:space-between; font-weight:600; margin-bottom:4px;">
                <span>Utilization:</span> <span>${w.utilization}%</span>
              </div>
              <div style="height:6px; width:100%; background-color:var(--border-color); border-radius:3px; overflow:hidden; margin-bottom:8px;">
                <div style="width:${w.utilization}%; height:100%; background-color:${col};"></div>
              </div>

              <div style="font-size:0.7rem; color:var(--text-secondary);">
                <div>Total Racks: <b>${w.rackCount} Racks</b></div>
                <div style="margin-top:2px;">Floor capacity: <b>${w.capacity.toLocaleString()} sq ft</b></div>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="grid-cols-3 mb-6">
        <!-- STOCK MOVE LOGS -->
        <div class="card span-2" style="padding: 20px;">
          <h3 class="mb-6">Stock Movement History</h3>
          <div class="table-container" style="box-shadow:none; border:none; margin-bottom:0;">
            <table class="custom-table" style="font-size:0.8rem;">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product Specification</th>
                  <th>Quantity</th>
                  <th>Movement Type</th>
                  <th>Allocated Rack</th>
                </tr>
              </thead>
              <tbody>
                ${movements.map(m => {
                  let typeBadge = "badge-primary";
                  if (m.type.includes("Inbound") || m.type.includes("Incoming")) typeBadge = "badge-success";
                  else if (m.type.includes("Dispatched")) typeBadge = "badge-danger";
                  else if (m.type.includes("Reserved")) typeBadge = "badge-warning";

                  return `
                    <tr>
                      <td>${ERPUtils.formatDateTime(m.date)}</td>
                      <td style="font-weight:600;">${m.product}</td>
                      <td><b>${m.qty} units</b></td>
                      <td><span class="badge ${typeBadge}" style="font-size:0.65rem;">${m.type}</span></td>
                      <td><code>Rack ${m.rack}</code></td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- RACKS MAP DIAGRAM -->
        <div class="card" style="padding:20px;">
          <h3 class="mb-6">Rack Storage Map (Depot A)</h3>
          <p class="text-muted" style="font-size:0.75rem; margin-bottom:16px;">Occupancy layout diagram visual representation of central depot.</p>
          
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:10px; text-align:center;">
            ${Array.from({ length: 16 }).map((_, i) => {
              const rackName = `A-${i + 1}`;
              const usage = Math.round(30 + (i * 4.3)) % 100;
              let fillCol = "rgba(34, 197, 94, 0.1)";
              let borderCol = "var(--success)";
              
              if (usage >= 80) {
                fillCol = "rgba(239, 68, 68, 0.1)";
                borderCol = "var(--danger)";
              } else if (usage >= 55) {
                fillCol = "rgba(245, 158, 11, 0.1)";
                borderCol = "var(--warning)";
              }

              return `
                <div style="border:1px solid ${borderCol}; background-color:${fillCol}; padding:10px 4px; border-radius:8px;" title="Occupancy: ${usage}%">
                  <div style="font-size:0.75rem; font-weight:700;">${rackName}</div>
                  <div style="font-size:0.65rem; color:var(--text-secondary); margin-top:2px;">${usage}%</div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
  };

  return {
    render
  };
})();
