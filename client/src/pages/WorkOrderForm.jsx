import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, X } from 'lucide-react';

const WorkOrderForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState([]);
  
  const [form, setForm] = useState({
    assetId: '',
    issue: '',
    issueCategory: 'Civil',
    priority: 'Medium',
    estimatedCost: '',
    expectedCompletion: '',
    description: ''
  });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await api.get('/assets?limit=500');
        setAssets(res.data.assets);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : 0
      };
      
      const res = await api.post('/work-orders', payload);
      navigate(`/maintenance/${res.data._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to create work order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Maintenance Work Order</h1>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"><X size={20}/></button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6 font-semibold shadow-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-5">
           <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Target Asset</label>
                <select required value={form.assetId} onChange={(e)=>setForm({...form, assetId: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium">
                  <option value="" disabled>Select Asset...</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.assetId} - {a.name} ({a.condition.status})</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Issue Overview</label>
                <input type="text" required value={form.issue} onChange={(e)=>setForm({...form, issue: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium" placeholder="E.g. Repair structural cracks on pier 2" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Category</label>
                <select value={form.issueCategory} onChange={(e)=>setForm({...form, issueCategory: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium">
                  {['Structural', 'Electrical', 'Plumbing', 'Civil', 'Safety', 'Drainage', 'Surface', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Priority</label>
                <select value={form.priority} onChange={(e)=>setForm({...form, priority: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium">
                  {['Low', 'Medium', 'High', 'Critical'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Estimated Cost (₹ Lakhs)</label>
                <input type="number" min="0" step="0.01" value={form.estimatedCost} onChange={(e)=>setForm({...form, estimatedCost: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Expected Completion</label>
                <input type="date" required value={form.expectedCompletion} onChange={(e)=>setForm({...form, expectedCompletion: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Detailed Description</label>
                <textarea rows="4" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium" placeholder="Specific instructions for contractor..."></textarea>
              </div>
           </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md transition-all active:scale-95 disabled:opacity-70">
            <Save size={18} /> {loading ? 'Creating...' : 'Create Work Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkOrderForm;
