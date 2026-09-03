/* SMART USAGE ALERT - Realistic Dataset Engine (Utilities & Resources Focus) */

const SmartData = {
  // Global Dashboard Metrics & Status Levels (Utilities: Water, Electricity, LPG, Consumables)
  summary: {
    sustainabilityScore: 92, // out of 100
    sustainabilityLevel: 'green', // Efficient
    sustainabilityStatusText: 'Efficient (92/100)',

    dailyWaterLiters: 185,
    targetWaterLiters: 220,
    waterLevel: 'green', // Efficient
    waterStatusText: 'Efficient (185 L)',

    electricityConsumption: 14.2, // kWh today
    livePowerKW: 1.84,
    electricityLevel: 'orange', // High Usage
    electricityStatusText: 'High Usage (14.2 kWh)',

    vampireLoadKW: 0.28,
    vampireLevel: 'orange', // High Usage
    vampireStatusText: 'High Standby (0.28 kW)',

    lpgPercentage: 59,
    lpgWeightKg: 8.4,
    lpgDaysLeft: 14,
    lpgLevel: 'yellow', // Moderate
    lpgStatusText: 'Moderate (59% Full)',

    inventoryLowCount: 2,
    inventoryTotalItems: 5,
    inventoryLevel: 'yellow', // Moderate
    inventoryStatusText: 'Moderate (2 Low Stock)',

    moneySavedMonth: 248.50,
    moneySavedTrend: '+18.4%',
    moneySavedLevel: 'green', // Efficient
    moneySavedStatusText: 'Efficient ($248.50)',

    co2AvoidedKg: 142.5,
    treesEquivalent: 6.4,
    co2Level: 'green', // Efficient
    co2StatusText: 'Efficient (142.5 kg)',

    activeAlertsCount: 2,
    activeAlertsLevel: 'red', // Critical
    activeAlertsStatusText: 'Critical (2 Active Alerts)'
  },

  // AI Waste and Shortage Predictions Engine Data
  predictions: [
    {
      id: 'pred-101',
      category: 'Food & Vegetables',
      categoryKey: 'food',
      icon: 'apple',
      iconColor: 'text-emerald',
      severity: 'warning',
      statusBadge: '🟠 Waste Risk',
      normalUsage: '0.4 kg / week',
      currentUsage: '1.8 kg / week',
      percentIncrease: '+350.0%',
      anomalyDetected: '🟠 Crisper Spoilage Anomaly',
      problem: 'You may waste approximately 1.8 kg of vegetables this week.',
      cause: 'Excess humidity in crisper drawer #2 & 4 items (Spinach, Tomatoes, Bell Peppers) reaching 6 days post-purchase maturity without consumption.',
      action: 'Prepare Zero-Waste Vegetable Meal & Adjust Crisper Humidity',
      actionCode: 'PREVENT_FOOD_WASTE',
      expectedSavings: '$14.20 / Week & 1.8 kg Food Saved',
      confidence: 92
    },
    {
      id: 'pred-102',
      category: 'Electricity',
      categoryKey: 'electricity',
      icon: 'zap',
      iconColor: 'text-amber',
      severity: 'warning',
      statusBadge: '🟠 High Usage Predicted',
      normalUsage: '12.1 kWh / day',
      currentUsage: '14.2 kWh / day',
      percentIncrease: '+17.4%',
      anomalyDetected: '🟠 Standby Power & Peak HVAC Surge',
      problem: 'Your electricity usage is predicted to exceed your normal monthly consumption by 17%.',
      cause: 'Continuous 0.28 kW vampire standby draw from home theater electronics and unoptimized HVAC setpoints during peak tariff hours (3 PM - 7 PM).',
      action: 'Schedule AI Peak Eco-Thermostat Shift & Cut Vampire Standby Load',
      actionCode: 'ECO_POWER_SHIFT',
      expectedSavings: '$28.50 / Month (17% Reduction)',
      confidence: 96
    },
    {
      id: 'pred-103',
      category: 'LPG Gas',
      categoryKey: 'lpg',
      icon: 'flame',
      iconColor: 'text-amber',
      severity: 'moderate',
      statusBadge: '🟡 Depletion Approaching',
      normalUsage: '0.35 kg / day',
      currentUsage: '0.52 kg / day',
      percentIncrease: '+48.6%',
      anomalyDetected: '🟡 Burner Thermal Efficiency Loss',
      problem: 'Your LPG cylinder may last approximately 6 more days.',
      cause: 'Increased daily fuel draw from 0.35 kg to 0.52 kg due to uncalibrated burner ports & open-pan simmering.',
      action: 'Book 1-Click LPG Cylinder Refill & Enable Eco-Thermal Mode',
      actionCode: 'BOOK_LPG_REFILL',
      expectedSavings: '$18.50 Saved & Zero Outage',
      confidence: 98
    },
    {
      id: 'pred-104',
      category: 'Consumables & Oil',
      categoryKey: 'oil',
      icon: 'package',
      iconColor: 'text-purple',
      severity: 'warning',
      statusBadge: '🟠 Shortage Risk',
      normalUsage: '35 ml / day',
      currentUsage: '85 ml / day',
      percentIncrease: '+142.8%',
      anomalyDetected: '🟠 Rapid Stock Depletion',
      problem: 'Cooking oil may run out within 4 days.',
      cause: 'Weekend consumption velocity accelerated to 85 ml/day during family meals, crossing auto-replenishment safety margin.',
      action: 'Trigger Smart Reorder for Cold-Pressed Cooking Oil & HVAC HEPA Filters',
      actionCode: 'REORDER_SUPPLIES',
      expectedSavings: '$6.20 Saved (15% Bulk Discount)',
      confidence: 94
    },
    {
      id: 'pred-105',
      category: 'Water',
      categoryKey: 'water',
      icon: 'droplets',
      iconColor: 'text-cyan',
      severity: 'critical',
      statusBadge: '🔴 Pattern Anomaly',
      normalUsage: '185 L / day',
      currentUsage: '236 L / day',
      percentIncrease: '+27.6%',
      anomalyDetected: '🔴 Micro-Leak Anomaly (Bathroom)',
      problem: 'Water consumption is 28% above your normal household pattern.',
      cause: 'Constant 0.4 L/min micro-flow detected in Master Bathroom toilet flapper valve line during off-peak hours.',
      action: 'Execute 10s Diagnostic Leak Test & Trigger Smart Valve Isolation',
      actionCode: 'ISOLATE_WATER_LEAK',
      expectedSavings: '1,440 Liters Saved ($18.20 / Month)',
      confidence: 97
    }
  ],

  // Urgent Alerts Feed (Water, Gas, Electricity, Consumables)
  alerts: [
    {
      id: 'alt-101',
      severity: 'critical',
      resource: 'LPG Gas',
      icon: 'flame',
      title: 'Sudden Pressure Drop Detected',
      description: 'LPG Valve #1 recorded an irregular pressure reduction. Inspection advised.',
      time: '12 mins ago',
      actionText: 'Diagnose & Cutoff'
    },
    {
      id: 'alt-102',
      severity: 'warning',
      resource: 'Water',
      icon: 'droplets',
      title: 'High Micro-Flow in Master Bathroom',
      description: 'Constant 0.4 L/min flow detected over 3 hours. Possible silent toilet flapper leak.',
      time: '1 hour ago',
      actionText: 'Run Leak Test'
    },
    {
      id: 'alt-103',
      severity: 'info',
      resource: 'Electricity',
      icon: 'zap',
      title: 'Peak Tariff Period Starting in 30 Mins',
      description: 'Electricity rate increases by 2.2x ($0.34/kWh). Consider delaying heavy appliances.',
      time: '3 hours ago',
      actionText: 'Schedule Eco Mode'
    },
    {
      id: 'alt-104',
      severity: 'warning',
      resource: 'Inventory',
      icon: 'package',
      title: 'HVAC HEPA Air Filter Replacement Due',
      description: 'Air filter lifespan at 12%. Reorder recommended for optimal HVAC energy efficiency.',
      time: '5 hours ago',
      actionText: 'Reorder Filter'
    }
  ],

  // Water Usage Breakdown
  waterMetrics: {
    liveFlowRate: 2.4, // Liters per minute
    dailyUsageLiters: 185,
    targetDailyLiters: 220,
    savingsLitersMonth: 1850,
    roomBreakdown: [
      { room: 'Master Bathroom', usage: '82 L', percent: 44, icon: 'bath' },
      { room: 'Kitchen & Sink', usage: '46 L', percent: 25, icon: 'utensils' },
      { room: 'Garden Irrigation', usage: '37 L', percent: 20, icon: 'flower2' },
      { room: 'Laundry & Washing', usage: '20 L', percent: 11, icon: 'shirt' }
    ],
    valves: [
      { id: 'v-1', name: 'Main Water Inlet Valve', status: 'OPEN', location: 'Utility Room' },
      { id: 'v-2', name: 'Garden Sprinkler Line', status: 'CLOSED', location: 'Outdoors' },
      { id: 'v-3', name: 'Water Heater Supply', status: 'OPEN', location: 'Basement' }
    ]
  },

  // Electricity & Energy Hub (All 6 Requested Appliances)
  electricityMetrics: {
    currentDrawKW: 1.84,
    todayKWh: 14.2,
    monthlyCostEst: 84.50,
    peakStatus: 'Off-Peak ($0.14/kWh)',
    vampireLoadKW: 0.28,
    appliances: [
      {
        id: 'app-ac',
        name: 'Central HVAC Air Conditioner (AC)',
        icon: 'wind',
        category: 'Climate Control',
        normalUsage: '0.70 kW',
        currentUsage: '0.95 kW',
        percentIncrease: '+35.7%',
        kw: 0.95,
        anomalyDetected: '⚠️ High Duty Cycle',
        anomalySeverity: 'warning',
        possibleCause: 'Clogged HEPA air filter causing compressor to draw 0.25 kW extra power to maintain setpoint.',
        recommendation: 'Replace HVAC HEPA Filter & Shift Cooling Setpoint +2°F during peak hours.',
        expectedSavings: '$28.50 / Month',
        status: 'High Usage'
      },
      {
        id: 'app-fridge',
        name: 'Double-Door Smart Refrigerator',
        icon: 'refrigerator',
        category: 'Kitchen Appliance',
        normalUsage: '0.12 kW',
        currentUsage: '0.18 kW',
        percentIncrease: '+50.0%',
        kw: 0.18,
        anomalyDetected: '⚠️ Door Seal Thermal Leak',
        anomalySeverity: 'warning',
        possibleCause: 'Worn magnetic gasket seal leaking cold air and forcing continuous compressor operation.',
        recommendation: 'Clean rear condenser coils & align magnetic door seal gasket.',
        expectedSavings: '$8.40 / Month',
        status: 'Warning'
      },
      {
        id: 'app-fan',
        name: 'BLDC Smart Ceiling Fans (3 Units)',
        icon: 'fan',
        category: 'Ventilation',
        normalUsage: '0.06 kW',
        currentUsage: '0.06 kW',
        percentIncrease: '0.0%',
        kw: 0.06,
        anomalyDetected: '🟢 Normal Operation',
        anomalySeverity: 'efficient',
        possibleCause: 'BLDC motor operating at optimal energy-efficient speed 3 with smart timer active.',
        recommendation: 'Maintain BLDC Eco-Mode schedule during evening hours.',
        expectedSavings: 'Optimal Baseline',
        status: 'Efficient'
      },
      {
        id: 'app-wash',
        name: 'Smart Front-Load Washing Machine',
        icon: 'shirt',
        category: 'Laundry Appliance',
        normalUsage: '0.30 kW',
        currentUsage: '0.52 kW',
        percentIncrease: '+73.3%',
        kw: 0.52,
        anomalyDetected: '⚠️ Peak Tariff Operation',
        anomalySeverity: 'warning',
        possibleCause: 'Heavy hot water wash cycle running during peak electricity tariff hours ($0.34/kWh).',
        recommendation: 'Schedule laundry cycles after 9:00 PM for off-peak rates ($0.14/kWh).',
        expectedSavings: '$12.20 / Month',
        status: 'Warning'
      },
      {
        id: 'app-tv',
        name: 'OLED TV & Home Theater System',
        icon: 'tv',
        category: 'Entertainment System',
        normalUsage: '0.05 kW',
        currentUsage: '0.29 kW',
        percentIncrease: '+480.0%',
        kw: 0.29,
        anomalyDetected: '🔴 Vampire Standby Drain',
        anomalySeverity: 'critical',
        possibleCause: 'Fast-startup mode active on gaming console & AV receiver drawing continuous 45W standby.',
        recommendation: 'Cut standby kill switch & disable gaming console fast-resume mode.',
        expectedSavings: '$17.30 / Month',
        status: 'Critical Anomaly'
      },
      {
        id: 'app-heater',
        name: 'Smart Electric Water Heater',
        icon: 'zap',
        category: 'Utility System',
        normalUsage: '0.35 kW',
        currentUsage: '0.42 kW',
        percentIncrease: '+20.0%',
        kw: 0.42,
        anomalyDetected: '⚠️ Thermal Lag / Scaling',
        anomalySeverity: 'warning',
        possibleCause: 'Hard water sediment build-up on heating element causing extended heating cycles.',
        recommendation: 'Flush heating tank & schedule thermostat timer to off-peak morning hours.',
        expectedSavings: '$9.80 / Month',
        status: 'Warning'
      }
    ],
    vampireDevices: [
      { id: 'vp-1', name: 'OLED TV & Soundbar Standby', drawWatts: 45, estMonthlyCost: 4.80, status: 'ACTIVE' },
      { id: 'vp-2', name: 'Gaming Console Fast-Startup Mode', drawWatts: 35, estMonthlyCost: 3.70, status: 'ACTIVE' },
      { id: 'vp-3', name: 'Microwave & Oven Clock Displays', drawWatts: 18, estMonthlyCost: 1.90, status: 'ACTIVE' },
      { id: 'vp-4', name: 'Workstation Quad-Monitors Standby', drawWatts: 65, estMonthlyCost: 6.90, status: 'ACTIVE' }
    ]
  },

  // LPG & Gas Monitor
  lpgMetrics: {
    cylinderWeightKg: 8.4,
    maxCapacityKg: 14.2,
    percentage: 59,
    avgDailyUsageKg: 0.38,
    estDaysRemaining: 14,
    leakStatus: 'NORMAL',
    coLevelPpm: 4,
    orderStatus: 'NONE',
    historicalDays: [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    weightHistory: [14.2, 13.8, 13.4, 13.0, 12.6, 12.2, 11.8, 11.4, 11.0, 10.6, 10.2, 9.8, 9.4, 9.0, 8.8, 8.6, 8.5, 8.4]
  },

  // Smart Shopping Assistant Inventory Dataset (3-Tier Classification)
  shoppingInventory: [
    // 🔴 NEED NOW (Stock < 20%)
    { id: 'shop-1', name: 'Cold-Pressed Extra Virgin Cooking Oil', category: 'Groceries & Pantry', stockPercent: 12, statusGroup: 'need-now', statusBadge: '🔴 Need Now', daysLeft: 4, unit: '1 Liter', price: '$8.50', icon: 'package' },
    { id: 'shop-2', name: 'HVAC HEPA Air Filter Replacement', category: 'Home Maintenance', stockPercent: 12, statusGroup: 'need-now', statusBadge: '🔴 Need Now', daysLeft: 6, unit: '1 Unit', price: '$14.99', icon: 'wind' },
    { id: 'shop-3', name: 'Dishwasher Rinse Aid & Pods', category: 'Cleaning Supplies', stockPercent: 15, statusGroup: 'need-now', statusBadge: '🔴 Need Now', daysLeft: 5, unit: '1 Pack (30 pods)', price: '$9.20', icon: 'droplets' },

    // 🟡 NEED SOON (Stock 20% - 50%)
    { id: 'shop-4', name: 'Eco Concentrated Laundry Pods', category: 'Cleaning Supplies', stockPercent: 32, statusGroup: 'need-soon', statusBadge: '🟡 Need Soon', daysLeft: 12, unit: '1 Container (45 pods)', price: '$12.40', icon: 'shirt' },
    { id: 'shop-5', name: 'LPG Cooking Gas Cylinder Refill', category: 'Fuel & Utility', stockPercent: 45, statusGroup: 'need-soon', statusBadge: '🟡 Need Soon', daysLeft: 14, unit: '14.2 kg Cylinder', price: '$22.00', icon: 'flame' },
    { id: 'shop-6', name: 'Biodegradable Trash Bags', category: 'Household Essentials', stockPercent: 35, statusGroup: 'need-soon', statusBadge: '🟡 Need Soon', daysLeft: 15, unit: 'Roll (50 count)', price: '$6.50', icon: 'package' },

    // 🟢 DON'T BUY YET (Stock > 50% - Prevents Impulse Buying & Waste!)
    { id: 'shop-7', name: 'Organic Aged Basmati Rice', category: 'Pantry Groceries', stockPercent: 88, statusGroup: 'dont-buy', statusBadge: '🟢 Don\'t Buy Yet', daysLeft: 45, unit: '5 kg Bag', price: '$16.00', icon: 'shield-check' },
    { id: 'shop-8', name: 'Iodized Himalayan Pink Salt', category: 'Pantry Groceries', stockPercent: 92, statusGroup: 'dont-buy', statusBadge: '🟢 Don\'t Buy Yet', daysLeft: 90, unit: '1 kg Jar', price: '$3.20', icon: 'shield-check' },
    { id: 'shop-9', name: 'Natural Spring Mineral Water Bottles', category: 'Beverages', stockPercent: 75, statusGroup: 'dont-buy', statusBadge: '🟢 Don\'t Buy Yet', daysLeft: 30, unit: '24 Pack', price: '$7.80', icon: 'shield-check' }
  ],

  // Consumables & Household Inventory
  consumables: [
    { id: 'c-1', name: 'Eco Laundry Pods', level: 22, unit: 'pods', status: 'Normal', velocity: '1.2 / day', daysLeft: 18, reorderPoint: 10 },
    { id: 'c-2', name: 'HEPA Air Filter (HVAC)', level: 12, unit: '% lifespan', status: 'LOW', velocity: '0.5% / day', daysLeft: 6, reorderPoint: 15 },
    { id: 'c-3', name: 'Dishwasher Rinse Aid', level: 15, unit: '% full', status: 'LOW', velocity: '1.5% / day', daysLeft: 5, reorderPoint: 20 },
    { id: 'c-4', name: 'Water Filter Cartridge (RO)', level: 68, unit: '% lifespan', status: 'Good', velocity: '0.3% / day', daysLeft: 45, reorderPoint: 20 },
    { id: 'c-5', name: 'Biodegradable Trash Bags', level: 35, unit: 'bags', status: 'Good', velocity: '1.0 / day', daysLeft: 35, reorderPoint: 10 }
  ],

  // Grok AI Chatbot Prompt Presets & Response Engine (Utilities focus)
  aiKnowledge: {
    presets: [
      "🛒 What items do I need to buy today?",
      "⚡ How can I cut my electricity bill by 25% this month?",
      "🔥 How can I reduce my LPG gas consumption?",
      "💧 Why did my water consumption spike this morning?",
      "💰 Calculate my annual waste savings potential"
    ],
    responses: {
      "🛒 What items do I need to buy today?": `🛒 **Grok Smart Shopping Assistant Audit**:

Here is your real-time inventory classification breakdown:

🔴 **NEED NOW (Action Required Today)**:
1. **Cold-Pressed Cooking Oil** (12% stock left ~ 4 days) — Est: **$8.50**
2. **HVAC HEPA Air Filter Replacement** (12% life ~ 6 days) — Est: **$14.99**
3. **Dishwasher Rinse Aid & Pods** (15% stock left ~ 5 days) — Est: **$9.20**
👉 **Total Need Now Cart**: **$32.69**

🟡 **NEED SOON (Buy in 5–7 Days)**:
- Eco Laundry Pods (32%)
- LPG Cylinder Refill (45%)

🟢 **DON'T BUY YET (Overstocked - Do Not Purchase!)**:
- Basmati Rice (88% full), Himalayan Salt (92%), Bottled Water (75%) — *Prevent impulse buying to save $45/mo!*`,

      "⚡ How can I cut my electricity bill by 25% this month?": `Here is your custom **25% Power Reduction Blueprint** based on your home telemetry:

1. ⚡ **Eliminate Vampire Draw**: Disable standby power on your Home Theater and Gaming PC to instantly save **$17.30/month** (0.28 kW continuous pull).
2. 🌡️ **HVAC Thermostat Shift**: Adjust cooling setpoint from 71°F to 74°F during off-peak hours. Projected savings: **$28.50/month**.
3. 🧺 **Off-Peak Washing Schedule**: Run dishwasher and washing machine strictly after 9:00 PM (Off-Peak rate $0.14 vs Peak $0.34/kWh).
4. 💡 **Total Estimated Monthly Savings**: **$58.40** (A 26.2% reduction in overall power costs).`,

      "How can I reduce my LPG gas consumption?": `🔥 **LPG Gas Efficiency Blueprint**:

1. 🍳 **Match Flame to Pot Size**: Using smaller burners for smaller pots reduces thermal dissipation by up to **18%**.
2. ♨️ **Use Pressure Cookers for Pulses & Stews**: Cuts gas consumption by **40%** compared to open pan boiling.
3. 🧼 **Burner Port Cleaning**: Clogged burner ports cause yellow flames (incomplete combustion). Clean ports yield efficient blue flames (saves ~0.08 kg/day).
4. 💵 **Projected Gas Savings**: Extend cylinder lifespan from 14 days to **22 days**, saving **~$14.50/month**!`,

      "Why did my water consumption spike this morning?": `🔍 **AI Telemetry Water Leak Diagnostic**:

- **Spike Incident**: 08:15 AM - 10:45 AM
- **Flow Pattern**: Constant 0.4 Liters/min micro-stream in **Master Bathroom Line**.
- **Root Cause Analysis**: 89% probability of a sticky flapper valve inside the toilet tank or an unclosed bidet spray valve.
- **Recommended Action**: Run our automated **10-Second Water Leak Diagnostic Test** in the Water section to confirm valve pressure delta!`,

      "Predict my total household utility budget for next month.": `📊 **Predictive Resource Consumption Forecast (Next Month)**:

- ⚡ **Electricity**: $78.20 (-7% vs this month due to cooler seasonal weather)
- 💧 **Water**: $32.40 (-12% with micro-leak resolution)
- 🔥 **LPG Gas**: $18.50 (1 new cylinder replacement expected in ~14 days)
- 📦 **Consumables & Filters**: $16.00 (HEPA filter reorder)
- 💵 **Net Projected Utility Spend**: **$145.10** (Down from $178.60 - total projected savings **$33.50**)`
    }
  },

  // Sustainability & Community Leaderboard
  community: {
    districtName: 'Green Oak Eco-District',
    householdRank: 3,
    totalHouseholds: 124,
    leaderboard: [
      { rank: 1, name: 'The Miller Family (#108)', points: 2840, savings: '$312.00', ecoScore: 98, badge: '🏆 Energy Master' },
      { rank: 2, name: 'Alex Rivera (#204)', points: 2650, savings: '$285.50', ecoScore: 95, badge: '⚡ Solar Wizard' },
      { rank: 3, name: 'Smart Home #104 (You)', points: 2490, savings: '$248.50', ecoScore: 92, badge: '💧 Water Warden' },
      { rank: 4, name: 'Chen Residence (#312)', points: 2310, savings: '$220.00', ecoScore: 89, badge: '🔥 Gas Saver' },
      { rank: 5, name: 'David & Sarah (#102)', points: 2150, savings: '$198.00', ecoScore: 86, badge: '📦 Smart Saver' }
    ],
    marketplace: [
      { id: 'm-1', donor: 'Sarah (#102)', item: 'Unused Smart Energy Plug (Zigbee)', dist: '0.1 miles', status: 'Available' },
      { id: 'm-2', donor: 'Smart Home #104 (You)', item: 'Excess Water Hose Nozzle (Brass)', dist: 'Your Post', status: 'Posted' },
      { id: 'm-3', donor: 'Alex (#204)', item: 'Unused Water Filter Cartridge (RO)', dist: '0.3 miles', status: 'Available' }
    ]
  }
};
