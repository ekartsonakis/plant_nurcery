import React from 'react';
import { Reminder } from '../../types';
import { format, isPast, isValid, parseISO } from 'date-fns';
import { BellRing, Calendar, Mail, Pencil, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ReminderCardProps {
  reminder: Reminder;
  onEdit: (reminder: Reminder) => void;
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onEdit }) => {
  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return 'Invalid Date';
    }
    return format(date, 'MMMM d, yyyy');
  };
  
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, 'h:mm a');
  };
  
  const isOverdue = () => {
    const date = parseISO(reminder.dueDate);
    if (!isValid(date)) return false;
    
    const now = new Date();
    const reminderDateTime = new Date(reminder.dueDate);
    const [hours, minutes] = reminder.time.split(':');
    reminderDateTime.setHours(parseInt(hours, 10));
    reminderDateTime.setMinutes(parseInt(minutes, 10));
    
    return isPast(reminderDateTime) && !reminder.sent;
  };
  
  const overdueStatus = isOverdue();
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
      reminder.sent 
        ? 'border-green-500' 
        : (overdueStatus ? 'border-red-500' : 'border-yellow-500')
    }`}>
      <div className="px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold flex items-center">
          <BellRing size={18} className="mr-2" />
          {reminder.title}
          {reminder.sent && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 flex items-center">
              <CheckCircle size={12} className="mr-1" />
              Sent
            </span>
          )}
          {overdueStatus && (
            <span className="ml-2 text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 flex items-center">
              <AlertCircle size={12} className="mr-1" />
              Overdue
            </span>
          )}
        </h3>
        <button
          onClick={() => onEdit(reminder)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <Pencil size={16} />
        </button>
      </div>
      
      <div className="p-4 space-y-3">
        {reminder.description && (
          <p className="text-sm text-gray-700">{reminder.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-600 flex items-center">
            <Calendar size={16} className="mr-1" />
            Due Date:
          </div>
          <div className={overdueStatus ? 'font-medium text-red-600' : 'font-medium'}>
            {formatDate(reminder.dueDate)}
          </div>
          
          <div className="text-gray-600 flex items-center">
            <Clock size={16} className="mr-1" />
            Time:
          </div>
          <div className={overdueStatus ? 'font-medium text-red-600' : 'font-medium'}>
            {formatTime(reminder.time)}
          </div>
          
          <div className="text-gray-600 flex items-center">
            <Mail size={16} className="mr-1" />
            Notify:
          </div>
          <div className="font-medium overflow-hidden text-ellipsis">{reminder.email}</div>
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;