import axios from 'axios';
import { store } from '../store';
import { logoutUser, setCredentials } from '../store/slices/authSlice';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

// Inject token into request headers
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const state = store.getState();
      const token = state.auth.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get token from Redux store:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ignore refresh or login endpoints to prevent infinite loops
    const isAuthRoute = originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/custom-auth/refresh') || originalRequest.url?.includes('/login');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token using HttpOnly cookie
        const { data } = await axios.post('http://localhost:5000/api/v1/custom-auth/refresh', {}, { withCredentials: true });
        
        const newAccessToken = data.accessToken;
        
        // Update Redux state
        store.dispatch(setCredentials({
          user: data.user,
          accessToken: newAccessToken
        }));

        // Retry the original request
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return axiosClient(originalRequest);

      } catch (refreshError) {
        store.dispatch(logoutUser());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
