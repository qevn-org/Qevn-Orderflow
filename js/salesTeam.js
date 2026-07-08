// ==================== SALES TEAM MODULE ====================

const SalesTeamModule = (() => {

  const render = (container) => {
    const executives = window.ERPState.salespersons || [];
    
    // Sort executives by sales performance to find the leaderboard order
    const sortedLeaderboard = [...executives].sort((a, b) => b.monthlySales - a.monthlySales);
    
    const topPerformer = sortedLeaderboard[0];
    const totalVisits = executives.reduce((sum, e) => sum + e.todayVisits, 0);
    const totalCommissions = executives.reduce((sum, e) => sum + e.commission, 0);

    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2>Sales Team Operations</h2>
          <p class="text-muted">Track executive location checkpoints, monthly metrics targets, commission allocations, and leaderboards.</p>
        </div>
      </div>

      <!-- HIGHLIGHTS WIDGET ROW -->
      <div class="bento-grid mb-6">
        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Monthly MVP Leader</span>
            <div class="card-stat-icon success"><i data-lucide="award"></i></div>
          </div>
          <div class="card-stat-value" style="font-size: 1.5rem;">${topPerformer ? topPerformer.name : "N/A"}</div>
          <div class="card-stat-footer">
            <span class="trend-label">Sales: <b>${ERPUtils.formatCurrency(topPerformer ? topPerformer.monthlySales : 0)}</b></span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Today's Visits Logs</span>
            <div class="card-stat-icon primary"><i data-lucide="map-pin"></i></div>
          </div>
          <div class="card-stat-value">${totalVisits} Checkpoints</div>
          <div class="card-stat-footer">
            <span class="trend-label">Allocated across corporate parks</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Accrued Commissions</span>
            <div class="card-stat-icon warning"><i data-lucide="banknote"></i></div>
          </div>
          <div class="card-stat-value" style="font-size: 1.5rem;">${ERPUtils.formatCurrency(totalCommissions)}</div>
          <div class="card-stat-footer">
            <span class="trend-label">Paid at month end (4% average)</span>
          </div>
        </div>

        <div class="card card-stat">
          <div class="card-stat-header">
            <span class="card-stat-title">Active Duty Roster</span>
            <div class="card-stat-icon success"><i data-lucide="users"></i></div>
          </div>
          <div class="card-stat-value">
            ${executives.filter(e => e.attendance === 'Present').length} / ${executives.length}
          </div>
          <div class="card-stat-footer">
            <span class="trend-label">Staff present in region</span>
          </div>
        </div>
      </div>

      <div class="grid-cols-3 mb-6">
        <!-- LEADERBOARD TABLE -->
        <div class="card span-2" style="padding: 20px;">
          <h3 class="mb-6">Performance Leaderboard</h3>
          <div class="table-container" style="box-shadow:none; border:none; margin-bottom:0;">
            <table class="custom-table" style="font-size: 0.82rem;">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Executive Name</th>
                  <th>Monthly Sales</th>
                  <th>Monthly Quota</th>
                  <th>Target Achieved</th>
                  <th>Accrued Commission</th>
                </tr>
              </thead>
              <tbody>
                ${sortedLeaderboard.map((e, index) => {
                  let rankBadge = `<span style="font-weight:700;">#${index + 1}</span>`;
                  if (index === 0) rankBadge = `<span class="badge badge-warning" style="padding: 2px 6px;">🥇 MVP</span>`;
                  else if (index === 1) rankBadge = `<span class="badge badge-neutral" style="padding: 2px 6px;">🥈 Rank 2</span>`;
                  
                  return `
                    <tr>
                      <td>${rankBadge}</td>
                      <td style="font-weight:600;">${e.name}</td>
                      <td style="font-weight:600;">${ERPUtils.formatCurrency(e.monthlySales)}</td>
                      <td>${ERPUtils.formatCurrency(e.monthlyTarget)}</td>
                      <td>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <span style="font-weight:700; color:${e.targetAchievement >= 100 ? 'var(--success)' : 'inherit'};">${e.targetAchievement}%</span>
                          <div style="flex:1; height:4px; width:40px; background-color:var(--border-color); border-radius:2px; overflow:hidden;">
                            <div style="width:${Math.min(e.targetAchievement, 100)}%; height:100%; background-color:${e.targetAchievement >= 100 ? 'var(--success)' : (e.targetAchievement >= 85 ? 'var(--warning)' : 'var(--primary)')};"></div>
                          </div>
                        </div>
                      </td>
                      <td>${ERPUtils.formatCurrency(e.commission)}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- LIVE RADAR FEED / GPS STATUSES -->
        <div class="card" style="padding: 20px;">
          <h3 class="mb-6">Live GPS Duty Status</h3>
          <div style="display:flex; flex-direction:column; gap:12px; max-height:330px; overflow-y:auto; padding-right:4px;">
            ${executives.map(e => {
              const statusDot = e.attendance === 'Present' ? 
                `<span class="badge badge-success" style="font-size:0.65rem; padding:1px 6px;">On Duty</span>` : 
                `<span class="badge badge-neutral" style="font-size:0.65rem; padding:1px 6px;">Absent</span>`;

              const gps = e.gpsStatus === 'Active' ? 
                `<span style="color:var(--success); font-size:0.75rem; display:flex; align-items:center; gap:3px;"><i data-lucide="radio" style="width:12px; height:12px;"></i> Active Ping</span>` : 
                `<span style="color:var(--text-muted); font-size:0.75rem; display:flex; align-items:center; gap:3px;"><i data-lucide="radio-off" style="width:12px; height:12px;"></i> Offline</span>`;

              return `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
                  <div>
                    <div style="font-weight:600; font-size:0.85rem;">${e.name}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted); display:flex; gap:6px; margin-top:2px;">
                      <span>Visits today: <b>${e.todayVisits}</b></span>
                      <span>•</span>
                      <span>Assigned client count: <b>${e.assignedCustomersCount}</b></span>
                    </div>
                  </div>
                  <div style="text-align:right; display:flex; flex-direction:column; gap:3px; align-items:flex-end;">
                    ${statusDot}
                    ${gps}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;

    lucide.createIcons();
  };

  return {
    render
  };
})();
