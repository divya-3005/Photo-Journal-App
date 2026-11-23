import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);
const USER_KEY = '@journal_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // When the app starts, check if a user was saved earlier (auto-login)
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const saved = await AsyncStorage.getItem(USER_KEY);
        if (saved) setUser(JSON.parse(saved));
      } catch (e) {
        console.log('Could not restore user:', e);
      } finally {
        setIsLoading(false);
      }
    };
    restoreUser();
  }, []);

  const login = async (name, password) => {
    if (!name.trim() || !password) {
      throw new Error('Please enter your name and password.');
    }
    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters.');
    }
    // Demo login: we only save the name. We never store the password.
    const newUser = { name: name.trim() };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so screens can write: const { user } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
