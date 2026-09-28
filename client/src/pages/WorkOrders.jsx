import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, PenTool, ChevronRight, Clock, AlertCircle, CheckCircle, MoreHorizontal } from 'lucide-react';
import api from '../services/api';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWOs = async () => {
      try {
        const res = await api.get('/work-orders');
        setWorkOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWOs();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Delayed': return 'bg-red-100 text-red-700 border-red-200';
      case 'Assigned': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Planned': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (p) => {
    if (p === 'Critical' || p === 'High') return 'text-red-600 font-bold';
    return 'text-gray-600';
  };

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Maintenance</h1>
          <p className="text-sm text-gray-500 font-medium">Track and manage physical infrastructure work orders.</p>
        </div>
        <Link to="/maintenance/new" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-sm transition-colors text-sm tracking-wide">
          <Plus size={18} /> Create Work Order
        </Link>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-600 text-xs uppercase font-bold tracking-wider sticky top-0 border-b border-gray-200 z-0">
              <tr>
                <th className="px-6 py-4">Work Order ID</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Issue</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500 font-medium">Loading work orders...</td></tr>
              ) : workOrders.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500 font-medium">No active maintenance work orders.</td></tr>
              ) : (
                workOrders.map((wo) => (
                  <tr key={wo.workOrderId} className="hover:bg-primary-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{wo.workOrderId}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-primary-600"><Link to={`/assets/${wo.assetRef}`} className="hover:underline">{wo.assetRef}</Link></div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">{wo.assetName}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{wo.issue}</td>
                    <td className={`px-6 py-4 ${getPriorityColor(wo.priority)}`}>{wo.priority}</td>
                    <td className="px-6 py-4 text-gray-600">{wo.expectedCompletion ? new Date(wo.expectedCompletion).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusBadge(wo.computedStatus || wo.status)}`}>
                        {wo.computedStatus || wo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/maintenance/${wo._id}`} className="text-primary-600 hover:text-primary-800 font-bold text-sm tracking-wide flex items-center justify-end gap-1 group">
                        Manage <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
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

export default WorkOrders;
