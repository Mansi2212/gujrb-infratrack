const express = require('express');
const router = express.Router();
const inspectionsController = require('../controllers/inspections');

router.get('/', inspectionsController.getInspections);
router.post('/', inspectionsController.createInspection);
router.get('/:id', inspectionsController.getInspectionById);

module.exports = router;
