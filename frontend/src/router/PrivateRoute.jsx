import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, selectAuthError, logoutUser } from '../store/slices/authSlice';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  // Not signed in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If there's an authentication/sync error, show it
  if (authError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white/5 border border-red-500/30 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-gray-400 mb-6">{authError}</p>
          <button 
            onClick={async () => {
              dispatch(logoutUser());
              window.location.href = '/login';
            }}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Sign Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  // Signed in but user data not yet synced to Redux → show loading
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          <p className="text-gray-400 text-sm">Setting up your session...</p>
        </div>
      </div>
    );
  }

  // Role-based access check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect user to their own portal based on their actual role
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/admin/executive" replace />;
    if (user.role === 'HR_RECRUITER') return <Navigate to="/dashboard" replace />;
    if (user.role === 'SENIOR_MANAGER') return <Navigate to="/manager/dashboard" replace />;
    if (user.role === 'EMPLOYEE') return <Navigate to="/dashboard" replace />;
    
    // Fallback redirect
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
