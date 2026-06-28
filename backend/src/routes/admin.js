const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const upload = require('../middleware/upload');

// Apply auth to all routes in this file
router.use(auth);

const adminOnly = requireRole('admin');

// Clients
router.get('/clients', adminOnly, adminController.listClients);
router.post('/clients', adminOnly, adminController.createClient);
router.get('/clients/:id/stores', adminOnly, adminController.listStores);
router.post('/clients/:id/stores', adminOnly, adminController.createStore);

// Stores & Sections
// If user is admin, process section listing. Otherwise, fall through to the agent router.
router.get('/stores/:id/sections', (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next('router');
  }
}, adminController.listSections);

router.post('/stores/:id/sections', adminOnly, adminController.createSection);

// User Management
router.get('/users', adminOnly, adminController.listUsers);
router.post('/users', adminOnly, adminController.createUser);
router.post('/agent-assignments', adminOnly, adminController.assignAgent);

// Reference Products
router.post('/reference-products', adminOnly, upload.single('image'), adminController.uploadReferenceProduct);
router.get('/reference-products/:id/status', adminOnly, adminController.checkEmbeddingStatus);

// Planograms
router.get('/planograms', adminOnly, adminController.listPlanograms);
router.post('/planograms', adminOnly, adminController.createPlanogram);
router.post('/planograms/:id/cells', adminOnly, adminController.definePlanogramCells);
router.patch('/planograms/:id/activate', adminOnly, adminController.activatePlanogram);

// Flags
router.get('/flags', adminOnly, adminController.listFlags);
router.patch('/flags/:id/resolve', adminOnly, adminController.resolveFlag);

module.exports = router;
