const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        role: { type: String, enum: ['Admin', 'District Officer', 'Field Inspector'], required: true },
        district: { type: String, default: null }, // For District Officer / Field Inspector
        passwordHash: { type: String, default: 'demo' }, // Demo only
        isActive: { type: Boolean, default: true },
        isDemo: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
