const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['Critical', 'InspectionDue', 'InspectionOverdue', 'MaintenanceRequired', 'DelayedWork', 'Info'],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
        assetRef: { type: String }, // denormalized e.g. BR-GJ-AHM-00452
        workOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder' },
        read: { type: Boolean, default: false },
        isDemo: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
