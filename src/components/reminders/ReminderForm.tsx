import React, { useState } from 'react';
import { Reminder } from '../../types';
import { usePlantStore } from '../../store/plantStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { Save, X, Trash2 } from 'lucide-react';

interface ReminderFormProps {
  areaId: string;
  reminder?: Reminder;
  onClose: () => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ 
  areaId, 
  reminder, 
  onClose 
}) => {
  const { createReminder, updateReminder, deleteReminder } = usePlantStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState(reminder?.title || '');
  const [description, setDescription] = useState(reminder?.description || '');
  const [dueDate, setDueDate] = useState(
    reminder?.dueDate || format(new Date(), 'yyyy-MM-dd')
  );
  const [time, setTime] = useState(reminder?.time || '09:00');
  const [email, setEmail] = useState(reminder?.email || (user?.email || ''));
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const reminderData = {
      areaId,
      title,
      description,
      dueDate,
      time,
      email
    };
    
    if (reminder) {
      await updateReminder({
        ...reminderData,
        id: reminder.id,
        sent: reminder.sent
      });
    } else {
      await createReminder(reminderData);
    }
    
    onClose();
  };
  
  const handleDelete = async () => {
    if (!reminder) return;
    
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      await deleteReminder(reminder.id);
      onClose();
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {reminder ? 'Edit Reminder' : 'Create Reminder'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter reminder title"
            required
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Describe what needs to be done"
          ></textarea>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email for Notification
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter email address"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <X size={18} className="mr-1" />
            Cancel
          </button>
          
          {reminder && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Trash2 size={18} className="mr-1" />
              Delete
            </button>
          )}
          
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Save size={18} className="mr-1" />
            {reminder ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;