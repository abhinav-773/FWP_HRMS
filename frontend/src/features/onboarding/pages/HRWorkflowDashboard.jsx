import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import { 
  Users, CheckCircle2, AlertCircle, Plus, ClipboardList, Laptop, 
  Search, ShieldAlert, Cpu, Sparkles, Send, Trash, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const HRWorkflowDashboard = () => {
  const [onboardingEmployees, setOnboardingEmployees] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('checklists');

  // Modal States
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);

  // Form States
  const [newChecklist, setNewChecklist] = useState({
    employeeId: '',
    title: 'Standard Employee Onboarding',
    description: 'Welcome checklist containing default tasks (NDA, ID verification, IT, Orientation).'
  });
  const [newAsset, setNewAsset] = useState({
    employeeId: '',
    assetName: '',
    assetType: 'Laptop',
    serialNumber: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const checklistsRes = await axiosClient.get('/onboarding/checklists');
      setChecklists(checklistsRes.data?.data || []);

      const assetsRes = await axiosClient.get('/onboarding/assets');
      setAssets(assetsRes.data?.data || []);

      const employeesRes = await axiosClient.get('/employees');
      setEmployees(employeesRes.data?.data || []);

      const onboardingRes = await axiosClient.get('/onboarding/employees');
      setOnboardingEmployees(onboardingRes.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { withCredentials: true });

    socket.on('onboarding_update', (data) => {
      setOnboardingEmployees(prev => prev.map(emp => {
        if (emp.id === data.employeeId) {
          toast.success(`Onboarding progress updated for ${emp.user?.fullName}`);
          return { ...emp, onboardingProgress: data.progress };
        }
        return emp;
      }));
    });

    return () => socket.disconnect();
  }, []);

  const handleCreateChecklist = async (e) => {
    e.preventDefault();
    if (!newChecklist.employeeId) {
      toast.error('Please select an employee.');
      return;
    }

    try {
      await axiosClient.post('/onboarding/checklists', newChecklist);
      toast.success('Onboarding checklist assigned successfully!');
      setShowChecklistModal(false);
      setNewChecklist({
        employeeId: '',
        title: 'Standard Employee Onboarding',
        description: 'Welcome checklist containing default tasks (NDA, ID verification, IT, Orientation).'
      });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to assign checklist.');
    }
  };

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.employeeId || !newAsset.assetName) {
      toast.error('Please fill in required fields.');
      return;
    }

    try {
      await axiosClient.post('/onboarding/assets', newAsset);
      toast.success('IT Asset assigned successfully!');
      setShowAssetModal(false);
      setNewAsset({
        employeeId: '',
        assetName: '',
        assetType: 'Laptop',
        serialNumber: ''
      });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to assign asset.');
    }
  };

  const handleReleaseAsset = async (assetId) => {
    try {
      await axiosClient.put(`/onboarding/assets/${assetId}/release`);
      toast.success('IT Asset released successfully.');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to release IT Asset.');
    }
  };

  const handleVerifyDocument = async (docId, status) => {
    try {
      await axiosClient.put(`/onboarding/verify-document/${docId}`, { status });
      toast.success(`Document ${status.toLowerCase()} successfully`);
      fetchData(); // Refresh to see verification status
    } catch (error) {
      toast.error('Failed to update document status');
    }
  };

  const handleActivateEmployee = async (employeeId) => {
    try {
      await axiosClient.post(`/onboarding/employee/${employeeId}/activate`);
      toast.success('Employee activated and payroll/leaves setup successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to activate employee');
    }
  };

  // Helper stats
  const pendingChecklists = onboardingEmployees.filter(e => e.onboardingProgress === 0).length;
  const inProgressChecklists = onboardingEmployees.filter(e => e.onboardingProgress > 0 && e.onboardingProgress < 100).length;
  const completedChecklists = checklists.filter(c => c.status === 'COMPLETED').length; // Kept for logic

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header banner */}
      <div className="relative bg-gradient-to-br from-indigo-950/40 to-purple-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              Employee Onboarding & HR Operations
            </h1>
            <p className="text-indigo-200 mt-2 font-medium">
              Oversee candidate welcome workflows, checklists completion, and IT hardware provisioning.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowChecklistModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-indigo-500/20"
            >
              <Plus className="h-5 w-5" />
              Assign Checklist
            </button>
            <button
              onClick={() => setShowAssetModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl transition-all"
            >
              <Laptop className="h-5 w-5 text-indigo-400" />
              Provision Asset
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      {activeTab === 'checklists' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Total Onboardings</span>
            <span className="text-3xl font-black text-white mt-1 block">{checklists.length}</span>
          </div>
          <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg border-l-4 border-yellow-500/40">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Pending Tasks</span>
            <span className="text-3xl font-black text-yellow-400 mt-1 block">{pendingChecklists}</span>
          </div>
          <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg border-l-4 border-indigo-500/40">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">In Progress</span>
            <span className="text-3xl font-black text-indigo-400 mt-1 block">{inProgressChecklists}</span>
          </div>
          <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg border-l-4 border-green-500/40">
            <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">Completed</span>
            <span className="text-3xl font-black text-green-400 mt-1 block">{completedChecklists}</span>
          </div>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-white/10 gap-8">
        <button
          onClick={() => setActiveTab('checklists')}
          className={`pb-4 text-sm font-bold tracking-wider relative transition-colors ${
            activeTab === 'checklists' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          New Hire Checklists
          {activeTab === 'checklists' && (
            <motion.div layoutId="hr-onb-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`pb-4 text-sm font-bold tracking-wider relative transition-colors ${
            activeTab === 'assets' ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          IT Asset Provisioning
          {activeTab === 'assets' && (
            <motion.div layoutId="hr-onb-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Content Panels */}
      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : activeTab === 'checklists' ? (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-wider">
                <th className="p-5">Employee / Details</th>
                <th className="p-5">Checklist Title</th>
                <th className="p-5">Progress</th>
                <th className="p-5">Status</th>
                <th className="p-5">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {onboardingEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No active onboarding employees.
                  </td>
                </tr>
              ) : (
                onboardingEmployees.map((emp) => {
                  const c = emp.onboardingChecklists?.[0];
                  const docs = emp.user?.documents || [];

                  return (
                    <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-indigo-400">
                            {emp.user?.fullName?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white">{emp.user?.fullName}</p>
                            <p className="text-xs text-gray-400">{emp.department?.name || 'New Hire'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="font-bold text-sm">{c ? c.title : 'No Checklist'}</span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3 w-48">
                          <div className="flex-1 bg-white/5 h-2 rounded-full border border-white/5 overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${emp.onboardingProgress || 0}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-400">{emp.onboardingProgress || 0}%</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                          emp.onboardingProgress === 100 
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : emp.onboardingProgress > 0
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {emp.onboardingProgress === 100 ? 'COMPLETED' : emp.onboardingProgress > 0 ? 'IN PROGRESS' : 'PENDING'}
                        </span>
                        {emp.onboardingProgress === 100 && emp.user?.status !== 'ACTIVE' && (
                          <button
                            onClick={() => handleActivateEmployee(emp.id)}
                            className="mt-2 block w-full py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[10px] rounded uppercase tracking-widest shadow-lg shadow-indigo-500/25 transition-all"
                          >
                            Activate Employee
                          </button>
                        )}
                      </td>
                      <td className="p-5">
                        {docs.length === 0 ? (
                          <span className="text-xs text-gray-500">None uploaded</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {docs.map((doc, idx) => (
                              <div key={idx} className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/25 px-2 py-1 rounded">
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-indigo-400 font-bold hover:bg-indigo-500/20 transition-colors"
                                >
                                  {doc.documentType}
                                </a>
                                {doc.verificationStatus === 'PENDING' && (
                                  <>
                                    <button onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')} className="text-green-400 hover:text-green-300 ml-1"><CheckCircle2 className="h-3 w-3" /></button>
                                    <button onClick={() => handleVerifyDocument(doc.id, 'REJECTED')} className="text-red-400 hover:text-red-300"><AlertCircle className="h-3 w-3" /></button>
                                  </>
                                )}
                                {doc.verificationStatus === 'VERIFIED' && <CheckCircle2 className="h-3 w-3 text-green-400 ml-1" />}
                                {doc.verificationStatus === 'REJECTED' && <AlertCircle className="h-3 w-3 text-red-400 ml-1" />}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-wider">
                <th className="p-5">Asset Model</th>
                <th className="p-5">Type</th>
                <th className="p-5">Serial Number</th>
                <th className="p-5">Assigned Employee</th>
                <th className="p-5">Provision Date</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No hardware assets provisioned. Click "Provision Asset" above.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <Cpu className="h-5 w-5 text-indigo-400" />
                        <span className="font-bold text-sm">{asset.assetName}</span>
                      </div>
                    </td>
                    <td className="p-5 text-xs text-gray-400 font-bold uppercase tracking-widest">{asset.assetType}</td>
                    <td className="p-5 font-mono text-xs text-indigo-300">{asset.serialNumber || 'N/A'}</td>
                    <td className="p-5">
                      {asset.employee ? (
                        <span className="font-bold text-sm text-white">{asset.employee.user?.fullName}</span>
                      ) : (
                        <span className="text-xs text-gray-500 font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded">Unassigned</span>
                      )}
                    </td>
                    <td className="p-5 text-xs text-gray-400">
                      {asset.assignedDate ? new Date(asset.assignedDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-5 text-right">
                      {asset.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleReleaseAsset(asset.id)}
                          className="text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/5 px-3 py-1.5 rounded-lg font-bold transition-all"
                        >
                          Decommission / Release
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Checklist Assignment Modal */}
      <AnimatePresence>
        {showChecklistModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden"
            >
              <h2 className="text-xl font-black text-white">Assign Onboarding Checklist</h2>
              <form onSubmit={handleCreateChecklist} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Select Employee</label>
                  <select
                    value={newChecklist.employeeId}
                    onChange={(e) => setNewChecklist({ ...newChecklist, employeeId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-400">Choose New Hire...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-gray-900 text-white">
                        {emp.user?.fullName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Checklist Title</label>
                  <input
                    type="text"
                    value={newChecklist.title}
                    onChange={(e) => setNewChecklist({ ...newChecklist, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Checklist Description</label>
                  <textarea
                    value={newChecklist.description}
                    onChange={(e) => setNewChecklist({ ...newChecklist, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors h-24 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowChecklistModal(false)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                  >
                    Assign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IT Asset Assignment Modal */}
      <AnimatePresence>
        {showAssetModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-white/10 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden"
            >
              <h2 className="text-xl font-black text-white">Provision IT Asset</h2>
              <form onSubmit={handleAssignAsset} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Select Employee</label>
                  <select
                    value={newAsset.employeeId}
                    onChange={(e) => setNewAsset({ ...newAsset, employeeId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-400">Choose Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id} className="bg-gray-900 text-white">
                        {emp.user?.fullName} ({emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Asset Type</label>
                    <select
                      value={newAsset.assetType}
                      onChange={(e) => setNewAsset({ ...newAsset, assetType: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option className="bg-gray-900 text-white" value="Laptop">Laptop</option>
                      <option className="bg-gray-900 text-white" value="Mobile Phone">Mobile Phone</option>
                      <option className="bg-gray-900 text-white" value="Keyboard">Keyboard</option>
                      <option className="bg-gray-900 text-white" value="Monitor">Monitor</option>
                      <option className="bg-gray-900 text-white" value="YubiKey">YubiKey</option>
                      <option className="bg-gray-900 text-white" value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Asset Name / Model</label>
                    <input
                      type="text"
                      placeholder="e.g. MacBook Pro 16 M3"
                      value={newAsset.assetName}
                      onChange={(e) => setNewAsset({ ...newAsset, assetName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. C02X12345XYZ"
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAssetModal(false)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                  >
                    Provision
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HRWorkflowDashboard;
