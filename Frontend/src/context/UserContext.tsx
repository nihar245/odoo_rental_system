import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface Address {
  line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  avatarUrl?: string;
  address?: Address;
  wishlist?: string[]; // product ids
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (partial: Partial<User>) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('rental_user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem('rental_user', JSON.stringify(user));
      else localStorage.removeItem('rental_user');
    } catch {
      // no-op
    }
  }, [user]);

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};