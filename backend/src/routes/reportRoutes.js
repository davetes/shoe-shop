const express = require('express');
const { getDashboard } = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { asyncHandler } = require('../utils/errorHandler');
const router = express.Router();
router.get('/dashboard', authenticate, requireRole('OWNER'), asyncHandler(getDashboard));
module.exports = router;
