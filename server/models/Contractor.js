const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema(
    {
        contractorId: { type: String, unique: true },
        name: { type: String, required: true, trim: true },
        company: { type: String, required: true },
        contact: { type: String, default: '' },
        email: { type: String, default: '' },
        specialization: { type: String, default: 'General Civil Works' },
        isActive: { type: Boolean, default: true },
        isDemo: { type: Boolean, default: true },
    },
    { timestamps: true }
);

contractorSchema.pre('save', async function (next) {
    if (!this.contractorId) {
        const count = await mongoose.model('Contractor').countDocuments();
        this.contractorId = `CON-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Contractor', contractorSchema);
