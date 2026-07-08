// ==================== CUSTOMERS MODULE ====================

const CustomersModule = (() => {
  let currentPage = 1;
  const rowsPerPage = 10;
  
  let searchQuery = "";
  let balanceFilter = "All"; // All | HasBalance | NearLimit

  const render = (container) => {
    const customers = window.ERPState.customers || [];

    // Filter Logic
    let filtered = customers.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchBalance = true;
      if (balanceFilter === "HasBalance") {
        matchBalance = c.outstandingAmount > 0;
      } else if (balanceFilter === "NearLimit") {
        matchBalance = c.outstandingAmount >= (c.creditLimit * 0.8);
      }

      return matchSearch && matchBalance;
    });

    const totalRows = filtered.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
    const paginated = filtered.slice(startIdx, endIdx);

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Customers Registry</h2>
          <p class="text-muted">Manage corporate client relationships, verify outstanding balances, and check credit line warnings.</p>
        </div>
        <button class="btn btn-primary" id="add-customer-btn">
          <i data-lucide="user-plus"></i> Add New Customer
        </button>
      </div>

      <!-- SEARCH & FILTER TOOLBAR -->
      <div class="table-container">
        <div class="table-header-toolbar">
          <div class="table-search">
            <i data-lucide="search"></i>
            <input type="text" id="cust-search" placeholder="Search customer, contact person..." value="${searchQuery}">
          </div>

          <div class="table-filters">
            <select id="filter-cust-balance">
              <option value="All" ${balanceFilter === "All" ? "selected" : ""}>All Balances</option>
              <option value="HasBalance" ${balanceFilter === "HasBalance" ? "selected" : ""}>Has Outstanding Balance</option>
              <option value="NearLimit" ${balanceFilter === "NearLimit" ? "selected" : ""}>Near Credit Limit (>80%)</option>
            </select>
          </div>
        </div>

        <!-- CUSTOMERS TABLE -->
        <table class="custom-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>GST Number</th>
              <th>Credit Limit</th>
              <th>Outstanding Balance</th>
              <th>Debt Ratio</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map(c => {
              const ratio = Math.round((c.outstandingAmount / c.creditLimit) * 100);
              let ratioClass = "badge-success";
              if (ratio >= 80) ratioClass = "badge-danger";
              else if (ratio >= 40) ratioClass = "badge-warning";

              return `
                <tr>
                  <td style="font-weight:600; color:var(--text-muted);">${c.id}</td>
                  <td style="font-weight:600; color:var(--text-primary);">${c.name}</td>
                  <td>
                    <div>${c.contactPerson}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${c.email}</div>
                  </td>
                  <td><code>${c.gstNumber}</code></td>
                  <td>${ERPUtils.formatCurrency(c.creditLimit)}</td>
                  <td style="font-weight:600; color:${c.outstandingAmount > 0 ? 'var(--danger)' : 'inherit'};">
                    ${ERPUtils.formatCurrency(c.outstandingAmount)}
                  </td>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span class="badge ${ratioClass}">${ratio}%</span>
                      <div style="flex:1; height:4px; width:50px; background-color:var(--border-color); border-radius:2px; overflow:hidden;">
                        <div style="width:${Math.min(ratio, 100)}%; height:100%; background-color:${ratio >= 80 ? 'var(--danger)' : (ratio >= 40 ? 'var(--warning)' : 'var(--success)')};"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm action-view-cust" data-cust-id="${c.id}">
                      <i data-lucide="folder-open" style="width:14px; height:14px;"></i> Profile
                    </button>
                  </td>
                </tr>
              `;
            }).join("") || `
              <tr>
                <td colspan="8" class="text-center text-muted" style="padding:40px;">No customers found matching search criteria.</td>
              </tr>
            `}
          </tbody>
        </table>

        <!-- PAGINATION -->
        <div class="table-pagination">
          <div class="pagination-info">
            Showing <b>${totalRows === 0 ? 0 : startIdx + 1}</b> to <b>${endIdx}</b> of <b>${totalRows}</b> customers
          </div>
          <div class="pagination-buttons">
            <button class="btn btn-secondary btn-sm" id="prev-page-cust-btn" ${currentPage === 1 ? "disabled" : ""}>
              <i data-lucide="chevron-left" style="width:14px; height:14px;"></i> Prev
            </button>
            <button class="btn btn-secondary btn-sm" id="next-page-cust-btn" ${currentPage === totalPages ? "disabled" : ""}>
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
    document.getElementById("cust-search").addEventListener("input", (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      render(container);
    });

    // Filters
    document.getElementById("filter-cust-balance").addEventListener("change", (e) => {
      balanceFilter = e.target.value;
      currentPage = 1;
      render(container);
    });

    // Pagination
    document.getElementById("prev-page-cust-btn").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        render(container);
      }
    });

    document.getElementById("next-page-cust-btn").addEventListener("click", () => {
      currentPage++;
      render(container);
    });

    // Details clicks
    container.querySelectorAll(".action-view-cust").forEach(btn => {
      btn.addEventListener("click", () => {
        const custId = btn.getAttribute("data-cust-id");
        showCustomerDetails(custId);
      });
    });

    // Add Customer Form Click
    document.getElementById("add-customer-btn").addEventListener("click", () => {
      showAddCustomerModal();
    });
  };

  // ==================== CUSTOMER PROFILE MODAL ====================
  const showCustomerDetails = (customerId) => {
    const customer = window.ERPState.customers.find(c => c.id === customerId);
    if (!customer) return;

    const detailTitle = document.getElementById("detail-modal-title");
    const detailBody = document.getElementById("detail-modal-body");
    const detailFooter = document.getElementById("detail-modal-footer");

    detailTitle.textContent = `Customer Profile: ${customer.name}`;

    // Get orders from customer id
    const cOrders = window.ERPState.orders.filter(o => o.customerId === customer.id);

    detailBody.innerHTML = `
      <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:24px; margin-bottom:20px;">
        <div>
          <h4 style="margin-bottom:8px; font-weight:700;">Account Credentials</h4>
          <p><b>Company:</b> ${customer.name}</p>
          <p><b>Contact Person:</b> ${customer.contactPerson}</p>
          <p><b>Email Address:</b> ${customer.email}</p>
          <p><b>GSTIN Register:</b> <code>${customer.gstNumber}</code></p>
          <p><b>HQ Address:</b> ${customer.address}</p>
        </div>
        <div style="background-color:var(--bg-color); border:1px solid var(--border-color); padding:16px; border-radius:12px;">
          <h4 style="margin-bottom:8px; font-weight:700;">Credit Exposure</h4>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:0.85rem;">
            <span>Outstanding Debt:</span> 
            <span style="font-weight:700; color:var(--danger);">${ERPUtils.formatCurrency(customer.outstandingAmount)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.85rem;">
            <span>Approved Credit Line:</span> 
            <span>${ERPUtils.formatCurrency(customer.creditLimit)}</span>
          </div>
          
          <!-- Bar visualizer -->
          <div style="height:8px; width:100%; background-color:var(--border-color); border-radius:4px; overflow:hidden; margin-bottom:6px;">
            <div style="width:${Math.min((customer.outstandingAmount / customer.creditLimit) * 100, 100)}%; height:100%; background-color:var(--danger);"></div>
          </div>
          <span style="font-size:0.75rem; color:var(--text-muted);">Used Credit: ${Math.round((customer.outstandingAmount / customer.creditLimit) * 100)}%</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <!-- Timeline log -->
        <div>
          <h4 style="margin-bottom:12px; font-weight:700;">Customer Activity Timeline</h4>
          <div class="timeline-feed" style="max-height:180px; overflow-y:auto; padding-right:4px;">
            ${customer.timeline.map((event, idx) => `
              <div class="timeline-item ${idx === 0 ? 'active' : ''}">
                <div class="timeline-point"></div>
                <div class="timeline-meta">${ERPUtils.formatDate(event.date)}</div>
                <div class="timeline-content">${event.action}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Orders list -->
        <div>
          <h4 style="margin-bottom:12px; font-weight:700;">Recent Order Logs</h4>
          <div style="max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
            ${cOrders.slice(0, 4).map(o => `
              <div class="card" style="padding:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; box-shadow:none;">
                <div>
                  <span style="font-weight:600; color:var(--primary);">${o.id}</span>
                  <div style="font-size:0.72rem; color:var(--text-muted);">${ERPUtils.formatDate(o.createdDate)}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:0.8rem; font-weight:700;">${ERPUtils.formatCurrency(o.grandTotal)}</div>
                  <span class="badge ${o.status === 'Dispatched' ? 'badge-success' : 'badge-warning'}" style="font-size:0.65rem; padding:1px 4px;">${o.status}</span>
                </div>
              </div>
            `).join("") || `<p class="text-muted" style="font-size:0.8rem;">No purchase history found.</p>`}
          </div>
        </div>
      </div>
    `;

    detailFooter.innerHTML = `
      <button class="btn btn-secondary" id="btn-close-cust-details">Close Profile</button>
    `;

    ERPUtils.openModal("detail-modal");

    document.getElementById("btn-close-cust-details").addEventListener("click", () => ERPUtils.closeModal("detail-modal"));
  };

  // ==================== ADD CUSTOMER DIALOG ====================
  const showAddCustomerModal = () => {
    const detailTitle = document.getElementById("detail-modal-title");
    const detailBody = document.getElementById("detail-modal-body");
    const detailFooter = document.getElementById("detail-modal-footer");

    detailTitle.textContent = "Register New Corporate Customer";
    
    detailBody.innerHTML = `
      <form id="add-cust-form" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div class="form-group" style="grid-column: span 2;">
          <label for="new-cust-name">Company Name</label>
          <input type="text" id="new-cust-name" class="form-control" placeholder="e.g. Nexa Automations Ltd" required>
        </div>
        <div class="form-group">
          <label for="new-cust-person">Contact Representative</label>
          <input type="text" id="new-cust-person" class="form-control" placeholder="e.g. Sandra Bullock" required>
        </div>
        <div class="form-group">
          <label for="new-cust-email">Contact Email</label>
          <input type="email" id="new-cust-email" class="form-control" placeholder="e.g. shipping@nexa.com" required>
        </div>
        <div class="form-group">
          <label for="new-cust-gst">GST Number (India)</label>
          <input type="text" id="new-cust-gst" class="form-control" placeholder="e.g. 27APXFS4820K1ZX" required>
        </div>
        <div class="form-group">
          <label for="new-cust-credit">Credit Limit ($)</label>
          <input type="number" id="new-cust-credit" class="form-control" placeholder="e.g. 100000" min="5000" step="5000" required>
        </div>
        <div class="form-group" style="grid-column: span 2;">
          <label for="new-cust-address">HQ Shipping Address</label>
          <textarea id="new-cust-address" class="form-control" rows="2" placeholder="Street, Building, City, State..." required></textarea>
        </div>
      </form>
    `;

    detailFooter.innerHTML = `
      <button class="btn btn-secondary" id="btn-cancel-add-cust">Cancel</button>
      <button class="btn btn-primary" id="btn-save-add-cust">Save Customer</button>
    `;

    ERPUtils.openModal("detail-modal");

    document.getElementById("btn-cancel-add-cust").addEventListener("click", () => ERPUtils.closeModal("detail-modal"));
    document.getElementById("btn-save-add-cust").addEventListener("click", submitAddCustomerForm);
  };

  const submitAddCustomerForm = () => {
    const form = document.getElementById("add-cust-form");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = document.getElementById("new-cust-name").value.trim();
    const person = document.getElementById("new-cust-person").value.trim();
    const email = document.getElementById("new-cust-email").value.trim();
    const gst = document.getElementById("new-cust-gst").value.trim().toUpperCase();
    const credit = parseFloat(document.getElementById("new-cust-credit").value) || 20000;
    const address = document.getElementById("new-cust-address").value.trim();

    const newCustId = `cust-${window.ERPState.customers.length + 1}`;

    const newCustObj = {
      id: newCustId,
      name: name,
      contactPerson: person,
      email: email,
      gstNumber: gst,
      creditLimit: credit,
      outstandingAmount: 0,
      address: address,
      history: [],
      timeline: [
        { date: new Date().toISOString(), action: "Onboarded as Approved Corporate Partner" }
      ]
    };

    window.ERPState.customers.unshift(newCustObj);
    window.ERPNotifications.add(`New Customer onboarded: ${name}`, "info");

    ERPUtils.saveState();
    ERPUtils.closeModal("detail-modal");
    
    ERPUtils.showToast(`${name} registered successfully.`, "success");

    // Force re-render of active panel
    const mainViewport = document.getElementById("main-viewport");
    render(mainViewport);
  };

  return {
    render,
    showCustomerDetails
  };
})();
