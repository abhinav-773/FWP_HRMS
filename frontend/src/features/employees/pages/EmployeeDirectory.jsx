import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, User, Building, Briefcase, Network, List } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/slices/authSlice';
import OrgChartNode from '../components/OrgChartNode';
import AddEmployeeModal from '../components/AddEmployeeModal';

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosClient.get('/employees');
        setEmployees(response.data.data);
      } catch (error) {
        console.error('Failed to fetch employees', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleRefresh = async () => {
    try {
      const response = await axiosClient.get('/employees');
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Failed to refresh employees', error);
    }
  };

  // Map subordinates by managerId
  const employeesMap = {};
  const roots = [];

  if (viewMode === 'chart') {
    employees.forEach(emp => {
      if (emp.managerId) {
        if (!employeesMap[emp.managerId]) {
          employeesMap[emp.managerId] = [];
        }
        employeesMap[emp.managerId].push(emp);
      }
    });

    employees.forEach(emp => {
      const hasManagerInList = employees.some(m => m.id === emp.managerId);
      if (!emp.managerId || !hasManagerInList) {
        roots.push(emp);
      }
    });
  }

  const filteredEmployees = employees.filter(emp => 
    emp.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    emp.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    emp.department?.name?.toLowerCase().includes(search.toLowerCase()) ||
    emp.designation?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Employee Directory</h2>
          <p className="text-gray-400 mt-1">Manage, search and view organizational reporting hierarchies.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* View Toggles */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="h-4 w-4" />
              Directory List
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'chart' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Network className="h-4 w-4" />
              Org Chart
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 md:w-64 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500 text-sm"
            />
          </div>

          {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'HR_RECRUITER') && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-white transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Plus className="h-5 w-5" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory Main view */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">No employees found.</div>
          ) : (
            filteredEmployees.map((emp, index) => (
              <motion.div 
                key={emp.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors group cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center text-2xl font-bold border border-indigo-500/30 overflow-hidden">
                      {emp.profilePhoto ? (
                        <img src={emp.profilePhoto} alt={emp.user?.fullName} className="h-full w-full object-cover" />
                      ) : (
                        emp.user?.fullName?.charAt(0) || 'E'
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      emp.user?.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      emp.user?.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {emp.user?.status || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {emp.user?.fullName}
                    </h3>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{emp.user?.email}</p>
                  </div>
                  
                  <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
                    <div className="flex items-center text-xs text-gray-300">
                      <Building className="h-4 w-4 mr-2 text-gray-500" />
                      {emp.department?.name || 'No Department'}
                    </div>
                    <div className="flex items-center text-xs text-gray-300">
                      <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                      {emp.designation?.title || 'No Designation'}
                    </div>
                    <div className="flex items-center text-xs text-gray-300">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      ID: {emp.employeeId}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        /* Org Chart Interactive Scrollable canvas */
        <div className="w-full overflow-x-auto bg-gray-950/20 border border-white/5 rounded-3xl p-8 min-h-[500px] flex flex-col items-center custom-scrollbar">
          <div className="space-y-12 min-w-max flex flex-col items-center py-4">
            {roots.length === 0 ? (
              <div className="text-gray-500">No reporting hierarchies found in organization data.</div>
            ) : (
              roots.map((root) => (
                <div key={root.id} className="flex flex-col items-center">
                  <OrgChartNode
                    employee={root}
                    employeesMap={employeesMap}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <AddEmployeeModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={handleRefresh}
        existingEmployees={employees}
      />
    </div>
  );
};

export default EmployeeDirectory;
