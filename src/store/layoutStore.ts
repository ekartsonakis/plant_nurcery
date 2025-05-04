import { create } from 'zustand';
import { NurseryLayout, AreaShape } from '../types';
import { supabase } from '../lib/supabase';

interface LayoutState {
  layouts: NurseryLayout[];
  currentLayout: NurseryLayout | null;
  selectedArea: AreaShape | null;
  loading: boolean;
  error: string | null;
  
  fetchLayouts: () => Promise<void>;
  createLayout: (layout: Omit<NurseryLayout, 'id' | 'userId' | 'lastModified'>) => Promise<void>;
  updateLayout: (layout: NurseryLayout) => Promise<void>;
  deleteLayout: (id: string) => Promise<void>;
  
  setCurrentLayout: (layout: NurseryLayout | null) => void;
  selectArea: (area: AreaShape | null) => void;
  
  addArea: (area: Omit<AreaShape, 'id'>) => Promise<void>;
  updateArea: (area: AreaShape) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
  clearAreas: () => Promise<void>;
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  layouts: [],
  currentLayout: null,
  selectedArea: null,
  loading: false,
  error: null,
  
  fetchLayouts: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('layouts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Ensure areas is always an array
      const layouts = data.map(layout => ({
        ...layout,
        areas: Array.isArray(layout.areas) ? layout.areas : []
      }));
      
      set({ 
        layouts: layouts as NurseryLayout[],
        loading: false
      });
    } catch (err) {
      console.error('Error fetching layouts:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch layouts',
        loading: false
      });
    }
  },
  
  createLayout: async (layout) => {
    try {
      set({ loading: true, error: null });
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');
      
      const newLayout = {
        ...layout,
        userId: userData.user.id,
        lastModified: new Date().toISOString(),
        // Ensure areas is always an array
        areas: Array.isArray(layout.areas) ? layout.areas : []
      };
      
      const { data, error } = await supabase
        .from('layouts')
        .insert([newLayout])
        .select()
        .single();
      
      if (error) throw error;
      
      // Ensure data has areas as an array
      const parsedLayout = {
        ...data,
        areas: Array.isArray(data.areas) ? data.areas : []
      };
      
      set((state) => ({ 
        layouts: [...state.layouts, parsedLayout as NurseryLayout],
        currentLayout: parsedLayout as NurseryLayout,
        loading: false
      }));
    } catch (err) {
      console.error('Error creating layout:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to create layout',
        loading: false
      });
    }
  },
  
  updateLayout: async (layout) => {
    try {
      set({ loading: true, error: null });
      
      const layoutToUpdate = {
        ...layout,
        lastModified: new Date().toISOString(),
        // Ensure areas is always an array
        areas: Array.isArray(layout.areas) ? layout.areas : []
      };
      
      const { error } = await supabase
        .from('layouts')
        .update(layoutToUpdate)
        .eq('id', layout.id);
      
      if (error) throw error;
      
      set((state) => ({ 
        layouts: state.layouts.map(l => l.id === layout.id ? layoutToUpdate : l),
        currentLayout: state.currentLayout?.id === layout.id ? layoutToUpdate : state.currentLayout,
        loading: false
      }));
    } catch (err) {
      console.error('Error updating layout:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update layout',
        loading: false
      });
    }
  },
  
  deleteLayout: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('layouts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({ 
        layouts: state.layouts.filter(l => l.id !== id),
        currentLayout: state.currentLayout?.id === id ? null : state.currentLayout,
        loading: false
      }));
    } catch (err) {
      console.error('Error deleting layout:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to delete layout',
        loading: false
      });
    }
  },
  
  setCurrentLayout: (layout) => set({ currentLayout: layout }),
  
  selectArea: (area) => set({ selectedArea: area }),
  
  addArea: async (area) => {
    const currentLayout = get().currentLayout;
    if (!currentLayout) return;
    
    try {
      set({ error: null });
      
      // Ensure current layout areas is an array
      const currentAreas = Array.isArray(currentLayout.areas) ? currentLayout.areas : [];
      const newArea = { ...area, id: crypto.randomUUID() };
      
      const updatedAreas = [...currentAreas, newArea];
      const updatedLayout = { 
        ...currentLayout, 
        areas: updatedAreas,
        lastModified: new Date().toISOString()
      };
      
      await get().updateLayout(updatedLayout);
      
      set({ 
        currentLayout: updatedLayout,
        selectedArea: newArea
      });
    } catch (err) {
      console.error('Error adding area:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to add area' });
    }
  },
  
  updateArea: async (area) => {
    const currentLayout = get().currentLayout;
    if (!currentLayout) return;
    
    try {
      set({ error: null });
      
      // Ensure current layout areas is an array
      const currentAreas = Array.isArray(currentLayout.areas) ? currentLayout.areas : [];
      
      const updatedAreas = currentAreas.map(a => 
        a.id === area.id ? area : a
      );
      
      const updatedLayout = { 
        ...currentLayout, 
        areas: updatedAreas,
        lastModified: new Date().toISOString()
      };
      
      await get().updateLayout(updatedLayout);
      
      set({ 
        currentLayout: updatedLayout,
        selectedArea: area
      });
    } catch (err) {
      console.error('Error updating area:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to update area' });
    }
  },
  
  deleteArea: async (id) => {
    const currentLayout = get().currentLayout;
    if (!currentLayout) return;
    
    try {
      set({ error: null });
      
      // Ensure current layout areas is an array
      const currentAreas = Array.isArray(currentLayout.areas) ? currentLayout.areas : [];
      
      const updatedAreas = currentAreas.filter(a => a.id !== id);
      const updatedLayout = { 
        ...currentLayout, 
        areas: updatedAreas,
        lastModified: new Date().toISOString()
      };
      
      await get().updateLayout(updatedLayout);
      
      set({ 
        currentLayout: updatedLayout,
        selectedArea: null
      });
    } catch (err) {
      console.error('Error deleting area:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to delete area' });
    }
  },
  
  clearAreas: async () => {
    const currentLayout = get().currentLayout;
    if (!currentLayout) return;
    
    try {
      set({ error: null });
      
      const updatedLayout = { 
        ...currentLayout, 
        areas: [],
        lastModified: new Date().toISOString()
      };
      
      await get().updateLayout(updatedLayout);
      
      set({ 
        currentLayout: updatedLayout,
        selectedArea: null
      });
    } catch (err) {
      console.error('Error clearing areas:', err);
      set({ error: err instanceof Error ? err.message : 'Failed to clear areas' });
    }
  }
}));