import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '../services/api/account';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      getUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const getUserProfile = async () => {
    try {
      setLoading(true);
      const response = await accountService.getDetail();
      if (response.data) {
        setUser(response.data);
        
        // Set user and company information in localStorage
        if (response.data.user) {
          // User info
          localStorage.setItem("loginType", response.data.user.loginType);
          localStorage.setItem("userInformation", JSON.stringify(response.data.user));
          
          // Free user status
          const isFreeUser = response.data?.isFreeUser;
          localStorage.setItem("iFU0", isFreeUser);
          
          // Company info
          if (response.data.company) {
            localStorage.setItem("userCompanyInformation", JSON.stringify(response.data.company));
          }
          
          // Company subscription
          if (response.data.companySubscription) {
            localStorage.setItem("c65s1", JSON.stringify(response.data.companySubscription));
          }
          
          // Handle user role IDs
          let userRoleIdList = JSON.parse(localStorage.getItem("userRoleIdList")) || [];
          userRoleIdList.push(response.data.user.userTypeId);
          localStorage.setItem("userRoleIdList", JSON.stringify(userRoleIdList));
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await accountService.login(credentials);
      
      if (response.error) {
        return { success: false, error: response.error };
      }
      
      if (response.data) {
        // Store token
        const token = response.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("accessToken", token); // Also set accessToken for compatibility
        localStorage.setItem("refreshToken", response.data.refreshToken);
        
        // Get user profile after successful login
        await getUserProfile();
        
        // Navigate to mind-map-list after successful login
        navigate('/mind-map-list');
        
        return { success: true };
      }
      
      return { success: false, error: 'Unknown error' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await accountService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInformation');
      localStorage.removeItem('iFU0');
      localStorage.removeItem('userCompanyInformation');
      localStorage.removeItem('c65s1');
      localStorage.removeItem('userRoleIdList');
      
      // Clear user state
      setUser(null);
      
      // Navigate to login page
      navigate('/login');
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 