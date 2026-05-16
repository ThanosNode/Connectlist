import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

// Extended user type to include JWT token
interface AuthUser extends User {
  token?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
  getCsrfToken: () => Promise<string | null>;
  getAuthToken: () => string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  getCsrfToken: async () => null,
  getAuthToken: () => null,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Function to get or initialize CSRF token
  const getCsrfToken = async (): Promise<string | null> => {
    if (csrfToken) return csrfToken;
    
    try {
      const response = await fetch('/api/csrf-init', { 
        method: 'GET', 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const token = response.headers.get('X-CSRF-Token');
        if (token) {
          console.log('CSRF token initialized successfully');
          setCsrfToken(token);
          return token;
        } else {
          console.warn('No CSRF token in response headers');
        }
      } else {
        console.error('Failed to initialize CSRF token:', response.status);
      }
      return null;
    } catch (error) {
      console.error('Error initializing CSRF token:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First check if we have a user in localStorage (Ultra Simple Login)
        const storedUser = localStorage.getItem('connectedUser');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            if (userData && userData.id) {
              console.log('Using authenticated user from localStorage');
              setUser(userData);
              setIsLoading(false);
              return; // Skip API check if we have user in localStorage
            }
          } catch (e) {
            console.error('Error parsing stored user data:', e);
            localStorage.removeItem('connectedUser'); // Clear invalid data
          }
        }
        
        // If no localStorage user, try the standard API check
        // First, initialize the CSRF token
        await getCsrfToken();
        
        // Then check authentication status
        const headers: Record<string, string> = {
          'X-CSRF-Token': csrfToken || '', // Use token if available
        };
        
        // Check if we have a token in localStorage
        try {
          const storedUser = localStorage.getItem('connectedUser');
          if (storedUser) {
            const userData = JSON.parse(storedUser) as AuthUser;
            if (userData && userData.token) {
              headers['Authorization'] = `Bearer ${userData.token}`;
              console.log('Adding JWT token to auth check');
            }
          }
        } catch (e) {
          console.error('Error adding token to auth check:', e);
        }
        
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData) {
            setUser(userData);
            // Also store in localStorage for redundancy
            localStorage.setItem('connectedUser', JSON.stringify(userData));
          }
        } else if (response.status !== 401) {
          // Only log non-401 errors
          console.error(`Auth check failed: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [csrfToken]);

  // Get the JWT auth token from the currently logged in user
  const getAuthToken = (): string | null => {
    // First try to get from the current user object in state
    if (user && user.token) {
      return user.token;
    }
    
    // Otherwise try to get from localStorage
    try {
      const storedUser = localStorage.getItem('connectedUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser) as AuthUser;
        if (userData && userData.token) {
          return userData.token;
        }
      }
    } catch (error) {
      console.error('Error retrieving auth token from localStorage:', error);
    }
    
    return null;
  };

  const login = (userData: AuthUser) => {
    // Make sure we're properly handling the user data
    if (userData && userData.id) {
      // Set in context
      setUser(userData);
      
      // Store in localStorage for persistence
      localStorage.setItem('connectedUser', JSON.stringify(userData));
      
      // Set global variables for easier debugging
      (window as any).isAuthenticated = true;
      (window as any).currentUser = userData;
      
      console.log('User successfully logged in:', userData.username);
      
      if (userData.token) {
        console.log('JWT token successfully stored');
      }
    } else {
      console.error("Invalid user data in login function:", userData);
    }
  };

  const logout = async () => {
    try {
      // Get a fresh CSRF token if needed
      const token = await getCsrfToken();
      
      // Include the CSRF token in the request
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": token || "",
        },
      });
      
      // Clear the localStorage data
      localStorage.removeItem('connectedUser');
      
      // Remove the window globals
      (window as any).isAuthenticated = false;
      (window as any).currentUser = null;
      
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      
      // Even if the API call fails, clear local state
      localStorage.removeItem('connectedUser');
      (window as any).isAuthenticated = false;
      (window as any).currentUser = null;
      setUser(null);
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
    isLoading,
    getCsrfToken,
    getAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
