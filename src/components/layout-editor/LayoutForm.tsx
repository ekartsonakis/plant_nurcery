import React, { useState } from 'react';
import { useLayoutStore } from '../../store/layoutStore';
import { NurseryLayout, MeasurementUnit } from '../../types';
import { Save, X } from 'lucide-react';

interface LayoutFormProps {
  initialLayout?: NurseryLayout;
  onSubmit: () => void;
  onCancel: () => void;
}

const LayoutForm: React.FC<LayoutFormProps> = ({ 
  initialLayout, 
  onSubmit, 
  onCancel 
}) => {
  const [name, setName] = useState(initialLayout?.name || '');
  const [width, setWidth] = useState(initialLayout?.width || 10);
  const [height, setHeight] = useState(initialLayout?.height || 10);
  const [unit, setUnit] = useState<MeasurementUnit>(initialLayout?.unit || 'meters');
  
  const { createLayout, updateLayout } = useLayoutStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialLayout) {
      await updateLayout({
        ...initialLayout,
        name,
        width,
        height,
        unit
      });
    } else {
      await createLayout({
        name,
        width,
        height,
        unit,
        areas: []
      });
    }
    
    onSubmit();
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {initialLayout ? 'Edit Layout' : 'Create New Layout'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="layoutName" className="block text-sm font-medium text-gray-700 mb-1">
            Layout Name
          </label>
          <input
            id="layoutName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter layout name"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="layoutWidth" className="block text-sm font-medium text-gray-700 mb-1">
              Width
            </label>
            <input
              id="layoutWidth"
              type="number"
              min="1"
              step={unit === 'meters' ? '0.1' : '1'}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="layoutHeight" className="block text-sm font-medium text-gray-700 mb-1">
              Height
            </label>
            <input
              id="layoutHeight"
              type="number"
              min="1"
              step={unit === 'meters' ? '0.1' : '1'}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
            Measurement Unit
          </label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="meters">Meters</option>
            <option value="centimeters">Centimeters</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <X size={18} className="mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Save size={18} className="mr-1" />
            {initialLayout ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LayoutForm;