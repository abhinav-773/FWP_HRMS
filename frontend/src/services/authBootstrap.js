import axiosClient from './axiosClient';
import { setCredentials, setAuthFailed } from '../store/slices/authSlice';

/**
 * runAuthHydration is called ONCE when the app mounts.
 * It strictly enforces the global loading gate.
 */
export const runAuthHydration = async (dispatch) => {
  try {
    console.log('[AuthBootstrap] Initiating session hydration...');
    // The refresh endpoint utilizes the HttpOnly cookie
    const response = await axiosClient.post('/custom-auth/refresh');
    
    if (response.data && response.data.accessToken) {
      console.log('[AuthBootstrap] Session hydrated successfully. User:', response.data.user?.email);
      dispatch(setCredentials({
        user: response.data.user,
        accessToken: response.data.accessToken
      }));
    } else {
      console.log('[AuthBootstrap] No valid session returned.');
      dispatch(setAuthFailed());
    }
  } catch (error) {
    console.warn('[AuthBootstrap] Session hydration failed. User needs to login.', error?.response?.data || error.message);
    dispatch(setAuthFailed());
  }
};
