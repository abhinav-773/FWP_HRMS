import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, logoutUser } from '../store/slices/authSlice';
import { LayoutDashboard, Users, UserPlus, FileText, Settings, LogOut, MessageSquare, Clock, DollarSign, Folder } from 'lucide-react';
import axiosClient from '../services/axiosClient';

import NotificationBell from '../components/layout/NotificationBell';

const DashboardLayout = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(logoutUser());
      navigate('/login');
    }
  };

  const getMenuItems = () => {
    const role = user?.role;
    const items = [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Directory', icon: Users, path: '/directory' },
      { name: 'My Attendance', icon: Clock, path: '/attendance' },
      { name: 'My Leaves', icon: FileText, path: '/leaves' },
      { name: 'My Payroll', icon: DollarSign, path: '/payroll' },
      { name: 'My Documents', icon: Folder, path: '/documents' }
    ];

    if (role === 'SUPER_ADMIN') {
      items.push({ name: 'User Management', icon: Users, path: '/admin/users' });
      items.push({ name: 'System Settings', icon: Settings, path: '/admin/settings' });
    } else if (role === 'HR_RECRUITER') {
      items.push({ name: 'ATS Pipeline', icon: UserPlus, path: '/hr/ats' });
      items.push({ name: 'Interviews', icon: Users, path: '/hr/interviews' });
    } else if (role === 'SENIOR_MANAGER') {
      items.push({ name: 'Team Performance', icon: Users, path: '/manager/team' });
      items.push({ name: 'Reports', icon: FileText, path: '/manager/reports' });
      items.push({ name: 'Team Approvals', icon: FileText, path: '/manager/approvals' });
    } else if (role === 'EMPLOYEE') {
      items.push({ name: 'AI Assistant', icon: MessageSquare, path: '/employee/ai-chat' });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-400">HRGPT</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.fullName}</p>
              <p className="text-xs text-gray-400 truncate w-32">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-900">
        <header className="h-16 flex items-center justify-end px-8 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm z-40">
          <NotificationBell />
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
