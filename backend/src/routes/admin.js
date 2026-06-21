const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const upload = require('../middleware/upload');

// Apply auth and admin check to all routes in this file
router.use(auth);
router.use(requireRole('admin'));

// Clients
router.get('/clients', adminController.listClients);
router.post('/clients', adminController.createClient);
router.get('/clients/:id/stores', adminController.listStores);
router.post('/clients/:id/stores', adminController.createStore);

// Stores & Sections
router.get('/stores/:id/sections', adminController.listSections);
router.post('/stores/:id/sections', adminController.createSection);

// User Management
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.post('/agent-assignments', adminController.assignAgent);

// Reference Products
router.post('/reference-products', upload.single('image'), adminController.uploadReferenceProduct);
router.get('/reference-products/:id/status', adminController.checkEmbeddingStatus);

// Planograms
router.get('/planograms', adminController.listPlanograms);
router.post('/planograms', adminController.createPlanogram);
router.post('/planograms/:id/cells', adminController.definePlanogramCells);
router.patch('/planograms/:id/activate', adminController.activatePlanogram);

// Flags
router.get('/flags', adminController.listFlags);
router.patch('/flags/:id/resolve', adminController.resolveFlag);

module.exports = router;
