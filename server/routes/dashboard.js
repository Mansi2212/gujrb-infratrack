const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');

router.get('/stats', dashboardController.getStats);
router.get('/attention', dashboardController.getAttentionRequired);

module.exports = router;
