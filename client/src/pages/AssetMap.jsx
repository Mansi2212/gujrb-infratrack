import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Layers, Map as MapIcon, Filter, MapPin } from 'lucide-react';
import api from '../services/api';

const DISTRICT_COORDS = {
  Ahmedabad: { center: [23.0338, 72.5850], zoom: 12 },
  Gandhinagar: { center: [23.2156, 72.6369], zoom: 12 },
  Surat: { center: [21.1702, 72.8311], zoom: 12 },
  Vadodara: { center: [22.3072, 73.1812], zoom: 12 },
  Rajkot: { center: [22.3039, 70.8022], zoom: 12 },
  Bharuch: { center: [21.7051, 72.9959], zoom: 12 },
  Mehsana: { center: [23.5880, 72.3693], zoom: 12 },
  All: { center: [22.2587, 71.1924], zoom: 7 }
};

function MapViewUpdater({ district }) {
  const map = useMap();
  useEffect(() => {
    const target = DISTRICT_COORDS[district] || DISTRICT_COORDS.All;
    map.flyTo(target.center, target.zoom, { duration: 1.2 });
  }, [district, map]);
  return null;
}

const AssetMap = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const districts = ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot', 'Bharuch', 'Mehsana'];

  useEffect(() => {
    const fetchAllAssets = async () => {
      try {
        const res = await api.get('/assets?limit=1000');
        setAssets(res.data.assets || []);
      } catch (err) {
        console.error("Map data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllAssets();
  }, []);

  const getConditionColor = (status) => {
    switch (status) {
      case 'Good': return '#22c55e';
      case 'Fair': return '#f59e0b';
      case 'Poor': return '#f97316';
      case 'Critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredAssets = assets.filter(asset => {
    if (selectedDistrict !== 'All' && asset.administrative?.district !== selectedDistrict) {
      return false;
    }
    if (filter === 'All') return true;
    if (filter === 'Critical') return asset.condition.status === 'Critical';
    if (filter === 'Government Buildings') return asset.category === 'Government Buildings';
    return asset.category === filter;
  });

  const center = [22.2587, 71.1924]; // Default Gujarat center

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <div className="absolute top-0 left-0 w-full p-4 z-[400] flex flex-wrap justify-between items-center gap-3 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-md border border-gray-200 pointer-events-auto flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
            <MapIcon size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight">
              GIS Infrastructure Map
            </h1>
            <p className="text-[11px] text-gray-500 font-medium">Gujarat State R&B Assets ({filteredAssets.length} displayed)</p>
          </div>
        </div>
        
        <div className="bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-md border border-gray-200 pointer-events-auto flex flex-wrap items-center gap-2">
          {/* District Dropdown */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1">
            <MapPin size={13} className="text-primary-600" />
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

          <div className="h-4 w-px bg-gray-200"></div>

          <Filter size={14} className="text-gray-400 ml-1" />
          {['All', 'Roads', 'Bridges', 'Government Buildings', 'Culverts', 'Critical'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                filter === f 
                  ? 'bg-primary-600 text-white shadow-xs' 
                  : f === 'Critical' 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'Government Buildings' ? 'Buildings' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full h-full relative z-0">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-primary-600 font-bold text-lg animate-pulse flex items-center gap-2">
              <MapIcon /> Loading GIS Data...
            </div>
          </div>
        ) : (
          <MapContainer 
            center={center} 
            zoom={7} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <MapViewUpdater district={selectedDistrict} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredAssets.map(asset => {
              // Ensure coordinates exist and are valid numbers
              if (!asset.location || isNaN(asset.location.latitude) || isNaN(asset.location.longitude)) return null;
              
              return (
                <CircleMarker
                  key={asset.assetId}
                  center={[asset.location.latitude, asset.location.longitude]}
                  radius={asset.condition.status === 'Critical' ? 9 : 7}
                  pathOptions={{
                    fillColor: getConditionColor(asset.condition.status),
                    fillOpacity: 0.8,
                    color: '#ffffff',
                    weight: 2
                  }}
                >
                  <Popup className="rounded-xl font-sans min-w-[200px]">
                    <div className="p-1">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{asset.assetId}</div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight mb-2">{asset.name}</h3>
                      <div className="space-y-1 mb-3">
                        <div className="text-sm text-gray-600"><span className="font-medium">Type:</span> {asset.type}</div>
                        <div className="text-sm text-gray-600"><span className="font-medium">District:</span> {asset.administrative.district}</div>
                        <div className="text-sm flex items-center gap-1">
                          <span className="font-medium text-gray-600">Condition:</span> 
                          <span className="font-bold px-1.5 py-0.5 rounded text-xs text-white uppercase tracking-wider" style={{backgroundColor: getConditionColor(asset.condition.status)}}>
                            {asset.condition.status}
                          </span>
                        </div>
                      </div>
                      <Link 
                        to={`/assets/${asset.assetId}`} 
                        className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded text-sm transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default AssetMap;
