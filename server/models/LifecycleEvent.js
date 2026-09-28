const mongoose = require('mongoose');

const lifecycleEventSchema = new mongoose.Schema(
    {
        assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
        assetRef: { type: String }, // e.g. BR-GJ-AHM-00452
        eventType: {
            type: String,
            enum: [
                'Created', 'Constructed', 'Commissioned', 'Inspected',
                'Maintained', 'Repaired', 'Rehabilitated', 'Renovated',
                'Transferred', 'Temporarily Closed', 'Reopened', 'Decommissioned',
                'Work Order Created', 'Work Order Completed', 'Status Changed',
            ],
            required: true,
        },
        date: { type: Date, required: true, default: Date.now },
        description: { type: String, required: true },
        performedBy: { type: String, default: 'System' },
        cost: { type: Number, default: 0 }, // in Lakhs
        documents: [{ type: String }], // metadata only
        isDemo: { type: Boolean, default: false },
    },
    { timestamps: true }
);

lifecycleEventSchema.index({ assetId: 1, date: -1 });

module.exports = mongoose.model('LifecycleEvent', lifecycleEventSchema);
