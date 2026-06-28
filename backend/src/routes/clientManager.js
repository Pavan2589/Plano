const express = require('express');
const router = express.Router();
const clientManagerController = require('../controllers/clientManagerController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// Apply auth to all routes in this file
router.use(auth);

const clientManagerOnly = requireRole('client_manager');

// Client Stores & Scoring
router.get('/client/stores', clientManagerOnly, clientManagerController.getClientStores);
router.get('/client/stores/:id/results', clientManagerOnly, clientManagerController.getComplianceHistory);
router.get('/client/stores/:id/scores', clientManagerOnly, clientManagerController.getStoreScoresAndTrends);

// Export Report (PDF/CSV)
router.get('/client/results/:id/export', clientManagerOnly, clientManagerController.exportResult);

module.exports = router;
