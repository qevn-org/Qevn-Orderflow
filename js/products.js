// ==================== PRODUCTS MANAGEMENT MODULE ====================

const ProductsModule = (() => {
  let searchQuery = "";
  let categoryFilter = "All";

  const render = (container) => {
    const products = window.ERPState.products || [];

    // Filter Logic
    let filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
      
      return matchSearch && matchCategory;
    });

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Product Inventory Catalog</h2>
          <p class="text-muted">Review mechanical parts, controllers, variants parameters, manufacturing pricing, and critical safety stocks.</p>
        </div>
        <button class="btn btn-primary" id="add-product-btn">
          <i data-lucide="plus"></i> Add New Product
        </button>
      </div>

      <!-- FILTER BAR -->
      <div class="table-container" style="border:none; box-shadow:none; background:none; margin-bottom:16px;">
        <div class="table-header-toolbar" style="padding:0; border:none; background:none; justify-content:space-between;">
          <div class="table-search">
            <i data-lucide="search"></i>
            <input type="text" id="prod-search" placeholder="Search by name, SKU..." value="${searchQuery}">
          </div>

          <div class="table-filters">
            <select id="filter-prod-cat">
              <option value="All" ${categoryFilter === "All" ? "selected" : ""}>All Categories</option>
              <option value="Motors" ${categoryFilter === "Motors" ? "selected" : ""}>Motors</option>
              <option value="Gears" ${categoryFilter === "Gears" ? "selected" : ""}>Gears</option>
              <option value="Controllers" ${categoryFilter === "Controllers" ? "selected" : ""}>Controllers</option>
              <option value="Mechanical Parts" ${categoryFilter === "Mechanical Parts" ? "selected" : ""}>Mechanical Parts</option>
              <option value="Raw Materials" ${categoryFilter === "Raw Materials" ? "selected" : ""}>Raw Materials</option>
            </select>
          </div>
        </div>
      </div>

      <!-- PRODUCT CARDS GRID -->
      <div class="bento-grid" style="grid-template-columns: repeat(4, 1fr);">
        ${filtered.map(p => {
          const availableStock = p.stock - p.reservedStock;
          const isLowStock = p.stock <= p.minStock;

          return `
            <div class="card product-card" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; min-height:220px;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                  <div style="width:36px; height:36px; border-radius:8px; background-color:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="${p.image || 'box'}"></i>
                  </div>
                  <span class="badge ${isLowStock ? 'badge-danger' : 'badge-success'}">${isLowStock ? 'Low Stock' : 'In Stock'}</span>
                </div>
                
                <h4 style="font-weight:700; font-size:0.95rem; margin-bottom:4px; line-height:1.3;">${p.name}</h4>
                <div style="font-size:0.75rem; color:var(--text-muted); font-family:monospace; margin-bottom:12px;">SKU: ${p.sku}</div>
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:10px; border-top:1px solid var(--border-color); padding-top:10px;">
                  <span style="font-size:0.75rem; color:var(--text-secondary);">Rate:</span>
                  <span style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${ERPUtils.formatCurrency(p.price)}</span>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; margin-bottom:12px;">
                  <span>Available stock:</span>
                  <span style="font-weight:600;">${availableStock} / ${p.stock}</span>
                </div>

                <div style="display:flex; gap:8px;">
                  <button class="btn btn-secondary btn-sm action-view-prod" data-prod-id="${p.id}" style="flex:1; padding:6px;">
                    Inspect Spec
                  </button>
                  <button class="btn btn-secondary btn-sm action-archive-prod text-danger" data-prod-id="${p.id}" style="padding:6px;" title="Archive Product">
                    <i data-lucide="archive" style="width:14px; height:14px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join("") || `
          <div class="card span-4 text-center text-muted" style="padding:60px;">
            <i data-lucide="box" style="width:40px; height:40px; margin-bottom:10px;"></i>
            <p>No products found in catalog matching search criteria.</p>
          </div>
        `}
      </div>
    `;

    lucide.createIcons();
    attachEvents(container);
  };

  const attachEvents = (container) => {
    // Search query listener
    document.getElementById("prod-search").addEventListener("input", (e) => {
      searchQuery = e.target.value;
      render(container);
    });

    // Category filtering
    document.getElementById("filter-prod-cat").addEventListener("change", (e) => {
      categoryFilter = e.target.value;
      render(container);
    });

    // Details clicks
    container.querySelectorAll(".action-view-prod").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.getAttribute("data-prod-id");
        showProductDetails(prodId);
      });
    });

    // Archive clicks
    container.querySelectorAll(".action-archive-prod").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.getAttribute("data-prod-id");
        triggerArchiveProduct(prodId);
      });
    });

    // Add Product Modal trigger
    document.getElementById("add-product-btn").addEventListener("click", () => {
      showAddProductModal();
    });
  };

  // ==================== PRODUCT DETAILS OVERLAY ====================
  const showProductDetails = (productId) => {
    const product = window.ERPState.products.find(p => p.id === productId);
    if (!product) return;

    const detailTitle = document.getElementById("detail-modal-title");
    const detailBody = document.getElementById("detail-modal-body");
    const detailFooter = document.getElementById("detail-modal-footer");

    detailTitle.textContent = `Product Specifications: ${product.name}`;

    detailBody.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
        <div>
          <div style="width:100%; height:180px; background-color:var(--bg-color); border:1px solid var(--border-color); border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
            <i data-lucide="${product.image || 'box'}" style="width:72px; height:72px; color:var(--primary);"></i>
          </div>
          <p><b>Product ID:</b> ${product.id}</p>
          <p style="margin-top:4px;"><b>SKU Reference:</b> <code>${product.sku}</code></p>
          <p style="margin-top:4px;"><b>Category:</b> ${product.category}</p>
          <p style="margin-top:4px;"><b>Unit Catalog Price:</b> ${ERPUtils.formatCurrency(product.price)}</p>
        </div>

        <div>
          <h4 style="font-weight:700; margin-bottom:10px;">Stock Reserves Summary</h4>
          <div style="background-color:var(--bg-color); border:1px solid var(--border-color); padding:16px; border-radius:12px; margin-bottom:16px;">
            <p><b>Physical Stock In Hand:</b> ${product.stock} units</p>
            <p style="margin-top:4px;"><b>Committed / Reserved:</b> ${product.reservedStock} units</p>
            <p style="margin-top:4px; font-weight:600; color:var(--success);"><b>Available to Sell:</b> ${product.stock - product.reservedStock} units</p>
            <p style="margin-top:4px; font-weight:500; color:var(--danger);"><b>Safety Threshold Limit:</b> ${product.minStock} units</p>
          </div>

          <h4 style="font-weight:700; margin-bottom:6px;">Data Specifications</h4>
          <table class="review-table" style="font-size:0.8rem; width:100%;">
            <tbody>
              ${Object.entries(product.specifications).map(([key, val]) => `
                <tr>
                  <td><b>${key}</b></td>
                  <td>${val}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    detailFooter.innerHTML = `
      <button class="btn btn-secondary" id="btn-close-prod-details">Close Info</button>
    `;

    ERPUtils.openModal("detail-modal");

    document.getElementById("btn-close-prod-details").addEventListener("click", () => ERPUtils.closeModal("detail-modal"));
  };

  // ==================== ADD NEW PRODUCT FORM ====================
  const showAddProductModal = () => {
    const detailTitle = document.getElementById("detail-modal-title");
    const detailBody = document.getElementById("detail-modal-body");
    const detailFooter = document.getElementById("detail-modal-footer");

    detailTitle.textContent = "Register New Catalog Product";

    detailBody.innerHTML = `
      <form id="add-prod-form" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
        <div class="form-group" style="grid-column: span 2;">
          <label for="new-prod-name">Product Name Description</label>
          <input type="text" id="new-prod-name" class="form-control" placeholder="e.g. Servo Motor (Standard)" required>
        </div>
        <div class="form-group">
          <label for="new-prod-sku">SKU Code</label>
          <input type="text" id="new-prod-sku" class="form-control" placeholder="e.g. MC-SV-STD-05" required>
        </div>
        <div class="form-group">
          <label for="new-prod-cat">Product Category</label>
          <select id="new-prod-cat" class="form-control" required>
            <option value="Motors">Motors</option>
            <option value="Gears">Gears</option>
            <option value="Controllers">Controllers</option>
            <option value="Mechanical Parts">Mechanical Parts</option>
            <option value="Raw Materials">Raw Materials</option>
          </select>
        </div>
        <div class="form-group">
          <label for="new-prod-price">Catalog Selling Price ($)</label>
          <input type="number" id="new-prod-price" class="form-control" placeholder="e.g. 240" min="1" required>
        </div>
        <div class="form-group">
          <label for="new-prod-stock">Initial Stock Level</label>
          <input type="number" id="new-prod-stock" class="form-control" placeholder="e.g. 100" min="0" required>
        </div>
        <div class="form-group">
          <label for="new-prod-min">Minimum Stock Alert</label>
          <input type="number" id="new-prod-min" class="form-control" placeholder="e.g. 15" min="1" required>
        </div>
        <div class="form-group">
          <label for="new-prod-icon">Product Graphic Icon</label>
          <select id="new-prod-icon" class="form-control">
            <option value="box">Package Box</option>
            <option value="cpu">Processor / Motor</option>
            <option value="settings">Cog / Gearbox</option>
            <option value="layers">Sheets / Materials</option>
          </select>
        </div>
      </form>
    `;

    detailFooter.innerHTML = `
      <button class="btn btn-secondary" id="btn-cancel-add-prod">Cancel</button>
      <button class="btn btn-primary" id="btn-save-add-prod">Save Product</button>
    `;

    ERPUtils.openModal("detail-modal");

    document.getElementById("btn-cancel-add-prod").addEventListener("click", () => ERPUtils.closeModal("detail-modal"));
    document.getElementById("btn-save-add-prod").addEventListener("click", submitAddProductForm);
  };

  const submitAddProductForm = () => {
    const form = document.getElementById("add-prod-form");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = document.getElementById("new-prod-name").value.trim();
    const sku = document.getElementById("new-prod-sku").value.trim().toUpperCase();
    const cat = document.getElementById("new-prod-cat").value;
    const price = parseFloat(document.getElementById("new-prod-price").value) || 100;
    const stock = parseInt(document.getElementById("new-prod-stock").value) || 0;
    const min = parseInt(document.getElementById("new-prod-min").value) || 10;
    const icon = document.getElementById("new-prod-icon").value;

    const newProdId = `prod-${window.ERPState.products.length + 1}`;

    const newProdObj = {
      id: newProdId,
      name: name,
      sku: sku,
      category: cat,
      price: price,
      stock: stock,
      reservedStock: 0,
      minStock: min,
      variants: ["Standard"],
      specifications: { "Weight": "Variable", "Material": "Diecast Castings" },
      image: icon
    };

    window.ERPState.products.unshift(newProdObj);
    window.ERPNotifications.add(`New product catalog created: ${name}`, "info");

    ERPUtils.saveState();
    ERPUtils.closeModal("detail-modal");
    
    ERPUtils.showToast(`${name} added to catalog successfully.`, "success");

    // Force re-render of active panel
    const mainViewport = document.getElementById("main-viewport");
    render(mainViewport);
  };

  // ==================== ARCHIVING PRODUCT LOGIC ====================
  const triggerArchiveProduct = (productId) => {
    const product = window.ERPState.products.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`Are you sure you want to archive ${product.name} from active lists?`)) {
      window.ERPState.products = window.ERPState.products.filter(p => p.id !== productId);
      window.ERPNotifications.add(`Product archived: ${product.name}`, "warning");
      
      ERPUtils.saveState();
      ERPUtils.showToast(`${product.name} archived successfully.`, "success");

      // Force re-render of active panel
      const mainViewport = document.getElementById("main-viewport");
      render(mainViewport);
    }
  };

  return {
    render,
    showProductDetails
  };
})();
