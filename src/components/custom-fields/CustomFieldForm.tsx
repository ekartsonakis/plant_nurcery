import React, { useState } from 'react';
import { CustomField } from '../../types';
import { usePlantStore } from '../../store/plantStore';
import { Save, X, Trash2, Plus, Minus } from 'lucide-react';

interface CustomFieldFormProps {
  field?: CustomField;
  onClose: () => void;
}

const CustomFieldForm: React.FC<CustomFieldFormProps> = ({ field, onClose }) => {
  const { createCustomField, updateCustomField, deleteCustomField } = usePlantStore();
  
  const [name, setName] = useState(field?.name || '');
  const [type, setType] = useState<'text' | 'number' | 'date' | 'select'>(field?.type || 'text');
  const [options, setOptions] = useState<string[]>(field?.options || ['']);
  
  const handleAddOption = () => {
    setOptions([...options, '']);
  };
  
  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty options
    const filteredOptions = type === 'select' 
      ? options.filter(option => option.trim() !== '') 
      : undefined;
    
    const fieldData = {
      name,
      type,
      options: filteredOptions
    };
    
    if (field) {
      await updateCustomField({
        ...fieldData,
        id: field.id
      });
    } else {
      await createCustomField(fieldData);
    }
    
    onClose();
  };
  
  const handleDelete = async () => {
    if (!field) return;
    
    if (window.confirm('Are you sure you want to delete this custom field?')) {
      await deleteCustomField(field.id);
      onClose();
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {field ? 'Edit Custom Field' : 'Create Custom Field'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fieldName" className="block text-sm font-medium text-gray-700 mb-1">
            Field Name
          </label>
          <input
            id="fieldName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter field name"
            required
          />
        </div>
        
        <div>
          <label htmlFor="fieldType" className="block text-sm font-medium text-gray-700 mb-1">
            Field Type
          </label>
          <select
            id="fieldType"
            value={type}
            onChange={(e) => setType(e.target.value as 'text' | 'number' | 'date' | 'select')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="select">Select (Dropdown)</option>
          </select>
        </div>
        
        {type === 'select' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
                  disabled={options.length === 1}
                >
                  <Minus size={18} />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center text-green-600 hover:text-green-800 text-sm"
            >
              <Plus size={16} className="mr-1" />
              Add Option
            </button>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <X size={18} className="mr-1" />
            Cancel
          </button>
          
          {field && (
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
            {field ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomFieldForm;