import { create } from 'zustand';
import { User } from '../types';
import { getCurrentUser, getUserProfile, signOut } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  checkUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,
  
  checkUser: async () => {
    try {
      set({ loading: true });
      const { user, error } = await getCurrentUser();
      
      if (error) {
        set({ 
          user: null, 
          loading: false, 
          initialized: true,
          error: null 
        });
        return;
      }
      
      if (!user) {
        set({ 
          user: null, 
          loading: false, 
          initialized: true,
          error: null 
        });
        return;
      }
      
      // Get additional user data from profiles table
      const { profile, error: profileError } = await getUserProfile(user.id);
      
      if (profileError) {
        set({ 
          user: null, 
          loading: false, 
          initialized: true,
          error: null 
        });
        return;
      }
      
      // Combine auth and profile data
      set({
        user: {
          id: user.id,
          email: user.email || '',
          isAdmin: profile?.is_admin || false,
          approved: profile?.approved || false,
          name: profile?.name,
          avatar_url: profile?.avatar_url
        },
        loading: false,
        initialized: true,
        error: null
      });
    } catch (err) {
      set({ 
        user: null, 
        loading: false, 
        initialized: true,
        error: null 
      });
    }
  },
  
  setUser: (user) => set({ user }),
  
  logout: async () => {
    try {
      set({ loading: true });
      await signOut();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Always clear user state, even if there was an error
      set({ 
        user: null, 
        loading: false, 
        initialized: true,
        error: null 
      });
    }
  }
}));