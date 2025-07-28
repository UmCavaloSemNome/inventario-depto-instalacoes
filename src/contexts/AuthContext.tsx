import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  login: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (name: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('name', name)
        .eq('password', password)
        .single();

      if (error || !data) {
        setError('Usuário ou senha inválidos.');
        setUser(null);
        return false;
      }

      setUser(data as User);
      return true;
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // TODO: Clear any other session data if necessary
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
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
