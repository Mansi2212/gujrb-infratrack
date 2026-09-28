const express = require('express');
const router = express.Router();
const workOrdersController = require('../controllers/workOrders');

router.get('/', workOrdersController.getWorkOrders);
router.post('/', workOrdersController.createWorkOrder);
router.get('/:id', workOrdersController.getWorkOrderById);
router.put('/:id', workOrdersController.updateWorkOrder);

module.exports = router;
