const express = require('express');
const controller = require('../controllers/salesController');
const { authenticate } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');
const router = express.Router();
router.use(authenticate);
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
module.exports = router;
