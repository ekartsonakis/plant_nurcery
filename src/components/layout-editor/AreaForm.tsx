import React, { useState, useEffect } from 'react';
import { AreaShape } from '../../types';
import { useLayoutStore } from '../../store/layoutStore';
import { Pencil, X, Save, Trash2 } from 'lucide-react';

interface AreaFormProps {
  area: AreaShape;
  onClose: () => void;
}

const AreaForm: React.FC<AreaFormProps> = ({ area, onClose }) => {
  const [name, setName] = useState(area.name);
  const [isEditing, setIsEditing] = useState(false);
  const { updateArea, deleteArea } = useLayoutStore();
  
  // Text-specific states
  const [textContent, setTextContent] = useState('');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  
  useEffect(() => {
    setName(area.name);
    
    if (area.type === 'text') {
      setTextContent(area.content);
      setTextAlign(area.textAlign || 'left');
    }
  }, [area]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim() === '') return;
    
    // If it's a text area, also update the text content
    if (area.type === 'text') {
      updateArea({
        ...area,
        name,
        content: textContent,
        textAlign
      });
    } else {
      updateArea({
        ...area,
        name
      });
    }
    
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this area?')) {
      deleteArea(area.id);
      onClose();
    }
  };
  
  const renderAreaDetails = () => {
    switch (area.type) {
      case 'rectangle':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Position:</div>
            <div>X: {area.x}, Y: {area.y}</div>
            
            <div className="text-gray-500">Size:</div>
            <div>{area.width} × {area.height}</div>
          </div>
        );
      case 'circle':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Center:</div>
            <div>X: {area.x}, Y: {area.y}</div>
            
            <div className="text-gray-500">Radius:</div>
            <div>{area.radius}</div>
          </div>
        );
      case 'line':
        return (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-500">Start:</div>
            <div>X: {area.x}, Y: {area.y}</div>
            
            <div className="text-gray-500">End:</div>
            <div>X: {area.endX}, Y: {area.endY}</div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Position:</div>
              <div>X: {area.x}, Y: {area.y}</div>
              
              <div className="text-gray-500">Content:</div>
              <div className="font-medium">{area.content}</div>
              
              <div className="text-gray-500">Alignment:</div>
              <div className="capitalize">{area.textAlign || 'left'}</div>
            </div>
            
            <div>
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full text-center px-3 py-1.5 text-sm bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100"
              >
                Edit Text
              </button>
            </div>
          </div>
        );
      case 'polygon':
        return (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500">Origin:</div>
              <div>X: {area.x}, Y: {area.y}</div>
              
              <div className="text-gray-500">Vertices:</div>
              <div>{area.points.length}</div>
            </div>
            
            <details>
              <summary className="cursor-pointer text-green-600 hover:text-green-700">
                View all vertices
              </summary>
              <div className="mt-2 pl-2 border-l-2 border-gray-200 space-y-1">
                {area.points.map((point, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500">Point {index + 1}:</div>
                    <div>X: {point.x}, Y: {point.y}</div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Edit Area' : area.name}
          </h3>
          {!isEditing && area.type !== 'text' && (
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 text-gray-500 hover:text-green-600"
            >
              <Pencil size={16} />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="areaName" className="block text-sm font-medium text-gray-700 mb-1">
              Area Name
            </label>
            <input
              id="areaName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter area name"
              required
            />
          </div>
          
          {area.type === 'text' && (
            <div className="space-y-3">
              <div>
                <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Text Content
                </label>
                <input
                  id="textContent"
                  type="text"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter text content"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Alignment
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setTextAlign('left')}
                    className={`px-3 py-1.5 border ${textAlign === 'left' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 text-gray-700'} rounded-md`}
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('center')}
                    className={`px-3 py-1.5 border ${textAlign === 'center' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 text-gray-700'} rounded-md`}
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('right')}
                    className={`px-3 py-1.5 border ${textAlign === 'right' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 text-gray-700'} rounded-md`}
                  >
                    Right
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Save size={18} className="mr-1" />
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <X size={18} className="mr-1" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ml-auto"
            >
              <Trash2 size={18} className="mr-1" />
              Delete
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {renderAreaDetails()}
        </div>
      )}
    </div>
  );
};

export default AreaForm;