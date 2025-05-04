import React, { useState, useEffect } from 'react';
import { PlantInfo, CustomField } from '../../types';
import { usePlantStore } from '../../store/plantStore';
import { format } from 'date-fns';
import { Save, X, Trash2 } from 'lucide-react';

interface PlantInfoFormProps {
  areaId: string;
  plantInfo?: PlantInfo;
  onClose: () => void;
}

const PlantInfoForm: React.FC<PlantInfoFormProps> = ({ 
  areaId, 
  plantInfo, 
  onClose 
}) => {
  const { createPlantInfo, updatePlantInfo, deletePlantInfo, customFields } = usePlantStore();
  
  const [species, setSpecies] = useState(plantInfo?.species || '');
  const [quantity, setQuantity] = useState(plantInfo?.quantity || 1);
  const [plantingDate, setPlantingDate] = useState(
    plantInfo?.plantingDate ? format(new Date(plantInfo.plantingDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const [notes, setNotes] = useState(plantInfo?.notes || '');
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string | number | Date>>(
    plantInfo?.customFields || {}
  );
  
  const handleCustomFieldChange = (fieldId: string, value: string | number) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const plantData = {
      areaId,
      species,
      quantity,
      plantingDate: new Date(plantingDate),
      notes,
      customFields: customFieldValues
    };
    
    if (plantInfo) {
      await updatePlantInfo({
        ...plantData,
        id: plantInfo.id
      });
    } else {
      await createPlantInfo(plantData);
    }
    
    onClose();
  };
  
  const handleDelete = async () => {
    if (!plantInfo) return;
    
    if (window.confirm('Are you sure you want to delete this plant information?')) {
      await deletePlantInfo(plantInfo.id);
      onClose();
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {plantInfo ? 'Edit Plant Information' : 'Add Plant Information'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
            Plant Species
          </label>
          <input
            id="species"
            type="text"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter plant species"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700 mb-1">
              Planting Date
            </label>
            <input
              id="plantingDate"
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Add any notes about this plant"
          ></textarea>
        </div>
        
        {customFields.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700">Custom Fields</h3>
            
            {customFields.map(field => (
              <div key={field.id}>
                <label htmlFor={`field-${field.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  {field.name}
                </label>
                
                {field.type === 'text' && (
                  <input
                    id={`field-${field.id}`}
                    type="text"
                    value={customFieldValues[field.id] as string || ''}
                    onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                )}
                
                {field.type === 'number' && (
                  <input
                    id={`field-${field.id}`}
                    type="number"
                    value={customFieldValues[field.id] as number || 0}
                    onChange={(e) => handleCustomFieldChange(field.id, Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                )}
                
                {field.type === 'date' && (
                  <input
                    id={`field-${field.id}`}
                    type="date"
                    value={
                      customFieldValues[field.id] 
                        ? format(new Date(customFieldValues[field.id] as string), 'yyyy-MM-dd') 
                        : format(new Date(), 'yyyy-MM-dd')
                    }
                    onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                )}
                
                {field.type === 'select' && field.options && (
                  <select
                    id={`field-${field.id}`}
                    value={customFieldValues[field.id] as string || ''}
                    onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select an option</option>
                    {field.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
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
          
          {plantInfo && (
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
            {plantInfo ? 'Update' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlantInfoForm;