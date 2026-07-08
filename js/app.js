// ==================== MAIN CORE CONTROLLER ====================

const ERPApp = (() => {
  // Active state role permissions mapping
  const rolePermissions = {
    "Owner": { label: "Owner", color: "badge-primary" },
    "Admin": { label: "Administrator", color: "badge-neutral" },
    "Sales Manager": { label: "Sales Manager", color: "badge-success" },
    "Sales Executive": { label: "Sales Exec", color: "badge-success" },
    "Factory Manager": { label: "Factory Mgr", color: "badge-warning" },
    "Warehouse Manager": { label: "Warehouse Mgr", color: "badge-warning" },
    "Accountant": { label: "Accountant", color: "badge-neutral" },
    "Dispatch Manager": { label: "Dispatch Mgr", color: "badge-danger" }
  };

  let activeRole = "Owner";
  let activeView = "dashboard";

  // 1. APP BOOTSTRAP INITS
  const init = () => {
    setupLoginHandler();
    setupNavigation();
    setupDropdowns();
    setupNotificationsCenter();
    setupCommandPalette();
    setupThemeToggle();
    setupMobileSidebar();
  };

  // 2. LOGIN FLOW LOGIC
  const setupLoginHandler = () => {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-password").value;

      // Validate mock credentials
      if (email === "admin@qevn.in" && pass === "admin123") {
        const loginScreen = document.getElementById("login-screen");
        const appContainer = document.getElementById("app-container");
        
        loginScreen.classList.add("hidden");
        appContainer.classList.remove("hidden");

        ERPUtils.showToast("Successfully logged in as Owner.", "success");
        
        // Initial view load
        navigateTo("dashboard");
      } else {
        ERPUtils.showToast("Invalid credentials. Try admin@qevn.in / admin123.", "error");
      }
    });

    // Logout button bindings
    const logoutBtns = [document.getElementById("logout-btn"), document.getElementById("dropdown-logout-btn")];
    logoutBtns.forEach(btn => {
      if (btn) {
        btn.addEventListener("click", () => {
          const loginScreen = document.getElementById("login-screen");
          const appContainer = document.getElementById("app-container");
          
          appContainer.classList.add("hidden");
          loginScreen.classList.remove("hidden");
          
          ERPUtils.showToast("Logged out successfully.", "info");
        });
      }
    });
  };

  // 3. NAVIGATION ROUTER WITH SIMULATED SKELETON LOADERS
  const setupNavigation = () => {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = link.getAttribute("data-view");
        if (targetView) navigateTo(targetView);
      });
    });
  };

  const navigateTo = (viewName) => {
    const navLinks = document.querySelectorAll(".nav-link");
    const viewPanels = document.querySelectorAll(".view-panel");

    // Close sidebars on mobile if open
    document.getElementById("sidebar").classList.remove("mobile-show");

    // Deactivate previous active links
    navLinks.forEach(link => {
      if (link.getAttribute("data-view") === viewName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Swapping with skeleton screen loading simulation
    const activePanel = document.getElementById(`view-${viewName}`);
    if (!activePanel) return;

    // Set page headings breadcrumbs
    const bcParent = document.getElementById("bc-parent");
    const bcChild = document.getElementById("bc-child");
    
    // Group hierarchy titles
    let parentTitle = "Sales & Customers";
    let childTitle = viewName.charAt(0).toUpperCase() + viewName.slice(1);
    
    if (viewName === "dashboard") {
      parentTitle = "Main";
    } else if (["products", "inventory"].includes(viewName)) {
      parentTitle = "Products & Inventory";
    } else if (["manufacturing", "warehouse", "dispatch"].includes(viewName)) {
      parentTitle = "Operations & Logistics";
    } else if (["billing", "analytics", "reports"].includes(viewName)) {
      parentTitle = "Finance & Reports";
    } else if (viewName === "settings") {
      parentTitle = "Configuration";
    }

    bcParent.textContent = parentTitle;
    bcChild.textContent = childTitle;
    activeView = viewName;

    // Apply temporary skeleton screens
    renderSkeleton(activePanel, viewName);

    setTimeout(() => {
      // Trigger target modules rendering templates
      viewPanels.forEach(panel => {
        panel.classList.remove("active");
      });
      activePanel.classList.add("active");

      executeViewRenderer(viewName, activePanel);
    }, 280); // Wait for shim load
  };

  const renderSkeleton = (panel, viewName) => {
    panel.classList.add("active");
    
    // Draw generic skeleton blocks based on view template type
    let skeletonHTML = `
      <div class="section-header">
        <div class="skeleton-loading" style="height: 32px; width: 220px;"></div>
        <div class="skeleton-loading" style="height: 40px; width: 140px; border-radius: 8px;"></div>
      </div>
    `;

    if (viewName === "dashboard" || viewName === "analytics") {
      skeletonHTML += `
        <div class="bento-grid mb-6">
          <div class="card skeleton-loading skeleton-widget"></div>
          <div class="card skeleton-loading skeleton-widget"></div>
          <div class="card skeleton-loading skeleton-widget"></div>
          <div class="card skeleton-loading skeleton-widget"></div>
        </div>
        <div class="grid-cols-2 mb-6">
          <div class="card skeleton-loading skeleton-chart"></div>
          <div class="card skeleton-loading skeleton-chart"></div>
        </div>
      `;
    } else {
      // Table skeleton
      skeletonHTML += `
        <div class="table-container">
          <div class="table-header-toolbar">
            <div class="skeleton-loading" style="height: 36px; width: 240px;"></div>
            <div class="skeleton-loading" style="height: 36px; width: 180px;"></div>
          </div>
          <div style="padding: 20px;">
            <div class="skeleton-loading skeleton-row"></div>
            <div class="skeleton-loading skeleton-row"></div>
            <div class="skeleton-loading skeleton-row"></div>
            <div class="skeleton-loading skeleton-row"></div>
            <div class="skeleton-loading skeleton-row"></div>
          </div>
        </div>
      `;
    }

    panel.innerHTML = skeletonHTML;
  };

  const executeViewRenderer = (viewName, container) => {
    try {
      switch (viewName) {
        case "dashboard":
          DashboardModule.render(container);
          break;
        case "orders":
          OrdersModule.render(container);
          break;
        case "customers":
          CustomersModule.render(container);
          break;
        case "sales-team":
          SalesTeamModule.render(container);
          break;
        case "products":
          ProductsModule.render(container);
          break;
        case "inventory":
          InventoryModule.render(container);
          break;
        case "manufacturing":
          ManufacturingModule.render(container);
          break;
        case "warehouse":
          WarehouseModule.render(container);
          break;
        case "dispatch":
          DispatchModule.render(container);
          break;
        case "billing":
          BillingModule.render(container);
          break;
        case "analytics":
          AnalyticsModule.render(container);
          break;
        case "reports":
          ReportsModule.render(container);
          break;
        case "settings":
          SettingsModule.render(container);
          break;
      }
      lucide.createIcons();
    } catch (err) {
      console.error(`Rendering error in module ${viewName}:`, err);
      container.innerHTML = `
        <div class="text-center text-danger" style="padding: 80px 20px;">
          <i data-lucide="alert-octagon" style="width: 48px; height: 48px; margin-bottom: 12px;"></i>
          <h3>Failed to load module</h3>
          <p class="text-muted">${err.message}</p>
        </div>
      `;
      lucide.createIcons();
    }
  };

  // 4. HEADER DROPDOWNS & PROFILE SWITCHER
  const setupDropdowns = () => {
    const profileBtn = document.getElementById("profile-dropdown-btn");
    const profileMenu = document.getElementById("profile-dropdown");

    const notifBtn = document.getElementById("notif-btn");
    const notifMenu = document.getElementById("notif-dropdown");

    // Profile Click toggles
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifMenu.classList.add("hidden");
      profileMenu.classList.toggle("hidden");
      profileMenu.classList.toggle("show");
    });

    // Notifications Click toggles
    notifBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu.classList.add("hidden");
      notifMenu.classList.toggle("hidden");
      notifMenu.classList.toggle("show");
    });

    // Dismiss dropdowns on outside clicks
    document.addEventListener("click", () => {
      profileMenu.classList.add("hidden");
      profileMenu.classList.remove("show");
      notifMenu.classList.add("hidden");
      notifMenu.classList.remove("show");
    });

    // Role switcher logic inside menu
    const roleBtns = document.querySelectorAll(".role-btn");
    roleBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const role = btn.getAttribute("data-role");
        roleBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        changeActiveRole(role);
        
        profileMenu.classList.add("hidden");
        profileMenu.classList.remove("show");
      });
    });
  };

  const changeActiveRole = (roleName) => {
    activeRole = roleName;
    const permissions = rolePermissions[roleName] || { label: roleName, color: "badge-neutral" };

    // Update names, badges across the sidebar and header
    const sidebarRoleBadge = document.querySelector(".sidebar-user .user-role-badge");
    const sidebarAvatar = document.getElementById("sidebar-avatar");
    
    const profileDropdownTitle = document.getElementById("profile-dropdown-name");
    const profileDropdownEmail = document.getElementById("profile-dropdown-email");
    const userNameElement = document.getElementById("user-name");

    const headerAvatar = document.querySelector(".profile-trigger-btn .avatar");

    const initial = roleName.charAt(0);
    sidebarAvatar.textContent = initial;
    headerAvatar.textContent = initial;

    sidebarRoleBadge.textContent = permissions.label;
    sidebarRoleBadge.className = `user-role-badge ${permissions.color}`;
    
    userNameElement.textContent = `${roleName} User`;
    profileDropdownTitle.textContent = `${roleName} User`;
    profileDropdownEmail.textContent = `${roleName.toLowerCase().replace(/\s+/g, '')}@qevn.in`;

    ERPUtils.showToast(`Switched active workspace role to ${roleName}.`, "info");

    // Re-render current active view to apply permissions updates
    const activePanel = document.getElementById(`view-${activeView}`);
    if (activePanel) executeViewRenderer(activeView, activePanel);
  };

  // 5. NOTIFICATION CENTER SYSTEM
  const setupNotificationsCenter = () => {
    const listContainer = document.getElementById("notif-list");
    const clearBtn = document.getElementById("clear-notif-btn");
    const badgeDot = document.getElementById("notif-badge-dot");

    const renderNotifications = () => {
      const items = window.ERPState.notifications || [];
      const unreadCount = items.filter(n => !n.read).length;

      // Update dot visibility
      if (unreadCount > 0) {
        badgeDot.classList.remove("hidden");
      } else {
        badgeDot.classList.add("hidden");
      }

      if (items.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state-dropdown">
            <i data-lucide="bell-off"></i>
            <p>All caught up!</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      listContainer.innerHTML = items.map(n => `
        <div class="dropdown-item ${n.read ? 'read' : ''}" data-notif-id="${n.id}">
          <div class="notif-item-icon ${n.type}">
            <i data-lucide="${n.type === 'warning' ? 'alert-triangle' : (n.type === 'success' ? 'check' : 'info')}"></i>
          </div>
          <div class="notif-item-content">
            <div class="notif-item-title" style="${n.read ? 'font-weight: 500; opacity: 0.8;' : 'font-weight: 600;'}">${n.title}</div>
            <div class="notif-item-time">${ERPUtils.formatDateTime(n.time)}</div>
          </div>
        </div>
      `).join("");

      lucide.createIcons();

      // Attach click read list logic
      listContainer.querySelectorAll(".dropdown-item").forEach(item => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = item.getAttribute("data-notif-id");
          markNotifRead(id);
        });
      });
    };

    const markNotifRead = (id) => {
      const items = window.ERPState.notifications || [];
      const notif = items.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        ERPUtils.saveState();
        renderNotifications();
      }
    };

    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.ERPState.notifications = [];
      ERPUtils.saveState();
      renderNotifications();
      ERPUtils.showToast("All notifications cleared.", "info");
    });

    // Populate initially
    renderNotifications();

    // Export notifications renderer so other modules can trigger it
    window.ERPNotifications = {
      refresh: renderNotifications,
      add: (title, type = "info") => {
        const notifs = window.ERPState.notifications || [];
        notifs.unshift({
          id: `notif-${Date.now()}`,
          title: title,
          type: type,
          time: new Date().toISOString(),
          read: false
        });
        ERPUtils.saveState();
        renderNotifications();
      }
    };
  };

  // 6. COMMAND PALETTE GLOBAL SEARCH
  const setupCommandPalette = () => {
    const searchTrigger = document.getElementById("global-search-trigger");
    const modalInput = document.getElementById("command-palette-input");
    const resultsContainer = document.getElementById("command-palette-results");
    
    // Open trigger
    searchTrigger.addEventListener("click", () => {
      ERPUtils.openModal("command-palette-modal");
      setTimeout(() => modalInput.focus(), 150);
      renderPaletteResults("");
    });

    // Ctrl + K listener
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ERPUtils.openModal("command-palette-modal");
        setTimeout(() => modalInput.focus(), 150);
        renderPaletteResults("");
      }
    });

    // Search query listener
    modalInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      renderPaletteResults(query);
    });
    
    // Handle Enter to select
    modalInput.addEventListener("keydown", (e) => {
      const selected = resultsContainer.querySelector(".palette-item.selected");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        navigatePaletteItems(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navigatePaletteItems(-1);
      } else if (e.key === "Enter" && selected) {
        e.preventDefault();
        selected.click();
      }
    });

    const navigatePaletteItems = (direction) => {
      const items = Array.from(resultsContainer.querySelectorAll(".palette-item"));
      if (items.length === 0) return;

      const activeIdx = items.findIndex(item => item.classList.contains("selected"));
      let targetIdx = activeIdx + direction;
      
      if (targetIdx < 0) targetIdx = items.length - 1;
      if (targetIdx >= items.length) targetIdx = 0;

      items.forEach(i => i.classList.remove("selected"));
      items[targetIdx].classList.add("selected");
      items[targetIdx].scrollIntoView({ block: "nearest" });
    };

    const renderPaletteResults = (query) => {
      if (!query) {
        // Show default/quick navigation shortcuts
        resultsContainer.innerHTML = `
          <div class="palette-section-title">Quick Actions</div>
          <div class="palette-item selected" data-action="nav-dashboard">
            <div class="palette-item-left">
              <i data-lucide="layout-dashboard"></i>
              <div class="palette-item-text">
                <span class="palette-item-title">Go to Dashboard</span>
                <span class="palette-item-subtitle">View widgets, weather and performance metrics</span>
              </div>
            </div>
            <kbd class="shortcut-badge">Nav</kbd>
          </div>
          <div class="palette-item" data-action="new-order">
            <div class="palette-item-left">
              <i data-lucide="shopping-cart"></i>
              <div class="palette-item-text">
                <span class="palette-item-title">Create Sales Order</span>
                <span class="palette-item-subtitle">Initiate the sales order creation stepper</span>
              </div>
            </div>
            <kbd class="shortcut-badge">Action</kbd>
          </div>
          <div class="palette-item" data-action="nav-inventory">
            <div class="palette-item-left">
              <i data-lucide="package"></i>
              <div class="palette-item-text">
                <span class="palette-item-title">Check Inventory Status</span>
                <span class="palette-item-subtitle">View warehouse capacity and material reserves</span>
              </div>
            </div>
            <kbd class="shortcut-badge">Nav</kbd>
          </div>
        `;
        lucide.createIcons();
        bindPaletteItemClicks();
        return;
      }

      const orders = window.ERPState.orders || [];
      const customers = window.ERPState.customers || [];
      const products = window.ERPState.products || [];
      const invoices = window.ERPState.invoices || [];

      // Filters
      const matchedOrders = orders.filter(o => o.id.toLowerCase().includes(query) || o.customerName.toLowerCase().includes(query)).slice(0, 3);
      const matchedCusts = customers.filter(c => c.name.toLowerCase().includes(query) || c.contactPerson.toLowerCase().includes(query)).slice(0, 3);
      const matchedProds = products.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)).slice(0, 3);
      const matchedInvs = invoices.filter(i => i.id.toLowerCase().includes(query) || i.customerName.toLowerCase().includes(query)).slice(0, 3);

      let html = "";
      let count = 0;

      if (matchedOrders.length > 0) {
        html += `<div class="palette-section-title">Orders</div>`;
        matchedOrders.forEach(o => {
          html += `
            <div class="palette-item ${count === 0 ? 'selected' : ''}" data-entity="order" data-id="${o.id}">
              <div class="palette-item-left">
                <i data-lucide="shopping-cart"></i>
                <div class="palette-item-text">
                  <span class="palette-item-title">${o.id} — ${o.customerName}</span>
                  <span class="palette-item-subtitle">Total: ${ERPUtils.formatCurrency(o.grandTotal)} | Status: ${o.status}</span>
                </div>
              </div>
              <span class="badge badge-neutral">${o.priority}</span>
            </div>
          `;
          count++;
        });
      }

      if (matchedCusts.length > 0) {
        html += `<div class="palette-section-title">Customers</div>`;
        matchedCusts.forEach(c => {
          html += `
            <div class="palette-item ${count === 0 ? 'selected' : ''}" data-entity="customer" data-id="${c.id}">
              <div class="palette-item-left">
                <i data-lucide="users"></i>
                <div class="palette-item-text">
                  <span class="palette-item-title">${c.name}</span>
                  <span class="palette-item-subtitle">Contact: ${c.contactPerson} | GST: ${c.gstNumber}</span>
                </div>
              </div>
              <span class="badge badge-neutral">${c.id}</span>
            </div>
          `;
          count++;
        });
      }

      if (matchedProds.length > 0) {
        html += `<div class="palette-section-title">Products</div>`;
        matchedProds.forEach(p => {
          html += `
            <div class="palette-item ${count === 0 ? 'selected' : ''}" data-entity="product" data-id="${p.id}">
              <div class="palette-item-left">
                <i data-lucide="box"></i>
                <div class="palette-item-text">
                  <span class="palette-item-title">${p.name}</span>
                  <span class="palette-item-subtitle">SKU: ${p.sku} | Price: ${ERPUtils.formatCurrency(p.price)} | Stock: ${p.stock}</span>
                </div>
              </div>
              <span class="badge badge-neutral">${p.category}</span>
            </div>
          `;
          count++;
        });
      }

      if (matchedInvs.length > 0) {
        html += `<div class="palette-section-title">Invoices</div>`;
        matchedInvs.forEach(i => {
          html += `
            <div class="palette-item ${count === 0 ? 'selected' : ''}" data-entity="invoice" data-id="${i.id}">
              <div class="palette-item-left">
                <i data-lucide="receipt"></i>
                <div class="palette-item-text">
                  <span class="palette-item-title">${i.id} — ${i.customerName}</span>
                  <span class="palette-item-subtitle">Due: ${ERPUtils.formatDate(i.dueDate)} | Balance: ${ERPUtils.formatCurrency(i.outstandingAmount)}</span>
                </div>
              </div>
              <span class="badge badge-neutral">${i.status}</span>
            </div>
          `;
          count++;
        });
      }

      if (count === 0) {
        resultsContainer.innerHTML = `
          <div class="text-center text-muted" style="padding: 30px;">
            <i data-lucide="alert-circle" style="width: 24px; height: 24px; margin-bottom: 6px;"></i>
            <p>No results found for "${query}"</p>
          </div>
        `;
        lucide.createIcons();
      } else {
        resultsContainer.innerHTML = html;
        lucide.createIcons();
        bindPaletteItemClicks();
      }
    };

    const bindPaletteItemClicks = () => {
      resultsContainer.querySelectorAll(".palette-item").forEach(item => {
        item.addEventListener("click", () => {
          // Close command palette first
          ERPUtils.closeModal("command-palette-modal");
          
          const action = item.getAttribute("data-action");
          const entity = item.getAttribute("data-entity");
          const id = item.getAttribute("data-id");

          if (action) {
            if (action === "nav-dashboard") navigateTo("dashboard");
            else if (action === "nav-inventory") navigateTo("inventory");
            else if (action === "new-order") {
              navigateTo("orders");
              setTimeout(() => {
                const addBtn = document.getElementById("add-order-btn");
                if (addBtn) addBtn.click();
              }, 300);
            }
          } else if (entity && id) {
            if (entity === "order") {
              navigateTo("orders");
              setTimeout(() => OrdersModule.showOrderDetails(id), 300);
            } else if (entity === "customer") {
              navigateTo("customers");
              setTimeout(() => CustomersModule.showCustomerDetails(id), 300);
            } else if (entity === "product") {
              navigateTo("products");
              setTimeout(() => ProductsModule.showProductDetails(id), 300);
            } else if (entity === "invoice") {
              navigateTo("billing");
              setTimeout(() => BillingModule.showInvoicePreview(id), 300);
            }
          }
        });
      });
    };
  };

  // 7. THEME MANAGER (Light/Dark toggler)
  const setupThemeToggle = () => {
    // Provide a simple shortcut/setting trigger or profile toggle for theme swaps
    // In our setting view page, we will support theme changes too!
  };

  // 8. SIDEBAR MECHANICS (Desktop toggle & Mobile Drawer)
  const setupMobileSidebar = () => {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebar-toggle-btn");
    const mobileBtn = document.getElementById("mobile-menu-btn");

    // Desktop Collapse
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      // Re-trigger chart layouts to recalculate viewport sizing
      setTimeout(() => {
        if (window.activeChartInstances) {
          Object.values(window.activeChartInstances).forEach(chart => {
            if (chart && typeof chart.resize === "function") chart.resize();
          });
        }
      }, 350);
    });

    // Mobile slide-in
    mobileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.add("mobile-show");
    });

    // Click outside sidebar on mobile closes it
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
          sidebar.classList.remove("mobile-show");
        }
      }
    });
  };

  return {
    init,
    navigateTo,
    getActiveRole: () => activeRole
  };
})();

// Initialize application on script load
window.addEventListener("DOMContentLoaded", () => {
  ERPApp.init();
});
