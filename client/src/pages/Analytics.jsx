import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Filter,
    HardHat,
    Layers,
    MapPin,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
    Wrench,
    ArrowUpRight
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import api from '../services/api';

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState('All');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics');
                setAnalytics(res.data);
            } catch (err) {
                console.error('Error fetching analytics data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-semibold">Calculating Infrastructure Analytics & Lifecycle Metrics...</p>
            </div>
        );
    }

    if (!analytics || !analytics.summary) {
        return (
            <div className="p-8 text-center text-red-500 font-semibold">
                Failed to load infrastructure analytics. Please check that the server is running.
            </div>
        );
    }

    const { summary, ageDistribution, districtComparison, categoryMatrix, defectDistribution, atRiskAssets } = analytics;

    const filteredDistricts =
        selectedDistrict === 'All'
            ? districtComparison
            : districtComparison.filter((d) => d.district === selectedDistrict);

    const filteredAtRisk =
        selectedDistrict === 'All'
            ? atRiskAssets
            : atRiskAssets.filter((a) => a.district === selectedDistrict);

    const CAT_COLORS = ['#2563eb', '#0284c7', '#4f46e5', '#059669', '#d97706'];
    const CONDITION_COLORS = {
        Good: '#22c55e',
        Fair: '#f59e0b',
        Poor: '#f97316',
        Critical: '#ef4444'
    };

    const conditionData = [
        { name: 'Good', value: summary.goodCount, fill: '#22c55e' },
        { name: 'Fair', value: summary.fairCount, fill: '#f59e0b' },
        { name: 'Poor', value: summary.poorCount, fill: '#f97316' },
        { name: 'Critical', value: summary.criticalCount, fill: '#ef4444' }
    ];

    const getHealthColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
        if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="p-8 bg-gray-50 min-h-full space-y-8 overflow-y-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-lg bg-primary-600 text-white shadow-sm">
                            <BarChart3 size={20} />
                        </span>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            Infrastructure Analytics & Lifecycle Intelligence
                        </h1>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Predictive asset degradation modeling, CapEx valuation, district heatmaps, and rehabilitation backlog.
                    </p>
                </div>

                {/* District Filter Dropdown */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-xs">
                    <Filter size={15} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">District:</span>
                    <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer"
                    >
                        <option value="All">All Districts ({districtComparison.length})</option>
                        {districtComparison.map((d) => (
                            <option key={d.district} value={d.district}>
                                {d.district} ({d.assetCount})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Top KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Statewide Health Index</p>
                            <div className="text-3xl font-black text-gray-900 tracking-tight mt-1 flex items-baseline gap-1">
                                {summary.avgConditionScore}
                                <span className="text-sm font-semibold text-gray-400">/100</span>
                            </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getHealthColor(summary.avgConditionScore)}`}>
                            {summary.statewideHealthStatus}
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Activity size={14} className="text-primary-600" /> Across {summary.totalAssets} physical assets
                    </div>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none"></div>
                </div>

                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Portfolio Valuation</p>
                            <div className="text-3xl font-black text-gray-900 tracking-tight mt-1">
                                ₹{summary.totalValuationCr.toLocaleString('en-IN')} <span className="text-sm font-semibold text-gray-500">Cr</span>
                            </div>
                        </div>
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <DollarSign size={18} />
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500">
                        Total sanctioned EPC capital investment
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Maintenance Committed</p>
                            <div className="text-3xl font-black text-amber-600 tracking-tight mt-1">
                                ₹{summary.totalMaintenanceCommitted.toLocaleString('en-IN')} <span className="text-sm font-semibold text-gray-500">L</span>
                            </div>
                        </div>
                        <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Wrench size={18} />
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500">
                        Active live infrastructure work orders
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">5-Yr Rehab Backlog</p>
                            <div className="text-3xl font-black text-red-600 tracking-tight mt-1">
                                ₹{summary.estimatedRehabBacklog.toLocaleString('en-IN')} <span className="text-sm font-semibold text-gray-500">L</span>
                            </div>
                        </div>
                        <span className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <ShieldAlert size={18} />
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-red-600">
                        <AlertTriangle size={13} /> {summary.criticalCount} critical & {summary.poorCount} poor assets
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Inspection Compliance</p>
                            <div className="text-3xl font-black text-green-600 tracking-tight mt-1">
                                {summary.complianceRate}%
                            </div>
                        </div>
                        <span className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle2 size={18} />
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Calendar size={13} /> Up to date inspection schedules
                    </div>
                </div>
            </div>

            {/* Row 1: Age vs Degradation & Condition Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Age Degradation Curve */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <TrendingDown size={18} className="text-primary-600" /> Infrastructure Degradation Curve
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                Mean Condition Score vs Structural Operating Age Brackets
                            </p>
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            Lifecycle Analysis
                        </span>
                    </div>

                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ageDistribution} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="bracket" tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                    formatter={(value, name) => [
                                        name === 'avgScore' ? `${value}/100 Score` : `${value} Assets`,
                                        name === 'avgScore' ? 'Avg Condition Score' : 'Total Assets'
                                    ]}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 10 }} />
                                <Bar dataKey="avgScore" name="Avg Condition Score" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={36} />
                                <Bar dataKey="assetCount" name="Asset Count" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Condition Distribution Donut */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 tracking-tight">Condition Distribution</h2>
                            <p className="text-xs text-gray-500 font-medium">Portfolio health breakdown</p>
                        </div>
                    </div>

                    <div className="h-[230px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={conditionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {conditionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value) => [`${value} Assets (${Math.round((value / summary.totalAssets) * 100)}%)`, 'Count']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-gray-100">
                        {conditionData.map((c) => (
                            <div key={c.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/80 text-xs">
                                <span className="flex items-center gap-1.5 font-bold text-gray-700">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }}></span>
                                    {c.name}
                                </span>
                                <span className="font-black text-gray-900">{c.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 2: District Comparison & Category CapEx */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* District Comparison Bar Chart */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <MapPin size={18} className="text-primary-600" /> District Infrastructure Performance
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">Assets count and average condition score by district</p>
                        </div>
                    </div>

                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredDistricts} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="district" 
                                    interval={0}
                                    angle={-25}
                                    textAnchor="end"
                                    tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
                                    axisLine={false} 
                                    tickLine={false}
                                    height={35}
                                />
                                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                    formatter={(value, name) => [
                                        name === 'avgScore' ? `${value}/100 Score` : `${value} Assets`,
                                        name === 'avgScore' ? 'Avg Condition Score' : 'Asset Count'
                                    ]}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                                <Bar dataKey="avgScore" name="Avg Condition Score" fill="#0284c7" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="assetCount" name="Asset Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Capital Matrix */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <Building2 size={18} className="text-primary-600" /> Category Valuation & Maintenance
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">Sanctioned capital investment (₹ Lakhs) by category</p>
                        </div>
                    </div>

                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryMatrix} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} axisLine={false} tickLine={false} />
                                <RechartsTooltip
                                    formatter={(value, name) => [
                                        name === 'totalValuationLakhs' ? `₹${value.toLocaleString('en-IN')} Lakhs` : value,
                                        name === 'totalValuationLakhs' ? 'Capital Value' : 'Maintenance Required'
                                    ]}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                                <Bar dataKey="totalValuationLakhs" name="Capital Value (₹ Lakhs)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={18} />
                                <Bar dataKey="maintenanceCount" name="Maintenance Required" fill="#f97316" radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Row 3: Defect Analytics & Predictive At-Risk Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Defect Classification Bar */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
                    <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2 mb-1">
                        <AlertTriangle size={18} className="text-amber-500" /> Defect Prevalences
                    </h2>
                    <p className="text-xs text-gray-500 font-medium mb-6">Most recurring defects detected during physical inspections</p>

                    <div className="space-y-4">
                        {defectDistribution.slice(0, 6).map((d, index) => (
                            <div key={d.type} className="space-y-1">
                                <div className="flex justify-between text-xs font-semibold text-gray-700">
                                    <span>{d.type}</span>
                                    <span className="font-bold text-gray-900">{d.count} occurrences</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary-600"
                                        style={{
                                            width: `${Math.min(100, (d.count / (defectDistribution[0]?.count || 1)) * 100)}%`,
                                            backgroundColor: index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#3b82f6'
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Predictive High-Risk Assets Priority Matrix */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <ShieldAlert size={18} className="text-red-500" /> Predictive High-Risk Asset Prioritization
                            </h2>
                            <p className="text-xs text-gray-500 font-medium">
                                Assets requiring immediate rehabilitation budget before critical failure
                            </p>
                        </div>
                        <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                            {filteredAtRisk.length} Assets Identified
                        </span>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-gray-50/90 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Asset</th>
                                    <th className="px-4 py-3">District</th>
                                    <th className="px-4 py-3 text-center">Score</th>
                                    <th className="px-4 py-3">Life Exhausted</th>
                                    <th className="px-4 py-3 text-right">Est. Rehab Budget</th>
                                    <th className="px-4 py-3 text-center">Urgency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAtRisk.slice(0, 6).map((asset) => (
                                    <tr key={asset.assetId} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link
                                                to={`/assets/${asset.assetId}`}
                                                className="font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1 group"
                                            >
                                                {asset.assetId}
                                                <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                            <p className="text-gray-500 truncate max-w-[200px] text-[11px] font-medium">{asset.name}</p>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-700">{asset.district}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                                                    asset.conditionStatus === 'Critical'
                                                        ? 'bg-red-100 text-red-700 border border-red-200'
                                                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                                                }`}
                                            >
                                                {asset.conditionScore} ({asset.conditionStatus})
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full ${
                                                            asset.lifeExhaustedPct >= 80 ? 'bg-red-500' : 'bg-amber-500'
                                                        }`}
                                                        style={{ width: `${asset.lifeExhaustedPct}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-semibold text-gray-700 text-[11px]">
                                                    {asset.lifeExhaustedPct}% ({asset.ageYears}y/{asset.designLife}y)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-black text-gray-900">
                                            ₹{asset.estRehabLakhs.toLocaleString('en-IN')} L
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    asset.urgency === 'Immediate'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                }`}
                                            >
                                                {asset.urgency}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
