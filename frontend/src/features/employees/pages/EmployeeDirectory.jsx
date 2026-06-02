import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, User, Building, Briefcase } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../store/slices/authSlice';

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  const filteredEmployees = employees.filter(emp => 
    emp.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    emp.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Employee Directory</h2>
          <p className="text-gray-400 mt-1">Manage and view all organization members.</p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-4">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500"
            />
          </div>
          {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'HR_RECRUITER') && (
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-white transition-colors shadow-lg shadow-indigo-500/30">
              <Plus className="h-5 w-5" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((emp, index) => (
            <motion.div 
              key={emp.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-colors group cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="h-16 w-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-2xl font-bold border border-indigo-500/30">
                    {emp.profilePhoto ? (
                      <img src={emp.profilePhoto} alt={emp.user.fullName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      emp.user.fullName.charAt(0)
                    )}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    emp.user.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    emp.user.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {emp.user.status}
                  </span>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                    {emp.user.fullName}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">{emp.user.email}</p>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="flex items-center text-sm text-gray-300">
                    <Building className="h-4 w-4 mr-2 text-gray-500" />
                    {emp.department?.name || 'No Department'}
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                    {emp.designation?.title || 'No Designation'}
                  </div>
                  <div className="flex items-center text-sm text-gray-300">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    ID: {emp.employeeId}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
