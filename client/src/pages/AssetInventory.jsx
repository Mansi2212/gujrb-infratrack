import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Search,
    Filter,
    Plus,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    Activity,
    X,
    RotateCcw,
    ChevronDown,
    SlidersHorizontal,
    Edit,
    ArrowUpDown,
    MapPin,
    Building2,
    Layers
} from 'lucide-react';
import api from '../services/api';

const AssetInventory = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    // Filter states
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
    const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || 'All');
    const [selectedCondition, setSelectedCondition] = useState(searchParams.get('status') || 'All');
    const [selectedLifecycle, setSelectedLifecycle] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const categories = ['Roads', 'Bridges', 'Culverts', 'Government Buildings', 'Other Structures'];
    const districts = [
        'Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot',
        'Bharuch', 'Bhavnagar', 'Mehsana', 'Jamnagar', 'Junagadh', 'Kutch'
    ];
    const conditions = ['Good', 'Fair', 'Poor', 'Critical'];
    const lifecycleStatuses = ['Operational', 'Under Maintenance', 'Temporarily Closed', 'Under Construction'];

    // Sync from URL params
    useEffect(() => {
        const querySearch = searchParams.get('search');
        if (querySearch !== null && querySearch !== search) {
            setSearch(querySearch);
        }
        const queryCategory = searchParams.get('category');
        if (queryCategory !== null && queryCategory !== selectedCategory) {
            setSelectedCategory(queryCategory);
        }
        const queryDistrict = searchParams.get('district');
        if (queryDistrict !== null && queryDistrict !== selectedDistrict) {
            setSelectedDistrict(queryDistrict);
        }
        const queryStatus = searchParams.get('status');
        if (queryStatus !== null && queryStatus !== selectedCondition) {
            setSelectedCondition(queryStatus);
        }
    }, [searchParams]);

    // Fetch assets on filter changes
    useEffect(() => {
        fetchAssets();
    }, [search, selectedCategory, selectedDistrict, selectedCondition, selectedLifecycle, sortBy]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search.trim()) params.append('search', search.trim());
            if (selectedCategory !== 'All') params.append('category', selectedCategory);
            if (selectedDistrict !== 'All') params.append('district', selectedDistrict);
            if (selectedCondition !== 'All') params.append('status', selectedCondition);
            if (selectedLifecycle !== 'All') params.append('lifecycleStatus', selectedLifecycle);
            if (sortBy !== 'newest') params.append('sortBy', sortBy);
            params.append('limit', '100');

            const res = await api.get(`/assets?${params.toString()}`);
            setAssets(res.data.assets || []);
            setTotalCount(res.data.total ?? (res.data.assets?.length || 0));
        } catch (err) {
            console.error('Error fetching filtered assets:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearAllFilters = () => {
        setSearch('');
        setSelectedCategory('All');
        setSelectedDistrict('All');
        setSelectedCondition('All');
        setSelectedLifecycle('All');
        setSortBy('newest');
        setSearchParams({});
    };

    const activeFilterCount =
        (selectedCategory !== 'All' ? 1 : 0) +
        (selectedDistrict !== 'All' ? 1 : 0) +
        (selectedCondition !== 'All' ? 1 : 0) +
        (selectedLifecycle !== 'All' ? 1 : 0) +
        (sortBy !== 'newest' ? 1 : 0) +
        (search.trim() ? 1 : 0);

    const StatusBadge = ({ status, score }) => {
        const colors = {
            Good: 'bg-green-100 text-green-700 border-green-200',
            Fair: 'bg-amber-100 text-amber-700 border-amber-200',
            Poor: 'bg-orange-100 text-orange-700 border-orange-200',
            Critical: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
        };
        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
                    colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
            >
                {status} {score !== undefined ? `(${score})` : ''}
            </span>
        );
    };

    return (
        <div className="p-8 h-full flex flex-col bg-gray-50 overflow-hidden">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <Layers className="text-primary-600" size={24} /> Asset Registry & Inventory
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                        Manage, filter, and monitor physical Gujarat Roads & Buildings infrastructure.
                    </p>
                </div>
                <Link
                    to="/assets/new"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-all active:scale-95 text-sm tracking-wide"
                >
                    <Plus size={18} /> Register New Asset
                </Link>
            </div>

            {/* Quick Filter Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                    <SlidersHorizontal size={13} /> Quick Filter:
                </span>
                <button
                    onClick={() => {
                        setSelectedCategory('All');
                        setSelectedCondition('All');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        selectedCategory === 'All' && selectedCondition === 'All'
                            ? 'bg-primary-600 text-white shadow-xs'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    All Assets
                </button>
                <button
                    onClick={() => {
                        setSelectedCondition(selectedCondition === 'Critical' ? 'All' : 'Critical');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        selectedCondition === 'Critical'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    }`}
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Critical Assets
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            selectedCategory === cat
                                ? 'bg-primary-600 text-white shadow-xs'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        {cat === 'Government Buildings' ? 'Buildings' : cat}
                    </button>
                ))}
                <button
                    onClick={() => setSelectedLifecycle(selectedLifecycle === 'Under Maintenance' ? 'All' : 'Under Maintenance')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        selectedLifecycle === 'Under Maintenance'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                >
                    Under Maintenance
                </button>

                <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                {/* Direct District Quick Selector */}
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 shadow-2xs">
                    <MapPin size={13} className="text-primary-600" />
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">District:</span>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer pr-1"
                    >
                        <option value="All">All Districts</option>
                        {districts.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Fast Ahmedabad Quick Chip */}
                <button
                    onClick={() => setSelectedDistrict(selectedDistrict === 'Ahmedabad' ? 'All' : 'Ahmedabad')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                        selectedDistrict === 'Ahmedabad'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                >
                    <MapPin size={12} /> Ahmedabad
                </button>
            </div>

            {/* Filter Bar & Search Container */}
            <div className="bg-white rounded-t-xl border border-gray-200 shadow-xs relative z-10 overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-96 group">
                        <Search
                            size={18}
                            className="absolute left-3 top-3 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                        />
                        <input
                            type="text"
                            placeholder="Search by ID, Name, Type (e.g. BR-GJ, Sabarmati)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-sm"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle & Counter */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-xs font-bold text-gray-500">
                            Showing <span className="text-primary-700 font-black">{totalCount}</span> assets
                        </span>

                        <button
                            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-bold text-sm transition-all ${
                                isFilterPanelOpen || activeFilterCount > 0
                                    ? 'bg-primary-50 text-primary-700 border-primary-300 shadow-xs'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Filter size={16} className={activeFilterCount > 0 ? 'text-primary-600' : 'text-gray-400'} />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="h-5 w-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                            <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${isFilterPanelOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Expandable Filter Panel */}
                {isFilterPanelOpen && (
                    <div className="p-4 bg-gray-50/80 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                                >
                                    <option value="All">All Categories</option>
                                    {categories.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* District Filter */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    District
                                </label>
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                                >
                                    <option value="All">All Districts</option>
                                    {districts.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Condition Status */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Condition Status
                                </label>
                                <select
                                    value={selectedCondition}
                                    onChange={(e) => setSelectedCondition(e.target.value)}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                                >
                                    <option value="All">All Conditions</option>
                                    {conditions.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lifecycle Status */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Lifecycle
                                </label>
                                <select
                                    value={selectedLifecycle}
                                    onChange={(e) => setSelectedLifecycle(e.target.value)}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                                >
                                    <option value="All">All Statuses</option>
                                    {lifecycleStatuses.map((l) => (
                                        <option key={l} value={l}>
                                            {l}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Order */}
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
                                >
                                    <option value="newest">Recently Added</option>
                                    <option value="score_asc">Score (Lowest First)</option>
                                    <option value="score_desc">Score (Highest First)</option>
                                    <option value="name">Name (A-Z)</option>
                                    <option value="id">Asset ID</option>
                                </select>
                            </div>
                        </div>

                        {/* Reset and Active Filter Badges */}
                        {activeFilterCount > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[11px] font-bold uppercase text-gray-400">Active:</span>
                                    {selectedCategory !== 'All' && (
                                        <span className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                                            Category: {selectedCategory}
                                            <button onClick={() => setSelectedCategory('All')} className="text-gray-400 hover:text-gray-600">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    )}
                                    {selectedDistrict !== 'All' && (
                                        <span className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                                            District: {selectedDistrict}
                                            <button onClick={() => setSelectedDistrict('All')} className="text-gray-400 hover:text-gray-600">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    )}
                                    {selectedCondition !== 'All' && (
                                        <span className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                                            Condition: {selectedCondition}
                                            <button onClick={() => setSelectedCondition('All')} className="text-gray-400 hover:text-gray-600">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    )}
                                    {selectedLifecycle !== 'All' && (
                                        <span className="bg-white border border-gray-200 text-gray-700 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                                            Lifecycle: {selectedLifecycle}
                                            <button onClick={() => setSelectedLifecycle('All')} className="text-gray-400 hover:text-gray-600">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    )}
                                </div>

                                <button
                                    onClick={handleClearAllFilters}
                                    className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
                                >
                                    <RotateCcw size={12} /> Reset All Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Assets Table */}
            <div className="flex-1 bg-white border-x border-b border-gray-200 rounded-b-xl shadow-xs overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1 h-full">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/90 text-gray-600 text-xs uppercase font-bold tracking-wider sticky top-0 border-b border-gray-200 z-0">
                            <tr>
                                <th className="px-6 py-4">Asset ID</th>
                                <th className="px-6 py-4">Name & Description</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">District</th>
                                <th className="px-6 py-4 text-center">Condition</th>
                                <th className="px-6 py-4 text-center">Lifecycle</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-gray-500 font-medium">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                            Loading asset records...
                                        </div>
                                    </td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-16 text-gray-500">
                                        <div className="max-w-sm mx-auto flex flex-col items-center">
                                            <AlertCircle size={32} className="text-gray-400 mb-2" />
                                            <p className="font-bold text-gray-700">No assets match your search criteria</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Try adjusting your filter parameters or search keyword.
                                            </p>
                                            <button
                                                onClick={handleClearAllFilters}
                                                className="mt-4 bg-primary-50 text-primary-700 font-bold px-4 py-2 rounded-lg text-xs hover:bg-primary-100 transition-colors"
                                            >
                                                Clear All Filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
                                    <tr key={asset.assetId} className="hover:bg-primary-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/assets/${asset.assetId}`}
                                                className="font-bold text-primary-700 hover:text-primary-900 hover:underline"
                                            >
                                                {asset.assetId}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 truncate max-w-[260px]">
                                                {asset.name}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-[260px] font-normal">
                                                {asset.type}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-gray-700">{asset.category}</td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {asset.administrative?.district}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge
                                                status={asset.condition?.status}
                                                score={asset.condition?.score}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                                                    asset.lifecycleStatus === 'Operational'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                        : asset.lifecycleStatus === 'Under Maintenance'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                {asset.lifecycleStatus || 'Operational'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/assets/${asset.assetId}/edit`}
                                                    className="p-1.5 text-gray-400 hover:text-primary-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Edit Asset"
                                                >
                                                    <Edit size={15} />
                                                </Link>
                                                <Link
                                                    to={`/assets/${asset.assetId}`}
                                                    className="text-primary-600 hover:text-primary-800 font-bold text-xs tracking-wide flex items-center gap-0.5 group bg-primary-50/70 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition-colors"
                                                >
                                                    View{' '}
                                                    <ChevronRight
                                                        size={14}
                                                        className="group-hover:translate-x-0.5 transition-transform"
                                                    />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AssetInventory;
