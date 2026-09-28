const Asset = require('../models/Asset');
const Inspection = require('../models/Inspection');
const WorkOrder = require('../models/WorkOrder');

exports.getAnalytics = async (req, res, next) => {
    try {
        const currentYear = new Date().getFullYear();
        const today = new Date();

        // 1. Fetch all active assets for aggregation
        const assets = await Asset.find({ archived: false }).lean();
        const workOrders = await WorkOrder.find().lean();
        const inspections = await Inspection.find().lean();

        const totalAssets = assets.length;

        // 2. Health & Condition calculations
        const totalScore = assets.reduce((sum, a) => sum + (a.condition?.score || 60), 0);
        const avgConditionScore = totalAssets > 0 ? parseFloat((totalScore / totalAssets).toFixed(1)) : 0;

        const criticalAssets = assets.filter((a) => a.condition?.status === 'Critical');
        const poorAssets = assets.filter((a) => a.condition?.status === 'Poor');
        const fairAssets = assets.filter((a) => a.condition?.status === 'Fair');
        const goodAssets = assets.filter((a) => a.condition?.status === 'Good');

        // 3. Financial CapEx & Maintenance Valuations
        const totalValuationLakhs = assets.reduce((sum, a) => sum + (a.construction?.originalCost || 0), 0);
        const totalMaintenanceCommitted = workOrders
            .filter((w) => !['Completed', 'Cancelled'].includes(w.status))
            .reduce((sum, w) => sum + (w.estimatedCost || 0), 0);
        const totalMaintenanceCompleted = workOrders
            .filter((w) => w.status === 'Completed')
            .reduce((sum, w) => sum + (w.actualCost || w.estimatedCost || 0), 0);

        // Rehabilitation budget estimate for Poor & Critical assets
        const estimatedRehabBacklog = assets
            .filter((a) => (a.condition?.score || 100) < 60)
            .reduce((sum, a) => {
                const cost = a.construction?.originalCost || 200;
                // Poor: 15% of cost, Critical: 30% of cost (min 25 lakhs)
                const factor = a.condition?.status === 'Critical' ? 0.30 : 0.15;
                return sum + Math.max(25, parseFloat((cost * factor).toFixed(1)));
            }, 0);

        // Inspection compliance (% with valid upcoming inspection date)
        const overdueCount = assets.filter(
            (a) => a.condition?.nextInspectionDate && new Date(a.condition.nextInspectionDate) < today
        ).length;
        const complianceRate = totalAssets > 0 ? Math.round(((totalAssets - overdueCount) / totalAssets) * 100) : 100;

        // 4. Age vs Condition Correlation
        const ageBrackets = {
            '< 10 Yrs': { count: 0, totalScore: 0, critical: 0 },
            '10-20 Yrs': { count: 0, totalScore: 0, critical: 0 },
            '20-30 Yrs': { count: 0, totalScore: 0, critical: 0 },
            '30-50 Yrs': { count: 0, totalScore: 0, critical: 0 },
            '50+ Yrs': { count: 0, totalScore: 0, critical: 0 }
        };

        assets.forEach((a) => {
            const age = a.construction?.year ? currentYear - a.construction.year : 10;
            const score = a.condition?.score || 60;
            const isCrit = a.condition?.status === 'Critical';

            let b = '< 10 Yrs';
            if (age >= 50) b = '50+ Yrs';
            else if (age >= 30) b = '30-50 Yrs';
            else if (age >= 20) b = '20-30 Yrs';
            else if (age >= 10) b = '10-20 Yrs';

            ageBrackets[b].count++;
            ageBrackets[b].totalScore += score;
            if (isCrit) ageBrackets[b].critical++;
        });

        const ageDistribution = Object.entries(ageBrackets).map(([bracket, data]) => ({
            bracket,
            assetCount: data.count,
            avgScore: data.count > 0 ? parseFloat((data.totalScore / data.count).toFixed(1)) : 0,
            criticalCount: data.critical
        }));

        // 5. District Performance Heatmap
        const districtMap = {};
        assets.forEach((a) => {
            const d = a.administrative?.district || 'Other';
            if (!districtMap[d]) {
                districtMap[d] = {
                    district: d,
                    assetCount: 0,
                    totalScore: 0,
                    totalValuation: 0,
                    criticalCount: 0,
                    activeMaintenance: 0
                };
            }
            districtMap[d].assetCount++;
            districtMap[d].totalScore += (a.condition?.score || 60);
            districtMap[d].totalValuation += (a.construction?.originalCost || 0);
            if (a.condition?.status === 'Critical') districtMap[d].criticalCount++;
        });

        workOrders.forEach((w) => {
            if (!['Completed', 'Cancelled'].includes(w.status) && w.assetId) {
                const targetAsset = assets.find((a) => String(a._id) === String(w.assetId));
                if (targetAsset && targetAsset.administrative?.district) {
                    const dist = targetAsset.administrative.district;
                    if (districtMap[dist]) districtMap[dist].activeMaintenance++;
                }
            }
        });

        const districtComparison = Object.values(districtMap).map((d) => ({
            ...d,
            avgScore: parseFloat((d.totalScore / d.assetCount).toFixed(1)),
            totalValuationCr: parseFloat((d.totalValuation / 100).toFixed(2)) // in Crores
        })).sort((a, b) => b.assetCount - a.assetCount);

        // 6. Category Capital & Health Matrix
        const catMap = {};
        assets.forEach((a) => {
            const cat = a.category || 'Other';
            if (!catMap[cat]) {
                catMap[cat] = {
                    category: cat,
                    count: 0,
                    totalScore: 0,
                    totalValuationLakhs: 0,
                    maintenanceCount: 0
                };
            }
            catMap[cat].count++;
            catMap[cat].totalScore += (a.condition?.score || 60);
            catMap[cat].totalValuationLakhs += (a.construction?.originalCost || 0);
            if ((a.condition?.score || 100) < 60) catMap[cat].maintenanceCount++;
        });

        const categoryMatrix = Object.values(catMap).map((c) => ({
            category: c.category,
            count: c.count,
            avgScore: parseFloat((c.totalScore / c.count).toFixed(1)),
            totalValuationLakhs: c.totalValuationLakhs,
            maintenanceCount: c.maintenanceCount
        }));

        // 7. Defect Prevalence from Inspections
        const defectCounts = {};
        const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };

        inspections.forEach((insp) => {
            if (insp.defects && Array.isArray(insp.defects)) {
                insp.defects.forEach((d) => {
                    if (d.type) {
                        defectCounts[d.type] = (defectCounts[d.type] || 0) + 1;
                    }
                    if (d.severity && severityCounts[d.severity] !== undefined) {
                        severityCounts[d.severity]++;
                    }
                });
            }
        });

        const defectDistribution = Object.entries(defectCounts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);

        const defectSeverity = Object.entries(severityCounts)
            .map(([severity, count]) => ({ severity, count }));

        // 8. Predictive At-Risk Assets Table
        const atRiskAssets = assets
            .filter((a) => (a.condition?.score || 100) < 60 || a.condition?.status === 'Critical')
            .sort((a, b) => (a.condition?.score || 0) - (b.condition?.score || 0))
            .slice(0, 10)
            .map((a) => {
                const age = a.construction?.year ? currentYear - a.construction.year : 20;
                const designLife = a.construction?.designLife || 50;
                const originalCost = a.construction?.originalCost || 200;
                const estRehab = Math.max(25, parseFloat((originalCost * (a.condition?.status === 'Critical' ? 0.3 : 0.15)).toFixed(1)));
                return {
                    assetId: a.assetId,
                    name: a.name,
                    category: a.category,
                    district: a.administrative?.district,
                    conditionScore: a.condition?.score || 0,
                    conditionStatus: a.condition?.status || 'Unknown',
                    ageYears: age,
                    designLife,
                    lifeExhaustedPct: Math.min(100, Math.round((age / designLife) * 100)),
                    estRehabLakhs: estRehab,
                    urgency: a.condition?.status === 'Critical' ? 'Immediate' : 'Within 6 Months'
                };
            });

        res.json({
            summary: {
                totalAssets,
                avgConditionScore,
                statewideHealthStatus: avgConditionScore >= 80 ? 'Good' : avgConditionScore >= 60 ? 'Fair' : avgConditionScore >= 40 ? 'Poor' : 'Critical',
                totalValuationLakhs,
                totalValuationCr: parseFloat((totalValuationLakhs / 100).toFixed(2)),
                totalMaintenanceCommitted,
                totalMaintenanceCompleted,
                estimatedRehabBacklog,
                complianceRate,
                criticalCount: criticalAssets.length,
                poorCount: poorAssets.length,
                fairCount: fairAssets.length,
                goodCount: goodAssets.length
            },
            ageDistribution,
            districtComparison,
            categoryMatrix,
            defectDistribution,
            defectSeverity,
            atRiskAssets
        });
    } catch (error) {
        next(error);
    }
};
