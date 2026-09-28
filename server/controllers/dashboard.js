const Asset = require('../models/Asset');
const Inspection = require('../models/Inspection');
const WorkOrder = require('../models/WorkOrder');
const Notification = require('../models/Notification');

exports.getStats = async (req, res, next) => {
    try {
        const totalAssets = await Asset.countDocuments({ archived: false });
        const roads = await Asset.countDocuments({ category: 'Roads', archived: false });
        const bridges = await Asset.countDocuments({ category: 'Bridges', archived: false });
        const buildings = await Asset.countDocuments({ category: 'Government Buildings', archived: false });
        const criticalAssets = await Asset.countDocuments({ 'condition.status': 'Critical', archived: false });
        
        // Maintenance Required (score < 60)
        const maintenanceRequired = await Asset.countDocuments({ 'condition.score': { $lt: 60 }, archived: false });

        // Inspections Due (due before today)
        const today = new Date();
        const inspectionsDue = await Asset.countDocuments({
            'condition.nextInspectionDate': { $lt: today },
            archived: false
        });

        // Active maintenance (Work orders not completed/cancelled)
        const activeMaintenance = await WorkOrder.countDocuments({
            status: { $nin: ['Completed', 'Cancelled'] }
        });

        // Chart Aggregations
        const conditionDistribution = await Asset.aggregate([
            { $match: { archived: false } },
            { $group: { _id: "$condition.status", value: { $sum: 1 } } }
        ]);

        const categoryDistribution = await Asset.aggregate([
            { $match: { archived: false } },
            { $group: { _id: "$category", value: { $sum: 1 } } }
        ]);

        const districtDistribution = await Asset.aggregate([
            { $match: { archived: false } },
            { $group: { _id: "$administrative.district", value: { $sum: 1 } } }
        ]);

        const workOrderStatus = await WorkOrder.aggregate([
            { $group: { _id: "$status", value: { $sum: 1 } } }
        ]);

        res.json({
            totalAssets, roads, bridges, buildings, criticalAssets,
            inspectionsDue, activeMaintenance, maintenanceRequired,
            charts: {
                conditionDistribution: conditionDistribution.map(c => ({ name: c._id || 'Unknown', value: c.value })),
                categoryDistribution: categoryDistribution.map(c => ({ name: c._id || 'Unknown', value: c.value })),
                districtDistribution: districtDistribution.map(c => ({ name: c._id || 'Unknown', value: c.value })),
                workOrderStatus: workOrderStatus.map(c => ({ name: c._id || 'Unknown', value: c.value }))
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.getAttentionRequired = async (req, res, next) => {
    try {
        const today = new Date();

        // Find critical assets (score < 40)
        const critical = await Asset.find({ 'condition.score': { $lt: 40 }, archived: false })
            .select('assetId name type condition')
            .lean();

        // Find overdue inspections (nextInspectionDate < today)
        const overdue = await Asset.find({
            'condition.nextInspectionDate': { $lt: today },
            archived: false
        }).select('assetId name type condition').lean();

        // Find maintenance required (score < 60 but not critical)
        const maintenance = await Asset.find({
            'condition.score': { $gte: 40, $lt: 60 },
            archived: false
        }).select('assetId name type condition').lean();

        res.json({
            critical: critical.map(a => ({ ...a, reason: 'Critical Score < 40', action: 'Immediate Repair' })),
            overdue: overdue.map(a => ({ ...a, reason: 'Inspection Overdue', action: 'Schedule Inspection' })),
            maintenance: maintenance.map(a => ({ ...a, reason: 'Score < 60', action: 'Schedule Maintenance' }))
        });
    } catch (error) {
        next(error);
    }
};
