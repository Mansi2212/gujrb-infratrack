const Notification = require('../models/Notification');

/**
 * Evaluate alert rules for an asset and create notifications as needed.
 * Rules:
 * 1. score < 40 → Critical Asset Alert
 * 2. nextInspectionDate < today → Inspection Overdue
 * 3. score < 60 → Maintenance Review Required
 */
async function evaluateAssetAlerts(asset) {
    const today = new Date();
    const notifs = [];

    // Rule 1: Critical
    if (asset.condition.score < 40) {
        notifs.push({
            type: 'Critical',
            title: `Critical Asset Alert — ${asset.assetId}`,
            message: `${asset.name} has condition score ${asset.condition.score}/100 (Critical). Immediate inspection or intervention required.`,
            assetId: asset._id,
            assetRef: asset.assetId,
        });
    } else if (asset.condition.score < 60) {
        // Rule 3: Maintenance Review
        notifs.push({
            type: 'MaintenanceRequired',
            title: `Maintenance Review Required — ${asset.assetId}`,
            message: `${asset.name} has condition score ${asset.condition.score}/100 (${asset.condition.status}). Maintenance review recommended.`,
            assetId: asset._id,
            assetRef: asset.assetId,
        });
    }

    // Rule 2: Inspection Overdue
    if (asset.condition.nextInspectionDate && asset.condition.nextInspectionDate < today) {
        notifs.push({
            type: 'InspectionOverdue',
            title: `Inspection Overdue — ${asset.assetId}`,
            message: `${asset.name} inspection was due on ${asset.condition.nextInspectionDate.toDateString()}. Please schedule immediately.`,
            assetId: asset._id,
            assetRef: asset.assetId,
        });
    }

    // Create notifications (avoid duplicates by checking existing unread)
    for (const n of notifs) {
        const existing = await Notification.findOne({
            assetId: asset._id,
            type: n.type,
            read: false,
        });
        if (!existing) {
            await Notification.create(n);
        }
    }
}

/**
 * Rule 4: Delayed Work Order alert
 */
async function evaluateWorkOrderAlerts(workOrder) {
    const today = new Date();
    if (
        workOrder.expectedCompletion &&
        workOrder.expectedCompletion < today &&
        !['Completed', 'Cancelled'].includes(workOrder.status)
    ) {
        const existing = await Notification.findOne({
            workOrderId: workOrder._id,
            type: 'DelayedWork',
            read: false,
        });
        if (!existing) {
            await Notification.create({
                type: 'DelayedWork',
                title: `Delayed Work Order — ${workOrder.workOrderId}`,
                message: `Work order ${workOrder.workOrderId} for ${workOrder.assetName} is past its due date (${workOrder.expectedCompletion?.toDateString()}) and still not completed.`,
                workOrderId: workOrder._id,
                assetId: workOrder.assetId,
                assetRef: workOrder.assetRef,
            });
        }
    }
}

module.exports = { evaluateAssetAlerts, evaluateWorkOrderAlerts };
