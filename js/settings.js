// ==================== SETTINGS MODULE ====================

const SettingsModule = (() => {

  const render = (container) => {
    const settings = window.ERPState.settings || {
      companyName: "QEVN Orderflow Global Systems Ltd",
      gstin: "27APXFS4820K1ZX",
      currency: "USD",
      theme: "light",
      address: "740 Silicon Valley Corporate Ave, San Jose, CA 95112"
    };

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>System Configuration & Access Keys</h2>
          <p class="text-muted">Configure company tax identities, set system-wide preferences, and view role credentials permissions checklists.</p>
        </div>
      </div>

      <div class="grid-cols-3 mb-6">
        
        <!-- COMPANY PROFILE CARD -->
        <div class="card span-2" style="padding:20px;">
          <h3 class="mb-6">Corporate Details Profile</h3>
          
          <form id="settings-company-form" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div class="form-group" style="grid-column: span 2;">
              <label for="set-company-name">Registered Company Name</label>
              <input type="text" id="set-company-name" class="form-control" value="${settings.companyName}" required>
            </div>
            <div class="form-group">
              <label for="set-company-gst">Company Tax ID / GSTIN</label>
              <input type="text" id="set-company-gst" class="form-control" value="${settings.gstin}" required>
            </div>
            <div class="form-group">
              <label for="set-company-currency">System Base Currency</label>
              <select id="set-company-currency" class="form-control">
                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($) - United States Dollar</option>
                <option value="INR" ${settings.currency === 'INR' ? 'selected' : ''}>INR (₹) - Indian Rupee</option>
                <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (€) - Euro Currency</option>
              </select>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label for="set-company-address">HQ Mailing Address</label>
              <textarea id="set-company-address" class="form-control" rows="2" required>${settings.address}</textarea>
            </div>
            
            <div style="grid-column: span 2; display:flex; justify-content:flex-end; margin-top:10px;">
              <button type="submit" class="btn btn-primary" id="btn-save-settings">
                <i data-lucide="save"></i> Save Configuration
              </button>
            </div>
          </form>
        </div>

        <!-- THEMING & APP PREFERENCES -->
        <div class="card" style="padding:20px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h3 class="mb-6">Platform Preferences</h3>
            
            <div class="form-group">
              <label>System Color Mode</label>
              <div style="display:flex; gap:10px; margin-top:6px;">
                <button class="btn ${settings.theme === 'light' ? 'btn-primary' : 'btn-secondary'}" id="theme-btn-light" style="flex:1;">
                  <i data-lucide="sun"></i> Light Theme
                </button>
                <button class="btn ${settings.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}" id="theme-btn-dark" style="flex:1;">
                  <i data-lucide="moon"></i> Dark Theme
                </button>
              </div>
            </div>

            <div class="form-group" style="margin-top:20px;">
              <label class="checkbox-container">
                <input type="checkbox" checked id="set-notif-toast">
                <span class="checkmark"></span>
                Show Desktop Toast Popups
              </label>
              <label class="checkbox-container" style="margin-top:12px;">
                <input type="checkbox" checked id="set-notif-sound">
                <span class="checkmark"></span>
                Play Alert Notification Sounds
              </label>
            </div>
          </div>

          <div style="font-size:0.75rem; color:var(--text-muted); border-top:1px solid var(--border-color); padding-top:10px; text-align:center;">
            Platform Version v4.12.0 (Stable Branch)
          </div>
        </div>

      </div>

      <!-- SECURITY ROLES & CREDENTIALS CHECKLIST -->
      <div class="card mb-6">
        <h3 class="mb-6">Security Access Keys & Roles Permissions Matrix</h3>
        <div class="table-container" style="border:none; box-shadow:none; margin-bottom:0;">
          <table class="custom-table" style="font-size:0.8rem;">
            <thead>
              <tr>
                <th>Security Role Label</th>
                <th>Dashboard Metrics</th>
                <th>Invoices Operations</th>
                <th>Warehouse Logs</th>
                <th>System Configs</th>
                <th>Perm Badge</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Owner User / System Creator</b></td>
                <td>✓ Read/Write</td>
                <td>✓ Read/Write</td>
                <td>✓ Read/Write</td>
                <td>✓ Full Access</td>
                <td><span class="badge badge-primary">Owner</span></td>
              </tr>
              <tr>
                <td><b>Executive Administrator</b></td>
                <td>✓ Read/Write</td>
                <td>✓ Read/Write</td>
                <td>✓ Read/Write</td>
                <td>✓ Full Access</td>
                <td><span class="badge badge-neutral">Admin</span></td>
              </tr>
              <tr>
                <td><b>Corporate Sales Manager</b></td>
                <td>✓ Read/Write</td>
                <td>✓ Read Only</td>
                <td>✗ Denied</td>
                <td>✗ Denied</td>
                <td><span class="badge badge-success">Sales Manager</span></td>
              </tr>
              <tr>
                <td><b>Factory Floor Manager</b></td>
                <td>✓ Read Only</td>
                <td>✗ Denied</td>
                <td>✓ Read/Write</td>
                <td>✗ Denied</td>
                <td><span class="badge badge-warning">Factory Mgr</span></td>
              </tr>
              <tr>
                <td><b>General Accountant</b></td>
                <td>✓ Read Only</td>
                <td>✓ Read/Write</td>
                <td>✗ Denied</td>
                <td>✗ Denied</td>
                <td><span class="badge badge-neutral">Accountant</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    lucide.createIcons();
    attachEvents(container);
  };

  const attachEvents = (container) => {
    // Save details form handler
    document.getElementById("settings-company-form").addEventListener("submit", (e) => {
      e.preventDefault();
      
      const comp = document.getElementById("set-company-name").value.trim();
      const gst = document.getElementById("set-company-gst").value.trim().toUpperCase();
      const cur = document.getElementById("set-company-currency").value;
      const addr = document.getElementById("set-company-address").value.trim();

      window.ERPState.settings = {
        companyName: comp,
        gstin: gst,
        currency: cur,
        theme: window.ERPState.settings.theme || "light",
        address: addr
      };

      window.ERPNotifications.add("System Configuration profile values updated", "info");
      ERPUtils.saveState();
      
      ERPUtils.showToast("Configuration profile saved successfully.", "success");
    });

    // Theme togglers
    const lightBtn = document.getElementById("theme-btn-light");
    const darkBtn = document.getElementById("theme-btn-dark");

    lightBtn.addEventListener("click", () => {
      setThemeMode("light");
      lightBtn.className = "btn btn-primary";
      darkBtn.className = "btn btn-secondary";
    });

    darkBtn.addEventListener("click", () => {
      setThemeMode("dark");
      lightBtn.className = "btn btn-secondary";
      darkBtn.className = "btn btn-primary";
    });
  };

  const setThemeMode = (mode) => {
    document.documentElement.setAttribute("data-theme", mode);
    window.ERPState.settings.theme = mode;
    
    // Save configuration
    ERPUtils.saveState();
    ERPUtils.showToast(`Swapped active system theme to ${mode} mode.`, "info");
  };

  return {
    render
  };
})();
