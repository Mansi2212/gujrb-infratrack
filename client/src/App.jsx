import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import AssetInventory from './pages/AssetInventory';
import AssetDetails from './pages/AssetDetails';
import AddEditAsset from './pages/AddEditAsset';
import AssetMap from './pages/AssetMap';
import InspectionsList from './pages/InspectionsList';
import InspectionForm from './pages/InspectionForm';
import WorkOrders from './pages/WorkOrders';
import WorkOrderForm from './pages/WorkOrderForm';
import WorkOrderDetails from './pages/WorkOrderDetails';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<AssetInventory />} />
          <Route path="/assets/new" element={<AddEditAsset />} />
          <Route path="/assets/:id/edit" element={<AddEditAsset />} />
          <Route path="/assets/:id" element={<AssetDetails />} />
          <Route path="/map" element={<AssetMap />} />
          <Route path="/inspections" element={<InspectionsList />} />
          <Route path="/inspections/new" element={<InspectionForm />} />
          <Route path="/maintenance" element={<WorkOrders />} />
          <Route path="/maintenance/new" element={<WorkOrderForm />} />
          <Route path="/maintenance/:id" element={<WorkOrderDetails />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
