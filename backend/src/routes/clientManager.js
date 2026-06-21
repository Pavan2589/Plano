const express = require('express');
const router = express.Router();
const clientManagerController = require('../controllers/clientManagerController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// Apply auth and client_manager check to all routes in this file
router.use(auth);
router.use(requireRole('client_manager'));

// Client Stores & Scoring
router.get('/client/stores', clientManagerController.getClientStores);
router.get('/client/stores/:id/results', clientManagerController.getComplianceHistory);
router.get('/client/stores/:id/scores', clientManagerController.getStoreScoresAndTrends);

// Export Report (PDF/CSV)
router.get('/client/results/:id/export', clientManagerController.exportResult);

module.exports = router;
