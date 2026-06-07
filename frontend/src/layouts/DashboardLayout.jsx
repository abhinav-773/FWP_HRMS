import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { selectCurrentUser, logoutUser } from '../store/slices/authSlice';
import { LayoutDashboard, Users, UserPlus, FileText, Settings, LogOut, MessageSquare, Clock, DollarSign, Folder, CheckCircle, Play, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosClient from '../services/axiosClient';

import { Toaster } from 'react-hot-toast';
import NotificationBell from '../components/layout/NotificationBell';
import AIAssistantWidget from '../components/ai/AIAssistantWidget';
import TeamChatWidget from '../components/chat/TeamChatWidget';
import GlobalSearch from '../components/layout/GlobalSearch';
import GuidedTour, { TourTypes } from '../components/layout/GuidedTour';
import { hasPermission, PERMISSIONS } from '../config/permissions.config';

const DashboardLayout = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [runTour, setRunTour] = React.useState(false);

  const handleLogout = async () => {
    try {
      await axiosClient.post('/custom-auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(logoutUser());
      window.location.href = '/login';
    }
  };

  const getMenuItems = () => {
    const role = user?.role;
    const items = [];

    // All roles get Dashboard
    items.push({ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' });

    if (hasPermission(role, PERMISSIONS.VIEW_EMPLOYEE_PORTAL) || role === 'SUPER_ADMIN' || role === 'HR_RECRUITER' || role === 'SENIOR_MANAGER') {
      items.push({ name: 'Directory', icon: Users, path: '/directory' });
      items.push({ name: 'My Attendance', icon: Clock, path: '/attendance' });
      items.push({ name: 'My Leaves', icon: FileText, path: '/leaves' });
      items.push({ name: 'My Payroll', icon: DollarSign, path: '/payroll' });
      items.push({ name: 'My Documents', icon: Folder, path: '/documents' });
      items.push({ name: 'My Onboarding', icon: UserPlus, path: '/onboarding' });
      items.push({ name: 'My Performance', icon: Award, path: '/performance' });
    }

    if (hasPermission(role, PERMISSIONS.VIEW_ATS) || role === 'SUPER_ADMIN') {
      items.push({ name: 'ATS Analytics', icon: LayoutDashboard, path: '/hr/ats' });
      items.push({ name: 'Job Postings', icon: FileText, path: '/hr/jobs' });
    }

    if (hasPermission(role, PERMISSIONS.MANAGE_CANDIDATES) || role === 'SUPER_ADMIN') {
      items.push({ name: 'Candidates', icon: Users, path: '/hr/candidates' });
      items.push({ name: 'Kanban Pipeline', icon: UserPlus, path: '/hr/pipeline' });
    }

    if ((hasPermission(role, PERMISSIONS.SCHEDULE_INTERVIEWS) || role === 'SUPER_ADMIN') && role !== 'SENIOR_MANAGER') {
      items.push({ name: 'HR Interviews', icon: Clock, path: '/hr/interviews' });
    }

    if (hasPermission(role, PERMISSIONS.MANAGE_ONBOARDING) || role === 'SUPER_ADMIN') {
      items.push({ name: 'Onboarding & Assets', icon: UserPlus, path: '/hr/onboarding' });
    }

    if (hasPermission(role, PERMISSIONS.VIEW_TEAM_DASHBOARD) || role === 'SUPER_ADMIN') {
      items.push({ name: 'Team Dashboard', icon: LayoutDashboard, path: '/manager/dashboard' });
      items.push({ name: 'Team Tasks', icon: CheckCircle, path: '/manager/tasks' });
      items.push({ name: 'Leave Approvals', icon: FileText, path: '/manager/approvals' });
      items.push({ name: 'Performance Reviews', icon: Award, path: '/manager/reviews' });
      items.push({ name: 'Team Analytics', icon: Users, path: '/manager/analytics' });
      items.push({ name: 'Interviews', icon: Clock, path: '/manager/interviews' });
    }

    if (hasPermission(role, PERMISSIONS.MANAGE_SETTINGS) || role === 'SUPER_ADMIN') {
      items.push({ name: 'Executive Overview', icon: LayoutDashboard, path: '/admin/executive' });
      items.push({ name: 'User Management', icon: Users, path: '/admin/users' });
      items.push({ name: 'Audit Logs', icon: FileText, path: '/admin/audit' });
      items.push({ name: 'System Settings', icon: Settings, path: '/admin/settings' });
    }

    if (role === 'EMPLOYEE') {
      items.push({ name: 'AI Assistant', icon: MessageSquare, path: '/employee/ai-chat' });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white overflow-hidden selection:bg-indigo-500/30 transition-colors duration-300">
      {/* Sidebar with Glassmorphism */}
      <aside className="w-72 bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col z-50 shadow-2xl transition-colors duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-black text-xl text-white">H</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">HireMind</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-0.5">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={index}
                to={item.path}
                className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden sidebar-link-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')} ${
                  isActive ? 'text-indigo-700 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white'
                }`}
              >
                {/* Active Background highlighting */}
                {isActive && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Hover Background */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                )}
                
                <Icon className={`h-5 w-5 relative z-10 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-indigo-500 dark:group-hover:text-gray-300'}`} />
                <span className={`font-medium relative z-10 ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout */}
        <div className="flex items-center space-x-3 px-2 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.role}</p>
          </div>
          
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md z-40 transition-colors duration-300">
          <GlobalSearch />
          <div className="flex items-center gap-4">
            <button
              onClick={() => setRunTour(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full font-medium transition-all text-sm group"
            >
              <Play className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Start Tour
            </button>
            <NotificationBell />
            <div className="ml-2 pl-4 border-l border-white/10">
              {/* Profile icon moved to sidebar */}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
      
      <GuidedTour 
        type={user?.role === 'SUPER_ADMIN' ? TourTypes.ADMIN : user?.role === 'HR_RECRUITER' ? TourTypes.RECRUITER : user?.role === 'EMPLOYEE' ? TourTypes.EMPLOYEE : TourTypes.INVESTOR}
        run={runTour} 
        onFinish={() => setRunTour(false)} 
      />

      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          }
        }} 
      />

      <AIAssistantWidget />
      <TeamChatWidget />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
