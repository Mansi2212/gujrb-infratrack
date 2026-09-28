import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    MapPin,
    Calendar,
    CheckCircle,
    AlertTriangle,
    ShieldCheck,
    Wrench,
    Layers,
    Clock,
    DollarSign,
    HardHat,
    Compass,
    Building2,
    Activity,
    Plus
} from 'lucide-react';
import api from '../services/api';

const AssetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const res = await api.get(`/assets/${id}`);
                setData(res.data);
            } catch (err) {
                console.error('Error fetching asset details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAsset();
    }, [id]);

    if (loading) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-semibold">Loading Asset Details...</p>
            </div>
        );
    }

    if (!data?.asset) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 max-w-md mx-auto">
                    <AlertTriangle size={32} className="mx-auto mb-2" />
                    <h2 className="text-lg font-bold">Asset Not Found</h2>
                    <p className="text-sm mt-1">The requested asset ID "{id}" could not be located in the database.</p>
                    <button
                        onClick={() => navigate('/assets')}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Back to Registry
                    </button>
                </div>
            </div>
        );
    }

    const { asset, lifecycle = [] } = data;
    const c = asset.condition || {};
    const tech = asset.technical || {};

    const statusColors = {
        Good: 'bg-green-100 text-green-700 border-green-200',
        Fair: 'bg-amber-100 text-amber-700 border-amber-200',
        Poor: 'bg-orange-100 text-orange-700 border-orange-200',
        Critical: 'bg-red-500 text-white border-red-600 shadow-md animate-pulse',
    };

    // Helper to format technical keys into human-friendly labels
    const formatTechLabel = (key) => {
        const labelMap = {
            spanMeters: 'Span Length (m)',
            spanCount: 'Number of Spans',
            lengthMeters: 'Total Length (m)',
            lengthKm: 'Total Length (km)',
            widthMeters: 'Carriageway / Deck Width (m)',
            heightMeters: 'Clearance Height (m)',
            barrelLengthMeters: 'Barrel Length (m)',
            ventCount: 'Number of Vents / Cells',
            laneCount: 'Number of Lanes',
            pavementType: 'Pavement Surface Type',
            floorCount: 'Number of Floors / Storeys',
            builtUpSqMeters: 'Total Built-up Area (sq.m)',
            seismicZone: 'Seismic Design Zone',
            loadClass: 'Design Load Rating',
            canopyAreaSqMeters: 'Canopy Space Area (sq.m)',
            barrierLengthKm: 'Coastal Barrier Length (km)',
            wallHeightMeters: 'Wall Retaining Height (m)',
            crestLevelMeters: 'Crest Level (m)',
            floodRetentionDischargeCusecs: 'Flood Discharge (cusecs)',
            radialGates: 'Number of Radial Gates',
            hoistingCapacityTonnes: 'Hoisting Capacity (Tonnes)',
            tetrapodWeightTonnes: 'Armor Tetrapod Weight (Tonnes)',
            bedCapacity: 'Bed Capacity',
            oxygenPlantCount: 'Medical Oxygen Plants',
            solarPowerKW: 'Solar Rooftop Power (kW)',
            smartClassrooms: 'Smart Classrooms',
            labs: 'Laboratory Facilities',
            hvacType: 'HVAC Air System',
            fireSystem: 'Fire Suppression Standard',
            rightOfWayMeters: 'Right of Way (m)',
        };
        if (labelMap[key]) return labelMap[key];
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };

    return (
        <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
            {/* Top Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/assets')}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-semibold transition-colors text-sm"
                >
                    <ArrowLeft size={18} /> Back to Registry
                </button>
            </div>

            {/* Asset Header Banner */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{asset.name}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                {asset.assetId}
                            </span>
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1.5 border border-gray-200">
                                <MapPin size={13} className="text-primary-600" />
                                {asset.administrative?.district || 'Gujarat'}
                            </span>
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                {asset.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${statusColors[c.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                {c.status || 'Unknown'}
                            </span>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                {asset.lifecycleStatus || 'Operational'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(`/assets/${asset.assetId}/edit`)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors text-sm shadow-sm active:scale-95"
                        >
                            <Edit size={16} /> Edit Asset
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex border-b border-gray-200 bg-gray-50/70">
                            {['Overview', 'Technical', 'Lifecycle'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-6 py-4 font-bold text-sm tracking-wide transition-all ${
                                        activeTab === tab
                                            ? 'text-primary-600 border-b-2 border-primary-600 bg-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 min-h-[420px]">
                            {/* OVERVIEW TAB */}
                            {activeTab === 'Overview' && (
                                <div className="space-y-6">
                                    {asset.description && (
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Description</h3>
                                            <p className="text-sm font-medium text-gray-800 leading-relaxed">{asset.description}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Category & Specific Type</h3>
                                            <p className="font-bold text-gray-900 text-sm">{asset.category} &rsaquo; {asset.type}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Lifecycle Status</h3>
                                            <span className="inline-block font-bold text-sm text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-100">
                                                {asset.lifecycleStatus}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Owning Authority</h3>
                                            <p className="font-semibold text-gray-900 text-sm">{asset.ownership?.owner || 'Government of Gujarat'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Managing Authority</h3>
                                            <p className="font-semibold text-gray-900 text-sm">{asset.ownership?.managingAuthority || 'R&B Department, Gujarat'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Commissioning Date</h3>
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {asset.construction?.commissioningDate
                                                    ? new Date(asset.construction.commissioningDate).toLocaleDateString('en-IN', {
                                                          day: 'numeric',
                                                          month: 'long',
                                                          year: 'numeric',
                                                      })
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Traffic / Load Priority</h3>
                                            <p className="font-semibold text-gray-900 text-sm">{asset.usage?.trafficImportance || 'Medium'} Priority</p>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Location & Administrative Division</h3>
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-sm">
                                                <p className="font-medium text-gray-800">
                                                    <span className="font-bold">Address:</span> {asset.location?.address || 'No specific address street provided'}
                                                </p>
                                                {asset.location?.landmark && (
                                                    <p className="font-medium text-gray-700">
                                                        <span className="font-bold">Landmark:</span> {asset.location.landmark}
                                                    </p>
                                                )}
                                                <p className="text-gray-600">
                                                    <span className="font-bold">Subdivision / Division:</span> {asset.administrative?.subdivision || 'Subdivision A'}, {asset.administrative?.division || 'District Division'}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-bold">Taluka / District:</span> {asset.administrative?.taluka || 'District Core'}, {asset.administrative?.district}, {asset.administrative?.state}
                                                </p>
                                                <p className="text-xs text-primary-700 font-mono mt-2">
                                                    GPS: {asset.location?.latitude?.toFixed(4)}° N, {asset.location?.longitude?.toFixed(4)}° E
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TECHNICAL TAB */}
                            {activeTab === 'Technical' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                <Wrench size={18} className="text-primary-600" /> Engineered Technical Parameters
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                Physical metrics, design standards, and dimensional parameters for {asset.category}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/assets/${asset.assetId}/edit`)}
                                            className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors border border-primary-100"
                                        >
                                            <Edit size={13} /> Update Parameters
                                        </button>
                                    </div>

                                    {/* Dynamic Technical Specs Grid */}
                                    {tech && Object.keys(tech).length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {Object.entries(tech).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 flex flex-col justify-between hover:border-primary-200 transition-colors"
                                                >
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                        {formatTechLabel(key)}
                                                    </span>
                                                    <span className="text-xl font-black text-gray-900">
                                                        {typeof value === 'number'
                                                            ? value.toLocaleString('en-IN')
                                                            : String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center">
                                            <Layers size={28} className="mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm font-semibold text-gray-700">No category-specific technical metrics recorded.</p>
                                            <p className="text-xs text-gray-500 mt-1">Click below to add dimensional and structural specifications.</p>
                                            <button
                                                onClick={() => navigate(`/assets/${asset.assetId}/edit`)}
                                                className="mt-3 bg-white border border-gray-300 hover:border-primary-500 text-primary-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                                            >
                                                Add Technical Specs
                                            </button>
                                        </div>
                                    )}

                                    {/* Construction & Engineering Parameters */}
                                    <div className="pt-2">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                                            Construction & Engineering Information
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                                    <Calendar size={14} /> Construction Year
                                                </div>
                                                <div className="text-lg font-black text-gray-900">
                                                    {asset.construction?.year || 'N/A'}
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                                    <Clock size={14} /> Design Life
                                                </div>
                                                <div className="text-lg font-black text-gray-900">
                                                    {asset.construction?.designLife || 50} Years
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {asset.construction?.year
                                                        ? `${Math.max(0, (asset.construction.designLife || 50) - (new Date().getFullYear() - asset.construction.year))} yrs operational remaining`
                                                        : ''}
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                                    <DollarSign size={14} /> Sanctioned Project Cost
                                                </div>
                                                <div className="text-lg font-black text-gray-900">
                                                    ₹{asset.construction?.originalCost ? Number(asset.construction.originalCost).toLocaleString('en-IN') : '0'} Lakhs
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs sm:col-span-2">
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                                    <HardHat size={14} /> EPC / Construction Agency
                                                </div>
                                                <div className="text-base font-bold text-gray-900">
                                                    {asset.construction?.contractor || 'State R&B Engineering Wing'}
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mb-1">
                                                    <Activity size={14} /> Load Service Importance
                                                </div>
                                                <div className="text-base font-bold text-gray-900">
                                                    {asset.usage?.trafficImportance || 'Medium'} Priority
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* LIFECYCLE TAB */}
                            {activeTab === 'Lifecycle' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                <Clock size={18} className="text-primary-600" /> Infrastructure Lifecycle History
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Chronological events, past maintenance, condition inspections, and work orders
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative border-l-2 border-primary-200 ml-4 space-y-6 pt-2 pb-2">
                                        {[...lifecycle]
                                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                                            .map((ev, i) => (
                                                <div key={i} className="pl-6 relative">
                                                    <div className="absolute w-4 h-4 bg-primary-500 rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
                                                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs hover:border-primary-300 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                                                {ev.eventType}
                                                            </h4>
                                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded border border-gray-100">
                                                                {new Date(ev.date).toLocaleDateString('en-IN', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 text-sm font-medium leading-relaxed">{ev.description}</p>
                                                        {ev.cost ? (
                                                            <p className="text-xs font-bold text-amber-700 mt-2 bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-100">
                                                                Cost Impact: ₹{ev.cost} Lakhs
                                                            </p>
                                                        ) : null}
                                                        {ev.performedBy && (
                                                            <p className="text-xs font-bold text-primary-700 mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
                                                                <ShieldCheck size={13} /> Recorded By: {ev.performedBy}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        {lifecycle.length === 0 && (
                                            <p className="text-gray-500 italic pl-4 font-medium text-sm">
                                                No historical lifecycle events recorded yet for this asset.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Score & Actions */}
                <div className="space-y-6">
                    {/* Condition Score Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div
                            className={`p-6 text-white text-center ${
                                c.score >= 80
                                    ? 'bg-green-500'
                                    : c.score >= 60
                                    ? 'bg-amber-500'
                                    : c.score >= 40
                                    ? 'bg-orange-500'
                                    : 'bg-red-500'
                            }`}
                        >
                            <h2 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Condition Score</h2>
                            <div className="text-6xl font-black tracking-tighter">
                                {c.score ?? '--'}
                                <span className="text-2xl opacity-75">/100</span>
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest mt-2">{c.status || 'Not Evaluated'}</div>
                        </div>
                        <div className="p-5 space-y-3 bg-gray-50/70">
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-gray-600">Physical Rating (40)</span>
                                <span className="font-bold text-gray-900">{c.components?.physical || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-gray-600">Safety Rating (20)</span>
                                <span className="font-bold text-gray-900">{c.components?.safety || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-gray-600">Age & Life (15)</span>
                                <span className="font-bold text-gray-900">{c.components?.age || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-gray-600">Inspection Findings (15)</span>
                                <span className="font-bold text-gray-900">{c.components?.findings || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold text-gray-600">Usage & Load (10)</span>
                                <span className="font-bold text-gray-900">{c.components?.usage || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Inspection Schedule Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3 text-sm">
                            <Calendar size={16} className="text-primary-600" /> Inspection Status
                        </h3>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">Last Inspected:</span>
                                <span className="font-bold text-gray-800">
                                    {c.lastInspectionDate ? new Date(c.lastInspectionDate).toLocaleDateString('en-IN') : 'Pending'}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">Next Due Date:</span>
                                <span
                                    className={`font-bold ${
                                        c.nextInspectionDate && new Date(c.nextInspectionDate) < new Date()
                                            ? 'text-red-600'
                                            : 'text-gray-800'
                                    }`}
                                >
                                    {c.nextInspectionDate ? new Date(c.nextInspectionDate).toLocaleDateString('en-IN') : 'Not Scheduled'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/inspections/new?assetId=${asset.assetId}`)}
                            className="mt-4 w-full bg-white hover:bg-gray-50 text-primary-700 py-2 rounded-lg font-bold shadow-xs border border-primary-200 transition-colors text-xs flex items-center justify-center gap-1.5"
                        >
                            <Plus size={14} /> Schedule Inspection
                        </button>
                    </div>

                    {/* Maintenance Recommendation Card */}
                    <div className="bg-primary-50 rounded-xl border border-primary-200 p-5 shadow-sm">
                        <h3 className="font-bold text-primary-900 flex items-center gap-2 mb-2 text-sm">
                            <ShieldCheck size={18} /> Maintenance Recommendation
                        </h3>
                        {c.maintenanceRecommended ? (
                            <div>
                                <p className="text-xs text-primary-800 font-medium leading-relaxed">
                                    Condition rating indicates intervention required. A maintenance work order should be executed.
                                </p>
                                <button
                                    onClick={() => navigate(`/maintenance/new?assetId=${asset.assetId}`)}
                                    className="mt-3.5 w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-bold shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5 active:scale-95"
                                >
                                    <Plus size={14} /> Create Work Order
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-primary-700 font-medium leading-relaxed">
                                Asset condition is operational and within normal tolerances. Routine maintenance cycle applies.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetDetails;
