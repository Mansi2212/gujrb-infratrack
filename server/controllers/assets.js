const Asset = require('../models/Asset');
const LifecycleEvent = require('../models/LifecycleEvent');
const { generateAssetId } = require('../utils/assetId');

exports.getAssets = async (req, res, next) => {
    try {
        const { search, category, district, status, lifecycleStatus, sortBy, page = 1, limit = 50 } = req.query;

        let query = { archived: false };

        if (search && search.trim()) {
            const s = search.trim();
            query.$or = [
                { assetId: { $regex: s, $options: 'i' } },
                { name: { $regex: s, $options: 'i' } },
                { 'administrative.district': { $regex: s, $options: 'i' } },
                { 'administrative.taluka': { $regex: s, $options: 'i' } },
                { 'administrative.division': { $regex: s, $options: 'i' } },
                { 'location.address': { $regex: s, $options: 'i' } },
                { 'location.landmark': { $regex: s, $options: 'i' } },
                { category: { $regex: s, $options: 'i' } },
                { type: { $regex: s, $options: 'i' } }
            ];
        }
        if (category && category !== 'All') query.category = { $regex: `^${category.trim()}$`, $options: 'i' };
        if (district && district !== 'All') query['administrative.district'] = { $regex: `^${district.trim()}$`, $options: 'i' };
        if (status && status !== 'All') query['condition.status'] = { $regex: `^${status.trim()}$`, $options: 'i' };
        if (lifecycleStatus && lifecycleStatus !== 'All') query.lifecycleStatus = { $regex: `^${lifecycleStatus.trim()}$`, $options: 'i' };

        let sortOption = { createdAt: -1 };
        if (sortBy === 'score_asc') sortOption = { 'condition.score': 1 };
        else if (sortBy === 'score_desc') sortOption = { 'condition.score': -1 };
        else if (sortBy === 'name') sortOption = { name: 1 };
        else if (sortBy === 'id') sortOption = { assetId: 1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const assets = await Asset.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Asset.countDocuments(query);

        res.json({
            assets,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        next(error);
    }
};

const mongoose = require('mongoose');

exports.getAssetById = async (req, res, next) => {
    try {
        const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
        const query = isMongoId
            ? { $or: [{ _id: req.params.id }, { assetId: req.params.id }] }
            : { assetId: req.params.id };

        const asset = await Asset.findOne(query);
        if (!asset) return res.status(404).json({ error: 'Asset not found' });

        let lifecycle = [];
        try {
            lifecycle = await LifecycleEvent.find({ assetId: asset._id }).sort({ date: -1 });
        } catch (e) { }

        res.json({ asset, lifecycle });
    } catch (error) {
        next(error);
    }
};

exports.createAsset = async (req, res, next) => {
    try {
        const assetData = req.body;

        if (!assetData.assetId) {
            assetData.assetId = await generateAssetId(assetData.category, assetData.administrative.district);
        }

        const asset = new Asset(assetData);
        await asset.save();

        await LifecycleEvent.create({
            assetId: asset._id,
            assetRef: asset.assetId,
            eventType: 'Created',
            description: `Asset ${asset.assetId} added to registry.`,
            performedBy: 'System'
        });

        res.status(201).json(asset);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Asset ID already exists' });
        }
        next(error);
    }
};

exports.updateAsset = async (req, res, next) => {
    try {
        const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
        const query = isMongoId ? { $or: [{ _id: req.params.id }, { assetId: req.params.id }] } : { assetId: req.params.id };
        const asset = await Asset.findOneAndUpdate(query, req.body, { new: true, runValidators: true });
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        res.json(asset);
    } catch (error) {
        next(error);
    }
};

exports.deleteAsset = async (req, res, next) => {
    try {
        const isMongoId = mongoose.Types.ObjectId.isValid(req.params.id) && req.params.id.length === 24;
        const query = isMongoId ? { $or: [{ _id: req.params.id }, { assetId: req.params.id }] } : { assetId: req.params.id };
        const asset = await Asset.findOneAndUpdate(query, { archived: true }, { new: true });
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        res.json({ message: 'Asset archived successfully' });
    } catch (error) {
        next(error);
    }
};
