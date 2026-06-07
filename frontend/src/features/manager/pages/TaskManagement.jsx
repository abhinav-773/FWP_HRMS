import React, { useState, useEffect } from 'react';
import axiosClient from '../../../services/axiosClient';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Plus, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', assignedToEmployeeId: '', dueDate: '' });

  useEffect(() => {
    fetchTasksAndEmployees();

    // Socket real-time updates
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('TASK_COMPLETED', (task) => {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      toast.success(`Task completed: ${task.title}`);
    });

    return () => socket.disconnect();
  }, []);

  const fetchTasksAndEmployees = async () => {
    try {
      const [tasksRes, empsRes] = await Promise.all([
        axiosClient.get('/manager/tasks'),
        axiosClient.get('/employees')
      ]);
      setTasks(tasksRes.data);
      // Filter employees to only show department members (backend should ideally do this, but just in case)
      setEmployees(empsRes.data.employees || empsRes.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/manager/tasks', newTask);
      setTasks([res.data, ...tasks]);
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', assignedToEmployeeId: '', dueDate: '' });
      toast.success('Task assigned successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'OVERDUE': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Team Tasks</h1>
          <p className="text-gray-400 mt-1">Assign and monitor daily productivity.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Assign Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <div key={status} className="bg-gray-900/50 border border-white/5 rounded-2xl p-4 min-h-[500px]">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
              {status.replace('_', ' ')}
              <span className="bg-gray-800 text-gray-300 py-0.5 px-2.5 rounded-full text-xs">
                {tasks.filter(t => t.status === status).length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {tasks.filter(t => t.status === status).map(task => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={task.id} 
                  className="bg-gray-800 border border-white/10 p-4 rounded-xl hover:border-white/20 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white text-sm">{task.title}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-xs mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                        {task.assignedTo?.user?.fullName?.charAt(0) || '?'}
                      </div>
                      <span className="truncate max-w-[80px]">{task.assignedTo?.user?.fullName?.split(' ')[0]}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(task.dueDate), 'MMM dd')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {tasks.filter(t => t.status === status).length === 0 && (
                <div className="text-center text-gray-500 py-8 text-sm border border-dashed border-gray-700 rounded-xl">
                  No tasks in this column
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Assign New Task</h2>
            </div>
            
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Task Title</label>
                <input 
                  required 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none" 
                  placeholder="e.g., Update Q3 Reports" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea 
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[100px]" 
                  placeholder="Task details..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Assign To</label>
                  <select 
                    required 
                    value={newTask.assignedToEmployeeId}
                    onChange={e => setNewTask({...newTask, assignedToEmployeeId: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="" disabled>Select Team Member</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.user?.fullName} ({emp.employeeId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                <input 
                  type="date" 
                  required 
                  value={newTask.dueDate}
                  onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
