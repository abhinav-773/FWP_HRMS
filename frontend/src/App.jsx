import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { runAuthHydration } from './services/authBootstrap';

import LoginPage from './features/auth/pages/LoginPage';
import ChangePassword from './features/auth/pages/ChangePassword';
import LandingPage from './pages/landing/LandingPage';
import PrivateRoute from './router/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import MainDashboard from './pages/dashboards/MainDashboard';
import EmployeeDirectory from './features/employees/pages/EmployeeDirectory';
import AttendanceDashboard from './features/attendance/pages/AttendanceDashboard';
import LeaveDashboard from './features/leaves/pages/LeaveDashboard';
import PayrollDashboard from './features/payroll/pages/PayrollDashboard';
import DocumentDashboard from './features/documents/pages/DocumentDashboard';
import CandidateInterviewRoom from './features/interviews/pages/CandidateInterviewRoom';
import SettingsPage from './pages/admin/SettingsPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import ExecutiveDashboard from './pages/dashboards/ExecutiveDashboard';
import HRWorkflowDashboard from './features/onboarding/pages/HRWorkflowDashboard';
import PerformanceDashboard from './features/performance/pages/PerformanceDashboard';
import AIChatPortal from './features/ai/pages/AIChatPortal';
import CareersPortal from './features/ats/pages/CareersPortal';
import JobDetailApply from './features/ats/pages/JobDetailApply';

// Restore missing imports
import JobListings from './features/ats/pages/JobListings';
import PipelineBoard from './features/ats/pages/PipelineBoard';
import CandidateDirectory from './features/ats/pages/CandidateDirectory';
import InterviewScheduler from './features/ats/pages/InterviewScheduler';
import AIInterviewLanding from './features/ats/pages/AIInterviewLanding';
import AIInterviewSession from './features/ats/pages/AIInterviewSession';

// Lazy load heavy dashboard modules
const ATSDashboard = lazy(() => import('./features/ats/pages/ATSDashboard'));
const RecruiterInterviewDashboard = lazy(() => import('./features/interviews/pages/RecruiterInterviewDashboard'));
const OnboardingPortal = lazy(() => import('./features/onboarding/pages/OnboardingPortal'));

// Senior Manager Portal
const ManagerDashboard = lazy(() => import('./features/manager/pages/ManagerDashboard'));
const TaskManagement = lazy(() => import('./features/manager/pages/ManagerTaskDashboard'));
const LeaveApprovals = lazy(() => import('./features/manager/pages/ManagerLeaves'));
const PerformanceReviews = lazy(() => import('./features/manager/pages/PerformanceReviews'));
const TeamAnalytics = lazy(() => import('./features/manager/pages/TeamAnalytics'));
const ManagerInterviewsPage = lazy(() => import('./features/manager/pages/ManagerInterviewsPage'));


/* ── Loading Fallback ── */
const PageLoader = () => (
  <div className="h-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
  </div>
);

function App() {
  const dispatch = useDispatch();
  const authInitialized = useSelector((state) => state.auth.authInitialized);

  useEffect(() => {
    if (!authInitialized) {
      runAuthHydration(dispatch);
    }
  }, [dispatch, authInitialized]);

  if (!authInitialized) {
    return <PageLoader />;
  }

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/*" element={<LoginPage />} />
          <Route path="/register/*" element={<Navigate to="/login" replace />} />
          
          {/* Public AI Interview Routes */}
          <Route path="/ai-interview/:meetingUrl" element={<CandidateInterviewRoom />} />
          <Route path="/ai-interview/:id/session" element={<AIInterviewSession />} />
          
          {/* Public Careers Routes */}
          <Route path="/careers" element={<CareersPortal />} />
          <Route path="/careers/job/:id" element={<JobDetailApply />} />
          
          {/* Protected Routes inside DashboardLayout */}
          <Route element={<PrivateRoute />}>
            <Route path="/change-password" element={<ChangePassword />} />
            <Route element={<DashboardLayout />}>
              {/* Shared Routes (all authenticated roles) */}
              <Route path="/dashboard" element={<MainDashboard />} />
              <Route path="/directory" element={<EmployeeDirectory />} />
              <Route path="/attendance" element={<AttendanceDashboard />} />
              <Route path="/leaves" element={<LeaveDashboard />} />
              <Route path="/payroll" element={<PayrollDashboard />} />
              <Route path="/documents" element={<DocumentDashboard />} />
              <Route path="/onboarding" element={<OnboardingPortal />} />
              <Route path="/performance" element={<PerformanceDashboard />} />
              <Route path="/employee/ai-chat" element={<AIChatPortal />} />
              
              {/* Super Admin Only */}
              <Route element={<PrivateRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/admin/executive" element={<ExecutiveDashboard />} />
                <Route path="/admin/users" element={<EmployeeDirectory />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/audit" element={<AuditLogPage />} />
              </Route>

              {/* HR Recruiter + Admin */}
              <Route element={<PrivateRoute allowedRoles={['HR_RECRUITER', 'SUPER_ADMIN']} />}>
                <Route path="/hr/ats" element={<ATSDashboard />} />
                <Route path="/hr/jobs" element={<JobListings />} />
                <Route path="/hr/pipeline" element={<PipelineBoard />} />
                <Route path="/hr/candidates" element={<CandidateDirectory />} />
                <Route path="/hr/interviews" element={<InterviewScheduler />} />
                <Route path="/hr/interviews/:id/dashboard" element={<RecruiterInterviewDashboard />} />
                <Route path="/hr/onboarding" element={<HRWorkflowDashboard />} />
              </Route>

              {/* Senior Manager + Admin */}
              <Route element={<PrivateRoute allowedRoles={['SENIOR_MANAGER', 'SUPER_ADMIN']} />}>
                <Route path="/manager/dashboard" element={<ManagerDashboard />} />
                <Route path="/manager/tasks" element={<TaskManagement />} />
                <Route path="/manager/approvals" element={<LeaveApprovals />} />
                <Route path="/manager/reviews" element={<PerformanceReviews />} />
                <Route path="/manager/analytics" element={<TeamAnalytics />} />
                <Route path="/manager/interviews" element={<ManagerInterviewsPage />} />
              </Route>
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
