const express = require('express');
const router = express.Router();

const Notification = require('../models/Notification');

router.get('/', async (req, res, next) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
});

router.put('/:id/read', async (req, res, next) => {
    try {
        const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
