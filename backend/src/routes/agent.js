const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const upload = require('../middleware/upload');

// Apply auth and agent check to all routes in this file
router.use(auth);
router.use(requireRole('agent'));

// Stores & Sections
router.get('/agent/stores', agentController.getAssignedStores);
router.get('/stores/:id/sections', agentController.getSections);

// Compliance Jobs
router.post('/compliance/jobs', upload.single('image'), agentController.createComplianceJob);
router.get('/compliance/jobs/:id', agentController.getComplianceJobStatus);
router.get('/compliance/results/:jobId', agentController.getComplianceResult);

module.exports = router;
