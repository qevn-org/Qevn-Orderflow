// ==================== ORDERS MODULE ====================

const OrdersModule = (() => {
  let currentPage = 1;
  const rowsPerPage = 10;
  
  let searchQuery = "";
  let statusFilter = "All";
  let priorityFilter = "All";
  
  let sortField = "createdDate";
  let sortOrder = "desc"; // desc | asc

  // Wizard state tracker
  let wizardState = {
    step: 1,
    customerId: "",
    addedProducts: [], // { productId, qty, discountPercent, warehouseId }
    priority: "Medium"
  };

  const render = (container) => {
    const orders = window.ERPState.orders || [];

    // Filter & Search Logic
    let filtered = orders.filter(o => {
      const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.salespersonName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      const matchPriority = priorityFilter === "All" || o.priority === priorityFilter;
      
      return matchSearch && matchStatus && matchPriority;
    });

    // Sorting Logic
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle nested values if any
      if (sortField === "createdDate") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    // Pagination Logic
    const totalRows = filtered.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
    const paginated = filtered.slice(startIdx, endIdx);

    // Build markup
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Sales Orders</h2>
          <p class="text-muted">Monitor client purchase pipelines, verify details, and route approved items to factory queues.</p>
        </div>
        <button class="btn btn-primary" id="add-order-btn">
          <i data-lucide="plus-circle"></i> New Sales Order
        </button>
      </div>

      <!-- FILTER & TOOLBAR -->
      <div class="table-container">
        <div class="table-header-toolbar">
          <div class="table-search">
            <i data-lucide="search"></i>
            <input type="text" id="order-search" placeholder="Search by ID, customer, staff..." value="${searchQuery}">
          </div>

          <div class="table-filters">
            <select id="filter-order-status">
              <option value="All" ${statusFilter === "All" ? "selected" : ""}>All Statuses</option>
              <option value="Pending" ${statusFilter === "Pending" ? "selected" : ""}>Pending Approval</option>
              <option value="Approved" ${statusFilter === "Approved" ? "selected" : ""}>Approved</option>
              <option value="Processing" ${statusFilter === "Processing" ? "selected" : ""}>Processing</option>
              <option value="Quality Check" ${statusFilter === "Quality Check" ? "selected" : ""}>Quality Check</option>
              <option value="Ready to Ship" ${statusFilter === "Ready to Ship" ? "selected" : ""}>Ready to Ship</option>
              <option value="Dispatched" ${statusFilter === "Dispatched" ? "selected" : ""}>Dispatched</option>
              <option value="Cancelled" ${statusFilter === "Cancelled" ? "selected" : ""}>Cancelled</option>
            </select>

            <select id="filter-order-priority">
              <option value="All" ${priorityFilter === "All" ? "selected" : ""}>All Priorities</option>
              <option value="High" ${priorityFilter === "High" ? "selected" : ""}>High</option>
              <option value="Medium" ${priorityFilter === "Medium" ? "selected" : ""}>Medium</option>
              <option value="Low" ${priorityFilter === "Low" ? "selected" : ""}>Low</option>
            </select>
          </div>
        </div>

        <!-- ORDERS TABLE -->
        <table class="custom-table">
          <thead>
            <tr>
              <th class="sortable" data-field="id">Order ID ${getSortArrow("id")}</th>
              <th class="sortable" data-field="customerName">Customer Name ${getSortArrow("customerName")}</th>
              <th class="sortable" data-field="createdDate">Date ${getSortArrow("createdDate")}</th>
              <th>Items</th>
              <th class="sortable" data-field="grandTotal">Total ${getSortArrow("grandTotal")}</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${paginated.map(o => {
              let badgeType = "badge-neutral";
              if (o.status === "Approved") badgeType = "badge-primary";
              else if (o.status === "Processing" || o.status === "Quality Check") badgeType = "badge-warning";
              else if (o.status === "Ready to Ship" || o.status === "Dispatched") badgeType = "badge-success";
              else if (o.status === "Cancelled") badgeType = "badge-danger";

              let priType = "badge-neutral";
              if (o.priority === "High") priType = "badge-danger";
              else if (o.priority === "Medium") priType = "badge-warning";

              return `
                <tr>
                  <td style="font-weight:600; color:var(--primary);">${o.id}</td>
                  <td>
                    <div style="font-weight:600;">${o.customerName}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Agent: ${o.salespersonName}</div>
                  </td>
                  <td>${ERPUtils.formatDate(o.createdDate)}</td>
                  <td>${o.products.reduce((acc, p) => acc + p.quantity, 0)} units (${o.products.length} types)</td>
                  <td style="font-weight:600;">${ERPUtils.formatCurrency(o.grandTotal)}</td>
                  <td><span class="badge ${priType}">${o.priority}</span></td>
                  <td><span class="badge ${badgeType}">${o.status}</span></td>
                  <td>
                    <button class="btn btn-secondary btn-sm action-view-order" data-order-id="${o.id}">
                      <i data-lucide="eye" style="width:14px; height:14px;"></i> Details
                    </button>
                  </td>
                </tr>
              `;
            }).join("") || `
              <tr>
                <td colspan="8" class="text-center text-muted" style="padding: 40px;">No sales orders found matching filters.</td>
              </tr>
            `}
          </tbody>
        </table>

        <!-- PAGINATION -->
        <div class="table-pagination">
          <div class="pagination-info">
            Showing <b>${totalRows === 0 ? 0 : startIdx + 1}</b> to <b>${endIdx}</b> of <b>${totalRows}</b> orders
          </div>
          <div class="pagination-buttons">
            <button class="btn btn-secondary btn-sm" id="prev-page-btn" ${currentPage === 1 ? "disabled" : ""}>
              <i data-lucide="chevron-left" style="width:14px; height:14px;"></i> Prev
            </button>
            <button class="btn btn-secondary btn-sm" id="next-page-btn" ${currentPage === totalPages ? "disabled" : ""}>
              Next <i data-lucide="chevron-right" style="width:14px; height:14px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
    attachTableEvents(container);
  };

  const getSortArrow = (field) => {
    if (sortField !== field) return "";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  // ==================== INTERACTIVE TABLE ACTIONS ====================
  const attachTableEvents = (container) => {
    // Toolbar search input
    const searchInput = document.getElementById("order-search");
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      render(container);
    });

    // Filters
    document.getElementById("filter-order-status").addEventListener("change", (e) => {
      statusFilter = e.target.value;
      currentPage = 1;
      render(container);
    });

    document.getElementById("filter-order-priority").addEventListener("change", (e) => {
      priorityFilter = e.target.value;
      currentPage = 1;
      render(container);
    });

    // Column Sorting click listeners
    container.querySelectorAll("th.sortable").forEach(th => {
      th.addEventListener("click", () => {
        const field = th.getAttribute("data-field");
        if (sortField === field) {
          sortOrder = sortOrder === "asc" ? "desc" : "asc";
        } else {
          sortField = field;
          sortOrder = "desc";
        }
        render(container);
      });
    });

    // Pagination Click binders
    document.getElementById("prev-page-btn").addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        render(container);
      }
    });

    document.getElementById("next-page-btn").addEventListener("click", () => {
      currentPage++;
      render(container);
    });

    // Create Order wizard click trigger
    document.getElementById("add-order-btn").addEventListener("click", () => {
      initOrderWizard();
    });

    // View Details triggers
    container.querySelectorAll(".action-view-order").forEach(btn => {
      btn.addEventListener("click", () => {
        const ordId = btn.getAttribute("data-order-id");
        showOrderDetails(ordId);
      });
    });
  };

  // ==================== WIZARD STEPPER LOGIC ====================
  const initOrderWizard = () => {
    // Reset state
    wizardState = {
      step: 1,
      customerId: "",
      addedProducts: [],
      priority: "Medium"
    };

    // Populate Customer Dropdown
    const custSelect = document.getElementById("wizard-customer-select");
    const customers = window.ERPState.customers || [];
    custSelect.innerHTML = `<option value="" disabled selected>Select a customer...</option>` +
      customers.map(c => `<option value="${c.id}">${c.name} (${c.contactPerson})</option>`).join("");

    // Populate Product Dropdown
    const prodSelect = document.getElementById("wizard-product-select");
    const products = window.ERPState.products || [];
    prodSelect.innerHTML = `<option value="" disabled selected>Choose a product...</option>` +
      products.map(p => `<option value="${p.id}">${p.name} - SKU: ${p.sku} ($${p.price})</option>`).join("");

    updateWizardUI();
    ERPUtils.openModal("order-wizard-modal");
    
    // Bind stepper buttons
    const nextBtn = document.getElementById("wizard-next-btn");
    const prevBtn = document.getElementById("wizard-prev-btn");
    const closeBtn = document.getElementById("wizard-close-btn");
    const addProdBtn = document.getElementById("wizard-add-product-btn");

    nextBtn.replaceWith(nextBtn.cloneNode(true));
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    addProdBtn.replaceWith(addProdBtn.cloneNode(true));

    document.getElementById("wizard-next-btn").addEventListener("click", handleWizardNext);
    document.getElementById("wizard-prev-btn").addEventListener("click", handleWizardBack);
    document.getElementById("wizard-close-btn").addEventListener("click", () => ERPUtils.closeModal("order-wizard-modal"));
    document.getElementById("wizard-add-product-btn").addEventListener("click", handleWizardAddProduct);

    // Customer Select Listener to show meta details
    document.getElementById("wizard-customer-select").addEventListener("change", (e) => {
      const selectedId = e.target.value;
      wizardState.customerId = selectedId;
      const detailsCard = document.getElementById("wizard-customer-details-card");
      
      const cObj = customers.find(c => c.id === selectedId);
      if (cObj) {
        detailsCard.classList.remove("hidden");
        
        let warningText = "";
        if (cObj.outstandingAmount >= cObj.creditLimit * 0.8) {
          warningText = `<div class="badge badge-danger" style="margin-top: 4px;">⚠️ High outstanding: 80%+ of credit line</div>`;
        }

        detailsCard.innerHTML = `
          <div><b>Contact Person:</b> ${cObj.contactPerson} | <b>Email:</b> ${cObj.email}</div>
          <div><b>GSTIN:</b> ${cObj.gstNumber}</div>
          <div><b>Credit Limit:</b> ${ERPUtils.formatCurrency(cObj.creditLimit)} | <b>Outstanding Balance:</b> ${ERPUtils.formatCurrency(cObj.outstandingAmount)}</div>
          ${warningText}
        `;
      } else {
        detailsCard.classList.add("hidden");
      }
    });
  };

  const handleWizardAddProduct = () => {
    const prodSelect = document.getElementById("wizard-product-select");
    const productId = prodSelect.value;
    if (!productId) {
      ERPUtils.showToast("Please choose a product to add.", "warning");
      return;
    }

    const products = window.ERPState.products || [];
    const pObj = products.find(p => p.id === productId);
    
    // Check if already added
    if (wizardState.addedProducts.some(p => p.productId === productId)) {
      ERPUtils.showToast("Product is already added in order stack.", "warning");
      return;
    }

    wizardState.addedProducts.push({
      productId: productId,
      name: pObj.name,
      sku: pObj.sku,
      unitPrice: pObj.price,
      qty: 1,
      discountPercent: 0,
      warehouseId: window.ERPState.warehouses[0].id // default allocation
    });

    prodSelect.selectedIndex = 0; // Reset
    renderAddedProductsTable();
  };

  const renderAddedProductsTable = () => {
    const listBody = document.getElementById("wizard-added-products-list");
    if (wizardState.addedProducts.length === 0) {
      listBody.innerHTML = `
        <tr class="empty-row">
          <td colspan="4" class="text-center text-muted">No products added yet.</td>
        </tr>
      `;
      return;
    }

    listBody.innerHTML = wizardState.addedProducts.map((p, idx) => `
      <tr>
        <td style="font-weight:600;">${p.name}</td>
        <td><code>${p.sku}</code></td>
        <td>${ERPUtils.formatCurrency(p.unitPrice)}</td>
        <td>
          <button class="btn btn-danger btn-sm wizard-remove-item" data-index="${idx}">
            <i data-lucide="trash-2" style="width:14px; height:14px;"></i> Remove
          </button>
        </td>
      </tr>
    `).join("");

    lucide.createIcons();

    // Bind remove button
    listBody.querySelectorAll(".wizard-remove-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.getAttribute("data-index"));
        wizardState.addedProducts.splice(index, 1);
        renderAddedProductsTable();
      });
    });
  };

  const handleWizardNext = () => {
    if (wizardState.step === 1 && !wizardState.customerId) {
      ERPUtils.showToast("Please select a customer first.", "warning");
      return;
    }
    if (wizardState.step === 2 && wizardState.addedProducts.length === 0) {
      ERPUtils.showToast("Please add at least one product.", "warning");
      return;
    }

    if (wizardState.step < 4) {
      wizardState.step++;
      updateWizardUI();
    } else {
      // Step 4 is Submit!
      submitOrderFromWizard();
    }
  };

  const handleWizardBack = () => {
    if (wizardState.step > 1) {
      wizardState.step--;
      updateWizardUI();
    }
  };

  const updateWizardUI = () => {
    // Enable/Disable Back buttons
    const prevBtn = document.getElementById("wizard-prev-btn");
    const nextBtn = document.getElementById("wizard-next-btn");
    
    prevBtn.disabled = (wizardState.step === 1);
    nextBtn.textContent = (wizardState.step === 4) ? "Place Order" : "Next";

    // Toggle steps visual stepper
    document.querySelectorAll(".stepper .step").forEach(step => {
      const stepNum = parseInt(step.getAttribute("data-step"));
      step.classList.remove("active", "completed");
      if (stepNum < wizardState.step) {
        step.classList.add("completed");
      } else if (stepNum === wizardState.step) {
        step.classList.add("active");
      }
    });

    document.querySelectorAll(".stepper .step-line").forEach((line, idx) => {
      line.classList.remove("active", "completed");
      if (idx + 1 < wizardState.step) {
        line.classList.add("completed");
      } else if (idx + 1 === wizardState.step) {
        line.classList.add("active");
      }
    });

    // Toggle Panels
    document.querySelectorAll(".wizard-step-panel").forEach((panel, idx) => {
      panel.classList.remove("active");
      if (idx + 1 === wizardState.step) {
        panel.classList.add("active");
      }
    });

    // Step 3 layout initialization
    if (wizardState.step === 3) {
      setupStep3Quantities();
    }

    // Step 4 layout initialization
    if (wizardState.step === 4) {
      setupStep4Review();
    }
  };

  const setupStep3Quantities = () => {
    const container = document.getElementById("wizard-quantity-list");
    const warehouses = window.ERPState.warehouses || [];

    container.innerHTML = wizardState.addedProducts.map((p, idx) => `
      <div class="qty-item-row" data-index="${idx}">
        <div>
          <div class="qty-item-name">${p.name}</div>
          <div class="qty-item-meta">SKU: <code>${p.sku}</code> | Unit Rate: $${p.unitPrice}</div>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-size:0.65rem;">Quantity</label>
          <input type="number" class="form-control form-control-sm wizard-qty-input" min="1" value="${p.qty}" data-index="${idx}">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-size:0.65rem;">Discount (%)</label>
          <input type="number" class="form-control form-control-sm wizard-disc-input" min="0" max="100" value="${p.discountPercent}" data-index="${idx}">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-size:0.65rem;">Warehouse source</label>
          <select class="form-control form-control-sm wizard-wh-select" data-index="${idx}">
            ${warehouses.map(w => `<option value="${w.id}" ${p.warehouseId === w.id ? "selected" : ""}>${w.location} Hub</option>`).join("")}
          </select>
        </div>
      </div>
    `).join("");

    // Setup input listeners to save local wizard values
    container.querySelectorAll(".wizard-qty-input").forEach(input => {
      input.addEventListener("change", (e) => {
        const idx = parseInt(input.getAttribute("data-index"));
        const val = Math.max(1, parseInt(e.target.value) || 1);
        input.value = val;
        wizardState.addedProducts[idx].qty = val;
      });
    });

    container.querySelectorAll(".wizard-disc-input").forEach(input => {
      input.addEventListener("change", (e) => {
        const idx = parseInt(input.getAttribute("data-index"));
        const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
        input.value = val;
        wizardState.addedProducts[idx].discountPercent = val;
      });
    });

    container.querySelectorAll(".wizard-wh-select").forEach(select => {
      select.addEventListener("change", (e) => {
        const idx = parseInt(select.getAttribute("data-index"));
        wizardState.addedProducts[idx].warehouseId = e.target.value;
      });
    });
  };

  const setupStep4Review = () => {
    const cObj = window.ERPState.customers.find(c => c.id === wizardState.customerId);
    
    document.getElementById("wizard-review-customer").textContent = cObj ? cObj.name : "Unknown Customer";
    document.getElementById("wizard-review-salesperson").textContent = `${ERPApp.getActiveRole()} User`;
    
    const reviewItemsBody = document.getElementById("wizard-review-items-body");
    
    let subtotal = 0;
    let totalDiscount = 0;
    let totalGst = 0;

    const rowHTML = wizardState.addedProducts.map(p => {
      const lineCost = p.qty * p.unitPrice;
      const lineDiscount = Math.round(lineCost * (p.discountPercent / 100));
      const lineTaxable = lineCost - lineDiscount;
      const lineGst = Math.round(lineTaxable * 0.18);
      const lineTotal = lineTaxable + lineGst;

      subtotal += lineCost;
      totalDiscount += lineDiscount;
      totalGst += lineGst;

      return `
        <tr>
          <td><b>${p.name}</b><br><small class="text-muted">SKU: ${p.sku}</small></td>
          <td>${p.qty}</td>
          <td>${ERPUtils.formatCurrency(p.unitPrice)}</td>
          <td>-${ERPUtils.formatCurrency(lineDiscount)} (${p.discountPercent}%)</td>
          <td>${ERPUtils.formatCurrency(lineGst)} (18%)</td>
          <td style="font-weight:600;">${ERPUtils.formatCurrency(lineTotal)}</td>
        </tr>
      `;
    }).join("");

    reviewItemsBody.innerHTML = rowHTML;
    
    const grandTotal = (subtotal - totalDiscount) + totalGst;

    document.getElementById("wizard-total-subtotal").textContent = ERPUtils.formatCurrency(subtotal);
    document.getElementById("wizard-total-discount").textContent = `-${ERPUtils.formatCurrency(totalDiscount)}`;
    document.getElementById("wizard-total-gst").textContent = ERPUtils.formatCurrency(totalGst);
    document.getElementById("wizard-total-grand").textContent = ERPUtils.formatCurrency(grandTotal);

    // Save wizard properties to compile later
    wizardState.calculatedTotals = { subtotal, totalDiscount, totalGst, grandTotal };
  };

  const submitOrderFromWizard = () => {
    const customer = window.ERPState.customers.find(c => c.id === wizardState.customerId);
    const salesperson = `${ERPApp.getActiveRole()} User`;
    
    const newOrderId = `ORD-2026-${String(window.ERPState.orders.length + 1).padStart(4, '0')}`;
    
    // Map products to schema structures
    const orderProducts = wizardState.addedProducts.map(p => {
      const lineCost = p.qty * p.unitPrice;
      const lineDiscount = Math.round(lineCost * (p.discountPercent / 100));
      const lineTotal = (lineCost - lineDiscount) + Math.round((lineCost - lineDiscount) * 0.18);

      return {
        productId: p.productId,
        name: p.name,
        sku: p.sku,
        quantity: p.qty,
        unitPrice: p.unitPrice,
        discount: lineDiscount,
        gstRate: 18,
        total: lineTotal,
        warehouseId: p.warehouseId
      };
    });

    const priority = document.getElementById("wizard-review-priority").value;
    const totals = wizardState.calculatedTotals;

    const newOrderObj = {
      id: newOrderId,
      customerId: customer.id,
      customerName: customer.name,
      salespersonId: "sales-1", // mock default ID
      salespersonName: salesperson,
      products: orderProducts,
      subtotal: totals.subtotal,
      discountTotal: totals.totalDiscount,
      gstTotal: totals.totalGst,
      grandTotal: totals.grandTotal,
      status: "Pending",
      priority: priority,
      paymentStatus: "Unpaid",
      invoiceStatus: "Pending",
      createdDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 8 * 86400000).toISOString() // 8 days expected
    };

    // Save order in state
    window.ERPState.orders.unshift(newOrderObj);
    
    // Log to customer timeline
    customer.timeline.unshift({
      date: new Date().toISOString(),
      action: `Created Sales Order ${newOrderId} totaling ${ERPUtils.formatCurrency(totals.grandTotal)}`
    });

    // Add alert notification
    window.ERPNotifications.add(`New sales order ${newOrderId} created (Pending approval)`, "info");

    ERPUtils.saveState();
    ERPUtils.closeModal("order-wizard-modal");
    
    ERPUtils.showToast(`Order ${newOrderId} created successfully.`, "success");

    // Force re-render of active panel
    const mainViewport = document.getElementById("main-viewport");
    render(mainViewport);
  };

  // ==================== DETAIL MODALS & WORKFLOWS ====================
  const showOrderDetails = (orderId) => {
    const order = window.ERPState.orders.find(o => o.id === orderId);
    if (!order) return;

    const detailTitle = document.getElementById("detail-modal-title");
    const detailBody = document.getElementById("detail-modal-body");
    const detailFooter = document.getElementById("detail-modal-footer");

    detailTitle.textContent = `Order Details: ${order.id}`;

    let statusClass = "badge-neutral";
    if (order.status === "Approved") statusClass = "badge-primary";
    else if (order.status === "Processing" || order.status === "Quality Check") statusClass = "badge-warning";
    else if (order.status === "Ready to Ship" || order.status === "Dispatched") statusClass = "badge-success";
    else if (order.status === "Cancelled") statusClass = "badge-danger";

    let payClass = "badge-neutral";
    if (order.paymentStatus === "Paid") payClass = "badge-success";
    else if (order.paymentStatus === "Partially Paid") payClass = "badge-warning";

    const customer = window.ERPState.customers.find(c => c.id === order.customerId);

    detailBody.innerHTML = `
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-bottom:20px;">
        <div>
          <h4 style="margin-bottom:8px; font-weight:700;">Client Registry Info</h4>
          <p><b>Company:</b> ${order.customerName}</p>
          <p><b>GSTIN:</b> ${customer ? customer.gstNumber : "N/A"}</p>
          <p><b>Shipping Address:</b> ${customer ? customer.address : "N/A"}</p>
        </div>
        <div style="background-color:var(--bg-color); border:1px solid var(--border-color); padding:16px; border-radius:12px;">
          <h4 style="margin-bottom:8px; font-weight:700;">Metadata Log</h4>
          <p><b>Priority:</b> <span class="badge ${order.priority === 'High' ? 'badge-danger' : 'badge-warning'}">${order.priority}</span></p>
          <p style="margin-top:6px;"><b>Salesperson:</b> ${order.salespersonName}</p>
          <p style="margin-top:6px;"><b>Order Date:</b> ${ERPUtils.formatDate(order.createdDate)}</p>
          <p style="margin-top:6px;"><b>Delivery Target:</b> ${ERPUtils.formatDate(order.expectedDelivery)}</p>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <h4 style="margin-bottom:8px; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
          <span>Items Details List</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">Allocated from stock</span>
        </h4>
        <div class="review-table-wrapper">
          <table class="review-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Product Name</th>
                <th>Quantity Ordered</th>
                <th>Unit Price</th>
                <th>Discount Applied</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.products.map(p => `
                <tr>
                  <td><code>${p.sku}</code></td>
                  <td><b>${p.name}</b></td>
                  <td>${p.quantity}</td>
                  <td>${ERPUtils.formatCurrency(p.unitPrice)}</td>
                  <td>-${ERPUtils.formatCurrency(p.discount)}</td>
                  <td style="font-weight:600;">${ERPUtils.formatCurrency(p.total)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="display:flex; gap:12px;">
          <div>
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Workflow Status</div>
            <span class="badge ${statusClass}" style="font-size:0.875rem; margin-top:2px;">${order.status}</span>
          </div>
          <div>
            <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Payment Status</div>
            <span class="badge ${payClass}" style="font-size:0.875rem; margin-top:2px;">${order.paymentStatus}</span>
          </div>
        </div>

        <div style="background-color:var(--bg-color); border:1px solid var(--border-color); border-radius:10px; padding:12px; width:220px; text-align:right;">
          <div style="font-size:0.8rem; display:flex; justify-content:space-between;">
            <span>Subtotal:</span> <span>${ERPUtils.formatCurrency(order.subtotal)}</span>
          </div>
          <div style="font-size:0.8rem; display:flex; justify-content:space-between; margin-top:4px;">
            <span>Discount:</span> <span style="color:var(--danger);">-${ERPUtils.formatCurrency(order.discountTotal)}</span>
          </div>
          <div style="font-size:0.8rem; display:flex; justify-content:space-between; margin-top:4px;">
            <span>GST (18%):</span> <span>${ERPUtils.formatCurrency(order.gstTotal)}</span>
          </div>
          <div style="font-size:0.95rem; font-weight:700; display:flex; justify-content:space-between; margin-top:6px; border-top:1px solid var(--border-color); padding-top:6px;">
            <span>Total Cost:</span> <span>${ERPUtils.formatCurrency(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    `;

    // Render footer buttons based on order status and active permissions role
    let footerHTML = `
      <button class="btn btn-secondary" id="btn-print-order" style="margin-right:auto;">
        <i data-lucide="printer" style="width:14px; height:14px;"></i> Print GST Invoice
      </button>
      <button class="btn btn-secondary" id="btn-duplicate-order">
        <i data-lucide="copy" style="width:14px; height:14px;"></i> Duplicate
      </button>
    `;

    // Role permissions gating
    const role = ERPApp.getActiveRole();
    const canApproveReject = ["Owner", "Admin", "Sales Manager"].includes(role);

    if (order.status === "Pending") {
      if (canApproveReject) {
        footerHTML += `
          <button class="btn btn-danger" id="btn-reject-order">Reject Order</button>
          <button class="btn btn-success" id="btn-approve-order">Approve Order</button>
        `;
      } else {
        footerHTML += `<div style="font-size:0.75rem; color:var(--text-muted); align-self:center;">⚠️ Only Sales Managers or Admins can Approve.</div>`;
      }
    } else if (order.status === "Approved") {
      const canStartProduction = ["Owner", "Admin", "Factory Manager"].includes(role);
      if (canStartProduction) {
        footerHTML += `
          <button class="btn btn-primary" id="btn-start-production">
            <i data-lucide="cpu" style="width:14px; height:14px;"></i> Start Production
          </button>
        `;
      } else {
        footerHTML += `<div style="font-size:0.75rem; color:var(--text-muted); align-self:center;">⚠️ Only Factory Managers can route to production line.</div>`;
      }
    }

    footerHTML += `<button class="btn btn-secondary" id="btn-close-order-details">Close</button>`;

    detailFooter.innerHTML = footerHTML;
    ERPUtils.openModal("detail-modal");

    // Action click bindings
    document.getElementById("btn-close-order-details").addEventListener("click", () => ERPUtils.closeModal("detail-modal"));
    document.getElementById("btn-print-order").addEventListener("click", () => triggerPrintLayout(order));
    document.getElementById("btn-duplicate-order").addEventListener("click", () => triggerDuplicateOrder(order));

    const appBtn = document.getElementById("btn-approve-order");
    const rejBtn = document.getElementById("btn-reject-order");
    const prodBtn = document.getElementById("btn-start-production");

    if (appBtn) appBtn.addEventListener("click", () => handleOrderStateTransition(order.id, "Approved"));
    if (rejBtn) rejBtn.addEventListener("click", () => handleOrderStateTransition(order.id, "Cancelled"));
    if (prodBtn) prodBtn.addEventListener("click", () => routeToProductionQueue(order.id));
  };

  const handleOrderStateTransition = (orderId, newStatus) => {
    const order = window.ERPState.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;

    // Deduct physical stocks and reserve if Approved
    if (newStatus === "Approved") {
      let isInventorySufficient = true;
      order.products.forEach(p => {
        const prod = window.ERPState.products.find(pr => pr.id === p.productId);
        if (prod) {
          if (prod.stock < p.quantity) {
            isInventorySufficient = false;
          }
          // Increment reserved stock levels
          prod.reservedStock += p.quantity;
        }
      });

      if (!isInventorySufficient) {
        ERPUtils.showToast(`Order approved, but warning: Some products are low on physical inventory.`, "warning");
      } else {
        ERPUtils.showToast(`Order approved. Materials reserved successfully.`, "success");
      }

      // Generate invoice immediately since order is approved (simulating automation)
      createInvoiceForOrder(order);
      window.ERPNotifications.add(`Order ${order.id} Approved. Invoice Generated.`, "success");
    } else if (newStatus === "Cancelled") {
      ERPUtils.showToast(`Order ${order.id} has been cancelled.`, "error");
      window.ERPNotifications.add(`Order ${order.id} Cancelled.`, "danger");
    }

    ERPUtils.saveState();
    ERPUtils.closeModal("detail-modal");

    // Force re-render of active panel
    const activePanel = document.getElementById("view-orders");
    render(activePanel);
  };

  const createInvoiceForOrder = (order) => {
    // Check if invoice already exists
    const exists = window.ERPState.invoices.some(i => i.orderId === order.id);
    if (exists) return;

    const newInvId = `INV-2026-${String(window.ERPState.invoices.length + 1).padStart(4, '0')}`;
    
    order.invoiceStatus = "Generated";
    
    const newInvoiceObj = {
      id: newInvId,
      orderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      amount: order.grandTotal,
      status: order.paymentStatus === "Paid" ? "Paid" : "Unpaid",
      outstandingAmount: order.paymentStatus === "Paid" ? 0 : order.grandTotal,
      payments: []
    };

    window.ERPState.invoices.unshift(newInvoiceObj);

    // Update customer outstanding debt
    const customer = window.ERPState.customers.find(c => c.id === order.customerId);
    if (customer && order.paymentStatus !== "Paid") {
      customer.outstandingAmount += order.grandTotal;
    }
  };

  const routeToProductionQueue = (orderId) => {
    const order = window.ERPState.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = "Processing";

    // Allocate production job queue
    // Add work order items
    order.products.forEach(p => {
      // Create separate Manufacturing Work Order
      const workOrderNum = `WO-2026-${String(randomRange(1000, 9999))}`;
      
      const newJob = {
        id: workOrderNum,
        orderId: order.id,
        productId: p.productId,
        productName: p.name,
        qty: p.quantity,
        machineId: "mach-1", // initially unallocated, first machine default
        workerId: "wrk-1",
        stage: "Waiting", // Waiting -> Processing -> Quality Check -> Completed
        estimatedCompletion: new Date(Date.now() + 3 * 86400000).toISOString() // 3 days manufacturing
      };

      if (!window.ERPState.manufacturingQueue) {
        window.ERPState.manufacturingQueue = [];
      }
      window.ERPState.manufacturingQueue.unshift(newJob);
    });

    window.ERPNotifications.add(`Work Orders issued for order ${order.id}. Routing to factory floor.`, "info");
    ERPUtils.saveState();
    ERPUtils.closeModal("detail-modal");

    ERPUtils.showToast(`Order ${order.id} routed to active production.`, "success");

    // Force re-render of active panel
    const activePanel = document.getElementById("view-orders");
    render(activePanel);
  };

  const triggerDuplicateOrder = (order) => {
    const newOrderId = `ORD-2026-${String(window.ERPState.orders.length + 1).padStart(4, '0')}`;
    
    // Copy properties, reset status to Pending
    const duplicated = {
      ...order,
      id: newOrderId,
      status: "Pending",
      paymentStatus: "Unpaid",
      invoiceStatus: "Pending",
      createdDate: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 9 * 86400000).toISOString()
    };

    window.ERPState.orders.unshift(duplicated);
    ERPUtils.saveState();
    ERPUtils.closeModal("detail-modal");
    
    ERPUtils.showToast(`Duplicated into new Order ${newOrderId}.`, "success");

    // Re-render
    const activePanel = document.getElementById("view-orders");
    render(activePanel);
  };

  const triggerPrintLayout = (order) => {
    // Generate simple clean print page rendering in new window or styled print box
    const customer = window.ERPState.customers.find(c => c.id === order.customerId);
    
    const printContent = `
      <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding:40px; color:#333; }
          .invoice-header { display:flex; justify-content:space-between; border-bottom:2px solid #79980B; padding-bottom:20px; margin-bottom:30px; }
          .invoice-brand { font-size:1.8rem; font-weight:800; }
          .meta-info { text-align:right; font-size:0.9rem; }
          .address-section { display:grid; grid-template-columns:1fr 1fr; gap:40px; margin-bottom:40px; }
          .address-card { background-color:#F9FAFB; padding:16px; border-radius:8px; }
          .invoice-table { width:100%; border-collapse:collapse; margin-bottom:40px; }
          .invoice-table th { background-color:#79980B; color:white; font-weight:600; padding:10px; text-align:left; }
          .invoice-table td { padding:12px 10px; border-bottom:1px solid #E5E7EB; }
          .invoice-totals { width:300px; margin-left:auto; display:flex; flex-direction:column; gap:8px; font-size:0.95rem; }
          .totals-row { display:flex; justify-content:space-between; }
          .grand-total { border-top:2px solid #79980B; padding-top:8px; font-weight:700; font-size:1.15rem; }
          @media print {
            .btn-print-trigger { display:none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div>
            <div class="invoice-brand">QEVN <span style="color:#79980B">Orderflow</span></div>
            <p>Manufacturing Logistics Engine</p>
          </div>
          <div class="meta-info">
            <h2>TAX INVOICE</h2>
            <p><b>Order ID:</b> ${order.id}</p>
            <p><b>Date:</b> ${ERPUtils.formatDate(order.createdDate)}</p>
          </div>
        </div>

        <div class="address-section">
          <div class="address-card">
            <h3>From:</h3>
            <p><b>${window.ERPState.settings.companyName}</b></p>
            <p>${window.ERPState.settings.address}</p>
            <p>GSTIN: <b>${window.ERPState.settings.gstin}</b></p>
          </div>
          <div class="address-card">
            <h3>Bill To:</h3>
            <p><b>${order.customerName}</b></p>
            <p>${customer ? customer.address : "N/A"}</p>
            <p>GSTIN: <b>${customer ? customer.gstNumber : "N/A"}</b></p>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>SKU Code</th>
              <th>Product Name Description</th>
              <th>Qty</th>
              <th>Unit Rate ($)</th>
              <th>Discount Applied ($)</th>
              <th>Taxes (GST 18%)</th>
              <th>Total ($)</th>
            </tr>
          </thead>
          <tbody>
            ${order.products.map(p => {
              const lineCost = p.quantity * p.unitPrice - p.discount;
              const lineGst = Math.round(lineCost * 0.18);
              return `
                <tr>
                  <td><code>${p.sku}</code></td>
                  <td><b>${p.name}</b></td>
                  <td>${p.quantity}</td>
                  <td>$${p.unitPrice.toLocaleString()}</td>
                  <td>-$${p.discount.toLocaleString()}</td>
                  <td>$${lineGst.toLocaleString()}</td>
                  <td style="font-weight:600;">$${p.total.toLocaleString()}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <div class="invoice-totals">
          <div class="totals-row"><span>Subtotal:</span> <span>$${order.subtotal.toLocaleString()}</span></div>
          <div class="totals-row"><span>Discount Applied:</span> <span style="color:red;">-$${order.discountTotal.toLocaleString()}</span></div>
          <div class="totals-row"><span>GST Tax (18%):</span> <span>$${order.gstTotal.toLocaleString()}</span></div>
          <div class="totals-row grand-total"><span>Grand Total:</span> <span>$${order.grandTotal.toLocaleString()}</span></div>
        </div>

        <div style="margin-top:60px; text-align:center;" class="btn-print-trigger">
          <button onclick="window.print()" style="padding:10px 24px; background-color:#3B82F6; color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
            Confirm Print Page
          </button>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open("", "_blank");
    printWin.document.write(printContent);
    printWin.document.close();
  };

  const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  return {
    render,
    showOrderDetails
  };
})();
