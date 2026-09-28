const Inspection = require('../models/Inspection');
const Asset = require('../models/Asset');
const LifecycleEvent = require('../models/LifecycleEvent');
const { computeConditionScore, getHighestSeverity, hasStructuralDamageDefect } = require('../utils/conditionScore');
const { evaluateAssetAlerts } = require('../utils/alertRules');

exports.getInspections = async (req, res, next) => {
    try {
        const inspections = await Inspection.find().sort({ inspectionDate: -1 }).limit(100);
        res.json(inspections);
    } catch (error) {
        next(error);
    }
};

const mongoose = require('mongoose');

exports.getInspectionById = async (req, res, next) => {
    try {
        const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
        const query = isMongoId ? { $or: [{ _id: req.params.id }, { inspectionId: req.params.id }] } : { inspectionId: req.params.id };
        const inspection = await Inspection.findOne(query);
        if (!inspection) return res.status(404).json({ error: 'Inspection not found' });
        res.json(inspection);
    } catch (error) {
        next(error);
    }
};

exports.createInspection = async (req, res, next) => {
    try {
        const inspectionData = req.body;
        const isAssetMongoId = mongoose.Types.ObjectId.isValid(inspectionData.assetId) && inspectionData.assetId.length === 24;
        const asset = await Asset.findOne(
            isAssetMongoId
                ? { $or: [{ _id: inspectionData.assetId }, { assetId: inspectionData.assetId }] }
                : { assetId: inspectionData.assetId }
        );

        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        inspectionData.assetId = asset._id;

        // 1. Prepare and save the inspection
        inspectionData.assetRef = asset.assetId;
        inspectionData.overallSeverity = getHighestSeverity(inspectionData.defects || []);
        inspectionData.conditionBefore = {
            score: asset.condition.score,
            status: asset.condition.status
        };

        // 2. Calculate new condition score
        const newCondition = computeConditionScore({
            physicalRating: inspectionData.physicalRating,
            safetyRating: inspectionData.safetyRating,
            constructionYear: asset.construction.year,
            designLife: asset.construction.designLife,
            highestDefectSeverity: inspectionData.overallSeverity,
            hasStructuralDamage: hasStructuralDamageDefect(inspectionData.defects || []),
            trafficImportance: asset.usage.trafficImportance
        });

        inspectionData.conditionAfter = {
            score: newCondition.score,
            status: newCondition.status
        };

        const inspection = new Inspection(inspectionData);
        await inspection.save();

        // 3. Update the asset condition and dates
        const inspectionDate = new Date(inspection.inspectionDate || Date.now());
        let nextInspectionDate = new Date(inspectionDate);
        // +12 months normally, +3 if critical/high
        const incrementMonths = (inspectionData.overallSeverity === 'High' || inspectionData.overallSeverity === 'Critical') ? 3 : 12;
        nextInspectionDate.setMonth(nextInspectionDate.getMonth() + incrementMonths);

        const requiresMaintenance = inspectionData.recommendedAction !== 'No action';

        asset.condition = {
            score: newCondition.score,
            status: newCondition.status,
            components: newCondition.components,
            lastInspectionDate: inspectionDate,
            nextInspectionDate: nextInspectionDate,
            maintenanceRecommended: requiresMaintenance
        };

        await asset.save(); // apply updates to DB

        // 4. Create Lifecycle Event
        let desc = `Inspection completed with condition score ${newCondition.score} (${newCondition.status}).`;
        if (asset.condition.status !== inspectionData.conditionBefore.status) {
            desc += ` Condition changed from ${inspectionData.conditionBefore.status} to ${newCondition.status}.`;
        }

        await LifecycleEvent.create({
            assetId: asset._id,
            assetRef: asset.assetId,
            eventType: 'Inspected',
            description: desc,
            performedBy: inspection.inspectorName || 'System'
        });

        // 5. Evaluate alerts based on new condition
        await evaluateAssetAlerts(asset);

        res.status(201).json({ inspection, asset });
    } catch (error) {
        next(error);
    }
};
