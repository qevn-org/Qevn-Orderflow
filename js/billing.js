// ==================== BILLING / INVOICING MODULE ====================

const BillingModule = (() => {
  let currentPage = 1;
  const rowsPerPage = 10;

  let searchQuery = "";
  let statusFilter = "All";

  const render = (container) => {
    const invoices = window.ERPState.invoices || [];

    // Filter Logic
    let filtered = invoices.filter(i => {
      const matchSearch = i.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          i.orderId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === "All" || i.status === statusFilter;
      
      return matchSearch && matchStatus;
    });

    const totalRows = filtered.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
    const paginated = filtered.slice(startIdx, endIdx);

    // Calculate metrics
    const totalBilled = invoices.reduce((sum, i) => sum + i.amount, 0);
    const totalCollected = invoices.reduce((sum, i) => sum + (i.amount - i.outstandingAmount), 0);
    const totalOutstanding = invoices.reduce((sum, i) => sum + i.outstandingAmount, 0);
    const overdueCount = invoices.filter(i => i.status === "Overdue").length;

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Financial Invoices & Receipts</h2>
          <p class="text-muted">Review corporate accounts billing registers, collect outstanding client balances, and generate GST invoices.</p>
        </div>
      </div>

      <!-- FINANCE SUMMARY WIDGETS -->
      <div class="bento-grid mb-6">
        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Total Accounts Billed</span>
            <div class="card-stat-icon primary"><i data-lucide="receipt"></i></div>
          </div>
          <div class="card-stat-value">${ERPUtils.formatCurrency(totalBilled)}</div>
          <div class="card-stat-footer">
            <span class="trend-label">Gross invoice total generated</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Collected Funds</span>
            <div class="card-stat-icon success"><i data-lucide="check-square"></i></div>
          </div>
          <div class="card-stat-value">${ERPUtils.formatCurrency(totalCollected)}</div>
          <div class="card-stat-footer">
            <span class="trend-badge up"><i data-lucide="trending-up"></i> +9.1%</span>
            <span class="trend-label">realized collections</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Outstanding / Receivables</span>
            <div class="card-stat-icon danger"><i data-lucide="alert-triangle"></i></div>
          </div>
          <div class="card-stat-value">${ERPUtils.formatCurrency(totalOutstanding)}</div>
          <div class="card-stat-footer">
            <span class="trend-label" style="color:var(--danger); font-weight:600;">Active accounts outstanding debt</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Overdue Invoices</span>
            <div class="card-stat-icon danger"><i data-lucide="alert-octagon"></i></div>
          </div>
          <div class="card-stat-value">${overdueCount} Invoices</div>
          <div class="card-stat-footer">
            <span class="trend-label" style="color:var(--danger); font-weight:600;">Past 30-day payment limits</span>
          </div>
        </div>
      </div>

      <!-- INVOICES DIRECTORY -->
      <div class="table-container">
        <div class="table-header-toolbar">
          <div class="table-search">
            <i data-lucide="search"></i>
            <input type="text" id="billing-search" placeholder="Search invoice, order, customer..." value="${searchQuery}">
          </div>

          <div class="table-filters">
            <select id="filter-billing-status">
              <option value="All" ${statusFilter === "All" ? "selected" : ""}>All Invoices</option>
              <option value="Paid" ${statusFilter === "Paid" ? "selected" : ""}>Paid</option>
              <option value="Unpaid" ${statusFilter === "Unpaid" ? "selected" : ""}>Unpaid</option>
              <option value="Partial" ${statusFilter === "Partial" ? "selected" : ""}>Partially Paid</option>
              <option value="Overdue" ${statusFilter === "Overdue" ? "selected" : ""}>Overdue</option>
            </select>
          </div>
        </div>

        <!-- TABLE LIST -->
        <table class="custom-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Total Amount</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map(i => {
              let badgeCol = "badge-neutral";
              if (i.status === "Paid") badgeCol = "badge-success";
              else if (i.status === "Partial") badgeCol = "badge-warning";
              else if (i.status === "Overdue" || i.status === "Unpaid") badgeCol = "badge-danger";

              return `
                <tr>
                  <td style="font-weight:600; color:var(--text-muted);">${i.id}</td>
                  <td style="font-weight:600; color:var(--primary);">${i.orderId}</td>
                  <td>${i.customerName}</td>
                  <td>${ERPUtils.formatDate(i.invoiceDate)}</td>
                  <td>${ERPUtils.formatDate(i.dueDate)}</td>
                  <td style="font-weight:600;">${ERPUtils.formatCurrency(i.amount)}</td>
                  <td style="font-weight:600; color:${i.outstandingAmount > 0 ? 'var(--danger)' : 'inherit'};">${ERPUtils.formatCurrency(i.outstandingAmount)}</td>
                  <td><span class="badge ${badgeCol}">${i.status}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm action-view-invoice" data-invoice-id="${i.id}">
                      <i data-lucide="receipt" style="width:14px; height:14px;"></i> Preview
                    </button>
                  </td>
                </tr>
              `;
            }).join("") || `
              <tr>
                <td colspan="9" class="text-center text-muted" style="padding: 40px;">No invoices found matching criteria.</td>
              </tr>
            `}
          </tbody>
        </table>

        <!-- PAGINATION -->
        <div class="table-pagination">
          <div class="pagination-info">
            Showing <b>${totalRows === 0 ? 0 : startIdx + 1}</b> to <b>${endIdx}</b> of <b>${totalRows}</b> invoices
          </div>
          <div class="pagination-buttons">
            <button class="btn btn-secondary btn-sm" id="prev-page-bill-btn" ${currentPage === 1 ? "disabled" : ""}>
              <i data-lucide="chevron-left" style="width:14px; height:14px;"></i> Prev
            </button>
            <button class="btn btn-secondary btn-sm" id="next-page-bill-btn" ${currentPage === totalPages ? "disabled" : ""}>
              Next <i data-lucide="chevron-right" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    attachEvents(container);
  };

  const attachEvents = (container) => {
    // Search input
    document.getElementById("billing-search").addEventListener("input", (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      render(container);
    });

    // Filters
    document.getElementById("filter-billing-status").addEventListener("change", (e) => {
      statusFilter = e.target.value;
      currentPage = 1;
      render(container);
    });

    // Pagination
    document.getElementById("prev-page-bill-btn").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        render(container);
      }
    });

    document.getElementById("next-page-bill-btn").addEventListener("click", () => {
      currentPage++;
      render(container);
    });

    // Preview click triggers
    container.querySelectorAll(".action-view-invoice").forEach(btn => {
      btn.addEventListener("click", () => {
        const invId = btn.getAttribute("data-invoice-id");
        showInvoicePreview(invId);
      });
    });
  };

  // ==================== INVOICE TAX PREVIEW MODAL ====================
  const showInvoicePreview = (invoiceId) => {
    const invoice = window.ERPState.invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const order = window.ERPState.orders.find(o => o.id === invoice.orderId);
    const customer = window.ERPState.customers.find(c => c.id === invoice.customerId);

    const detailTitle = document.getElementById("detail-modal-title");
    const detailBody = document.getElementById("detail-modal-body");
    const detailFooter = document.getElementById("detail-modal-footer");

    detailTitle.textContent = `Invoice Preview: ${invoice.id}`;

    // Subtotal tax breakdowns (CGST 9% and SGST 9%)
    const rawTaxable = (order ? order.subtotal - order.discountTotal : invoice.amount / 1.18);
    const cgst = Math.round(rawTaxable * 0.09);
    const sgst = Math.round(rawTaxable * 0.09);

    detailBody.innerHTML = `
      <div style="border:1px solid var(--border-color); border-radius:12px; padding:24px; background-color:var(--card-bg);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
          <div>
            <h3 style="font-weight:800; font-size:1.4rem; color:var(--text-primary);">QEVN <span style="color:var(--primary);">Orderflow</span></h3>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">GSTIN: ${window.ERPState.settings.gstin}</p>
          </div>
          <div style="text-align:right;">
            <h4 style="font-weight:700;">TAX INVOICE</h4>
            <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;"><b>Invoice ID:</b> ${invoice.id}</p>
            <p style="font-size:0.8rem; color:var(--text-secondary);"><b>Invoice Date:</b> ${ERPUtils.formatDate(invoice.invoiceDate)}</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; font-size:0.82rem;">
          <div style="background-color:var(--bg-color); border:1px solid var(--border-color); padding:12px; border-radius:8px;">
            <b>Billed From:</b>
            <div style="font-weight:600; margin-top:4px;">${window.ERPState.settings.companyName}</div>
            <div style="color:var(--text-secondary);">${window.ERPState.settings.address}</div>
          </div>
          <div style="background-color:var(--bg-color); border:1px solid var(--border-color); padding:12px; border-radius:8px;">
            <b>Billed To:</b>
            <div style="font-weight:600; margin-top:4px;">${invoice.customerName}</div>
            <div style="color:var(--text-secondary);">${customer ? customer.address : "HQ Address"}</div>
            <div style="color:var(--text-secondary); font-weight:600; margin-top:2px;">GSTIN: ${customer ? customer.gstNumber : "N/A"}</div>
          </div>
        </div>

        <!-- ITEMS DETAIL -->
        <table class="review-table" style="font-size:0.8rem; margin-bottom:20px; width:100%;">
          <thead>
            <tr>
              <th>Product SKU</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Rate</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order ? order.products.map(p => `
              <tr>
                <td><code>${p.sku}</code></td>
                <td><b>${p.name}</b></td>
                <td>${p.quantity}</td>
                <td>${ERPUtils.formatCurrency(p.unitPrice)}</td>
                <td style="font-weight:600;">${ERPUtils.formatCurrency(p.total - Math.round((p.total / 1.18) * 0.18))}</td>
              </tr>
            `).join("") : `
              <tr>
                <td><code>N/A</code></td>
                <td><b>Contract Service Bill</b></td>
                <td>1</td>
                <td>${ERPUtils.formatCurrency(invoice.amount / 1.18)}</td>
                <td style="font-weight:600;">${ERPUtils.formatCurrency(invoice.amount / 1.18)}</td>
              </tr>
            `}
          </tbody>
        </table>

        <!-- TOTALS BLOCK -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="font-size:0.8rem;">
            <p><b>Outstanding Due Date:</b> ${ERPUtils.formatDate(invoice.dueDate)}</p>
            <p style="margin-top:2px;"><b>Payment Status:</b> <span class="badge ${invoice.status === 'Paid' ? 'badge-success' : 'badge-danger'}">${invoice.status}</span></p>
          </div>
          <div style="width:240px; font-size:0.8rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
              <span>Taxable Value:</span> <span>${ERPUtils.formatCurrency(rawTaxable)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
              <span>CGST (9%):</span> <span>${ERPUtils.formatCurrency(cgst)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
              <span>SGST (9%):</span> <span>${ERPUtils.formatCurrency(sgst)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-top:1px solid var(--border-color); padding-top:6px; font-weight:700; font-size:0.95rem;">
              <span>Grand Total:</span> <span>${ERPUtils.formatCurrency(invoice.amount)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Permissions role check
    const role = ERPApp.getActiveRole();
    const canCollect = ["Owner", "Admin", "Accountant"].includes(role);

    let footerHTML = "";
    if (invoice.status !== "Paid") {
      if (canCollect) {
        footerHTML += `<button class="btn btn-success" id="btn-record-payment">Record Cash Payment</button>`;
      } else {
        footerHTML += `<div style="font-size:0.75rem; color:var(--text-muted); align-self:center;">⚠️ Only Accountants can record cash payments.</div>`;
      }
    }
    
    footerHTML += `<button class="btn btn-secondary" id="btn-close-invoice-prev">Close</button>`;

    detailFooter.innerHTML = footerHTML;
    ERPUtils.openModal("detail-modal");

    document.getElementById("btn-close-invoice-prev").addEventListener("click", () => ERPUtils.closeModal("detail-modal"));
    
    const payBtn = document.getElementById("btn-record-payment");
    if (payBtn) {
      payBtn.addEventListener("click", () => {
        recordCashPayment(invoice.id);
      });
    }
  };

  const recordCashPayment = (invoiceId) => {
    const invoice = window.ERPState.invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    // Mutate invoice status
    invoice.status = "Paid";
    
    // Update customer outstanding amount
    const customer = window.ERPState.customers.find(c => c.id === invoice.customerId);
    if (customer) {
      customer.outstandingAmount = Math.max(0, customer.outstandingAmount - invoice.outstandingAmount);
      
      // Add log to customer timeline
      customer.timeline.unshift({
        date: new Date().toISOString(),
        action: `Settled Invoice ${invoice.id} for amount ${ERPUtils.formatCurrency(invoice.amount)}`
      });
    }

    invoice.outstandingAmount = 0;

    // Mutate order payment status too
    const order = window.ERPState.orders.find(o => o.id === invoice.orderId);
    if (order) {
      order.paymentStatus = "Paid";
    }

    window.ERPNotifications.add(`Payment cleared for Invoice ${invoice.id}`, "success");
    ERPUtils.saveState();
    ERPUtils.closeModal("detail-modal");

    ERPUtils.showToast(`Invoice ${invoice.id} payment recorded.`, "success");

    // Force re-render of active panel
    const mainViewport = document.getElementById("main-viewport");
    render(mainViewport);
  };

  return {
    render,
    showInvoicePreview
  };
})();
