const mongoose = require('mongoose');

const defectSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: [
                'Crack', 'Corrosion', 'Surface deterioration', 'Pothole',
                'Drainage issue', 'Structural damage', 'Water leakage',
                'Electrical issue', 'Fire safety issue', 'Other',
            ],
        },
        severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
        description: { type: String, default: '' },
    },
    { _id: false }
);

const photoMetaSchema = new mongoose.Schema(
    {
        filename: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const inspectionSchema = new mongoose.Schema(
    {
        inspectionId: { type: String, unique: true, index: true },
        assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
        assetRef: { type: String }, // denormalized asset assetId string e.g. BR-GJ-AHM-00452
        inspector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        inspectorName: { type: String, default: 'Demo Inspector' },
        inspectionDate: { type: Date, required: true },
        type: {
            type: String,
            enum: ['Routine', 'Structural', 'Safety', 'Post-event', 'Emergency'],
            default: 'Routine',
        },
        physicalRating: { type: Number, min: 1, max: 5, required: true },
        safetyRating: { type: Number, min: 1, max: 5, required: true },
        defects: [defectSchema],
        overallSeverity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical', 'None'], default: 'None' },
        remarks: { type: String, default: '' },
        recommendedAction: {
            type: String,
            enum: [
                'No action', 'Routine maintenance', 'Preventive maintenance',
                'Repair', 'Major rehabilitation', 'Detailed structural inspection', 'Emergency intervention',
            ],
            default: 'No action',
        },
        photos: [photoMetaSchema],
        conditionBefore: {
            score: Number,
            status: String,
        },
        conditionAfter: {
            score: Number,
            status: String,
        },
        status: {
            type: String,
            enum: ['Scheduled', 'In Progress', 'Completed', 'Overdue'],
            default: 'Completed',
        },
        isDemo: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Auto-generate inspection ID
inspectionSchema.pre('save', async function (next) {
    if (!this.inspectionId) {
        const count = await mongoose.model('Inspection').countDocuments();
        this.inspectionId = `INS-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Inspection', inspectionSchema);
