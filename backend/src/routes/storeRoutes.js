const express = require('express');
const { list, updateThreshold, create, update } = require('../controllers/storeController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();
router.get('/', authenticate, asyncHandler(list));
router.patch('/threshold', authenticate, requireRole('OWNER'), asyncHandler(updateThreshold));
router.post('/', authenticate, requireRole('OWNER'), asyncHandler(create));
router.patch('/:id', authenticate, requireRole('OWNER'), asyncHandler(update));
module.exports = router;
