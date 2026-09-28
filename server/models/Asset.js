const mongoose = require('mongoose');

const conditionComponentsSchema = new mongoose.Schema(
    {
        physical: { type: Number, default: 0 },   // out of 40
        safety: { type: Number, default: 0 },     // out of 20
        age: { type: Number, default: 0 },         // out of 15
        findings: { type: Number, default: 0 },   // out of 15
        usage: { type: Number, default: 0 },       // out of 10
        physicalRating: { type: Number, default: 3 },
        safetyRating: { type: Number, default: 3 },
    },
    { _id: false }
);

const conditionSchema = new mongoose.Schema(
    {
        score: { type: Number, default: 60, min: 0, max: 100 },
        status: { type: String, enum: ['Good', 'Fair', 'Poor', 'Critical'], default: 'Fair' },
        components: { type: conditionComponentsSchema, default: () => ({}) },
        lastInspectionDate: { type: Date, default: null },
        nextInspectionDate: { type: Date, default: null },
        maintenanceRecommended: { type: Boolean, default: false },
    },
    { _id: false }
);

const assetSchema = new mongoose.Schema(
    {
        assetId: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        category: {
            type: String,
            required: true,
            enum: ['Roads', 'Bridges', 'Culverts', 'Government Buildings', 'Other Structures'],
        },
        type: { type: String, required: true },
        department: { type: String, default: 'Roads & Buildings Department' },
        ownership: {
            owner: { type: String, default: 'Government of Gujarat' },
            managingAuthority: { type: String, default: 'R&B Department, Gujarat' },
        },
        administrative: {
            state: { type: String, default: 'Gujarat' },
            region: { type: String, default: '' },
            district: { type: String, required: true },
            taluka: { type: String, default: '' },
            division: { type: String, default: '' },
            subdivision: { type: String, default: '' },
        },
        location: {
            address: { type: String, default: '' },
            landmark: { type: String, default: '' },
            latitude: { type: Number, required: true },
            longitude: { type: Number, required: true },
        },
        construction: {
            year: { type: Number },
            commissioningDate: { type: Date },
            originalCost: { type: Number, default: 0 }, // in Lakhs
            contractor: { type: String, default: '' },
            agency: { type: String, default: '' },
            designLife: { type: Number, default: 50 }, // years
        },
        technical: { type: mongoose.Schema.Types.Mixed, default: {} },
        usage: {
            trafficImportance: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
        },
        condition: { type: conditionSchema, default: () => ({}) },
        lifecycleStatus: {
            type: String,
            enum: ['Operational', 'Under Maintenance', 'Under Construction', 'Temporarily Closed', 'Decommissioned'],
            default: 'Operational',
        },
        archived: { type: Boolean, default: false },
        isDemo: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexes for common query patterns
assetSchema.index({ 'administrative.district': 1 });
assetSchema.index({ category: 1 });
assetSchema.index({ 'condition.status': 1 });
assetSchema.index({ lifecycleStatus: 1 });
assetSchema.index({ archived: 1 });
assetSchema.index({ name: 'text', assetId: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
