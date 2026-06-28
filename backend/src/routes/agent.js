const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const upload = require('../middleware/upload');

// Apply auth to all routes in this file
router.use(auth);

const agentOnly = requireRole('agent');

// Stores & Sections
router.get('/agent/stores', agentOnly, agentController.getAssignedStores);
router.get(['/stores/:id/sections', '/agent/stores/:id/sections'], agentOnly, agentController.getSections);

// Compliance Jobs
router.post(['/compliance/jobs', '/agent/compliance/jobs'], agentOnly, upload.single('image'), agentController.createComplianceJob);
router.get(['/compliance/jobs/:id', '/agent/compliance/jobs/:id'], agentOnly, agentController.getComplianceJobStatus);
router.get(['/compliance/results/:jobId', '/agent/compliance/results/:jobId'], agentOnly, agentController.getComplianceResult);

module.exports = router;
