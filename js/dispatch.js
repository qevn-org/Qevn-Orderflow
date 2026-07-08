// ==================== DISPATCH MODULE ====================

const DispatchModule = (() => {

  const initDispatchLogsIfEmpty = () => {
    if (!window.ERPState.dispatchLogs) {
      window.ERPState.dispatchLogs = [];
    }

    if (window.ERPState.dispatchLogs.length === 0) {
      // Find orders with status Ready to Ship or Dispatched
      const targetOrders = window.ERPState.orders.filter(o => ["Ready to Ship", "Dispatched"].includes(o.status));
      
      targetOrders.forEach((o, index) => {
        let carrier = "";
        let tracking = "";
        let vehicle = "";
        let status = "Pending Dispatch";

        if (o.status === "Dispatched") {
          carrier = "FedEx SupplyChain";
          tracking = `TRK-${100000 + index}`;
          vehicle = `MH-12-GQ-${4000 + index}`;
          status = "Dispatched";
        }

        window.ERPState.dispatchLogs.push({
          id: `DSP-2026-${String(index + 1).padStart(4, '0')}`,
          orderId: o.id,
          customerName: o.customerName,
          carrier: carrier,
          trackingNum: tracking,
          status: status,
          dispatchDate: o.status === "Dispatched" ? o.createdDate : "",
          vehicleNum: vehicle
        });
      });
      ERPUtils.saveState();
    }
  };

  const render = (container) => {
    initDispatchLogsIfEmpty();

    const logs = window.ERPState.dispatchLogs || [];

    const pending = logs.filter(l => l.status === "Pending Dispatch");
    const shipped = logs.filter(l => l.status === "Dispatched");

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Dispatch & Shipping Controls</h2>
          <p class="text-muted">Allocate courier partners, assign transport vehicles, register shipping IDs, and generate outward tags.</p>
        </div>
      </div>

      <!-- DISPATCH METRICS -->
      <div class="bento-grid mb-6">
        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Awaiting Dispatch</span>
            <div class="card-stat-icon warning"><i data-lucide="clock"></i></div>
          </div>
          <div class="card-stat-value">${pending.length} Shipments</div>
          <div class="card-stat-footer">
            <span class="trend-label">Inventory boxed and on dock</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Dispatched Today</span>
            <div class="card-stat-icon success"><i data-lucide="truck"></i></div>
          </div>
          <div class="card-stat-value">${shipped.length} Transits</div>
          <div class="card-stat-footer">
            <span class="trend-label">Active courier vehicle routes</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Delivery Rate</span>
            <div class="card-stat-icon primary"><i data-lucide="percent"></i></div>
          </div>
          <div class="card-stat-value">98.4%</div>
          <div class="card-stat-footer">
            <span class="trend-label">On-time transit arrivals</span>
          </div>
        </div>
      </div>

      <!-- DISPATCH LISTS -->
      <div class="grid-cols-3 mb-6">
        
        <!-- PENDING SHIPPINGS -->
        <div class="card span-2" style="padding: 20px;">
          <h3 class="mb-6">Pending Shipments Queue</h3>
          <div class="table-container" style="box-shadow:none; border:none; margin-bottom:0;">
            <table class="custom-table" style="font-size:0.82rem;">
              <thead>
                <tr>
                  <th>Dispatch ID</th>
                  <th>Order Reference</th>
                  <th>Customer Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${pending.map(l => `
                  <tr>
                    <td style="font-weight:600; color:var(--text-muted);">${l.id}</td>
                    <td style="font-weight:600; color:var(--primary);">${l.orderId}</td>
                    <td>${l.customerName}</td>
                    <td><span class="badge badge-warning">${l.status}</span></td>
                    <td>
                      <button class="btn btn-primary btn-sm action-ship-modal" data-dispatch-id="${l.id}">
                        <i data-lucide="send" style="width:12px; height:12px;"></i> Ship Items
                      </button>
                    </td>
                  </tr>
                `).join("") || `
                  <tr>
                    <td colspan="5" class="text-center text-muted" style="padding: 30px;">No shipments pending dispatch.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

        <!-- TRANSIT LOGS -->
        <div class="card" style="padding: 20px;">
          <h3 class="mb-6">Recent Outward Dispatches</h3>
          <div style="display:flex; flex-direction:column; gap:12px; max-height:280px; overflow-y:auto; padding-right:4px;">
            ${shipped.slice(0, 6).map(l => `
              <div style="border-bottom:1px solid var(--border-color); padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:600; font-size:0.85rem;">${l.orderId} — ${l.customerName}</div>
                  <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px;">
                    Carrier: <b>${l.carrier}</b> | TRK: <code>${l.trackingNum}</code>
                  </div>
                </div>
                <button class="btn btn-secondary btn-sm action-print-label" data-dispatch-id="${l.id}" title="Print Label" style="padding:6px;">
                  <i data-lucide="printer" style="width:14px; height:14px;"></i>
                </button>
              </div>
            `).join("") || `<p class="text-muted text-center" style="font-size:0.8rem; padding:20px;">No shipped logs yet.</p>`}
          </div>
        </div>

      </div>
    `;

    lucide.createIcons();
    attachEvents(container);
  };

  const attachEvents = (container) => {
    container.querySelectorAll(".action-ship-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-dispatch-id");
        showShipFormModal(id);
      });
    });

    container.querySelectorAll(".action-print-label").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-dispatch-id");
        printShippingLabel(id);
      });
    });
  };

  const showShipFormModal = (dispatchId) => {
    const log = window.ERPState.dispatchLogs.find(l => l.id === dispatchId);
    if (!log) return;

    const detailTitle = document.getElementById("detail-modal-title");
    const detailBody = document.getElementById("detail-modal-body");
    const detailFooter = document.getElementById("detail-modal-footer");

    detailTitle.textContent = `Ship Order Details: ${log.orderId}`;

    detailBody.innerHTML = `
      <form id="ship-form" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div class="form-group">
          <label for="ship-carrier">Courier Partner</label>
          <select id="ship-carrier" class="form-control" required>
            <option value="FedEx SupplyChain">FedEx SupplyChain</option>
            <option value="DHL Express">DHL Express</option>
            <option value="BlueDart">BlueDart</option>
            <option value="Delhivery Logistics">Delhivery Logistics</option>
          </select>
        </div>
        <div class="form-group">
          <label for="ship-tracking">Tracking Number</label>
          <input type="text" id="ship-tracking" class="form-control" placeholder="e.g. TRK98402123" required>
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label for="ship-vehicle">Vehicle Assignment</label>
          <input type="text" id="ship-vehicle" class="form-control" placeholder="e.g. Truck MH-12-GQ-5820" required>
        </div>
      </form>
    `;

    detailFooter.innerHTML = `
      <button class="btn btn-secondary" id="btn-cancel-ship">Cancel</button>
      <button class="btn btn-primary" id="btn-submit-ship">Confirm Ship</button>
    `;

    ERPUtils.openModal("detail-modal");

    document.getElementById("btn-cancel-ship").addEventListener("click", () => ERPUtils.closeModal("detail-modal"));
    document.getElementById("btn-submit-ship").addEventListener("click", () => submitShipForm(dispatchId));
  };

  const submitShipForm = (dispatchId) => {
    const form = document.getElementById("ship-form");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const carrier = document.getElementById("ship-carrier").value;
    const tracking = document.getElementById("ship-tracking").value.trim();
    const vehicle = document.getElementById("ship-vehicle").value.trim();

    const log = window.ERPState.dispatchLogs.find(l => l.id === dispatchId);
    if (log) {
      log.carrier = carrier;
      log.trackingNum = tracking;
      log.vehicleNum = vehicle;
      log.status = "Dispatched";
      log.dispatchDate = new Date().toISOString();

      // Update Order Status to Dispatched
      const order = window.ERPState.orders.find(o => o.id === log.orderId);
      if (order) {
        order.status = "Dispatched";
      }

      window.ERPNotifications.add(`Shipment dispatched for ${log.orderId} via ${carrier}`, "success");
      ERPUtils.saveState();
      ERPUtils.closeModal("detail-modal");

      ERPUtils.showToast(`Order ${log.orderId} dispatched successfully.`, "success");

      // Force re-render of active panel
      const mainViewport = document.getElementById("main-viewport");
      render(mainViewport);
    }
  };

  const printShippingLabel = (dispatchId) => {
    const log = window.ERPState.dispatchLogs.find(l => l.id === dispatchId);
    if (!log) return;

    const order = window.ERPState.orders.find(o => o.id === log.orderId);
    const customer = window.ERPState.customers.find(c => c.id === (order ? order.customerId : ""));

    const printHTML = `
      <html>
      <head>
        <title>Shipping Tag - ${log.id}</title>
        <style>
          body { font-family: monospace; padding: 20px; text-align: center; }
          .label-box { border: 4px solid black; padding: 20px; width: 400px; margin: 0 auto; text-align: left; }
          .header { text-align: center; font-size: 1.5rem; font-weight: bold; border-bottom: 2px solid black; padding-bottom: 8px; margin-bottom: 15px; }
          .barcode-placeholder { text-align: center; font-size: 3.5rem; border: 1px dashed black; padding: 20px; margin: 20px 0; letter-spacing: 5px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="label-box">
          <div class="header">SHIPMENT TAG</div>
          <p><b>TO:</b><br>${log.customerName}<br>${customer ? customer.address : "N/A"}</p>
          <p><b>FROM:</b><br>${window.ERPState.settings.companyName}<br>${window.ERPState.settings.address}</p>
          <hr>
          <p><b>CARRIER:</b> ${log.carrier}</p>
          <p><b>TRACKING #:</b> ${log.trackingNum}</p>
          <p><b>ORDER ID:</b> ${log.orderId}</p>
          <p><b>VEHICLE NO:</b> ${log.vehicleNum}</p>
          <div class="barcode-placeholder">||| | | || ||| | |||</div>
        </div>
        <div style="margin-top: 20px;" class="no-print">
          <button onclick="window.print()">Print Label</button>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open("", "_blank");
    printWin.document.write(printHTML);
    printWin.document.close();
  };

  return {
    render
  };
})();
