const mongoose = require('mongoose');

/**
 * Prefix map: category → 2-letter code
 */
const categoryPrefix = {
    Roads: 'RD',
    Bridges: 'BR',
    Culverts: 'CV',
    'Government Buildings': 'BLD',
    'Other Structures': 'STR',
};

/**
 * District → 3-letter code mapping
 */
const districtCode = {
    Ahmedabad: 'AHM',
    Surat: 'SRT',
    Vadodara: 'VDR',
    Rajkot: 'RJK',
    Gandhinagar: 'GNR',
    Bhavnagar: 'BVN',
    Jamnagar: 'JMN',
    Bharuch: 'BRC',
    Anand: 'AND',
    Mehsana: 'MSN',
    Junagadh: 'JNG',
    Kutch: 'KTC',
    Amreli: 'AMR',
    Patan: 'PTN',
    Banaskantha: 'BNK',
    Sabarkantha: 'SBK',
    Surendranagar: 'SNR',
    Morbi: 'MRB',
    Narmada: 'NRM',
    Navsari: 'NVS',
    Valsad: 'VLS',
    Tapi: 'TPI',
    Surat_rural: 'SRR',
    Panchmahal: 'PCH',
    Dahod: 'DHD',
    Kheda: 'KHD',
    Chhota_Udaipur: 'CUD',
    Devbhoomi_Dwarka: 'DBD',
    Gir_Somnath: 'GRS',
    Botad: 'BTD',
    Aravalli: 'ARV',
    Mahisagar: 'MHS',
    Mahesana: 'MSN',
};

/**
 * Generate next asset ID for a given category and district
 * Pattern: PREFIX-GJ-DIST-NNNNN
 */
async function generateAssetId(category, district) {
    const Asset = require('../models/Asset');
    const prefix = categoryPrefix[category] || 'STR';
    const dCode = districtCode[district] || district.substring(0, 3).toUpperCase();
    const pattern = `${prefix}-GJ-${dCode}-`;

    // Find the highest existing sequence for this prefix+district
    const existing = await Asset.find({ assetId: { $regex: `^${pattern}` } })
        .sort({ assetId: -1 })
        .limit(1)
        .select('assetId');

    let nextNum = 1;
    if (existing.length > 0) {
        const lastId = existing[0].assetId;
        const lastNum = parseInt(lastId.split('-').pop(), 10);
        if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    return `${pattern}${String(nextNum).padStart(5, '0')}`;
}

module.exports = { generateAssetId, categoryPrefix, districtCode };
