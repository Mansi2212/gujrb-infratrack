import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Layers, Map, Building, AlertTriangle, PenTool, Activity, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [attention, setAttention] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, attnRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/attention')
                ]);
                setStats(statsRes.data);
                setAttention(attnRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading Dashboard Data...</div>;
    if (!stats) return <div className="p-8 text-center text-red-500 font-medium">Failed to load data. Is the server running?</div>;

    const kpis = [
        { label: 'Total Assets', value: stats.totalAssets, icon: Layers, color: 'bg-primary-500 text-white' },
        { label: 'Roads & Bridges', value: stats.roads + stats.bridges, icon: Map, color: 'bg-blue-600 text-white' },
        { label: 'Govt Buildings', value: stats.buildings, icon: Building, color: 'bg-indigo-600 text-white' },
        { label: 'Critical Assets', value: stats.criticalAssets, icon: AlertTriangle, color: 'bg-red-500 text-white animate-pulse' },
        { label: 'Inspections Due', value: stats.inspectionsDue, icon: Activity, color: 'bg-orange-500 text-white' },
        { label: 'Active Maint.', value: stats.activeMaintenance, icon: PenTool, color: 'bg-green-600 text-white' },
    ];

    const getConditionColor = (name) => {
        switch (name) {
            case 'Good': return '#22c55e';
            case 'Fair': return '#f59e0b';
            case 'Poor': return '#f97316';
            case 'Critical': return '#ef4444';
            default: return '#6b7280';
        }
    };
    
    const CAT_COLORS = ['#3b82f6', '#1d4ed8', '#1e3a8a', '#60a5fa', '#93c5fd'];
    const WO_COLORS = ['#94a3b8', '#fbbf24', '#3b82f6', '#8b5cf6', '#22c55e'];

    return (
        <div className="p-8 bg-gray-50 min-h-full">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gujarat R&B Command Center</h1>
                <p className="text-sm text-gray-500 font-medium mt-1">Unified Infrastructure Asset Lifecycle Monitoring</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-primary-200 transition-colors">
                        <div className={`p-3 rounded-full mb-3 shadow-sm ${kpi.color} group-hover:scale-110 transition-transform`}>
                            <kpi.icon size={22} />
                        </div>
                        <div className="text-3xl font-black text-gray-800 tracking-tight">{kpi.value || 0}</div>
                        <div className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider text-center">{kpi.label}</div>
                        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent group-hover:via-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">Condition Distribution</h2>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.charts?.conditionDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {stats.charts?.conditionDistribution?.map((entry, index) => <Cell key={`cell-${index}`} fill={getConditionColor(entry.name)} />)}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">Asset Categories</h2>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.charts?.categoryDistribution || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {stats.charts?.categoryDistribution?.map((entry, index) => <Cell key={`cell-${index}`} fill={CAT_COLORS[index % CAT_COLORS.length]} />)}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Assets by District</h2>
                        <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                            Click to Filter
                        </span>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.charts?.districtDistribution || []} margin={{top: 10, right: 10, left: -20, bottom: 25}}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="name" 
                                    interval={0}
                                    angle={-25}
                                    textAnchor="end"
                                    tick={{fontSize: 10, fill: '#4b5563', fontWeight: 600}} 
                                    axisLine={false} 
                                    tickLine={false}
                                    height={35}
                                />
                                <YAxis tick={{fontSize: 11}} axisLine={false} tickLine={false} />
                                <RechartsTooltip 
                                    cursor={{fill: '#f3f4f6'}} 
                                    formatter={(value, name, item) => [`${value} Assets`, item.payload.name]}
                                />
                                <Bar 
                                    dataKey="value" 
                                    fill="#3b82f6" 
                                    radius={[4, 4, 0, 0]}
                                    className="cursor-pointer hover:fill-primary-700 transition-colors"
                                    onClick={(entry) => {
                                        if (entry?.name) {
                                            navigate(`/assets?district=${encodeURIComponent(entry.name)}`);
                                        }
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">Work Order Status</h2>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={stats.charts?.workOrderStatus || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {stats.charts?.workOrderStatus?.map((entry, index) => <Cell key={`cell-${index}`} fill={WO_COLORS[index % WO_COLORS.length]} />)}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4">What Needs Attention?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="border border-red-100 bg-red-50/50 rounded-lg p-4 h-[300px] flex flex-col">
                      <h3 className="font-bold text-red-800 flex items-center gap-2 mb-3 border-b border-red-100 pb-2"><AlertTriangle size={16}/> Critical Assets ({attention?.critical?.length || 0})</h3>
                      <div className="overflow-y-auto flex-1 pr-2 space-y-2">
                        {attention?.critical?.map((item, i) => (
                           <div key={i} className="bg-white p-3 rounded shadow-sm border border-red-100">
                             <a href={`/assets/${item.assetId}`} className="font-bold text-primary-700 text-sm hover:underline block">{item.assetId} - {item.name}</a>
                             <div className="text-xs text-red-600 font-medium mt-1">{item.reason} &bull; {item.action}</div>
                           </div>
                        ))}
                        {attention?.critical?.length === 0 && <p className="text-gray-500 text-sm italic">No critical assets found.</p>}
                      </div>
                   </div>

                   <div className="border border-orange-100 bg-orange-50/50 rounded-lg p-4 h-[300px] flex flex-col">
                      <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-3 border-b border-orange-100 pb-2"><Activity size={16}/> Overdue Inspections ({attention?.overdue?.length || 0})</h3>
                      <div className="overflow-y-auto flex-1 pr-2 space-y-2">
                        {attention?.overdue?.map((item, i) => (
                           <div key={i} className="bg-white p-3 rounded shadow-sm border border-orange-100">
                             <a href={`/assets/${item.assetId}`} className="font-bold text-primary-700 text-sm hover:underline block">{item.assetId} - {item.name}</a>
                             <div className="text-xs text-orange-600 font-medium mt-1">{item.reason} &bull; {item.action}</div>
                           </div>
                        ))}
                        {attention?.overdue?.length === 0 && <p className="text-gray-500 text-sm italic">All inspections are up to date.</p>}
                      </div>
                   </div>

                   <div className="border border-amber-100 bg-amber-50/50 rounded-lg p-4 h-[300px] flex flex-col">
                      <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3 border-b border-amber-100 pb-2"><ShieldAlert size={16}/> Maintenance Required ({attention?.maintenance?.length || 0})</h3>
                      <div className="overflow-y-auto flex-1 pr-2 space-y-2">
                        {attention?.maintenance?.map((item, i) => (
                           <div key={i} className="bg-white p-3 rounded shadow-sm border border-amber-100">
                             <a href={`/assets/${item.assetId}`} className="font-bold text-primary-700 text-sm hover:underline block">{item.assetId} - {item.name}</a>
                             <div className="text-xs text-amber-600 font-medium mt-1">{item.reason} &bull; {item.action}</div>
                           </div>
                        ))}
                        {attention?.maintenance?.length === 0 && <p className="text-gray-500 text-sm italic">No maintenance alerts at this time.</p>}
                      </div>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
