import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Users, AlertTriangle, Plus, Clock, Loader2, ArrowRight } from 'lucide-react';
import axiosClient from '../../../services/axiosClient';
import toast from 'react-hot-toast';
import { useSocket } from '../../../contexts/SocketContext';

const ManagerTaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const socket = useSocket();

  // Assign Task Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedToEmployeeId: '',
    dueDate: '',
    department: 'General'
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, employeesRes] = await Promise.all([
        axiosClient.get('/tasks/team'),
        axiosClient.get('/employees/directory') // Assume we get list of employees here or use another endpoint
      ]);
      setTasks(tasksRes.data?.data || []);
      setEmployees(employeesRes.data?.data || []);
    } catch (error) {
      console.warn('Failed to load tasks', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('TASK_COMPLETED', (task) => {
        toast.success(`Task Completed: ${task.title}`);
        fetchData();
      });
      return () => {
        socket.off('TASK_COMPLETED');
      };
    }
  }, [socket]);

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!formData.assignedToEmployeeId || !formData.title || !formData.dueDate) {
      return toast.error('Please fill required fields');
    }
    try {
      setIsAssigning(true);
      await axiosClient.post('/tasks/assign', formData);
      toast.success('Task assigned successfully!');
      setShowForm(false);
      setFormData({ title: '', description: '', priority: 'MEDIUM', assignedToEmployeeId: '', dueDate: '', department: 'General' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign task');
    } finally {
      setIsAssigning(false);
    }
  };

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'IN_PROGRESS': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'OVERDUE': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Task Command Center</h2>
          <p className="text-gray-400 mt-1">Assign, monitor, and evaluate your team's daily tasks.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
        >
          {showForm ? <ArrowRight className="w-5 h-5 rotate-180" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Back to Board' : 'Assign New Task'}
        </button>
      </div>

      {showForm ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Create & Assign Task</h3>
          <form onSubmit={handleAssignTask} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Task Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="E.g., Q3 Analytics Report" required />
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assign To</label>
                <select value={formData.assignedToEmployeeId} onChange={e => setFormData({...formData, assignedToEmployeeId: e.target.value})} className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500" required>
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.user.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Due Date</label>
                <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Department</label>
                <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500" placeholder="Engineering" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="4" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500" placeholder="Task details and instructions..."></textarea>
            </div>

            <button type="submit" disabled={isAssigning} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50">
              {isAssigning ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckSquare className="w-5 h-5" />}
              Assign Task
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
             <div className="col-span-full flex justify-center py-20">
               <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
             </div>
          ) : tasks.length === 0 ? (
            <div className="col-span-full bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <CheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300">No active tasks</h3>
              <p className="text-gray-500 mt-2">Assign new tasks to your team to track productivity.</p>
            </div>
          ) : (
            tasks.map(task => (
              <motion.div key={task.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition-colors flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
                    {task.priority} Priority
                  </span>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{task.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-1">{task.description || 'No description provided.'}</p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${task.progress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                        <Users className="w-4 h-4 text-gray-300" />
                      </div>
                      <div className="text-xs">
                        <p className="text-white font-bold">{task.assignedTo?.user?.fullName}</p>
                        <p className="text-gray-500">Assignee</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p className="text-gray-400 font-medium flex items-center gap-1 justify-end"><Clock className="w-3.5 h-3.5" /> Due Date</p>
                      <p className="text-white font-bold">{new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerTaskDashboard;
