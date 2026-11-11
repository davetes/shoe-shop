const express = require('express');
const controller = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();
router.use(authenticate, requireRole('OWNER'));
router.get('/cashiers', asyncHandler(controller.cashiers));
router.post('/cashiers', asyncHandler(controller.create));
router.patch('/cashiers/:id/password', asyncHandler(controller.resetPassword));
module.exports = router;
