import React from 'react';
import { PlantInfo, CustomField } from '../../types';
import { format } from 'date-fns';
import { Sprout, Calendar, HashIcon, Pencil } from 'lucide-react';

interface PlantInfoCardProps {
  plantInfo: PlantInfo;
  customFields: CustomField[];
  onEdit: (plantInfo: PlantInfo) => void;
}

const PlantInfoCard: React.FC<PlantInfoCardProps> = ({ 
  plantInfo, 
  customFields,
  onEdit 
}) => {
  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMMM d, yyyy');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-green-700 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold flex items-center">
          <Sprout size={18} className="mr-2" />
          {plantInfo.species}
        </h3>
        <button
          onClick={() => onEdit(plantInfo)}
          className="text-white hover:text-green-200 focus:outline-none"
        >
          <Pencil size={16} />
        </button>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-600 flex items-center">
            <HashIcon size={16} className="mr-1" />
            Quantity:
          </div>
          <div className="font-medium">{plantInfo.quantity}</div>
          
          <div className="text-gray-600 flex items-center">
            <Calendar size={16} className="mr-1" />
            Planted:
          </div>
          <div className="font-medium">{formatDate(plantInfo.plantingDate)}</div>
        </div>
        
        {plantInfo.notes && (
          <div className="mt-3">
            <div className="text-gray-600 mb-1">Notes:</div>
            <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{plantInfo.notes}</p>
          </div>
        )}
        
        {Object.keys(plantInfo.customFields).length > 0 && (
          <div className="mt-3">
            <div className="text-gray-600 mb-1">Custom Fields:</div>
            <div className="bg-gray-50 p-2 rounded">
              {Object.entries(plantInfo.customFields).map(([fieldId, value]) => {
                const field = customFields.find(f => f.id === fieldId);
                if (!field) return null;
                
                let displayValue = value;
                if (field.type === 'date' && value) {
                  displayValue = formatDate(new Date(value as string));
                }
                
                return (
                  <div key={fieldId} className="grid grid-cols-2 gap-2 text-sm mb-1">
                    <div className="text-gray-600">{field.name}:</div>
                    <div>{displayValue as React.ReactNode}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantInfoCard;