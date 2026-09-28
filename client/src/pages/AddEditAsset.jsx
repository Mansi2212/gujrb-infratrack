import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, X, Building, MapPin, Wrench, Shield, CheckCircle } from 'lucide-react';

const AddEditAsset = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [form, setForm] = useState({
        name: '',
        category: 'Roads',
        type: 'State Highway',
        district: 'Ahmedabad',
        taluka: '',
        address: '',
        landmark: '',
        latitude: 23.0225,
        longitude: 72.5714,
        designLife: 50,
        year: new Date().getFullYear(),
        originalCost: 0,
        contractor: '',
        managingAuthority: 'R&B Department, Gujarat',
        lifecycleStatus: 'Operational',
        trafficImportance: 'Medium',
        description: '',
        // Technical fields
        lengthMeters: '',
        widthMeters: '',
        spanCount: '',
        heightMeters: '',
        laneCount: '',
        pavementType: '',
        floorCount: '',
        builtUpSqMeters: '',
        ventCount: '',
        loadClass: ''
    });

    const categories = ['Roads', 'Bridges', 'Culverts', 'Government Buildings', 'Other Structures'];
    const districts = [
        'Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot', 
        'Bharuch', 'Bhavnagar', 'Mehsana', 'Jamnagar', 'Junagadh', 
        'Anand', 'Kutch', 'Morbi', 'Patan', 'Navsari'
    ];
    const lifecycleStatuses = ['Operational', 'Under Maintenance', 'Under Construction', 'Temporarily Closed', 'Decommissioned'];
    const trafficPriorities = ['Low', 'Medium', 'High'];

    useEffect(() => {
        if (!isEdit) return;

        const loadAsset = async () => {
            try {
                setFetching(true);
                const res = await api.get(`/assets/${id}`);
                const a = res.data.asset;
                if (!a) {
                    setError('Asset not found');
                    return;
                }
                const tech = a.technical || {};
                setForm({
                    name: a.name || '',
                    category: a.category || 'Roads',
                    type: a.type || '',
                    district: a.administrative?.district || 'Ahmedabad',
                    taluka: a.administrative?.taluka || '',
                    address: a.location?.address || '',
                    landmark: a.location?.landmark || '',
                    latitude: a.location?.latitude ?? 23.0225,
                    longitude: a.location?.longitude ?? 72.5714,
                    designLife: a.construction?.designLife ?? 50,
                    year: a.construction?.year ?? new Date().getFullYear(),
                    originalCost: a.construction?.originalCost ?? 0,
                    contractor: a.construction?.contractor || '',
                    managingAuthority: a.ownership?.managingAuthority || 'R&B Department, Gujarat',
                    lifecycleStatus: a.lifecycleStatus || 'Operational',
                    trafficImportance: a.usage?.trafficImportance || 'Medium',
                    description: a.description || '',
                    // Technical fields
                    lengthMeters: tech.lengthMeters ?? (tech.lengthKm ? tech.lengthKm * 1000 : ''),
                    widthMeters: tech.widthMeters ?? '',
                    spanCount: tech.spanCount ?? '',
                    heightMeters: tech.heightMeters ?? '',
                    laneCount: tech.laneCount ?? '',
                    pavementType: tech.pavementType ?? '',
                    floorCount: tech.floorCount ?? '',
                    builtUpSqMeters: tech.builtUpSqMeters ?? '',
                    ventCount: tech.ventCount ?? '',
                    loadClass: tech.loadClass ?? ''
                });
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || 'Failed to load asset data');
            } finally {
                setFetching(false);
            }
        };

        loadAsset();
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Build technical specs object
        const technical = {};
        if (form.lengthMeters) {
            if (form.category === 'Roads') {
                technical.lengthKm = parseFloat((form.lengthMeters / 1000).toFixed(2));
            } else {
                technical.lengthMeters = parseFloat(form.lengthMeters);
            }
        }
        if (form.widthMeters) technical.widthMeters = parseFloat(form.widthMeters);
        if (form.spanCount) technical.spanCount = parseInt(form.spanCount, 10);
        if (form.heightMeters) technical.heightMeters = parseFloat(form.heightMeters);
        if (form.laneCount) technical.laneCount = parseInt(form.laneCount, 10);
        if (form.pavementType) technical.pavementType = form.pavementType;
        if (form.floorCount) technical.floorCount = parseInt(form.floorCount, 10);
        if (form.builtUpSqMeters) technical.builtUpSqMeters = parseFloat(form.builtUpSqMeters);
        if (form.ventCount) technical.ventCount = parseInt(form.ventCount, 10);
        if (form.loadClass) technical.loadClass = form.loadClass;

        const payload = {
            name: form.name.trim(),
            category: form.category,
            type: form.type.trim(),
            description: form.description.trim(),
            administrative: {
                state: 'Gujarat',
                district: form.district,
                taluka: form.taluka.trim()
            },
            location: {
                address: form.address.trim(),
                landmark: form.landmark.trim(),
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude)
            },
            construction: {
                year: parseInt(form.year, 10) || new Date().getFullYear(),
                designLife: parseInt(form.designLife, 10) || 50,
                originalCost: parseFloat(form.originalCost) || 0,
                contractor: form.contractor.trim()
            },
            ownership: {
                owner: 'Government of Gujarat',
                managingAuthority: form.managingAuthority.trim()
            },
            usage: {
                trafficImportance: form.trafficImportance
            },
            lifecycleStatus: form.lifecycleStatus,
            technical
        };

        try {
            if (isEdit) {
                await api.put(`/assets/${id}`, payload);
                setSuccessMsg('Asset updated successfully!');
                setTimeout(() => navigate(`/assets/${id}`), 800);
            } else {
                const res = await api.post('/assets', payload);
                setSuccessMsg('Asset registered successfully!');
                setTimeout(() => navigate(`/assets/${res.data.assetId || res.data._id}`), 800);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to save asset');
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-semibold">Loading asset information...</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => navigate(isEdit ? `/assets/${id}` : '/assets')}
                        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors mb-2"
                    >
                        <ArrowLeft size={16} /> {isEdit ? 'Back to Asset Details' : 'Back to Asset Registry'}
                    </button>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        {isEdit ? `Edit Asset: ${id}` : 'Register New Asset'}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium">
                        {isEdit
                            ? 'Update administrative, location, operational, and technical parameters.'
                            : 'Add a physical Gujarat infrastructure asset to the command registry.'}
                    </p>
                </div>
                <button
                    onClick={() => navigate(isEdit ? `/assets/${id}` : '/assets')}
                    className="text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 font-semibold shadow-sm flex items-center gap-2">
                    <X size={18} /> {error}
                </div>
            )}

            {successMsg && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 mb-6 font-semibold shadow-sm flex items-center gap-2">
                    <CheckCircle size={18} /> {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-200">
                {/* 1. Basic Identification */}
                <div className="p-6 space-y-4">
                    <h3 className="text-xs font-bold text-primary-700 uppercase tracking-widest flex items-center gap-2">
                        <Building size={16} /> 1. Basic Information
                    </h3>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Asset Name *</label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-gray-50 focus:bg-white font-medium text-sm"
                            placeholder="E.g. Subhash Bridge - Sabarmati River Crossing"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Category *</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-medium bg-gray-50 text-sm"
                            >
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Specific Structural Type *</label>
                            <input
                                type="text"
                                required
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-gray-50 font-medium text-sm"
                                placeholder="E.g. 4-Lane RCC Girder Bridge"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Asset Description / Purpose</label>
                        <textarea
                            rows={3}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-gray-50 font-medium text-sm"
                            placeholder="Briefly describe the asset connectivity, purpose, and significance..."
                        />
                    </div>
                </div>

                {/* 2. Location & Administrative */}
                <div className="p-6 space-y-4">
                    <h3 className="text-xs font-bold text-primary-700 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={16} /> 2. Location & Geographic Positioning
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">District *</label>
                            <select
                                value={form.district}
                                onChange={(e) => setForm({ ...form, district: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                            >
                                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Taluka / Zone</label>
                            <input
                                type="text"
                                value={form.taluka}
                                onChange={(e) => setForm({ ...form, taluka: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                                placeholder="E.g. Daskroi / Sabarmati"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Physical Address / Corridor</label>
                            <input
                                type="text"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                                placeholder="E.g. Subhash Bridge Circle, Sabarmati"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Landmark</label>
                            <input
                                type="text"
                                value={form.landmark}
                                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                                placeholder="E.g. Near Gandhi Ashram"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Latitude (Decimal) *</label>
                            <input
                                type="number"
                                step="any"
                                required
                                value={form.latitude}
                                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                                placeholder="23.0592"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Longitude (Decimal) *</label>
                            <input
                                type="number"
                                step="any"
                                required
                                value={form.longitude}
                                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                                placeholder="72.5801"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Construction & Operational */}
                <div className="p-6 space-y-4">
                    <h3 className="text-xs font-bold text-primary-700 uppercase tracking-widest flex items-center gap-2">
                        <Wrench size={16} /> 3. Construction & Operations
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Construction Year</label>
                            <input
                                type="number"
                                min="1900"
                                max="2050"
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Design Life (Years)</label>
                            <input
                                type="number"
                                min="1"
                                max="150"
                                required
                                value={form.designLife}
                                onChange={(e) => setForm({ ...form, designLife: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Original Cost (₹ Lakhs)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.originalCost}
                                onChange={(e) => setForm({ ...form, originalCost: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">EPC Contractor</label>
                            <input
                                type="text"
                                value={form.contractor}
                                onChange={(e) => setForm({ ...form, contractor: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                                placeholder="E.g. Sadbhav Engineering Ltd / Patel Infra"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Managing Authority</label>
                            <input
                                type="text"
                                value={form.managingAuthority}
                                onChange={(e) => setForm({ ...form, managingAuthority: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Lifecycle Status</label>
                            <select
                                value={form.lifecycleStatus}
                                onChange={(e) => setForm({ ...form, lifecycleStatus: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                            >
                                {lifecycleStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">Traffic / Load Priority</label>
                            <select
                                value={form.trafficImportance}
                                onChange={(e) => setForm({ ...form, trafficImportance: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                            >
                                {trafficPriorities.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 4. Technical Specifications */}
                <div className="p-6 space-y-4">
                    <h3 className="text-xs font-bold text-primary-700 uppercase tracking-widest flex items-center gap-2">
                        <Shield size={16} /> 4. Technical Specifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">
                                {form.category === 'Roads' ? 'Length (Meters or Km × 1000)' : 'Length / Span Length (m)'}
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={form.lengthMeters}
                                onChange={(e) => setForm({ ...form, lengthMeters: e.target.value })}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                                placeholder="E.g. 440"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">
                                {form.category === 'Roads' ? 'Number of Lanes' : form.category === 'Government Buildings' ? 'Floor Count' : 'Width / Carriageway (m)'}
                            </label>
                            <input
                                type="text"
                                value={
                                    form.category === 'Roads'
                                        ? form.laneCount
                                        : form.category === 'Government Buildings'
                                        ? form.floorCount
                                        : form.widthMeters
                                }
                                onChange={(e) => {
                                    if (form.category === 'Roads') setForm({ ...form, laneCount: e.target.value });
                                    else if (form.category === 'Government Buildings') setForm({ ...form, floorCount: e.target.value });
                                    else setForm({ ...form, widthMeters: e.target.value });
                                }}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                                placeholder={form.category === 'Roads' ? '6' : form.category === 'Government Buildings' ? '5' : '18.5'}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 tracking-wide uppercase mb-1">
                                {form.category === 'Culverts' ? 'Vent Count' : form.category === 'Bridges' ? 'Number of Spans' : 'Pavement / Facade Type'}
                            </label>
                            <input
                                type="text"
                                value={
                                    form.category === 'Culverts'
                                        ? form.ventCount
                                        : form.category === 'Bridges'
                                        ? form.spanCount
                                        : form.pavementType
                                }
                                onChange={(e) => {
                                    if (form.category === 'Culverts') setForm({ ...form, ventCount: e.target.value });
                                    else if (form.category === 'Bridges') setForm({ ...form, spanCount: e.target.value });
                                    else setForm({ ...form, pavementType: e.target.value });
                                }}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium text-sm"
                                placeholder={form.category === 'Culverts' ? '2' : form.category === 'Bridges' ? '12' : 'Bituminous Macadam'}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 bg-gray-50/80 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(isEdit ? `/assets/${id}` : '/assets')}
                        className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 hover:text-gray-900 rounded-lg transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md transition-all active:scale-95 disabled:bg-primary-400 text-sm"
                    >
                        <Save size={18} /> {loading ? 'Saving...' : isEdit ? 'Update Asset' : 'Save & Register Asset'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEditAsset;
