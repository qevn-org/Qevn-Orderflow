// ==================== UTILITY HELPERS & STATE SYNC ====================

const ERPUtils = (() => {
  
  // 1. FORMATTERS
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // 2. STATE SYNCHRONIZER
  const STATE_KEY = "orderflow_erp_state";

  const loadState = () => {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Basic check to ensure valid state parsing
        if (parsed && parsed.orders && parsed.customers) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load local storage state, fallback to seed.", e);
    }
    
    // Seed new state and write immediately
    const seeded = DummyDataGenerator.buildInitialState();
    localStorage.setItem(STATE_KEY, JSON.stringify(seeded));
    return seeded;
  };

  const saveState = () => {
    if (window.ERPState) {
      localStorage.setItem(STATE_KEY, JSON.stringify(window.ERPState));
    }
  };

  const updateState = (key, value) => {
    if (window.ERPState && window.ERPState[key] !== undefined) {
      window.ERPState[key] = value;
      saveState();
    }
  };

  // 3. TOAST SYSTEM
  const showToast = (message, type = "success") => {
    const container = document.getElementById("toast-container");
    if (!container) return;

    // Toast Card creation
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    // Icon selection
    let iconName = "check-circle";
    if (type === "error") iconName = "x-circle";
    else if (type === "warning") iconName = "alert-triangle";
    else if (type === "info") iconName = "info";

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close-btn">&times;</button>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Slide in
    setTimeout(() => {
      toast.classList.add("show");
    }, 50);

    // Auto-dismiss duration
    const dismissTimer = setTimeout(() => {
      dismissToast(toast);
    }, 4000);

    // Close button trigger
    toast.querySelector(".toast-close-btn").addEventListener("click", () => {
      clearTimeout(dismissTimer);
      dismissToast(toast);
    });
  };

  const dismissToast = (toast) => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 400); // Wait for transition out
  };

  // 4. MODALS & DIALOGS CONTROLLER
  const activeModals = [];

  const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    const backdrop = document.getElementById("modal-backdrop");
    
    if (!modal) return;

    // Hide scroll on body
    document.body.style.overflow = "hidden";
    
    // Show components
    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");
    
    setTimeout(() => {
      backdrop.style.opacity = "1";
      modal.classList.add("active");
    }, 20);

    activeModals.push(modalId);
    lucide.createIcons(); // Instantiates icons loaded dynamically
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    const backdrop = document.getElementById("modal-backdrop");

    if (!modal) return;

    modal.classList.remove("active");
    
    const idx = activeModals.indexOf(modalId);
    if (idx > -1) activeModals.splice(idx, 1);

    // If no other modals are active, fade backdrop
    if (activeModals.length === 0) {
      backdrop.style.opacity = "0";
      setTimeout(() => {
        backdrop.classList.add("hidden");
        document.body.style.overflow = "";
      }, 300);
    }
    
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 300);
  };

  // Backdrop global dismiss setup
  const initModalEvents = () => {
    const backdrop = document.getElementById("modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        // Clone to prevent mutation warnings
        const modalCopy = [...activeModals];
        modalCopy.forEach(id => closeModal(id));
      });
    }

    // Key board binders
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && activeModals.length > 0) {
        const lastModalId = activeModals[activeModals.length - 1];
        closeModal(lastModalId);
      }
    });
  };

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    loadState,
    saveState,
    updateState,
    showToast,
    openModal,
    closeModal,
    initModalEvents
  };
})();

// Instantiate Global ERPState immediately
window.ERPState = ERPUtils.loadState();
window.addEventListener("DOMContentLoaded", () => {
  ERPUtils.initModalEvents();
});
