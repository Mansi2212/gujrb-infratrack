import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PenTool, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

const WorkOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wo, setWo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWO();
  }, [id]);

  const fetchWO = async () => {
    try {
      const res = await api.get(`/work-orders/${id}`);
      setWo(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load work order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;
    setUpdating(true);
    try {
      const payload = { status: newStatus };
      if (newStatus === 'Completed') {
        payload.actualCost = wo.estimatedCost; // Simple mock for MVP completion
      }
      await api.put(`/work-orders/${id}`, payload);
      await fetchWO();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading details...</div>;
  if (!wo) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500 text-white';
      case 'In Progress': return 'bg-blue-500 text-white';
      case 'Delayed': return 'bg-red-500 text-white';
      case 'Assigned': return 'bg-amber-500 text-white';
      case 'Planned': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const statuses = ['Planned', 'Assigned', 'In Progress', 'Inspection', 'Completed'];

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <button onClick={() => navigate('/maintenance')} className="flex items-center gap-2 text-primary-600 hover:text-primary-800 font-medium mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Maintenance
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="text-sm font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{wo.workOrderId}</span>
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(wo.computedStatus || wo.status)}`}>
                 {wo.computedStatus || wo.status}
               </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{wo.issue}</h1>
            <p className="text-primary-600 font-bold mt-1">Asset: <Link to={`/assets/${wo.assetRef}`} className="hover:underline">{wo.assetRef} - {wo.assetName}</Link></p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100 mb-8">
           <div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Priority</div>
             <div className={`font-bold ${wo.priority === 'Critical' ? 'text-red-600' : 'text-gray-900'}`}>{wo.priority}</div>
           </div>
           <div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Category</div>
             <div className="font-bold text-gray-900">{wo.issueCategory}</div>
           </div>
           <div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Est. Cost</div>
             <div className="font-bold text-gray-900">₹ {wo.estimatedCost} Lakhs</div>
           </div>
           <div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Due Date</div>
             <div className="font-bold text-gray-900">{wo.expectedCompletion ? new Date(wo.expectedCompletion).toLocaleDateString() : 'N/A'}</div>
           </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b pb-2 mb-4 text-primary-700 border-primary-100">Status Workflow Actions</h3>
          <div className="flex gap-2 flex-wrap">
            {statuses.map(s => (
              <button 
                key={s}
                disabled={wo.status === s || updating || wo.status === 'Completed'}
                onClick={() => handleStatusChange(s)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${
                  wo.status === s 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : s === 'Completed'
                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'
                }`}
              >
                Mark as {s}
              </button>
            ))}
          </div>
          {wo.status === 'Completed' && <p className="text-sm font-medium text-green-600 mt-3 flex items-center gap-2"><CheckCircle size={16}/> Work Order is successfully completed and logged in Asset Lifecycle.</p>}
        </div>
        
        <div>
           <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b pb-2 mb-4 text-primary-700 border-primary-100">Description</h3>
           <p className="text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap">{wo.description || 'No detailed description provided.'}</p>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderDetails;
