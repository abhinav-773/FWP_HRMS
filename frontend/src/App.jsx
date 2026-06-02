import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import PrivateRoute from './router/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import MainDashboard from './pages/dashboards/MainDashboard';
import EmployeeDirectory from './features/employees/pages/EmployeeDirectory';
import AttendanceDashboard from './features/attendance/pages/AttendanceDashboard';
import LeaveDashboard from './features/leaves/pages/LeaveDashboard';
import PayrollDashboard from './features/payroll/pages/PayrollDashboard';
import DocumentDashboard from './features/documents/pages/DocumentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes inside DashboardLayout */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<MainDashboard />} />
            <Route path="/directory" element={<EmployeeDirectory />} />
            <Route path="/attendance" element={<AttendanceDashboard />} />
            <Route path="/leaves" element={<LeaveDashboard />} />
            <Route path="/payroll" element={<PayrollDashboard />} />
            <Route path="/documents" element={<DocumentDashboard />} />
            
            {/* Example RBAC restricted routes */}
            <Route element={<PrivateRoute allowedRoles={['SUPER_ADMIN']} />}>
              <Route path="/admin/users" element={<div className="text-white">User Management</div>} />
              <Route path="/admin/settings" element={<div className="text-white">System Settings</div>} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={['HR_RECRUITER', 'SUPER_ADMIN']} />}>
              <Route path="/hr/ats" element={<div className="text-white">ATS Pipeline</div>} />
              <Route path="/hr/interviews" element={<div className="text-white">Interviews</div>} />
            </Route>

            <Route element={<PrivateRoute allowedRoles={['SENIOR_MANAGER', 'SUPER_ADMIN']} />}>
              <Route path="/manager/team" element={<div className="text-white">Team Performance</div>} />
              <Route path="/manager/reports" element={<div className="text-white">Reports</div>} />
            </Route>
            
            <Route path="/employee/leaves" element={<div className="text-white">Leave Requests</div>} />
            <Route path="/employee/ai-chat" element={<div className="text-white">AI Assistant Chat</div>} />
          </Route>
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
