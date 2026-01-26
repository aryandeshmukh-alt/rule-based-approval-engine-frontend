import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount to persist session visually
    // Note: The backend handles the actual session via HttpOnly cookies.
    // We store the user info in localStorage just for UI persistence (e.g. name, role).
    // A better approach would be a /me endpoint, but for now we trust the localStorage until an API call fails with 401.
    const storedUser = localStorage.getItem('approval_engine_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('approval_engine_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      console.log('AuthContext: Setting user:', user);
      setUser(user);
      localStorage.setItem('approval_engine_user', JSON.stringify(user));
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await authService.register(name, email, password);
      setUser(user);
      localStorage.setItem('approval_engine_user', JSON.stringify(user));
      toast.success('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Email might be taken.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('approval_engine_user');
      toast.success('Logged out');
    } catch (error) {
      console.error('Logout error', error);
      // Even if API fails, clear local state
      setUser(null);
      localStorage.removeItem('approval_engine_user');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
