const express = require('express');
const router = express.Router();
const Contractor = require('../models/Contractor');

router.get('/', async (req, res, next) => {
    try {
        const contractors = await Contractor.find({ isActive: true }).sort({ name: 1 });
        res.json(contractors);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
