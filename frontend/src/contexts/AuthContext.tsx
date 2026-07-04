import React, { createContext, useState, useEffect, useContext } from 'react';

interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUserAddress: (address: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('med_auth_token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      // Fetch user profile using the token
      fetch('http://localhost:8000/api/auth/user/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Invalid token');
        })
        .then((data) => {
          setUser(data);
        })
        .catch(() => {
          logout();
        });
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('med_auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('med_auth_token');
    setToken(null);
    setUser(null);
  };

  const updateUserAddress = (address: string) => {
    if (user) {
      setUser({ ...user, address });
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout, updateUserAddress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
