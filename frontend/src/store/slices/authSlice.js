import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  clerkUser: null,
  accessToken: null,
  isAuthenticated: false,
  authError: null,
  authInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called by ClerkSyncProvider after Clerk sign-in + backend sync
    setClerkUser: (state, action) => {
      state.user = action.payload.user;
      state.clerkUser = action.payload.clerkUser || null;
      state.isAuthenticated = true;
      state.authInitialized = true;
      state.authError = null;
    },
    setAuthError: (state, action) => {
      state.authError = action.payload;
    },
    clearError: (state) => {
      state.authError = null;
    },
    // Legacy action kept for backward compatibility (and new Custom JWT flow)
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      if (action.payload.accessToken) {
        state.accessToken = action.payload.accessToken;
      }
      state.isAuthenticated = true;
      state.authInitialized = true;
      state.authError = null;
    },
    setAuthFailed: (state) => {
      state.user = null;
      state.clerkUser = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.authInitialized = true;
      state.authError = null;
    },
    logoutUser: (state) => {
      state.user = null;
      state.clerkUser = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.authInitialized = true;
      state.authError = null;
    },
  },
});

export const { setClerkUser, setAuthError, setCredentials, setAuthFailed, logoutUser, clearError } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectClerkUser = (state) => state.auth.clerkUser;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.authError;

export default authSlice.reducer;
