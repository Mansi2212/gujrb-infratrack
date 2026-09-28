const WorkOrder = require('../models/WorkOrder');
const Asset = require('../models/Asset');
const LifecycleEvent = require('../models/LifecycleEvent');
const Notification = require('../models/Notification');
const { evaluateWorkOrderAlerts } = require('../utils/alertRules');

exports.getWorkOrders = async (req, res, next) => {
    try {
        const wos = await WorkOrder.find().sort({ createdAt: -1 }).limit(100);
        res.json(wos);
    } catch (error) {
        next(error);
    }
};

const mongoose = require('mongoose');

exports.getWorkOrderById = async (req, res, next) => {
    try {
        const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
        const query = isMongoId ? { $or: [{ _id: req.params.id }, { workOrderId: req.params.id }] } : { workOrderId: req.params.id };
        const wo = await WorkOrder.findOne(query);
        if (!wo) return res.status(404).json({ error: 'Work order not found' });
        res.json(wo);
    } catch (error) {
        next(error);
    }
};

exports.createWorkOrder = async (req, res, next) => {
    try {
        const woData = req.body;
        const isAssetMongoId = mongoose.Types.ObjectId.isValid(woData.assetId) && woData.assetId.length === 24;
        const asset = await Asset.findOne(
            isAssetMongoId
                ? { $or: [{ _id: woData.assetId }, { assetId: woData.assetId }] }
                : { assetId: woData.assetId }
        );

        if (!asset) return res.status(404).json({ error: 'Asset not found' });

        woData.assetId = asset._id;
        woData.assetRef = asset.assetId;
        woData.assetName = asset.name;
        woData.statusHistory = [{ status: woData.status || 'Planned', note: 'Initial creation' }];

        const wo = new WorkOrder(woData);
        await wo.save();

        // Side effect: update asset to under maintenance
        if (asset.lifecycleStatus === 'Operational') {
            asset.lifecycleStatus = 'Under Maintenance';
            await asset.save();
        }

        await LifecycleEvent.create({
            assetId: asset._id,
            assetRef: asset.assetId,
            eventType: 'Work Order Created',
            description: `Work Order ${wo.workOrderId} created for ${wo.issue} (${wo.priority} priority). Estimated cost: ₹${wo.estimatedCost} Lakhs`,
            performedBy: 'System'
        });

        res.status(201).json(wo);
    } catch (error) {
        next(error);
    }
};

exports.updateWorkOrder = async (req, res, next) => {
    try {
        const updates = req.body;
        const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
        const query = isMongoId ? { $or: [{ _id: req.params.id }, { workOrderId: req.params.id }] } : { workOrderId: req.params.id };
        const wo = await WorkOrder.findOne(query);

        if (!wo) return res.status(404).json({ error: 'Work order not found' });

        const previousStatus = wo.status;
        const newStatus = updates.status;

        Object.assign(wo, updates);

        // Track status history if it changed
        if (newStatus && newStatus !== previousStatus) {
            wo.statusHistory.push({
                status: newStatus,
                note: updates.note || `Status updated from ${previousStatus} to ${newStatus}`
            });

            if (newStatus === 'Completed') {
                wo.completedDate = new Date();

                // Update Asset lifecycleStatus back to Operational
                const asset = await Asset.findById(wo.assetId);
                if (asset && asset.lifecycleStatus === 'Under Maintenance') {
                    asset.lifecycleStatus = 'Operational';
                    await asset.save();
                }

                // Add Lifecycle event for completion
                await LifecycleEvent.create({
                    assetId: wo.assetId,
                    assetRef: wo.assetRef,
                    eventType: 'Work Order Completed',
                    description: `Work order ${wo.workOrderId} completed. Action taken: ${wo.issue}`,
                    cost: wo.actualCost || wo.estimatedCost || 0,
                    performedBy: 'Contractor / System'
                });

                // Add Notification
                await Notification.create({
                    type: 'Info',
                    title: `Work Order Completed — ${wo.workOrderId}`,
                    message: `Work Order ${wo.workOrderId} for ${wo.assetName} has been successfully completed.`,
                    workOrderId: wo._id,
                    assetId: wo.assetId,
                    assetRef: wo.assetRef
                });
            }
        }

        await wo.save();

        // Evaluate if it became delayed based on expected completion
        await evaluateWorkOrderAlerts(wo);

        res.json(wo);
    } catch (error) {
        next(error);
    }
};
