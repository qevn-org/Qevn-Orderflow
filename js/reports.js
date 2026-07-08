// ==================== REPORTS EXPORTS MODULE ====================

const ReportsModule = (() => {
  let activeReportType = "Sales"; // Sales | Inventory | Production | Finance

  const render = (container) => {
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Operational Reports Registry</h2>
          <p class="text-muted">Export clean CSV spreadsheets, generate audits logs, and compile legal documentation reports.</p>
        </div>
      </div>

      <div class="grid-cols-3 mb-6">
        
        <!-- REPORT TYPE SELECTOR CARD -->
        <div class="card" style="padding:20px; display:flex; flex-direction:column; gap:12px;">
          <h3 class="mb-4">Select Report Template</h3>
          <button class="btn btn-block ${activeReportType === 'Sales' ? 'btn-primary' : 'btn-secondary'} report-select-btn" data-type="Sales">
            <i data-lucide="shopping-cart"></i> Sales Pipeline Audit
          </button>
          <button class="btn btn-block ${activeReportType === 'Inventory' ? 'btn-primary' : 'btn-secondary'} report-select-btn" data-type="Inventory">
            <i data-lucide="package"></i> Inventory Stock Ledger
          </button>
          <button class="btn btn-block ${activeReportType === 'Production' ? 'btn-primary' : 'btn-secondary'} report-select-btn" data-type="Production">
            <i data-lucide="cpu"></i> Factory Queue Log
          </button>
          <button class="btn btn-block ${activeReportType === 'Finance' ? 'btn-primary' : 'btn-secondary'} report-select-btn" data-type="Finance">
            <i data-lucide="receipt"></i> Finance Tax Receipts
          </button>
        </div>

        <!-- REPORT OPTIONS & DOWNLOAD -->
        <div class="card span-2" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h3 class="mb-6">${activeReportType} Report Configuration</h3>
            
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
              <div class="form-group">
                <label>Billing Period Start</label>
                <input type="date" class="form-control" value="2026-03-01">
              </div>
              <div class="form-group">
                <label>Billing Period End</label>
                <input type="date" class="form-control" value="2026-07-08">
              </div>
            </div>

            <div style="font-size:0.85rem; color:var(--text-secondary); background-color:var(--bg-color); border:1px solid var(--border-color); padding:12px; border-radius:8px; margin-bottom:20px;">
              <b>Template Parameters:</b>
              <p style="margin-top:4px;">Compiles all transaction files, status checkpoints, and relevant company metadata within the selected dates.</p>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:12px;">
            <button class="btn btn-secondary" id="btn-export-csv">
              <i data-lucide="file-spreadsheet"></i> Export Spreadsheet CSV
            </button>
            <button class="btn btn-primary" id="btn-export-pdf">
              <i data-lucide="file-text"></i> Compile PDF Report
            </button>
          </div>
        </div>

      </div>

      <!-- PREVIEW CARD -->
      <div class="card mb-6">
        <h3 class="mb-6">${activeReportType} Data Sheet Preview</h3>
        <div class="table-container" style="border:none; box-shadow:none; margin-bottom:0;">
          <table class="custom-table" style="font-size:0.8rem;" id="report-preview-table">
            <!-- Loaded dynamically based on selected type -->
          </table>
        </div>
      </div>
    `;

    lucide.createIcons();
    attachEvents(container);
    renderPreviewTable();
  };

  const attachEvents = (container) => {
    // Select report type
    container.querySelectorAll(".report-select-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeReportType = btn.getAttribute("data-type");
        render(container);
      });
    });

    // Mock downloads click
    document.getElementById("btn-export-csv").addEventListener("click", () => triggerMockDownload("CSV"));
    document.getElementById("btn-export-pdf").addEventListener("click", () => triggerMockDownload("PDF"));
  };

  const renderPreviewTable = () => {
    const table = document.getElementById("report-preview-table");
    if (!table) return;

    if (activeReportType === "Sales") {
      const orders = window.ERPState.orders.slice(0, 5);
      table.innerHTML = `
        <thead>
          <tr>
            <th>Order Ref</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Taxable Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td style="font-weight:600; color:var(--primary);">${o.id}</td>
              <td>${o.customerName}</td>
              <td>${ERPUtils.formatDate(o.createdDate)}</td>
              <td>${ERPUtils.formatCurrency(o.grandTotal)}</td>
              <td><span class="badge badge-success">${o.status}</span></td>
            </tr>
          `).join("")}
        </tbody>
      `;
    } else if (activeReportType === "Inventory") {
      const prods = window.ERPState.products.slice(0, 5);
      table.innerHTML = `
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Specification</th>
            <th>Safety Stock Hand</th>
            <th>Available Units</th>
            <th>Min Limit</th>
          </tr>
        </thead>
        <tbody>
          ${prods.map(p => `
            <tr>
              <td><code>${p.sku}</code></td>
              <td style="font-weight:600;">${p.name}</td>
              <td>${p.stock}</td>
              <td><b>${p.stock - p.reservedStock}</b></td>
              <td>${p.minStock}</td>
            </tr>
          `).join("")}
        </tbody>
      `;
    } else if (activeReportType === "Production") {
      const queue = window.ERPState.manufacturingQueue || [];
      table.innerHTML = `
        <thead>
          <tr>
            <th>Work Order</th>
            <th>Sales Ref</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Floor Line Stage</th>
          </tr>
        </thead>
        <tbody>
          ${queue.slice(0, 5).map(j => `
            <tr>
              <td style="font-weight:600;">${j.id}</td>
              <td>${j.orderId}</td>
              <td>${j.productName}</td>
              <td><b>${j.qty}</b></td>
              <td><span class="badge badge-warning">${j.stage}</span></td>
            </tr>
          `).join("") || `
            <tr><td colspan="5" class="text-center text-muted">No manufacturing logs generated.</td></tr>
          `}
        </tbody>
      `;
    } else if (activeReportType === "Finance") {
      const invs = window.ERPState.invoices.slice(0, 5);
      table.innerHTML = `
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Customer</th>
            <th>Issued Date</th>
            <th>Receivables</th>
            <th>Outstanding</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${invs.map(i => `
            <tr>
              <td style="font-weight:600; color:var(--text-muted);">${i.id}</td>
              <td>${i.customerName}</td>
              <td>${ERPUtils.formatDate(i.invoiceDate)}</td>
              <td>${ERPUtils.formatCurrency(i.amount)}</td>
              <td style="color:var(--danger);">${ERPUtils.formatCurrency(i.outstandingAmount)}</td>
              <td><span class="badge badge-success">${i.status}</span></td>
            </tr>
          `).join("")}
        </tbody>
      `;
    }
  };

  const triggerMockDownload = (format) => {
    const btn = format === "CSV" ? document.getElementById("btn-export-csv") : document.getElementById("btn-export-pdf");
    
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span style="display:inline-block; animation:spin 1s infinite linear;">↻</span> Compiling...`;

    ERPUtils.showToast(`Compiling and building ${activeReportType} report ledger...`, "info");

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = origHTML;
      
      // Prompt mock browser file download trigger
      const element = document.createElement("a");
      const fileContent = "QEVN Orderflow Mock Report Data Export Block";
      const file = new Blob([fileContent], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${activeReportType.toLowerCase()}_report_2026.${format.toLowerCase()}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      ERPUtils.showToast(`Report saved successfully as ${format} spreadsheet!`, "success");
    }, 1800);
  };

  return {
    render
  };
})();
