const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assets');

router.get('/', assetsController.getAssets);
router.post('/', assetsController.createAsset);
router.get('/:id', assetsController.getAssetById);
router.put('/:id', assetsController.updateAsset);
router.delete('/:id', assetsController.deleteAsset);

module.exports = router;
