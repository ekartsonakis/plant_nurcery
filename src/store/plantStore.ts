import { create } from 'zustand';
import { PlantInfo, CustomField, Reminder } from '../types';
import { supabase } from '../lib/supabase';

interface PlantState {
  plantInfo: PlantInfo[];
  customFields: CustomField[];
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  
  fetchPlantInfoByArea: (areaId: string) => Promise<void>;
  createPlantInfo: (info: Omit<PlantInfo, 'id'>) => Promise<void>;
  updatePlantInfo: (info: PlantInfo) => Promise<void>;
  deletePlantInfo: (id: string) => Promise<void>;
  
  fetchCustomFields: () => Promise<void>;
  createCustomField: (field: Omit<CustomField, 'id'>) => Promise<void>;
  updateCustomField: (field: CustomField) => Promise<void>;
  deleteCustomField: (id: string) => Promise<void>;
  
  fetchRemindersByArea: (areaId: string) => Promise<void>;
  createReminder: (reminder: Omit<Reminder, 'id' | 'sent'>) => Promise<void>;
  updateReminder: (reminder: Reminder) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
}

export const usePlantStore = create<PlantState>((set, get) => ({
  plantInfo: [],
  customFields: [],
  reminders: [],
  loading: false,
  error: null,
  
  fetchPlantInfoByArea: async (areaId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('plant_info')
        .select('*')
        .eq('area_id', areaId);
      
      if (error) throw error;
      
      // Convert snake_case to camelCase
      const plantInfo = data.map(info => ({
        id: info.id,
        areaId: info.area_id,
        species: info.species,
        quantity: info.quantity,
        plantingDate: info.planting_date,
        notes: info.notes,
        customFields: info.custom_fields,
        createdAt: info.created_at,
        updatedAt: info.updated_at
      }));
      
      set({ 
        plantInfo: plantInfo as PlantInfo[],
        loading: false 
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch plant info',
        loading: false
      });
    }
  },
  
  createPlantInfo: async (info) => {
    try {
      set({ loading: true });
      
      // Convert camelCase to snake_case for the database
      const dbInfo = {
        area_id: info.areaId,
        species: info.species,
        quantity: info.quantity,
        planting_date: info.plantingDate,
        notes: info.notes,
        custom_fields: info.customFields
      };
      
      const { data, error } = await supabase
        .from('plant_info')
        .insert([dbInfo])
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert snake_case back to camelCase
      const newPlantInfo = {
        id: data.id,
        areaId: data.area_id,
        species: data.species,
        quantity: data.quantity,
        plantingDate: data.planting_date,
        notes: data.notes,
        customFields: data.custom_fields,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      set((state) => ({ 
        plantInfo: [...state.plantInfo, newPlantInfo as PlantInfo],
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to create plant info',
        loading: false
      });
    }
  },
  
  updatePlantInfo: async (info) => {
    try {
      set({ loading: true });
      
      // Convert camelCase to snake_case for the database
      const dbInfo = {
        area_id: info.areaId,
        species: info.species,
        quantity: info.quantity,
        planting_date: info.plantingDate,
        notes: info.notes,
        custom_fields: info.customFields
      };
      
      const { error } = await supabase
        .from('plant_info')
        .update(dbInfo)
        .eq('id', info.id);
      
      if (error) throw error;
      
      set((state) => ({ 
        plantInfo: state.plantInfo.map(p => p.id === info.id ? info : p),
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update plant info',
        loading: false
      });
    }
  },
  
  deletePlantInfo: async (id) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('plant_info')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({ 
        plantInfo: state.plantInfo.filter(p => p.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to delete plant info',
        loading: false
      });
    }
  },
  
  fetchCustomFields: async () => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('custom_fields')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      set({ 
        customFields: data as CustomField[],
        loading: false
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch custom fields',
        loading: false
      });
    }
  },
  
  createCustomField: async (field) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('custom_fields')
        .insert([field])
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({ 
        customFields: [...state.customFields, data as CustomField],
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to create custom field',
        loading: false
      });
    }
  },
  
  updateCustomField: async (field) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('custom_fields')
        .update(field)
        .eq('id', field.id);
      
      if (error) throw error;
      
      set((state) => ({ 
        customFields: state.customFields.map(f => f.id === field.id ? field : f),
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update custom field',
        loading: false
      });
    }
  },
  
  deleteCustomField: async (id) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('custom_fields')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({ 
        customFields: state.customFields.filter(f => f.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to delete custom field',
        loading: false
      });
    }
  },
  
  fetchRemindersByArea: async (areaId) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('area_id', areaId)
        .order('due_date');
      
      if (error) throw error;
      
      // Convert snake_case to camelCase
      const reminders = data.map(reminder => ({
        id: reminder.id,
        areaId: reminder.area_id,
        title: reminder.title,
        description: reminder.description,
        dueDate: reminder.due_date,
        time: reminder.time,
        email: reminder.email,
        sent: reminder.sent
      }));
      
      set({ 
        reminders: reminders as Reminder[],
        loading: false
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch reminders',
        loading: false
      });
    }
  },
  
  createReminder: async (reminder) => {
    try {
      set({ loading: true });
      
      // Convert camelCase to snake_case for the database
      const dbReminder = {
        area_id: reminder.areaId,
        title: reminder.title,
        description: reminder.description,
        due_date: reminder.dueDate,
        time: reminder.time,
        email: reminder.email,
        sent: false
      };
      
      const { data, error } = await supabase
        .from('reminders')
        .insert([dbReminder])
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert snake_case back to camelCase
      const newReminder = {
        id: data.id,
        areaId: data.area_id,
        title: data.title,
        description: data.description,
        dueDate: data.due_date,
        time: data.time,
        email: data.email,
        sent: data.sent
      };
      
      set((state) => ({ 
        reminders: [...state.reminders, newReminder as Reminder],
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to create reminder',
        loading: false
      });
    }
  },
  
  updateReminder: async (reminder) => {
    try {
      set({ loading: true });
      
      // Convert camelCase to snake_case for the database
      const dbReminder = {
        area_id: reminder.areaId,
        title: reminder.title,
        description: reminder.description,
        due_date: reminder.dueDate,
        time: reminder.time,
        email: reminder.email,
        sent: reminder.sent
      };
      
      const { error } = await supabase
        .from('reminders')
        .update(dbReminder)
        .eq('id', reminder.id);
      
      if (error) throw error;
      
      set((state) => ({ 
        reminders: state.reminders.map(r => r.id === reminder.id ? reminder : r),
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to update reminder',
        loading: false
      });
    }
  },
  
  deleteReminder: async (id) => {
    try {
      set({ loading: true });
      
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({ 
        reminders: state.reminders.filter(r => r.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to delete reminder',
        loading: false
      });
    }
  }
}));