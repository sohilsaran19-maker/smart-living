/**
 * SMART USAGE ALERT — Authentication API Service & State Manager
 * Connects to REST endpoints (/api/auth/*) with fallback persistence.
 */

const AuthService = {
  API_BASE_URL: '/api/auth',
  STORAGE_KEY_USERS: 'sua_users_db',
  STORAGE_KEY_SESSION: 'sua_active_session',
  STORAGE_KEY_TOKEN: 'sua_auth_token',

  currentUser: null,

  // Seed Default Demo Accounts
  defaultUsers: [
    {
      userId: 'sohil104',
      fullName: 'Sohil Saran',
      email: 'sohil@smartusage.io',
      password: 'Password123!',
      householdSize: 4,
      location: 'Green Oak Eco-District',
      householdName: 'Smart Home #104',
      ecoScore: 92,
      isOnboarded: true,
      registeredAt: '2026-09-01T10:00:00Z',
      telemetry: {
        waterLpd: 185,
        powerKwh: 14.2,
        lpgPercent: 59,
        monthlySaved: 248.50,
        co2AvoidedKg: 142.5
      }
    },
    {
      userId: 'alex204',
      fullName: 'Alex Rivera',
      email: 'alex@smartusage.io',
      password: 'Password123!',
      householdSize: 2,
      location: 'Green Oak Eco-District',
      householdName: 'Smart Home #204',
      ecoScore: 95,
      isOnboarded: true,
      registeredAt: '2026-09-02T12:00:00Z',
      telemetry: {
        waterLpd: 160,
        powerKwh: 11.5,
        lpgPercent: 78,
        monthlySaved: 285.50,
        co2AvoidedKg: 165.0
      }
    }
  ],

  init: function() {
    // Initialize Local Database if empty
    const existingUsers = localStorage.getItem(this.STORAGE_KEY_USERS);
    if (!existingUsers) {
      localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(this.defaultUsers));
    }

    // Check Active Session
    const activeSession = localStorage.getItem(this.STORAGE_KEY_SESSION) || sessionStorage.getItem(this.STORAGE_KEY_SESSION);
    if (activeSession) {
      try {
        this.currentUser = JSON.parse(activeSession);
      } catch (e) {
        this.currentUser = null;
      }
    }
  },

  getUsers: function() {
    try {
      const usersRaw = localStorage.getItem(this.STORAGE_KEY_USERS);
      return usersRaw ? JSON.parse(usersRaw) : [...this.defaultUsers];
    } catch (e) {
      return [...this.defaultUsers];
    }
  },

  saveUsers: function(users) {
    localStorage.setItem(this.STORAGE_KEY_USERS, JSON.stringify(users));
  },

  // 🔍 Check User ID Uniqueness
  checkUserIdAvailability: async function(userId) {
    const cleanId = (userId || '').trim().toLowerCase();
    if (!cleanId) return { available: false, message: 'User ID is required.' };
    if (cleanId.length < 3) return { available: false, message: 'User ID must be at least 3 characters.' };

    try {
      // Attempt Backend API Check
      const response = await fetch(`${this.API_BASE_URL}/check-userid?userId=${encodeURIComponent(cleanId)}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      // Fallback to local store check
    }

    const users = this.getUsers();
    const exists = users.some(u => u.userId.toLowerCase() === cleanId);
    if (exists) {
      return { available: false, message: 'This User ID is already taken. Please choose another one.' };
    }
    return { available: true, message: 'User ID available ✓' };
  },

  // 📝 Register New User (POST /api/auth/register)
  register: async function(userData) {
    const cleanUserId = (userData.userId || '').trim();
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    // Try Backend API First
    try {
      const response = await fetch(`${this.API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        const result = await response.json();
        return { success: true, user: result.user || userData };
      } else {
        const errorData = await response.json();
        if (errorData.message) return { success: false, message: errorData.message };
      }
    } catch (e) {
      // Backend not running, proceed to local service handler
    }

    // Local Fallback Validation
    const users = this.getUsers();
    if (users.some(u => u.userId.toLowerCase() === cleanUserId.toLowerCase())) {
      return { success: false, message: 'This User ID is already taken. Please choose another one.' };
    }
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    // Create New User Record
    const newUser = {
      userId: cleanUserId,
      fullName: userData.fullName.trim(),
      email: cleanEmail,
      password: userData.password,
      householdSize: parseInt(userData.householdSize) || 4,
      location: userData.location || 'Green Oak Eco-District',
      householdName: `Smart Home #${Math.floor(100 + Math.random() * 900)}`,
      ecoScore: 88,
      isOnboarded: false,
      registeredAt: new Date().toISOString(),
      telemetry: {
        waterLpd: 190,
        powerKwh: 15.0,
        lpgPercent: 65,
        monthlySaved: 180.00,
        co2AvoidedKg: 120.0
      }
    };

    users.push(newUser);
    this.saveUsers(users);

    return { success: true, user: newUser, message: 'Account created successfully! Redirecting to login...' };
  },

  // 🔑 Login User (POST /api/auth/login)
  login: async function(userIdOrEmail, password, rememberMe = false) {
    const query = (userIdOrEmail || '').trim().toLowerCase();

    // Try Backend API First
    try {
      const response = await fetch(`${this.API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdOrEmail: query, password, rememberMe })
      });
      if (response.ok) {
        const result = await response.json();
        this.currentUser = result.user;
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(result.user));
        if (result.token) localStorage.setItem(this.STORAGE_KEY_TOKEN, result.token);
        return { success: true, user: result.user };
      } else if (response.status === 401 || response.status === 404) {
        const err = await response.json();
        return { success: false, message: err.message || 'Invalid User ID or password. Please try again.' };
      }
    } catch (e) {
      // Backend offline, fallback to local store lookup
    }

    // Local Fallback Authentication
    const users = this.getUsers();
    const matchedUser = users.find(u => 
      u.userId.toLowerCase() === query || u.email.toLowerCase() === query
    );

    if (!matchedUser) {
      return { success: false, message: 'No account found with these credentials.' };
    }

    if (matchedUser.password !== password) {
      return { success: false, message: 'Invalid User ID or password. Please try again.' };
    }

    // Store Session
    this.currentUser = matchedUser;
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(matchedUser));

    return { success: true, user: matchedUser };
  },

  // 🚪 Logout User (POST /api/auth/logout)
  logout: async function() {
    try {
      await fetch(`${this.API_BASE_URL}/logout`, { method: 'POST' });
    } catch (e) {
      // Ignore offline error
    }

    this.currentUser = null;
    localStorage.removeItem(this.STORAGE_KEY_SESSION);
    sessionStorage.removeItem(this.STORAGE_KEY_SESSION);
    localStorage.removeItem(this.STORAGE_KEY_TOKEN);

    return { success: true };
  },

  // 👤 Get Authenticated User (GET /api/auth/me)
  getMe: async function() {
    if (this.currentUser) return this.currentUser;

    try {
      const response = await fetch(`${this.API_BASE_URL}/me`);
      if (response.ok) {
        const user = await response.json();
        this.currentUser = user;
        return user;
      }
    } catch (e) {
      // Offline fallback
    }

    const activeSession = localStorage.getItem(this.STORAGE_KEY_SESSION) || sessionStorage.getItem(this.STORAGE_KEY_SESSION);
    if (activeSession) {
      try {
        this.currentUser = JSON.parse(activeSession);
        return this.currentUser;
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  isAuthenticated: function() {
    return !!this.currentUser;
  },

  // 🔄 Update Onboarding & Profile State
  completeOnboarding: function(onboardingData) {
    if (!this.currentUser) return;
    this.currentUser.isOnboarded = true;
    if (onboardingData.householdSize) this.currentUser.householdSize = onboardingData.householdSize;
    if (onboardingData.resources) this.currentUser.monitoredResources = onboardingData.resources;

    // Update in users database
    const users = this.getUsers();
    const idx = users.findIndex(u => u.userId === this.currentUser.userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...this.currentUser };
      this.saveUsers(users);
    }

    // Update active session
    if (localStorage.getItem(this.STORAGE_KEY_SESSION)) {
      localStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(this.currentUser));
    } else {
      sessionStorage.setItem(this.STORAGE_KEY_SESSION, JSON.stringify(this.currentUser));
    }
  }
};

// Initialize on script load
AuthService.init();
