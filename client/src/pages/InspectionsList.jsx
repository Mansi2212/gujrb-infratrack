import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus, ChevronRight, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import api from '../services/api';

const InspectionsList = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const res = await api.get('/inspections');
        setInspections(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInspections();
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'High': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'Medium': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'Low': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inspections</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and review asset condition inspections.</p>
        </div>
        <Link to="/inspections/new" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold shadow-sm transition-colors text-sm tracking-wide">
          <Plus size={18} /> Schedule / New Inspection
        </Link>
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-600 text-xs uppercase font-bold tracking-wider sticky top-0 border-b border-gray-200 z-0">
              <tr>
                <th className="px-6 py-4">Inspection ID</th>
                <th className="px-6 py-4">Asset ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Inspector</th>
                <th className="px-6 py-4 text-center">Score Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500 font-medium">Loading inspections...</td></tr>
              ) : inspections.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-500 font-medium">No inspections found.</td></tr>
              ) : (
                inspections.map((insp) => (
                  <tr key={insp.inspectionId} className="hover:bg-primary-50/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{insp.inspectionId}</td>
                    <td className="px-6 py-4 text-primary-600 font-bold">
                      <Link to={`/assets/${insp.assetRef}`} className="hover:underline">{insp.assetRef}</Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{new Date(insp.inspectionDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-gray-600">{insp.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityColor(insp.overallSeverity)}`}>
                        {insp.overallSeverity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{insp.inspectorName}</td>
                    <td className="px-6 py-4 text-center font-bold">
                      <span className="text-gray-400 mr-2">{insp.conditionBefore?.score || '-'}</span>
                      → 
                      <span className={`ml-2 ${insp.conditionAfter?.score < insp.conditionBefore?.score ? 'text-red-500' : 'text-gray-900'}`}>
                        {insp.conditionAfter?.score || '-'}
                      </span>
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

export default InspectionsList;
