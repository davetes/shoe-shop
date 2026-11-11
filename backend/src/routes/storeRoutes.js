const express = require('express');
const { list } = require('../controllers/storeController');
const { authenticate } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/errorHandler');

const router = express.Router();
router.get('/', authenticate, asyncHandler(list));
module.exports = router;
