const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const AuthController = require('../controllers/authController');
const DashboardController = require('../controllers/dashboardController');
const ResourceController = require('../controllers/resourceController');
const InventoryController = require('../controllers/inventoryController');
const UsageController = require('../controllers/usageController');
const PredictionController = require('../controllers/predictionController');
const ShoppingController = require('../controllers/shoppingController');
const SavingsController = require('../controllers/savingsController');
const SimulatorController = require('../controllers/simulatorController');
const SustainabilityController = require('../controllers/sustainabilityController');
const AssistantController = require('../controllers/assistantController');
const ReceiptController = require('../controllers/receiptController');
const CommunityController = require('../controllers/communityController');
const BenchmarkController = require('../controllers/benchmarkController');
const DemoController = require('../controllers/demoController');

// 🔑 Authentication Routes
router.get('/auth/check-userid', AuthController.checkUserIdAvailability);
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authMiddleware, AuthController.me);

// 📊 Dashboard API
router.get('/dashboard', authMiddleware, DashboardController.getDashboardData);

// ⚡ Resources API
router.get('/resources', authMiddleware, ResourceController.getResources);
router.post('/resources', authMiddleware, ResourceController.createResource);
router.put('/resources/:id', authMiddleware, ResourceController.updateResource);
router.delete('/resources/:id', authMiddleware, ResourceController.deleteResource);

// 🥗 Food Inventory API
router.get('/inventory', authMiddleware, InventoryController.getInventory);
router.post('/inventory', authMiddleware, InventoryController.createInventoryItem);
router.put('/inventory/:id', authMiddleware, InventoryController.updateInventoryItem);
router.delete('/inventory/:id', authMiddleware, InventoryController.deleteInventoryItem);

// 📈 Usage & IoT Ingest API
router.get('/usage', authMiddleware, UsageController.getUsageRecords);
router.get('/usage/:resourceType', authMiddleware, UsageController.getUsageByResourceType);
router.post('/usage', authMiddleware, UsageController.logUsage);
router.post('/iot/usage', authMiddleware, UsageController.handleIotReading);

// 🤖 AI Prediction & Root Cause Analysis API
router.get('/predictions', authMiddleware, PredictionController.getPredictions);
router.get('/analysis/root-cause', authMiddleware, PredictionController.getRootCauseAnalysis);

// 🛒 Smart Shopping Recommendations API
router.get('/shopping/recommendations', authMiddleware, ShoppingController.getRecommendations);

// 💰 Waste-to-Money Savings Calculator API
router.get('/savings', authMiddleware, SavingsController.getSavings);

// 🌐 Digital Household Twin Simulator API
router.post('/simulator', authMiddleware, SimulatorController.runSimulation);

// 🌱 Sustainability Score API
router.get('/sustainability', authMiddleware, SustainabilityController.getSustainabilityScore);

// 💬 AI Assistant Natural Language API
router.post('/assistant', authMiddleware, AssistantController.askAssistant);

// 🧾 Receipt Processing OCR API
router.post('/receipts', authMiddleware, ReceiptController.processReceipt);

// 🤝 Community Surplus Food Sharing API
router.get('/community', authMiddleware, CommunityController.getCommunityShares);
router.post('/community/share', authMiddleware, CommunityController.shareSurplusFood);

// 📊 Household Peer Benchmarking API
router.get('/benchmark', authMiddleware, BenchmarkController.getBenchmark);

// 🚀 Hackathon 12-Step AI Demo Mode API
router.post('/demo/run', authMiddleware, DemoController.runDemoScenario);

module.exports = router;
