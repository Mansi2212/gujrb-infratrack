import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Save, ArrowLeft, X } from 'lucide-react';

const InspectionForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialAssetId = searchParams.get('assetId') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assets, setAssets] = useState([]);
  
  const [form, setForm] = useState({
    assetId: initialAssetId, // The MongoDB _id or assetId depending on how we handle it. Wait, the backend expects MongoDB ObjectId for assetId. So we need the ObjectId.
    assetRef: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: 'Demo Inspector', // Default for MVP
    type: 'Routine',
    physicalRating: 3,
    safetyRating: 3,
    defects: [], // Will hold single defect for MVP simplicity
    defectType: 'None',
    defectSeverity: 'None',
    remarks: '',
    recommendedAction: 'No action'
  });

  useEffect(() => {
    // Fetch assets for dropdown
    const fetchAssets = async () => {
      try {
        const res = await api.get('/assets?limit=500');
        setAssets(res.data.assets);
        if (initialAssetId) {
          const match = res.data.assets.find(a => a.assetId === initialAssetId);
          if (match) setForm(f => ({ ...f, assetId: match._id, assetRef: match.assetId }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAssets();
  }, [initialAssetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const defectsArray = [];
    if (form.defectType !== 'None') {
      defectsArray.push({
        type: form.defectType,
        severity: form.defectSeverity === 'None' ? 'Low' : form.defectSeverity
      });
    }

    try {
      const payload = {
        assetId: form.assetId,
        inspectionDate: form.inspectionDate,
        inspectorName: form.inspectorName,
        type: form.type,
        physicalRating: parseInt(form.physicalRating),
        safetyRating: parseInt(form.safetyRating),
        defects: defectsArray,
        remarks: form.remarks,
        recommendedAction: form.recommendedAction
      };
      
      const res = await api.post('/inspections', payload);
      // Navigate to asset details to see updated condition
      navigate(`/assets/${res.data.asset.assetId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit inspection');
    } finally {
      setLoading(false);
    }
  };

  const defectTypes = ['None', 'Crack', 'Corrosion', 'Surface deterioration', 'Pothole', 'Drainage issue', 'Structural damage', 'Water leakage', 'Electrical issue', 'Fire safety issue', 'Other'];
  const severities = ['None', 'Low', 'Medium', 'High', 'Critical'];
  const actions = ['No action', 'Routine maintenance', 'Preventive maintenance', 'Repair', 'Major rehabilitation', 'Detailed structural inspection', 'Emergency intervention'];

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Submit Inspection Report</h1>
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"><X size={20}/></button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6 font-semibold shadow-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-5">
           <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b pb-2 mb-4 text-primary-700 border-primary-100">1. Administrative</h3>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Asset</label>
                <select required value={form.assetId} onChange={(e)=>setForm({...form, assetId: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium">
                  <option value="" disabled>Select Asset...</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.assetId} - {a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Inspection Date</label>
                <input type="date" required value={form.inspectionDate} onChange={(e)=>setForm({...form, inspectionDate: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Inspector</label>
                <input type="text" required value={form.inspectorName} onChange={(e)=>setForm({...form, inspectorName: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Inspection Type</label>
                <select value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium">
                  {['Routine', 'Structural', 'Safety', 'Post-event', 'Emergency'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
           </div>
        </div>

        <div className="p-6 border-b border-gray-200 space-y-5">
           <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b pb-2 mb-4 text-primary-700 border-primary-100">2. Condition & Findings</h3>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1 flex justify-between">
                  <span>Physical Condition Rating</span>
                  <span className="text-primary-600">{form.physicalRating}/5</span>
                </label>
                <input type="range" min="1" max="5" value={form.physicalRating} onChange={(e)=>setForm({...form, physicalRating: e.target.value})} className="w-full mt-2 accent-primary-600" />
                <div className="flex justify-between text-xs text-gray-400 font-bold mt-1"><span>1 - Critical</span><span>5 - Excellent</span></div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1 flex justify-between">
                  <span>Safety Rating</span>
                  <span className="text-primary-600">{form.safetyRating}/5</span>
                </label>
                <input type="range" min="1" max="5" value={form.safetyRating} onChange={(e)=>setForm({...form, safetyRating: e.target.value})} className="w-full mt-2 accent-primary-600" />
                <div className="flex justify-between text-xs text-gray-400 font-bold mt-1"><span>1 - Dangerous</span><span>5 - Safe</span></div>
              </div>
           </div>

           <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mt-4">
             <h4 className="font-bold text-orange-800 mb-3 text-sm">Primary Defect Observed (Optional)</h4>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">Defect Type</label>
                  <select value={form.defectType} onChange={(e)=>setForm({...form, defectType: e.target.value})} className="w-full p-2 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 outline-none font-medium bg-white">
                    {defectTypes.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-orange-700 uppercase tracking-wide mb-1">Severity</label>
                  <select value={form.defectSeverity} onChange={(e)=>setForm({...form, defectSeverity: e.target.value})} disabled={form.defectType === 'None'} className="w-full p-2 border border-orange-300 rounded focus:ring-2 focus:ring-orange-500 outline-none font-medium bg-white disabled:opacity-50">
                    {severities.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
             </div>
           </div>
        </div>

        <div className="p-6 border-b border-gray-200 space-y-5">
           <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b pb-2 mb-4 text-primary-700 border-primary-100">3. Action & Remarks</h3>
           <div>
              <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Recommended Action</label>
              <select value={form.recommendedAction} onChange={(e)=>setForm({...form, recommendedAction: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium">
                {actions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
           </div>
           <div>
              <label className="block text-sm font-bold text-gray-700 tracking-wide mb-1">Remarks</label>
              <textarea rows="3" value={form.remarks} onChange={(e)=>setForm({...form, remarks: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-gray-50 font-medium" placeholder="Additional observations..."></textarea>
           </div>
        </div>

        <div className="p-6 bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-md transition-all active:scale-95 disabled:opacity-70">
            <Save size={18} /> {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InspectionForm;
