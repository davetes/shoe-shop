const express = require('express');
const controller = require('../controllers/productController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();
router.use(authenticate);
router.get('/', asyncHandler(controller.list));
router.post('/', requireRole('OWNER'), asyncHandler(controller.create));
module.exports = router;
