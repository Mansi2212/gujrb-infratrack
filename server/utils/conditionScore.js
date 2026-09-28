/**
 * Condition Score Computation Utility
 * Prototype decision-support score — NOT an official Gujarat R&B methodology.
 * Weights: Physical 40, Safety 20, Age/Lifecycle 15, Inspection Findings 15, Usage/Traffic 10
 */

/**
 * Compute condition score and status from inputs
 * @param {Object} params
 * @param {number} params.physicalRating - 1 to 5
 * @param {number} params.safetyRating - 1 to 5
 * @param {number} params.constructionYear - year asset was built
 * @param {number} params.designLife - in years (default 50)
 * @param {string} params.highestDefectSeverity - 'None'|'Low'|'Medium'|'High'|'Critical'
 * @param {boolean} params.hasStructuralDamage - true if a 'Structural damage' defect exists
 * @param {string} params.trafficImportance - 'Low'|'Medium'|'High'
 * @returns {{ score, status, components }}
 */
function computeConditionScore({
    physicalRating = 3,
    safetyRating = 3,
    constructionYear,
    designLife = 50,
    highestDefectSeverity = 'None',
    hasStructuralDamage = false,
    trafficImportance = 'Medium',
}) {
    const currentYear = new Date().getFullYear();

    // Physical component (out of 40)
    const physical = Math.round((physicalRating / 5) * 40);

    // Safety component (out of 20)
    const safety = Math.round((safetyRating / 5) * 20);

    // Age component (out of 15)
    let age = 0;
    if (constructionYear && designLife > 0) {
        const assetAge = currentYear - constructionYear;
        age = Math.round(Math.max(0, 1 - assetAge / designLife) * 15);
    } else {
        age = 8; // default mid-range when no data
    }

    // Findings component (out of 15) based on highest defect severity
    const findingsMap = { None: 15, Low: 15, Medium: 10, High: 5, Critical: 0 };
    const findings = findingsMap[highestDefectSeverity] ?? 10;

    // Usage component (out of 10) — heavier load = more wear
    const usageMap = { Low: 10, Medium: 7, High: 4 };
    const usage = usageMap[trafficImportance] ?? 7;

    let score = physical + safety + age + findings + usage;

    // Override: Structural damage with High/Critical severity → cap at 39
    if (
        hasStructuralDamage &&
        (highestDefectSeverity === 'High' || highestDefectSeverity === 'Critical')
    ) {
        score = Math.min(score, 39);
    }

    score = Math.min(100, Math.max(0, Math.round(score)));

    // Status bands
    let status;
    if (score >= 80) status = 'Good';
    else if (score >= 60) status = 'Fair';
    else if (score >= 40) status = 'Poor';
    else status = 'Critical';

    return {
        score,
        status,
        components: {
            physical,
            safety,
            age,
            findings,
            usage,
            physicalRating,
            safetyRating,
        },
    };
}

/**
 * Get the highest severity from a defects array
 * @param {Array} defects - array with { severity } objects
 * @returns {string} highest severity string
 */
function getHighestSeverity(defects = []) {
    const order = ['Critical', 'High', 'Medium', 'Low', 'None'];
    for (const sev of order) {
        if (defects.some((d) => d.severity === sev)) return sev;
    }
    return 'None';
}

/**
 * Check if defects include structural damage
 */
function hasStructuralDamageDefect(defects = []) {
    return defects.some((d) => d.type === 'Structural damage');
}

module.exports = { computeConditionScore, getHighestSeverity, hasStructuralDamageDefect };
