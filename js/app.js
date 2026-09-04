/* SMART USAGE ALERT - Core Application Controller (Utilities & Resources Focus) */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Initializing App
  AppController.init();
});

const AppController = {
  activeView: 'dashboard',

  init: function() {
    this.bindNavigation();
    this.bindGlobalControls();
    this.renderWaterValves();
    this.renderVampireLoads();
    this.renderConsumables();
    this.renderShoppingAssistant();
    this.renderPredictions();
    this.renderApplianceTable();
    this.renderCommunityLeaderboard();
    this.renderCommunityMarketplace();
    this.bindAIChat();
    this.bindSavingsCalculator();
    this.updateWasteCalculator();

    // Check Authentication & Route Protection Guard
    if (AuthService.isAuthenticated()) {
      this.updateUserHeader();
      const user = AuthService.currentUser;
      if (!user.isOnboarded) {
        this.navigateTo('/onboarding');
      } else {
        this.navigateTo('/dashboard');
      }
    } else {
      this.navigateTo('/login');
    }
  },

  // Protected Route & View Navigator
  protectedRoutes: ['dashboard', 'water', 'electricity', 'lpg', 'inventory', 'ai', 'predictions', 'sustainability', 'community', 'reports', 'simulator'],

  navigateTo: function(route) {
    let viewTarget = route.replace('/', '').replace('#', '').trim();
    if (!viewTarget) viewTarget = 'dashboard';

    // Route Protection Guard
    const isAuth = AuthService.isAuthenticated();
    if (!isAuth && this.protectedRoutes.includes(viewTarget)) {
      viewTarget = 'login';
      this.showToast('🔐 Authentication required. Redirecting to login...');
    } else if (isAuth && (viewTarget === 'login' || viewTarget === 'register')) {
      const user = AuthService.currentUser;
      viewTarget = user && !user.isOnboarded ? 'onboarding' : 'dashboard';
    }

    this.switchView(viewTarget);
  },

  switchView: function(viewTarget) {
    const isAuth = AuthService.isAuthenticated();
    const isAuthPage = (viewTarget === 'login' || viewTarget === 'register' || viewTarget === 'onboarding');

    // Layout visibility toggle for Auth vs Protected Dashboard views
    const sidebar = document.querySelector('sidebar');
    const headerRight = document.querySelector('.header-right');
    const alertTicker = document.querySelector('.alert-ticker');

    if (isAuthPage) {
      if (sidebar) sidebar.style.display = 'none';
      if (headerRight) headerRight.style.display = 'none';
      if (alertTicker) alertTicker.style.display = 'none';
    } else {
      if (sidebar) sidebar.style.display = 'flex';
      if (headerRight) headerRight.style.display = 'flex';
      if (alertTicker) alertTicker.style.display = 'flex';
    }

    // Active State update on Sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(nav => {
      if (nav.getAttribute('data-view') === viewTarget) {
        nav.classList.add('active');
      } else {
        nav.classList.remove('active');
      }
    });

    // View Visibility update
    const viewSections = document.querySelectorAll('.view-section');
    viewSections.forEach(section => section.classList.remove('active'));

    const targetSection = document.getElementById(`view-${viewTarget}`);
    if (targetSection) {
      targetSection.classList.add('active');
      this.activeView = viewTarget;
      this.renderViewCharts(viewTarget);
      if (isAuth && (viewTarget === 'dashboard' || viewTarget === 'inventory' || viewTarget === 'water' || viewTarget === 'electricity' || viewTarget === 'lpg')) {
        this.fetchBackendTelemetry();
      }
      window.scrollTo(0, 0);
    }

    if (window.lucide) lucide.createIcons();
  },

  // Centralized Backend Telemetry Fetch & Dashboard Update
  fetchBackendTelemetry: async function() {
    try {
      const res = await ApiService.getDashboardData();
      if (res && res.success && res.data) {
        const d = res.data;

        // 1. Sustainability Score
        const scoreEl = document.getElementById('dash-sustainability-score');
        if (scoreEl) scoreEl.innerText = d.sustainability_score || 88;

        // 2. Food Waste Risk Count
        const foodRiskEl = document.getElementById('dash-food-risk-count');
        if (foodRiskEl) foodRiskEl.innerText = `${d.food_waste_risk_count || 0} Risk Items`;

        // 3. Water Consumption
        const waterValEl = document.getElementById('dash-water-val');
        if (waterValEl && d.daily_water_usage) waterValEl.innerText = `${d.daily_water_usage.current} ${d.daily_water_usage.unit}`;

        // 4. Electricity Consumption
        const powerValEl = document.getElementById('dash-power-val');
        if (powerValEl && d.electricity_usage) powerValEl.innerText = `${d.electricity_usage.current} ${d.electricity_usage.unit}`;

        // 5. LPG Status
        const lpgValEl = document.getElementById('dash-lpg-val');
        if (lpgValEl && d.lpg_level) lpgValEl.innerText = `${d.lpg_level.percentage}%`;

        // 8. Money Saved & 9. CO2 Avoided
        const moneyEl = document.getElementById('dash-money-saved');
        if (moneyEl && d.savings) moneyEl.innerText = `Rs. ${d.savings.money_saved}`;

        const co2El = document.getElementById('dash-co2-avoided');
        if (co2El && d.savings) co2El.innerText = `${d.savings.CO2_avoided} kg`;
      }

      // Fetch Inventory for user
      const invRes = await ApiService.getInventory();
      if (invRes && invRes.success && Array.isArray(invRes.data)) {
        this.userInventory = invRes.data;
        this.renderUserInventory(invRes.data);
      }
    } catch (e) {
      console.warn('Dashboard telemetry sync note:', e);
    }
  },

  renderUserInventory: function(items) {
    const container = document.getElementById('inventory-list');
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align:center; padding: 40px;">
          <i data-lucide="info" class="text-cyan" style="width:48px; height:48px; margin-bottom:12px;"></i>
          <h3 style="font-size:1.1rem; color:var(--text-primary);">Start adding your household resources to begin monitoring.</h3>
          <button class="btn btn-primary btn-sm" style="margin-top:14px;" onclick="AppController.loadDemoDataSample()">
            <i data-lucide="database"></i> Load Demo Data
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="glass-card" style="padding: 16px; border: 1px solid var(--border-color);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:700; font-size:0.95rem;">${item.food_name}</div>
          <span class="status-pill ${item.waste_risk === 'High' ? 'lvl-red' : 'lvl-green'}">${item.status}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">
          Quantity: <strong>${item.quantity} ${item.unit}</strong>
        </div>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  },

  loadDemoDataSample: async function() {
    this.showToast('⏳ Seeding demo sample telemetry data via backend...');
    await ApiService.loadDemoData();
    await this.fetchBackendTelemetry();
    this.showToast('✅ Sample telemetry data loaded successfully!');
  },

  // Navigation Logic
  bindNavigation: function() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const viewTarget = item.getAttribute('data-view');
        if (viewTarget) this.navigateTo(viewTarget);
      });
    });

    // Handle Hash Navigation
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash;
      if (hash) this.navigateTo(hash);
    });
  },

  // Chart Rendering for active view
  renderViewCharts: function(view) {
    switch (view) {
      case 'dashboard':
        SmartCharts.initDashboardTrend('dashboardTrendChart');
        break;
      case 'water':
        SmartCharts.initWaterRoomChart('waterRoomChart');
        break;
      case 'electricity':
        SmartCharts.initElectricityChart('electricityApplianceChart');
        break;
      case 'lpg':
        SmartCharts.initLPGDepletionChart('lpgDepletionChart');
        break;
      case 'sustainability':
        SmartCharts.initCarbonRadarChart('carbonRadarChart');
        break;
      case 'reports':
        SmartCharts.initReportsChart('reportsChart');
        break;
    }
  },

  // Render Water Valves
  renderWaterValves: function() {
    const container = document.getElementById('water-valves-list');
    if (!container) return;

    container.innerHTML = SmartData.waterMetrics.valves.map(valve => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 10px;">
        <div>
          <div style="font-weight: 600; font-size: 0.9rem;">${valve.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${valve.location}</div>
        </div>
        <label class="switch">
          <input type="checkbox" ${valve.status === 'OPEN' ? 'checked' : ''} onchange="AppController.toggleValve('${valve.name}', this.checked)">
          <span class="slider"></span>
        </label>
      </div>
    `).join('');
  },

  toggleValve: function(valveName, isChecked) {
    const statusStr = isChecked ? 'OPENED' : 'SHUT OFF (CLOSED)';
    this.showToast(`💧 ${valveName} is now ${statusStr}.`);
  },

  // Water Diagnostic Leak Tester Simulator
  runLeakDiagnostic: function() {
    const btn = document.getElementById('leak-test-btn');
    const resultBox = document.getElementById('leak-test-result');
    if (!btn || !resultBox) return;

    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Running Telemetry Pressure Test (5s)...`;
    if (window.lucide) lucide.createIcons();

    let countdown = 5;
    const interval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Analyzing Line Micro-Flows (${countdown}s)...`;
      } else {
        clearInterval(interval);
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="activity"></i> Run Diagnostic Leak Test`;
        
        resultBox.style.display = 'block';
        resultBox.className = 'glass-card bg-amber-glow';
        resultBox.innerHTML = `
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <i data-lucide="alert-triangle" class="text-amber" style="width:24px; height:24px;"></i>
            <div>
              <div style="font-weight:700; color:var(--accent-amber);">Micro-Leak Detected in Master Bathroom Line</div>
              <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px;">
                Constant pressure drop of 0.04 bar/min observed. Estimated water loss: 24 Liters/day ($3.60/mo).
              </div>
              <button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="AppController.toggleValve('Master Bathroom Line', false)">
                Auto-Shutoff Master Bathroom Valve
              </button>
            </div>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      }
    }, 1000);
  },

  // Render Vampire Load Devices
  renderVampireLoads: function() {
    const container = document.getElementById('vampire-devices-list');
    if (!container) return;

    container.innerHTML = SmartData.electricityMetrics.vampireDevices.map(dev => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 10px;">
        <div>
          <div style="font-weight: 600; font-size: 0.9rem;">${dev.name}</div>
          <div style="font-size: 0.75rem; color: var(--accent-crimson);">${dev.drawWatts}W continuous draw • ~$${dev.estMonthlyCost.toFixed(2)}/mo</div>
        </div>
        <label class="switch">
          <input type="checkbox" ${dev.status === 'ACTIVE' ? 'checked' : ''} onchange="AppController.toggleVampireDevice('${dev.name}', this.checked)">
          <span class="slider"></span>
        </label>
      </div>
    `).join('');
  },

  toggleVampireDevice: function(deviceName, isChecked) {
    if (!isChecked) {
      this.showToast(`⚡ Standby Power Cut off for ${deviceName}. Saved ~$4.80/mo!`);
      if (window.confetti) confetti({ particleCount: 40, spread: 50 });
    } else {
      this.showToast(`⚡ ${deviceName} standby power re-enabled.`);
    }
  },

  // LPG Booking Modal
  bookLPGRefill: function() {
    const modal = document.getElementById('lpg-modal');
    if (modal) modal.classList.add('active');
  },

  closeModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  confirmLPGOrder: function() {
    this.closeModal('lpg-modal');
    SmartData.lpgMetrics.orderStatus = 'CONFIRMED';
    const statusBox = document.getElementById('lpg-order-status');
    if (statusBox) {
      statusBox.innerHTML = `
        <div class="status-pill success"><i data-lucide="check-circle"></i> Refill Cylinder Booked (Est. Tomorrow 10:00 AM)</div>
      `;
    }
    this.showToast(`🔥 Order Placed! Cylinder replacement scheduled for tomorrow.`);
    if (window.confetti) confetti({ particleCount: 80, spread: 70 });
  },

  currentPredictionFilter: 'all',

  filterPredictions: function(category, chipEl) {
    this.currentPredictionFilter = category;
    if (chipEl) {
      const chips = document.querySelectorAll('.prediction-filter-chip');
      chips.forEach(c => c.classList.remove('active'));
      chipEl.classList.add('active');
    }
    this.renderPredictions();
  },

  runAIScan: function() {
    const scanBtn = document.getElementById('run-ai-scan-btn');
    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Scanning 5 IoT Telemetry Feeds...`;
      if (window.lucide) lucide.createIcons();
    }

    setTimeout(() => {
      if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = `<i data-lucide="sparkles"></i> Run Live AI Telemetry Scan`;
      }
      this.renderPredictions();
      this.showToast(`✨ AI Telemetry Scan Completed! All 5 risk models updated.`);
      if (window.confetti) confetti({ particleCount: 50, spread: 60 });
    }, 1200);
  },

  // Render AI Predictions Engine Cards
  renderPredictions: function() {
    const containers = [
      document.getElementById('main-predictions-grid'),
      document.getElementById('dashboard-predictions-grid'),
      document.getElementById('ai-predictions-grid')
    ];

    const filtered = SmartData.predictions.filter(pred => {
      if (!this.currentPredictionFilter || this.currentPredictionFilter === 'all') return true;
      return pred.categoryKey === this.currentPredictionFilter;
    });

    containers.forEach(container => {
      if (!container) return;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="grid-column: 1 / -1; text-align:center; padding: 40px;">
            <i data-lucide="check-circle-2" class="text-emerald" style="width:48px; height:48px; margin-bottom:12px;"></i>
            <h3 style="font-size:1.1rem; color:var(--text-primary);">No Risk Alerts for this Category</h3>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">All monitored telemetry parameters are operating within optimal threshold limits.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(pred => `
        <div class="prediction-card ${pred.severity}" id="card-${pred.id}">
          <div class="prediction-header">
            <div class="prediction-title-group">
              <div class="prediction-icon"><i data-lucide="${pred.icon}" class="${pred.iconColor}"></i></div>
              <div>
                <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">${pred.category} Telemetry</div>
                <span class="status-pill ${pred.severity === 'critical' ? 'lvl-red' : (pred.severity === 'warning' ? 'lvl-orange' : 'lvl-yellow')}">${pred.statusBadge}</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="surge-pill high">${pred.percentIncrease} Surge</span>
              <div class="confidence-badge" title="AI Pattern Recognition Accuracy">
                <i data-lucide="brain-circuit" style="width:14px;"></i> ${pred.confidence}% Confidence
              </div>
            </div>
          </div>

          <div class="problem-statement">
            "${pred.problem}"
          </div>

          <!-- Normal vs Current Telemetry Comparison Bar -->
          <div style="display:flex; gap:12px; background:rgba(255,255,255,0.03); padding:10px 14px; border-radius:10px; border:1px solid var(--border-color); font-size:0.82rem;">
            <div style="flex:1;">
              <div style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; font-weight:700;">Normal Usage</div>
              <div class="mono" style="font-weight:600; color:var(--text-secondary); margin-top:2px;">${pred.normalUsage || 'N/A'}</div>
            </div>
            <div style="flex:1;">
              <div style="color:var(--accent-amber); font-size:0.72rem; text-transform:uppercase; font-weight:700;">Current Usage</div>
              <div class="mono" style="font-weight:700; color:var(--text-primary); margin-top:2px;">${pred.currentUsage || 'N/A'}</div>
            </div>
            <div style="flex:1.2;">
              <div style="color:var(--text-muted); font-size:0.72rem; text-transform:uppercase; font-weight:700;">Anomaly Detected</div>
              <div style="font-weight:700; color:var(--status-orange); font-size:0.78rem; margin-top:2px;">${pred.anomalyDetected || 'Pattern Deviation'}</div>
            </div>
          </div>

          <div class="prediction-details">
            <div class="detail-block">
              <span class="detail-label"><i data-lucide="help-circle" style="width:12px;"></i> Possible Cause</span>
              <span class="detail-text">${pred.cause}</span>
            </div>
            <div class="detail-block">
              <span class="detail-label"><i data-lucide="piggy-bank" style="width:12px;" class="text-emerald"></i> Savings Recommendation</span>
              <span class="detail-text text-emerald" style="font-weight:700;">${pred.expectedSavings}</span>
            </div>
          </div>

          <div class="prediction-footer">
            <div style="font-size:0.8rem; color:var(--text-secondary); display:flex; align-items:center; gap:6px;">
              <i data-lucide="shield-alert" class="text-amber" style="width:14px;"></i> Action: <strong>${pred.action}</strong>
            </div>
            <button class="btn btn-primary btn-sm" onclick="AppController.applyPredictionAction('${pred.id}')">
              <i data-lucide="zap" style="width:14px;"></i> Execute AI Fix
            </button>
          </div>
        </div>
      `).join('');
    });

    if (window.lucide) lucide.createIcons();
  },

  // Render Appliance Telemetry & Anomaly Table (AC, Refrigerator, Fan, Washing Machine, TV, Water Heater)
  renderApplianceTable: function() {
    const container = document.getElementById('appliance-telemetry-table');
    if (!container) return;

    container.innerHTML = SmartData.electricityMetrics.appliances.map(app => `
      <tr id="app-row-${app.id}">
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="kpi-icon" style="width:34px; height:34px; font-size:0.9rem;"><i data-lucide="${app.icon}" class="text-cyan"></i></div>
            <div>
              <div style="font-weight:700; font-size:0.9rem;">${app.name}</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">${app.category}</div>
            </div>
          </div>
        </td>
        <td class="mono" style="color:var(--text-secondary);">${app.normalUsage}</td>
        <td class="mono" style="font-weight:700; color:var(--text-primary);">${app.currentUsage}</td>
        <td>
          <span class="surge-pill ${app.percentIncrease === '0.0%' ? 'normal' : 'high'}">${app.percentIncrease}</span>
        </td>
        <td>
          <span class="status-pill ${app.anomalySeverity === 'critical' ? 'lvl-red' : (app.anomalySeverity === 'warning' ? 'lvl-orange' : 'lvl-green')}">${app.anomalyDetected}</span>
        </td>
        <td style="font-size:0.82rem; color:var(--text-secondary); max-width:230px; line-height:1.3;">${app.possibleCause}</td>
        <td style="font-size:0.82rem; color:var(--accent-emerald); font-weight:600; max-width:210px; line-height:1.3;">
          ${app.recommendation}
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">Est. Savings: ${app.expectedSavings}</div>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="AppController.fixApplianceAnomaly('${app.id}')">
            <i data-lucide="zap" style="width:12px;"></i> Apply Fix
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  fixApplianceAnomaly: function(appId) {
    const app = SmartData.electricityMetrics.appliances.find(a => a.id === appId);
    if (!app) return;

    app.currentUsage = app.normalUsage;
    app.percentIncrease = '0.0%';
    app.anomalyDetected = '🟢 Normal Operation';
    app.anomalySeverity = 'efficient';

    this.renderApplianceTable();
    this.showToast(`⚡ Anomaly resolved for ${app.name}! Usage restored to normal baseline (${app.normalUsage}).`);
    if (window.confetti) confetti({ particleCount: 50, spread: 50 });
  },

  applyPredictionAction: function(predId) {
    const pred = SmartData.predictions.find(p => p.id === predId);
    if (!pred) return;

    if (pred.actionCode === 'PREVENT_FOOD_WASTE') {
      this.showToast(`🥦 Crisper humidity optimized! Saved 1.8 kg vegetables ($14.20).`);
    } else if (pred.actionCode === 'ECO_POWER_SHIFT') {
      this.toggleVampireDevice('Standby Electronics', false);
      this.showToast(`⚡ AI Eco-Power Shift enabled! Saved $28.50/month.`);
    } else if (pred.actionCode === 'BOOK_LPG_REFILL') {
      this.bookLPGRefill();
    } else if (pred.actionCode === 'REORDER_SUPPLIES') {
      this.reorderConsumable('Cooking Oil & HEPA Filters');
    } else if (pred.actionCode === 'ISOLATE_WATER_LEAK') {
      this.runLeakDiagnostic();
    }

    // Visual feedback update on the card
    const cards = document.querySelectorAll(`[id="card-${predId}"]`);
    cards.forEach(card => {
      card.className = 'prediction-card efficient';
      card.style.background = 'rgba(16, 185, 129, 0.08)';
      const problemEl = card.querySelector('.problem-statement');
      if (problemEl) {
        problemEl.innerHTML = `✅ <span class="text-emerald">Prediction Resolved:</span> ${pred.action} Successfully Applied!`;
      }
      const btn = card.querySelector('button');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="check-circle" style="width:14px;"></i> Resolved`;
        btn.className = 'btn btn-secondary btn-sm';
      }
    });

    if (window.lucide) lucide.createIcons();
    if (window.confetti) confetti({ particleCount: 60, spread: 60 });
  },

  // 🛒 Render Smart Shopping Assistant (3-Tier Classification: Need Now, Need Soon, Don't Buy Yet)
  currentShoppingFilter: 'all',

  renderShoppingAssistant: function() {
    const container = document.getElementById('smart-shopping-grid');
    if (!container) return;

    const filtered = SmartData.shoppingInventory.filter(item => {
      if (this.currentShoppingFilter === 'all') return true;
      return item.statusGroup === this.currentShoppingFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align:center; padding: 40px;">
          <i data-lucide="check-circle" class="text-emerald" style="width:48px; height:48px; margin-bottom:12px;"></i>
          <h3 style="font-size:1.1rem;">No Items in this Category</h3>
          <p style="color:var(--text-muted); font-size:0.85rem;">All monitored inventory items are operating within healthy stock limits.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      let badgeClass = 'lvl-green';
      let progressGrad = 'var(--grad-cyan-blue)';
      let borderStyle = '1px solid var(--border-color)';
      let actionBtnHtml = '';

      if (item.statusGroup === 'need-now') {
        badgeClass = 'lvl-red';
        progressGrad = 'var(--grad-crimson)';
        borderStyle = '1px solid rgba(239, 68, 68, 0.4)';
        actionBtnHtml = `
          <button class="btn btn-primary btn-sm" style="width:100%; justify-content:center;" onclick="AppController.reorderShoppingItem('${item.id}')">
            <i data-lucide="shopping-cart" style="width:14px;"></i> Buy Now (${item.price})
          </button>
        `;
      } else if (item.statusGroup === 'need-soon') {
        badgeClass = 'lvl-orange';
        progressGrad = 'var(--grad-orange)';
        actionBtnHtml = `
          <button class="btn btn-secondary btn-sm" style="width:100%; justify-content:center;" onclick="AppController.reorderShoppingItem('${item.id}')">
            <i data-lucide="calendar" style="width:14px;"></i> Schedule Reorder (${item.price})
          </button>
        `;
      } else {
        // don't buy yet
        badgeClass = 'lvl-green';
        progressGrad = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
        actionBtnHtml = `
          <button class="btn btn-secondary btn-sm" style="width:100%; justify-content:center; opacity:0.6; cursor:not-allowed;" disabled>
            <i data-lucide="shield-check" style="width:14px;"></i> Stocked (${item.stockPercent}%) — Do Not Buy
          </button>
        `;
      }

      return `
        <div class="glass-card" style="padding: 18px; border: ${borderStyle};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div class="kpi-icon" style="width:36px; height:36px; font-size:0.9rem;"><i data-lucide="${item.icon}" class="${item.statusGroup === 'need-now' ? 'text-crimson' : (item.statusGroup === 'need-soon' ? 'text-amber' : 'text-emerald')}"></i></div>
              <div>
                <div style="font-weight:700; font-size:0.92rem;">${item.name}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${item.category} • ${item.unit}</div>
              </div>
            </div>
            <span class="status-pill ${badgeClass}">${item.statusBadge}</span>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--text-secondary); margin-bottom:6px;">
            <span>Current Stock: <strong>${item.stockPercent}%</strong></span>
            <span>Estimated Days: <strong>~${item.daysLeft} days</strong></span>
          </div>

          <div class="progress-bar-bg" style="margin-bottom:14px; height:7px;">
            <div class="progress-bar-fill" style="width:${item.stockPercent}%; background: ${progressGrad}; border-radius:4px;"></div>
          </div>

          ${actionBtnHtml}
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  },

  filterShoppingList: function(status, btnElement) {
    this.currentShoppingFilter = status;
    const parent = document.getElementById('shopping-status-filters');
    if (parent) {
      parent.querySelectorAll('.prediction-filter-chip').forEach(c => c.classList.remove('active'));
    }
    if (btnElement) btnElement.classList.add('active');
    this.renderShoppingAssistant();
  },

  reorderShoppingItem: function(itemId) {
    const item = SmartData.shoppingInventory.find(i => i.id === itemId);
    if (!item) return;

    item.stockPercent = 100;
    item.statusGroup = 'dont-buy';
    item.statusBadge = "🟢 Don't Buy Yet";
    item.daysLeft = 60;

    this.renderShoppingAssistant();
    this.showToast(`🛒 Order placed for ${item.name} (${item.price})! Stock restored to 100%.`);
    if (window.confetti) confetti({ particleCount: 50, spread: 50 });
  },

  reorderAllNeedNow: function() {
    const needNowItems = SmartData.shoppingInventory.filter(i => i.statusGroup === 'need-now');
    if (needNowItems.length === 0) {
      this.showToast('✨ All urgent items are already reordered and fully stocked!');
      return;
    }

    needNowItems.forEach(item => {
      item.stockPercent = 100;
      item.statusGroup = 'dont-buy';
      item.statusBadge = "🟢 Don't Buy Yet";
      item.daysLeft = 60;
    });

    this.renderShoppingAssistant();
    this.showToast('🛒 Smart Checkout Complete! Reordered 3 "Need Now" items ($32.69 total). Saved $6.50 in bundled delivery!');
    if (window.confetti) confetti({ particleCount: 80, spread: 70 });
  },

  // 💰 Waste-to-Money Financial Loss Calculator
  updateWasteCalculator: function() {
    const foodVal = parseFloat(document.getElementById('slider-food')?.value || 1.8);
    const powerVal = parseFloat(document.getElementById('slider-power')?.value || 0.28);
    const waterVal = parseFloat(document.getElementById('slider-water')?.value || 180);
    const lpgVal = parseFloat(document.getElementById('slider-lpg')?.value || 1.7);

    // Costs
    const foodCostMo = foodVal * 4 * 1.97; // ~$14.20
    const powerCostMo = powerVal * 720 * 0.0858; // ~$17.30
    const waterCostMo = waterVal * 30 * 0.00337; // ~$18.20
    const lpgCostMo = lpgVal * 10.88; // ~$18.50

    const monthlyTotal = foodCostMo + powerCostMo + waterCostMo + lpgCostMo;
    const annualTotal = monthlyTotal * 12;

    const elFood = document.getElementById('calc-food-val');
    const elPower = document.getElementById('calc-power-val');
    const elWater = document.getElementById('calc-water-val');
    const elLpg = document.getElementById('calc-lpg-val');
    const elMonthly = document.getElementById('calc-monthly-total');
    const elAnnual = document.getElementById('calc-annual-total');
    const elReclaim = document.getElementById('calc-reclaim-amt');

    if (elFood) elFood.innerText = `${foodVal.toFixed(1)} kg/wk ($${foodCostMo.toFixed(2)})`;
    if (elPower) elPower.innerText = `${powerVal.toFixed(2)} kW ($${powerCostMo.toFixed(2)})`;
    if (elWater) elWater.innerText = `${Math.round(waterVal)} L/day ($${waterCostMo.toFixed(2)})`;
    if (elLpg) elLpg.innerText = `${lpgVal.toFixed(1)} kg/mo ($${lpgCostMo.toFixed(2)})`;

    if (elMonthly) elMonthly.innerText = `$${monthlyTotal.toFixed(2)} / mo`;
    if (elAnnual) elAnnual.innerText = `$${annualTotal.toFixed(2)} / yr`;
    if (elReclaim) elReclaim.innerText = `$${monthlyTotal.toFixed(2)} every month`;
  },

  applyCalculatorZeroWastePlan: function() {
    document.getElementById('slider-food').value = 0.2;
    document.getElementById('slider-power').value = 0.05;
    document.getElementById('slider-water').value = 20;
    document.getElementById('slider-lpg').value = 0.3;

    this.updateWasteCalculator();
    this.showToast('✨ AI Zero-Waste Plan Executed! Reduced estimated monthly waste to near zero ($3.40/mo).');
    if (window.confetti) confetti({ particleCount: 90, spread: 80 });
  },

  // 🤖 Grok AI Chat Assistant Engine
  bindAIChat: function() {
    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('ai-chat-send');
    if (!input || !sendBtn) return;

    const sendMessage = async () => {
      const query = input.value.trim();
      if (!query) return;

      this.appendChatMessage(query, 'user');
      input.value = '';

      // Call Backend REST API
      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query, householdId: AuthService.currentUser ? AuthService.currentUser.userId : 'sohil104' })
        });
        if (response.ok) {
          const res = await response.json();
          this.appendChatMessage(res.reply, 'assistant');
          return;
        }
      } catch (e) {
        // Backend offline fallback
      }

      // Offline Fallback
      setTimeout(() => {
        let reply = SmartData.aiKnowledge.responses[query];
        if (!reply) {
          reply = `✨ **Grok AI Resource Strategy**:

I evaluated your request regarding **"${query}"** against your home telemetry.

- ⚡ **Electricity Status**: 11.0 kWh today (37.5% above baseline).
- 💧 **Water Status**: 175 L today (Micro-leak active in Garden Valve).
- 🛒 **Shopping Status**: 3 items in **Need Now** status.

💡 **Grok Actionable Tip**: Resolving your AC duty cycle and running laundry after 9:00 PM will reduce your bill by **₹1,850/month**!`;
        }
        this.appendChatMessage(reply, 'assistant');
      }, 500);
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  },

  sendPresetPrompt: function(text) {
    const input = document.getElementById('ai-chat-input');
    if (input) {
      input.value = text;
      const sendBtn = document.getElementById('ai-chat-send');
      if (sendBtn) sendBtn.click();
    }
  },

  appendChatMessage: function(text, sender) {
    const chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return;

    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}`;
    bubble.innerHTML = text.replace(/\n/g, '<br/>');

    chatContainer.appendChild(bubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  },

  // Savings Calculator
  bindSavingsCalculator: function() {
    const membersInput = document.getElementById('calc-members');
    const budgetInput = document.getElementById('calc-budget');
    if (!membersInput || !budgetInput) return;

    const updateCalc = () => {
      const members = parseInt(membersInput.value) || 3;
      const budget = parseFloat(budgetInput.value) || 250;

      const membersVal = document.getElementById('calc-members-val');
      const budgetVal = document.getElementById('calc-budget-val');
      if (membersVal) membersVal.innerText = members;
      if (budgetVal) budgetVal.innerText = `$${budget}`;

      // Dynamic calculation logic
      const annualSavings = (budget * 0.22 * 12) + (members * 45);
      const co2Kg = (annualSavings * 0.85).toFixed(0);
      const trees = (co2Kg / 22).toFixed(1);

      const savedEl = document.getElementById('calc-saved-val');
      const co2El = document.getElementById('calc-co2-val');
      const treesEl = document.getElementById('calc-trees-val');

      if (savedEl) savedEl.innerText = `$${annualSavings.toFixed(2)}`;
      if (co2El) co2El.innerText = `${co2Kg} kg`;
      if (treesEl) treesEl.innerText = `${trees} Trees`;
    };

    membersInput.addEventListener('input', updateCalc);
    budgetInput.addEventListener('input', updateCalc);
  },

  // Community Renderers
  renderCommunityLeaderboard: function() {
    const container = document.getElementById('community-leaderboard');
    if (!container) return;

    container.innerHTML = SmartData.community.leaderboard.map(item => `
      <tr style="${item.rank === 3 ? 'background: rgba(0, 242, 254, 0.08); font-weight: 600;' : ''}">
        <td><span class="status-pill ${item.rank <= 3 ? 'info' : 'warning'}">#${item.rank}</span></td>
        <td>${item.name}</td>
        <td><span class="status-pill success">${item.badge}</span></td>
        <td class="mono text-emerald">${item.savings}</td>
        <td class="mono">${item.points} pts</td>
      </tr>
    `).join('');
  },

  renderCommunityMarketplace: function() {
    const container = document.getElementById('community-marketplace');
    if (!container) return;

    container.innerHTML = SmartData.community.marketplace.map(m => `
      <div class="glass-card" style="padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div style="font-weight:700; font-size:0.95rem;">${m.item}</div>
          <span class="status-pill info">${m.status}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:12px;">
          Posted by ${m.donor} • ${m.dist} away
        </div>
        <button class="btn btn-secondary btn-sm" style="width:100%; justify-content:center;" onclick="AppController.claimShareItem('${m.item}')">
          <i data-lucide="heart" style="width:14px;"></i> Request Free Item
        </button>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  claimShareItem: function(item) {
    this.showToast(`🤝 Pickup request sent for "${item}"! Neighbor notified.`);
  },

  // Export PDF & CSV Simulation
  exportPDFReport: function() {
    this.showToast(`📄 Generating printable PDF Summary Report...`);
    setTimeout(() => {
      window.print();
    }, 500);
  },

  exportCSVData: function() {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Resource,Consumption,Cost_USD,Savings_USD,Status\n"
      + "2026-09-01,Electricity,14.2 kWh,3.12,0.85,Eco Mode\n"
      + "2026-09-01,Water,185 Liters,1.20,0.40,Normal\n"
      + "2026-09-01,LPG Gas,0.38 kg,0.82,0.20,Normal\n"
      + "2026-09-01,Consumables,HVAC HEPA Filter,16.00,4.50,Good\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Smart_Usage_Alert_Report_Sept_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast(`📥 CSV Household Telemetry Report downloaded successfully!`);
  },

  // Toast Notification Helper
  showToast: function(message) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #0f1627;
        border: 1px solid var(--accent-cyan);
        box-shadow: var(--shadow-glow-cyan);
        color: #fff;
        padding: 14px 22px;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 9999;
        transition: all 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
    }, 3500);
  },

  bindGlobalControls: function() {
    const alertBtn = document.getElementById('alert-ticker-btn');
    if (alertBtn) {
      alertBtn.addEventListener('click', () => {
        const navWater = document.querySelector('[data-view="water"]');
        if (navWater) navWater.click();
      });
    }
  },

  // 🚀 HACKATHON DEMO CONTROLLER ENGINE
  demoState: {
    active: false,
    paused: false,
    currentStepIndex: 0,
    timer: null
  },

  startHackathonDemo: function() {
    this.closeModal('hackathon-finale-modal');
    this.demoState.active = true;
    this.demoState.paused = false;
    this.demoState.currentStepIndex = 0;

    const dock = document.getElementById('hackathon-demo-dock');
    if (dock) dock.classList.add('active');

    this.showToast('🚀 Hackathon AI Demo Started! Simulating real-time IoT resource anomaly detection...');
    this.executeDemoStep(0);
  },

  executeDemoStep: function(index) {
    if (!this.demoState.active) return;
    if (index >= SmartData.hackathonDemoSteps.length) {
      this.finishHackathonDemo();
      return;
    }

    this.demoState.currentStepIndex = index;
    const step = SmartData.hackathonDemoSteps[index];

    // Update Dock UI
    const elBadge = document.getElementById('demo-step-badge');
    const elTitle = document.getElementById('demo-step-title');
    const elSubtitle = document.getElementById('demo-step-subtitle');
    const elStatus = document.getElementById('demo-step-status');
    const elFill = document.getElementById('demo-progress-fill');
    const elLog = document.getElementById('demo-log-text');
    const elPauseBtn = document.getElementById('demo-pause-btn');

    if (elBadge) elBadge.innerText = `STEP ${step.step} / 9`;
    if (elTitle) elTitle.innerText = step.title;
    if (elSubtitle) elSubtitle.innerText = step.subtitle;
    if (elStatus) {
      elStatus.innerText = step.status;
      elStatus.className = `status-pill ${step.status.includes('Baseline') ? 'success' : (step.status.includes('Leak') || step.status.includes('Spoilage') ? 'danger' : 'warning')}`;
    }
    if (elFill) elFill.style.width = `${((step.step) / 9) * 100}%`;
    if (elLog) elLog.innerText = step.log;
    if (elPauseBtn) elPauseBtn.innerHTML = this.demoState.paused ? `<i data-lucide="play"></i> Resume` : `<i data-lucide="pause"></i> Pause`;

    // Navigate to target view
    if (step.view) {
      const navItem = document.querySelector(`.nav-item[data-view="${step.view}"]`);
      if (navItem) navItem.click();
    }

    // Execute Step Specific Telemetry Animations
    if (step.action === 'waterSurge') {
      const waterVal = document.getElementById('water-kpi-val');
      if (waterVal) waterVal.innerHTML = `240.5 <span style="font-size:0.9rem;">L/day (+30%)</span>`;
    } else if (step.action === 'waterAnomaly') {
      this.showToast('⚠️ WATER ANOMALY: Micro-leak stream (0.4 L/min) isolated in Master Bathroom Valve!');
    } else if (step.action === 'powerSurge') {
      const powerVal = document.getElementById('power-kpi-val');
      if (powerVal) powerVal.innerHTML = `19.8 <span style="font-size:0.9rem;">kWh (+39%)</span>`;
    } else if (step.action === 'acDiagnostic') {
      this.showToast('⚡ APPLIANCE DIAGNOSTIC: Central HVAC AC duty cycle exceeded 85% (+38.5% extra power load)!');
    } else if (step.action === 'recipeRecommend') {
      this.renderZeroWasteRecipes();
      this.showToast('🥦 SPOILAGE RISK: 1.8 kg produce approaching expiration. Recipe suggestions ready!');
    } else if (step.action === 'lpgDepletion') {
      const lpgVal = document.getElementById('lpg-kpi-val');
      if (lpgVal) lpgVal.innerHTML = `22% <span style="font-size:0.9rem;">Full (3.2 kg)</span>`;
      this.showToast('🔥 LPG DEPLETION WARNING: Cylinder will run out in ~4 days (Sept 8)!');
    } else if (step.action === 'generateActions') {
      this.showToast('💡 AI OPTIMIZATION: 4 personalized actions generated with $148.50/mo total savings impact!');
    } else if (step.action === 'showFinaleModal') {
      this.finishHackathonDemo();
      return;
    }

    if (window.lucide) lucide.createIcons();

    // Auto schedule next step
    if (this.demoState.timer) clearTimeout(this.demoState.timer);
    if (!this.demoState.paused && step.duration > 0) {
      this.demoState.timer = setTimeout(() => {
        this.nextDemoStep();
      }, step.duration);
    }
  },

  nextDemoStep: function() {
    if (this.demoState.currentStepIndex < SmartData.hackathonDemoSteps.length - 1) {
      this.executeDemoStep(this.demoState.currentStepIndex + 1);
    } else {
      this.finishHackathonDemo();
    }
  },

  prevDemoStep: function() {
    if (this.demoState.currentStepIndex > 0) {
      this.executeDemoStep(this.demoState.currentStepIndex - 1);
    }
  },

  toggleDemoPause: function() {
    this.demoState.paused = !this.demoState.paused;
    if (!this.demoState.paused) {
      this.showToast('▶️ Demo Resumed');
      this.nextDemoStep();
    } else {
      if (this.demoState.timer) clearTimeout(this.demoState.timer);
      this.showToast('⏸️ Demo Paused');
      const elPauseBtn = document.getElementById('demo-pause-btn');
      if (elPauseBtn) elPauseBtn.innerHTML = `<i data-lucide="play"></i> Resume`;
      if (window.lucide) lucide.createIcons();
    }
  },

  stopHackathonDemo: function() {
    this.demoState.active = false;
    if (this.demoState.timer) clearTimeout(this.demoState.timer);
    const dock = document.getElementById('hackathon-demo-dock');
    if (dock) dock.classList.remove('active');
    this.showToast('⏹️ Hackathon AI Demo Stopped');
  },

  finishHackathonDemo: function() {
    if (this.demoState.timer) clearTimeout(this.demoState.timer);
    this.openModal('hackathon-finale-modal');
    if (window.confetti) confetti({ particleCount: 120, spread: 90 });
  },

  renderZeroWasteRecipes: function() {
    const grid = document.getElementById('ai-predictions-grid');
    if (!grid) return;

    const existingCard = document.getElementById('recipe-recommendation-card');
    if (existingCard) return;

    const recipeCard = document.createElement('div');
    recipeCard.id = 'recipe-recommendation-card';
    recipeCard.className = 'glass-card recipe-card-3d';
    recipeCard.style.padding = '20px';
    recipeCard.style.border = '1px solid rgba(16, 185, 129, 0.4)';
    recipeCard.style.gridColumn = '1 / -1';
    recipeCard.style.marginBottom = '20px';

    recipeCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:38px; height:38px; border-radius:10px; background:rgba(16, 185, 129, 0.2); display:flex; align-items:center; justify-content:center; color:var(--accent-emerald); font-size:1.2rem;">🥦</div>
          <div>
            <h3 style="font-size:1.1rem; font-weight:800; color:#fff;">AI Zero-Waste Recipe Recommendations</h3>
            <p style="font-size:0.8rem; color:var(--text-muted);">Prevent 1.8 kg vegetable spoilage before expiration!</p>
          </div>
        </div>
        <span class="status-pill success"><i data-lucide="sparkles" style="width:14px;"></i> AI Recipe Match</span>
      </div>

      <div class="grid-2" style="gap:16px;">
        ${SmartData.recipeRecommendations.map(r => `
          <div style="background:rgba(15, 23, 42, 0.6); border-radius:12px; padding:16px; border:1px solid var(--border-color);">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <strong style="color:var(--accent-emerald); font-size:0.95rem;">${r.title}</strong>
              <span class="mono-badge">${r.cookTime}</span>
            </div>
            <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:10px; line-height:1.4;">${r.description}</p>
            <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">
              ${r.ingredients.map(ing => `<span class="chip" style="font-size:0.72rem; padding:3px 8px;">${ing}</span>`).join('')}
            </div>
            <button class="btn btn-primary btn-sm" style="width:100%; justify-content:center;" onclick="AppController.showToast('👨‍🍳 Recipe Saved to Meal Plan! Prevented 1.2 kg produce waste.')">
              <i data-lucide="book-open" style="width:14px;"></i> View Full Recipe & Cook
            </button>
          </div>
        `).join('')}
      </div>
    `;

    grid.insertBefore(recipeCard, grid.firstChild);
    if (window.lucide) lucide.createIcons();
  },

  // 🔑 AUTHENTICATION & LOGIN FRONTEND CONTROLLER METHODS
  togglePasswordVisibility: function(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btnEl.innerHTML = `<i data-lucide="eye-off" style="width:16px;"></i>`;
    } else {
      input.type = 'password';
      btnEl.innerHTML = `<i data-lucide="eye" style="width:16px;"></i>`;
    }
    if (window.lucide) lucide.createIcons();
  },

  handleLoginSubmit: async function(event) {
    event.preventDefault();
    const userIdInput = document.getElementById('login-userid');
    const passwordInput = document.getElementById('login-password');
    const rememberCheckbox = document.getElementById('login-remember');
    const errorAlert = document.getElementById('login-error-alert');
    const errorMsg = document.getElementById('login-error-msg');
    const submitBtn = document.getElementById('login-submit-btn');

    if (!userIdInput || !passwordInput) return;
    const query = userIdInput.value.trim();
    const password = passwordInput.value;
    const remember = rememberCheckbox ? rememberCheckbox.checked : false;

    if (!query || !password) {
      if (errorAlert) errorAlert.style.display = 'flex';
      if (errorMsg) errorMsg.innerText = 'Please enter both User ID/Email and Password.';
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Authenticating...`;
      if (window.lucide) lucide.createIcons();
    }

    try {
      const res = await AuthService.login(query, password, remember);
      if (res.success) {
        if (errorAlert) errorAlert.style.display = 'none';
        this.updateUserHeader();
        this.showToast(`Welcome back, ${res.user.fullName}!`);

        if (!res.user.isOnboarded) {
          this.navigateTo('/onboarding');
        } else {
          this.navigateTo('/dashboard');
        }
      } else {
        if (errorAlert) errorAlert.style.display = 'flex';
        if (errorMsg) errorMsg.innerText = res.message || 'Invalid User ID or password. Please try again.';
      }
    } catch (err) {
      if (errorAlert) errorAlert.style.display = 'flex';
      if (errorMsg) errorMsg.innerText = 'Unable to connect to SMART USAGE ALERT. Please try again.';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="log-in"></i> Sign In to Smart Home`;
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  // 🔍 User ID Uniqueness Real-Time Validator
  userIdTimer: null,
  validateUserIdDebounced: function() {
    clearTimeout(this.userIdTimer);
    this.userIdTimer = setTimeout(async () => {
      const input = document.getElementById('reg-userid');
      const msgEl = document.getElementById('userid-status-msg');
      if (!input || !msgEl) return;

      const userId = input.value.trim();
      if (!userId) {
        msgEl.innerText = '';
        return;
      }

      msgEl.style.color = 'var(--text-muted)';
      msgEl.innerText = 'Checking availability...';

      const res = await AuthService.checkUserIdAvailability(userId);
      if (res.available) {
        msgEl.style.color = '#10b981';
        msgEl.innerText = 'User ID available ✓';
      } else {
        msgEl.style.color = '#ef4444';
        msgEl.innerText = res.message;
      }
    }, 300);
  },

  // 📊 Live Password Strength Evaluator
  evaluatePasswordStrength: function(pw) {
    const meterFill = document.getElementById('pw-meter-fill');
    const meterLabel = document.getElementById('pw-strength-label');
    const errPassword = document.getElementById('err-password');
    if (!meterFill || !meterLabel) return;

    if (errPassword) errPassword.innerText = '';

    if (!pw) {
      meterFill.style.width = '0%';
      meterLabel.innerText = 'Too Short';
      meterLabel.style.color = 'var(--text-muted)';
      return;
    }

    let score = 0;
    if (pw.length >= 6) score += 1;
    if (pw.length >= 10) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    if (score <= 2) {
      meterFill.style.width = '33%';
      meterFill.style.background = '#ef4444';
      meterLabel.innerText = 'Weak';
      meterLabel.style.color = '#ef4444';
    } else if (score <= 4) {
      meterFill.style.width = '66%';
      meterFill.style.background = '#f59e0b';
      meterLabel.innerText = 'Medium';
      meterLabel.style.color = '#f59e0b';
    } else {
      meterFill.style.width = '100%';
      meterFill.style.background = '#10b981';
      meterLabel.innerText = 'Strong';
      meterLabel.style.color = '#10b981';
    }
  },

  handleRegisterSubmit: async function(event) {
    event.preventDefault();
    const fullNameInput = document.getElementById('reg-fullname');
    const userIdInput = document.getElementById('reg-userid');
    const emailInput = document.getElementById('reg-email');
    const passwordInput = document.getElementById('reg-password');
    const confirmPasswordInput = document.getElementById('reg-confirm-password');
    const householdSelect = document.getElementById('reg-household-size');
    const locationInput = document.getElementById('reg-location');

    const errAlert = document.getElementById('register-error-alert');
    const errMsg = document.getElementById('register-error-msg');
    const successAlert = document.getElementById('register-success-alert');
    const submitBtn = document.getElementById('register-submit-btn');

    if (!fullNameInput || !userIdInput || !emailInput || !passwordInput || !confirmPasswordInput) return;

    const fullName = fullNameInput.value.trim();
    const userId = userIdInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const householdSize = householdSelect ? householdSelect.value : 4;
    const location = locationInput ? locationInput.value.trim() : 'Green Oak Eco-District';

    if (errAlert) errAlert.style.display = 'none';
    if (successAlert) successAlert.style.display = 'none';

    // Validations
    if (!fullName) {
      if (errAlert) errAlert.style.display = 'flex';
      if (errMsg) errMsg.innerText = 'Full Name is required.';
      return;
    }
    if (!userId || userId.length < 3) {
      if (errAlert) errAlert.style.display = 'flex';
      if (errMsg) errMsg.innerText = 'User ID must be at least 3 characters.';
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      if (errAlert) errAlert.style.display = 'flex';
      if (errMsg) errMsg.innerText = 'Please enter a valid email address.';
      return;
    }
    if (!password || password.length < 6) {
      if (errAlert) errAlert.style.display = 'flex';
      if (errMsg) errMsg.innerText = 'Password must be at least 6 characters long.';
      return;
    }
    if (password !== confirmPassword) {
      if (errAlert) errAlert.style.display = 'flex';
      if (errMsg) errMsg.innerText = 'Passwords do not match.';
      return;
    }

    // Check User ID Uniqueness
    const checkRes = await AuthService.checkUserIdAvailability(userId);
    if (!checkRes.available) {
      if (errAlert) errAlert.style.display = 'flex';
      if (errMsg) errMsg.innerText = checkRes.message;
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Creating Account...`;
      if (window.lucide) lucide.createIcons();
    }

    try {
      const res = await AuthService.register({
        fullName,
        userId,
        email,
        password,
        householdSize,
        location
      });

      if (res.success) {
        if (successAlert) successAlert.style.display = 'flex';
        this.showToast('✅ Account created successfully! Redirecting to login...');
        setTimeout(() => {
          this.navigateTo('/login');
          // Autofill login User ID
          const loginId = document.getElementById('login-userid');
          if (loginId) loginId.value = userId;
        }, 1500);
      } else {
        if (errAlert) errAlert.style.display = 'flex';
        if (errMsg) errMsg.innerText = res.message || 'Registration failed. Please try again.';
      }
    } catch (e) {
      if (errAlert) errAlert.style.display = 'flex';
      if (errMsg) errMsg.innerText = 'Unable to connect to SMART USAGE ALERT. Please try again.';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i data-lucide="user-check"></i> Create Account & Proceed`;
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  handleForgotPassword: function() {
    this.showToast('📧 Password Reset: Enter your User ID or Email on login to receive reset instructions.');
  },

  // 🚀 First-Time User Onboarding Wizard Methods
  currentOnboardStep: 1,
  selectedOccupants: 4,

  selectOccupantOption: function(count, element) {
    this.selectedOccupants = count;
    const boxes = document.querySelectorAll('.occupant-chip-box');
    boxes.forEach(box => box.classList.remove('active'));
    if (element) element.classList.add('active');
  },

  useOnboardingDemoDefaults: function() {
    const waterInput = document.getElementById('onboard-water-target');
    const powerInput = document.getElementById('onboard-power-target');
    if (waterInput) waterInput.value = 180;
    if (powerInput) powerInput.value = 450;
    this.showToast('✨ Applied AI Recommended Smart Home baseline defaults!');
  },

  nextOnboardingStep: function() {
    if (this.currentOnboardStep < 4) {
      this.currentOnboardStep++;
      this.updateOnboardingUI();
    } else {
      // Complete Onboarding
      const user = AuthService.currentUser;
      AuthService.completeOnboarding({
        householdSize: this.selectedOccupants,
        resources: ['Food', 'Water', 'Electricity', 'LPG', 'Consumables']
      });
      this.showToast('🎉 Setup Complete! Welcome to your SMART USAGE ALERT Dashboard.');
      this.navigateTo('/dashboard');
    }
  },

  prevOnboardingStep: function() {
    if (this.currentOnboardStep > 1) {
      this.currentOnboardStep--;
      this.updateOnboardingUI();
    }
  },

  updateOnboardingUI: function() {
    const subtitle = document.getElementById('onboarding-step-subtitle');
    const prevBtn = document.getElementById('wiz-prev-btn');
    const nextBtn = document.getElementById('wiz-next-btn');
    const userNameSpan = document.getElementById('onboard-user-name');

    if (userNameSpan && AuthService.currentUser) {
      userNameSpan.innerText = AuthService.currentUser.fullName || 'User';
    }

    if (subtitle) {
      subtitle.innerText = `Step ${this.currentOnboardStep} of 4: ${
        this.currentOnboardStep === 1 ? 'Setup telemetry preferences' :
        this.currentOnboardStep === 2 ? 'Select occupant count' :
        this.currentOnboardStep === 3 ? 'Choose monitored resources' : 'Set consumption targets'
      }`;
    }

    // Stepper indicators
    for (let i = 1; i <= 4; i++) {
      const stepEl = document.getElementById(`wiz-step-${i}`);
      const pageEl = document.getElementById(`wiz-page-${i}`);
      if (stepEl) {
        if (i <= this.currentOnboardStep) stepEl.classList.add('active');
        else stepEl.classList.remove('active');
      }
      if (pageEl) {
        if (i === this.currentOnboardStep) pageEl.classList.add('active');
        else pageEl.classList.remove('active');
      }
    }

    if (prevBtn) {
      prevBtn.style.visibility = this.currentOnboardStep === 1 ? 'hidden' : 'visible';
    }
    if (nextBtn) {
      nextBtn.innerText = this.currentOnboardStep === 4 ? 'Start Monitoring →' : 'Next Step →';
    }
  },

  // 👤 User Profile Dropdown & Header Controller
  toggleProfileDropdown: function() {
    const menu = document.getElementById('profile-dropdown');
    if (menu) menu.classList.toggle('active');
  },

  updateUserHeader: function() {
    const user = AuthService.currentUser;
    if (!user) return;

    const headerName = document.getElementById('header-user-name');
    const headerId = document.getElementById('header-user-id');
    const headerAvatar = document.getElementById('header-user-avatar');

    const dropdownName = document.getElementById('dropdown-user-name');
    const dropdownEmail = document.getElementById('dropdown-user-email');

    const modalAvatar = document.getElementById('modal-avatar');
    const modalName = document.getElementById('modal-user-name');
    const modalId = document.getElementById('modal-user-id-badge');
    const modalEmail = document.getElementById('modal-user-email');
    const modalProperty = document.getElementById('modal-user-property');
    const modalOccupants = document.getElementById('modal-user-occupants');
    const modalLocation = document.getElementById('modal-user-location');

    const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'SU';

    if (headerName) headerName.innerText = `Welcome, ${user.fullName.split(' ')[0]}`;
    if (headerId) headerId.innerText = `User ID: ${user.userId}`;
    if (headerAvatar) headerAvatar.innerText = initials;

    if (dropdownName) dropdownName.innerText = user.fullName;
    if (dropdownEmail) dropdownEmail.innerText = user.email;

    if (modalAvatar) modalAvatar.innerText = initials;
    if (modalName) modalName.innerText = user.fullName;
    if (modalId) modalId.innerText = `User ID: ${user.userId}`;
    if (modalEmail) modalEmail.innerText = user.email;
    if (modalProperty) modalProperty.innerText = user.householdName || 'Smart Home #104';
    if (modalOccupants) modalOccupants.innerText = `${user.householdSize || 4} People`;
    if (modalLocation) modalLocation.innerText = user.location || 'Green Oak Eco-District';
  },

  handleLogout: async function() {
    const menu = document.getElementById('profile-dropdown');
    if (menu) menu.classList.remove('active');
    this.closeModal('user-profile-modal');

    await AuthService.logout();
    this.showToast('🚪 Logged out successfully.');
    this.navigateTo('/login');
  },

  fillDemoCredentials: function(userId, password) {
    const userIdInput = document.getElementById('login-userid');
    const passwordInput = document.getElementById('login-password');
    if (userIdInput) userIdInput.value = userId;
    if (passwordInput) passwordInput.value = password;
    this.showToast(`🔑 Loaded demo credentials for ${userId}! Click 'Sign In' to proceed.`);
  }
};
