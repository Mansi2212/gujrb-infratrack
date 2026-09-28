const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
    {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: 'System' },
        note: { type: String, default: '' },
    },
    { _id: false }
);

const workOrderSchema = new mongoose.Schema(
    {
        workOrderId: { type: String, unique: true, index: true },
        assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
        assetRef: { type: String }, // denormalized e.g. BR-GJ-AHM-00452
        assetName: { type: String, default: '' },
        issue: { type: String, required: true },
        issueCategory: {
            type: String,
            enum: ['Structural', 'Electrical', 'Plumbing', 'Civil', 'Safety', 'Drainage', 'Surface', 'Other'],
            default: 'Civil',
        },
        priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
        recommendedAction: { type: String, default: '' },
        estimatedCost: { type: Number, default: 0 }, // in Lakhs
        actualCost: { type: Number, default: 0 },
        contractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Contractor' },
        contractorName: { type: String, default: '' },
        startDate: { type: Date },
        expectedCompletion: { type: Date },
        completedDate: { type: Date },
        description: { type: String, default: '' },
        status: {
            type: String,
            enum: ['Planned', 'Assigned', 'In Progress', 'Inspection', 'Completed', 'Delayed', 'Cancelled'],
            default: 'Planned',
        },
        statusHistory: [statusHistorySchema],
        isDemo: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Compute Delayed on read: if due date passed and not Completed/Cancelled
workOrderSchema.virtual('computedStatus').get(function () {
    if (['Completed', 'Cancelled'].includes(this.status)) return this.status;
    if (this.expectedCompletion && new Date() > this.expectedCompletion) return 'Delayed';
    return this.status;
});

// Auto-generate WO ID
workOrderSchema.pre('save', async function (next) {
    if (!this.workOrderId) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('WorkOrder').countDocuments();
        this.workOrderId = `WO-${year}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
