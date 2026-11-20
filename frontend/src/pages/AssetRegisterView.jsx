import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  HardDrive,
  Calendar,
  Wrench,
  User,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  X,
  Building,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export const AssetRegisterView = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState(null);

  // Add Asset form state
  const [newAsset, setNewAsset] = useState({
    assetTag: '',
    name: '',
    category: 'Laptop',
    model: '',
    serialNumber: '',
    vendor: '',
    department: 'Information Science & Engineering',
    location: '',
    warrantyExpiryDate: ''
  });

  // Maintenance form state
  const [maintenanceForm, setMaintenanceForm] = useState({
    serviceType: '',
    technician: user?.name || '',
    cost: '',
    notes: ''
  });

  useEffect(() => {
    loadAssets();
  }, [search, statusFilter, categoryFilter]);

  const loadAssets = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.getAssets(params);
      setAssets(res.assets || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await api.createAsset(newAsset);
      setShowAddModal(false);
      setNewAsset({
        assetTag: '',
        name: '',
        category: 'Laptop',
        model: '',
        serialNumber: '',
        vendor: '',
        department: 'Information Science & Engineering',
        location: '',
        warrantyExpiryDate: ''
      });
      loadAssets();
    } catch (err) {
      alert(err.message || 'Failed to create asset');
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    if (!selectedAssetForMaintenance) return;
    try {
      await api.addMaintenanceRecord(selectedAssetForMaintenance.id, maintenanceForm);
      setSelectedAssetForMaintenance(null);
      setMaintenanceForm({
        serviceType: '',
        technician: user?.name || '',
        cost: '',
        notes: ''
      });
      loadAssets();
    } catch (err) {
      alert(err.message || 'Failed to add maintenance log');
    }
  };

  const handleDeleteAsset = async (id, tag) => {
    if (!confirm(`Are you sure you want to remove asset ${tag} from the register?`)) return;
    try {
      await api.deleteAsset(id);
      loadAssets();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'assigned':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Assigned</span>;
      case 'in_stock':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">In Stock</span>;
      case 'under_maintenance':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Under Maintenance</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">Retired</span>;
    }
  };

  const renderWarranty = (dateStr) => {
    if (!dateStr) return null;
    const expiry = new Date(dateStr).getTime();
    const now = Date.now();
    const daysLeft = Math.round((expiry - now) / (86400 * 1000));

    if (daysLeft < 0) {
      return (
        <span className="text-[11px] font-bold text-rose-600 flex items-center space-x-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Warranty Expired ({Math.abs(daysLeft)}d ago)</span>
        </span>
      );
    }

    if (daysLeft <= 90) {
      return (
        <span className="text-[11px] font-semibold text-amber-600 flex items-center space-x-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Expires in {daysLeft} days</span>
        </span>
      );
    }

    return (
      <span className="text-[11px] text-slate-500 flex items-center space-x-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Valid ({daysLeft} days)</span>
      </span>
    );
  };

  const canManage = user?.role === 'admin' || user?.role === 'supervisor';

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Enterprise Asset Register
            </h1>
            <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-sky-300">
              FR-5 Register
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track hardware allocation, warranties, serial numbers, and maintenance service histories.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow flex items-center space-x-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Asset</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Asset Tag (e.g. BMSIT-LAP-042), Model, or Serial Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700"
        >
          <option value="">All Categories</option>
          <option value="Laptop">Laptops</option>
          <option value="Desktop">Desktop Workstations</option>
          <option value="Network">Network Switches & Routers</option>
          <option value="Peripheral">Peripherals & Projectors</option>
          <option value="Server">Servers & Racks</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="in_stock">In Stock</option>
          <option value="assigned">Assigned</option>
          <option value="under_maintenance">Under Maintenance</option>
          <option value="retired">Retired</option>
        </select>

        <button
          onClick={loadAssets}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-sky-600 mb-2" />
            Loading asset register...
          </div>
        ) : assets.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Boxes className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
            <p className="font-bold text-slate-800">No Assets Found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Tag & Status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                    {asset.assetTag}
                  </span>
                  {getStatusBadge(asset.status)}
                </div>

                {/* Name & Model */}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {asset.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {asset.model || asset.category}
                  </p>
                </div>

                {/* Key Metadata Table */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Serial No:</span>
                    <span className="font-mono font-medium text-slate-700">{asset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">{asset.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned To:</span>
                    <span className="font-semibold text-slate-900">
                      {asset.assignedToName || 'Unassigned (In Store)'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400">Warranty:</span>
                    <div>{renderWarranty(asset.warrantyExpiryDate)}</div>
                  </div>
                </div>

                {/* Maintenance Summary */}
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Maintenance Records: </span>
                  {asset.maintenanceHistory?.length || 0} service entries
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedAssetForMaintenance(asset)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center space-x-1 cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Log / View Service</span>
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDeleteAsset(asset.id, asset.assetTag)}
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Register New Asset */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold">Register Hardware Asset (FR-5)</h2>
              <p className="text-xs text-slate-400 mt-1">Add a new device to the enterprise inventory.</p>
            </div>

            <form onSubmit={handleCreateAsset} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Asset Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="BMSIT-LAP-099"
                    value={newAsset.assetTag}
                    onChange={(e) => setNewAsset({ ...newAsset, assetTag: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Network">Network Switch</option>
                    <option value="Peripheral">Peripheral / Projector</option>
                    <option value="Server">Rack Server</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Device Name / Model *</label>
                <input
                  type="text"
                  required
                  placeholder="Dell Latitude 5440 i7 16GB"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value, model: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="SN-98834-IN"
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={newAsset.warrantyExpiryDate}
                    onChange={(e) => setNewAsset({ ...newAsset, warrantyExpiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={newAsset.department}
                    onChange={(e) => setNewAsset({ ...newAsset, department: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Physical Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 3, Server Room"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl"
                >
                  Save to Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Add Maintenance Log */}
      {selectedAssetForMaintenance && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-slate-900 text-white relative">
              <button
                onClick={() => setSelectedAssetForMaintenance(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Wrench className="w-4 h-4" />
                <span>FR-5 Maintenance History</span>
              </div>
              <h2 className="text-lg font-bold">
                {selectedAssetForMaintenance.name} ({selectedAssetForMaintenance.assetTag})
              </h2>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Existing History */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Service Logs
                </h3>
                {(!selectedAssetForMaintenance.maintenanceHistory ||
                  selectedAssetForMaintenance.maintenanceHistory.length === 0) ? (
                  <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    No prior maintenance or repairs recorded for this device.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedAssetForMaintenance.maintenanceHistory.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{m.serviceType}</span>
                          <span className="text-slate-500 font-mono">₹{m.cost || 0}</span>
                        </div>
                        <p className="text-slate-600">{m.notes}</p>
                        <p className="text-[10px] text-slate-400 pt-1">
                          Technician: <span className="text-slate-600">{m.technician}</span> •{' '}
                          {new Date(m.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Service Record */}
              <form onSubmit={handleAddMaintenance} className="pt-4 border-t border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Log New Service / Repair
                </h3>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Service Type *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Thermal paste replacement, Fan cleaning, RAM upgrade"
                    value={maintenanceForm.serviceType}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceType: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Technician</label>
                    <input
                      type="text"
                      value={maintenanceForm.technician}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, technician: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Cost (INR)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={maintenanceForm.cost}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Service Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Diagnosis observations, replaced parts, testing verified..."
                    value={maintenanceForm.notes}
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Record Maintenance Entry
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

