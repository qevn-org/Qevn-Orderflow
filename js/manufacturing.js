// ==================== MANUFACTURING MODULE ====================

const ManufacturingModule = (() => {
  
  // Seed initial manufacturing queue if empty
  const initQueueIfEmpty = () => {
    if (!window.ERPState.manufacturingQueue) {
      window.ERPState.manufacturingQueue = [];
    }
    
    if (window.ERPState.manufacturingQueue.length === 0) {
      // Find orders with active status (Processing, Quality Check, Approved)
      const targetOrders = window.ERPState.orders.filter(o => ["Approved", "Processing", "Quality Check"].includes(o.status));
      
      targetOrders.slice(0, 10).forEach((o, index) => {
        o.products.forEach(p => {
          let stage = "Processing";
          if (o.status === "Approved") stage = "Waiting";
          else if (o.status === "Quality Check") stage = "Quality Check";

          window.ERPState.manufacturingQueue.push({
            id: `WO-2026-${4000 + index + window.ERPState.manufacturingQueue.length}`,
            orderId: o.id,
            productId: p.productId,
            productName: p.name,
            qty: p.quantity,
            machineId: `mach-${(index % 10) + 1}`,
            workerId: `wrk-${(index % 15) + 1}`,
            stage: stage,
            estimatedCompletion: new Date(Date.now() + 2 * 86400000).toISOString()
          });
        });
      });
      ERPUtils.saveState();
    }
  };

  const render = (container) => {
    initQueueIfEmpty();

    const queue = window.ERPState.manufacturingQueue || [];
    const machines = window.ERPState.machines || [];
    const workers = window.ERPState.workers || [];

    const waitingJobs = queue.filter(j => j.stage === "Waiting");
    const activeJobs = queue.filter(j => j.stage === "Processing");
    const qcJobs = queue.filter(j => j.stage === "Quality Check");
    const finishedJobs = queue.filter(j => j.stage === "Completed");

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Manufacturing Floor & Work Orders</h2>
          <p class="text-muted">Manage work order queues, allocate CNC/SMT assembly lines, delegate technicians, and run quality checks.</p>
        </div>
      </div>

      <!-- WORK ORDER METRIC INDICATORS -->
      <div class="bento-grid mb-6">
        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Jobs Queueing</span>
            <div class="card-stat-icon warning"><i data-lucide="clock"></i></div>
          </div>
          <div class="card-stat-value">${waitingJobs.length} Work Orders</div>
          <div class="card-stat-footer">
            <span class="trend-label">Awaiting machine allocation</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Active Lines</span>
            <div class="card-stat-icon primary"><i data-lucide="cpu"></i></div>
          </div>
          <div class="card-stat-value">${activeJobs.length} Lines Running</div>
          <div class="card-stat-footer">
            <span class="trend-label">Actively assembly components</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">In QC Check</span>
            <div class="card-stat-icon success"><i data-lucide="shield-check"></i></div>
          </div>
          <div class="card-stat-value">${qcJobs.length} Batches</div>
          <div class="card-stat-footer">
            <span class="trend-label">Visual & functional verification</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">QC Outputs Passed</span>
            <div class="card-stat-icon success"><i data-lucide="package"></i></div>
          </div>
          <div class="card-stat-value">${finishedJobs.length} Batches</div>
          <div class="card-stat-footer">
            <span class="trend-label">Transferred to dispatcher</span>
          </div>
        </div>
      </div>

      <!-- INTERACTIVE STAGE GRID VIEW -->
      <div class="grid-cols-4 mb-6">
        
        <!-- COLUMN 1: WAITING -->
        <div class="card" style="padding:16px; background-color:var(--bg-color);">
          <h4 style="font-weight:700; margin-bottom:12px; display:flex; justify-content:space-between;">
            <span>Waiting List</span>
            <span style="font-size:0.75rem; background-color:var(--border-color); padding:1px 6px; border-radius:10px;">${waitingJobs.length}</span>
          </h4>
          <div class="stages-container" style="display:flex; flex-direction:column; gap:12px;">
            ${waitingJobs.map(j => renderJobCard(j, machines, workers)).join("") || `<div class="text-center text-muted" style="padding:30px 0; font-size:0.8rem;">No jobs pending</div>`}
          </div>
        </div>

        <!-- COLUMN 2: PROCESSING -->
        <div class="card" style="padding:16px; background-color:var(--bg-color);">
          <h4 style="font-weight:700; margin-bottom:12px; display:flex; justify-content:space-between;">
            <span>Processing</span>
            <span style="font-size:0.75rem; background-color:var(--primary-light); color:var(--primary); padding:1px 6px; border-radius:10px;">${activeJobs.length}</span>
          </h4>
          <div class="stages-container" style="display:flex; flex-direction:column; gap:12px;">
            ${activeJobs.map(j => renderJobCard(j, machines, workers)).join("") || `<div class="text-center text-muted" style="padding:30px 0; font-size:0.8rem;">Floor is idle</div>`}
          </div>
        </div>

        <!-- COLUMN 3: QC CHECK -->
        <div class="card" style="padding:16px; background-color:var(--bg-color);">
          <h4 style="font-weight:700; margin-bottom:12px; display:flex; justify-content:space-between;">
            <span>Quality Check</span>
            <span style="font-size:0.75rem; background-color:var(--warning-light); color:var(--warning); padding:1px 6px; border-radius:10px;">${qcJobs.length}</span>
          </h4>
          <div class="stages-container" style="display:flex; flex-direction:column; gap:12px;">
            ${qcJobs.map(j => renderJobCard(j, machines, workers)).join("") || `<div class="text-center text-muted" style="padding:30px 0; font-size:0.8rem;">No batches in QC</div>`}
          </div>
        </div>

        <!-- COLUMN 4: COMPLETED / READY -->
        <div class="card" style="padding:16px; background-color:var(--bg-color);">
          <h4 style="font-weight:700; margin-bottom:12px; display:flex; justify-content:space-between;">
            <span>QC Complete</span>
            <span style="font-size:0.75rem; background-color:var(--success-light); color:var(--success); padding:1px 6px; border-radius:10px;">${finishedJobs.length}</span>
          </h4>
          <div class="stages-container" style="display:flex; flex-direction:column; gap:12px;">
            ${finishedJobs.map(j => renderJobCard(j, machines, workers)).join("") || `<div class="text-center text-muted" style="padding:30px 0; font-size:0.8rem;">No finished stock</div>`}
          </div>
        </div>

      </div>
    `;

    lucide.createIcons();
    attachEvents(container);
  };

  const renderJobCard = (job, machines, workers) => {
    const machine = machines.find(m => m.id === job.machineId);
    const worker = workers.find(w => w.id === job.workerId);

    let actionButton = "";
    if (job.stage === "Waiting") {
      actionButton = `<button class="btn btn-primary btn-sm action-start-job" data-job-id="${job.id}" style="width:100%; margin-top:10px; font-size:0.72rem; padding:4px;">Start Production</button>`;
    } else if (job.stage === "Processing") {
      actionButton = `<button class="btn btn-warning btn-sm action-qc-job" data-job-id="${job.id}" style="width:100%; margin-top:10px; font-size:0.72rem; padding:4px;">Route to QC</button>`;
    } else if (job.stage === "Quality Check") {
      actionButton = `<button class="btn btn-success btn-sm action-pass-job" data-job-id="${job.id}" style="width:100%; margin-top:10px; font-size:0.72rem; padding:4px;">Pass QC Check</button>`;
    }

    return `
      <div class="card" style="padding:12px; box-shadow:none; border-radius:12px; border-color:${job.stage === 'Processing' ? 'var(--primary)' : 'var(--border-color)'};">
        <div style="font-size:0.68rem; font-weight:700; color:var(--text-muted); display:flex; justify-content:space-between;">
          <span>${job.id}</span>
          <span>ORD: ${job.orderId}</span>
        </div>
        <h5 style="font-size:0.82rem; font-weight:700; margin-top:4px; line-height:1.2;">${job.productName}</h5>
        <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:4px;">Quantity: <b>${job.qty} units</b></div>
        
        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:8px; border-top:1px dashed var(--border-color); padding-top:6px;">
          <div>Machine: <b>${machine ? machine.name.split(" ")[2] || machine.name : 'None'}</b></div>
          <div style="margin-top:2px;">Operator: <b>${worker ? worker.name : 'None'}</b></div>
        </div>

        ${actionButton}
      </div>
    `;
  };

  const attachEvents = (container) => {
    // Start job clicks
    container.querySelectorAll(".action-start-job").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-job-id");
        transitionJobStage(id, "Processing");
      });
    });

    // Move to QC clicks
    container.querySelectorAll(".action-qc-job").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-job-id");
        transitionJobStage(id, "Quality Check");
      });
    });

    // Pass QC clicks
    container.querySelectorAll(".action-pass-job").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-job-id");
        transitionJobStage(id, "Completed");
      });
    });
  };

  const transitionJobStage = (jobId, targetStage) => {
    const queue = window.ERPState.manufacturingQueue || [];
    const job = queue.find(j => j.id === jobId);
    if (!job) return;

    job.stage = targetStage;

    const order = window.ERPState.orders.find(o => o.id === job.orderId);

    if (targetStage === "Processing") {
      ERPUtils.showToast(`${job.id} production sequence started.`, "success");
      
      // Update machine to Running
      const machine = window.ERPState.machines.find(m => m.id === job.machineId);
      if (machine) machine.status = "Running";

      if (order && order.status !== "Processing") {
        order.status = "Processing";
      }

    } else if (targetStage === "Quality Check") {
      ERPUtils.showToast(`${job.id} routed to inspector.`, "warning");
      
      if (order && order.status !== "Quality Check") {
        // If all work orders for order are in QC, update order status
        const siblingJobs = queue.filter(j => j.orderId === order.id);
        const allQC = siblingJobs.every(j => j.stage === "Quality Check" || j.stage === "Completed");
        if (allQC) order.status = "Quality Check";
      }

    } else if (targetStage === "Completed") {
      ERPUtils.showToast(`${job.id} batch passed inspector. Inbound routing logged.`, "success");
      window.ERPNotifications.add(`QC Complete: ${job.id} (${job.productName})`, "success");

      // Release reserved stock levels and deduct physical stock
      const prod = window.ERPState.products.find(p => p.id === job.productId);
      if (prod) {
        prod.reservedStock = Math.max(0, prod.reservedStock - job.qty);
        prod.stock = Math.max(0, prod.stock - job.qty);
      }

      // Check if ALL work orders for order are Completed
      if (order) {
        const siblings = queue.filter(j => j.orderId === order.id);
        const allFinished = siblings.every(j => j.stage === "Completed");
        if (allFinished) {
          order.status = "Ready to Ship";
          
          // Generate Dispatch task
          if (!window.ERPState.dispatchLogs) window.ERPState.dispatchLogs = [];
          
          const existDispatch = window.ERPState.dispatchLogs.some(d => d.orderId === order.id);
          if (!existDispatch) {
            window.ERPState.dispatchLogs.unshift({
              id: `DSP-2026-${String(window.ERPState.dispatchLogs.length + 1).padStart(4, '0')}`,
              orderId: order.id,
              customerName: order.customerName,
              carrier: "",
              trackingNum: "",
              status: "Pending Dispatch", // Pending Dispatch | Shipped | Delivered
              dispatchDate: "",
              vehicleNum: ""
            });
          }
          window.ERPNotifications.add(`Order ${order.id} is ready for dispatch routing.`, "success");
        }
      }
    }

    ERPUtils.saveState();
    
    // Force re-render of active panel
    const mainViewport = document.getElementById("main-viewport");
    render(mainViewport);
  };

  return {
    render
  };
})();
