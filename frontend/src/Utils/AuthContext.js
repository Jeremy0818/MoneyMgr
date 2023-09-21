// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, storeToken, removeToken, checkAuthToken } from './TokenManager';
import { getUserInfo } from './RequestHelper';

const AuthContext = createContext("");

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user and isLoading state from stored token on app startup
  useEffect(() => {
    async function loadUserFromToken() {
      try {
        const { token, refreshToken } = await getToken();
      const userInfo = await getUserInfo();
      console.log("Token: ", token);
      console.log("Refresh Token: ", refreshToken);
      console.log("User info: ", userInfo);
      if (token) {
        setUser({ token, refreshToken, userInfo });
      }
      setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
      
    }

    loadUserFromToken();
  }, []);

  // Login function
  const login = async (token, refreshToken, userInfo) => {
    setUser({ token, refreshToken, userInfo });
    await storeToken(token, refreshToken);
  };

  // Logout function
  const logout = async () => {
    setUser(null);
    removeToken();
  };

  const isAuthenticated = () => {
    return user && user.userInfo
  }

  // Handle token refresh when token is about to expire
  const handleTokenRefresh = async () => {
    try {
      const newAccessToken = await checkAuthToken();
      setUser({token: newAccessToken, refreshToken: user.refreshToken, userInfo: user.userInfo});
    } catch (error) {
      // Handle token refresh failure (e.g., user needs to log in again)
      console.log("Refresh token failed: ", error);
      logout();
    }
  };

  // Automatically handle token refresh
  useEffect(() => {
    const token = user?.token;
    if (token) {
      // Check and refresh token when the app is active or periodically
      // You can use AppState and/or setInterval for periodic checks
      // For simplicity, this example checks every minute
      const refreshInterval = setInterval(() => {
        handleTokenRefresh();
      }, 3 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [user?.token]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthContext, AuthProvider, useAuth };
