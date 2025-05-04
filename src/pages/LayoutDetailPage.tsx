import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useLayoutStore } from '../store/layoutStore';
import { usePlantStore } from '../store/plantStore';
import { AreaShape, PlantInfo, Reminder } from '../types';
import LayoutCanvas from '../components/layout-editor/LayoutCanvas';
import AreaForm from '../components/layout-editor/AreaForm';
import PlantInfoForm from '../components/plant-info/PlantInfoForm';
import PlantInfoCard from '../components/plant-info/PlantInfoCard';
import ReminderForm from '../components/reminders/ReminderForm';
import ReminderCard from '../components/reminders/ReminderCard';
import { ChevronLeft, Sprout, BellRing, Plus, Square, Circle, Type, Minus, AlertTriangle } from 'lucide-react';

const LayoutDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { 
    layouts, 
    currentLayout, 
    selectedArea, 
    fetchLayouts, 
    setCurrentLayout,
    selectArea, 
    loading: layoutLoading,
    error: layoutError 
  } = useLayoutStore();
  
  const {
    plantInfo,
    reminders,
    customFields,
    fetchPlantInfoByArea,
    fetchRemindersByArea,
    fetchCustomFields,
    loading: dataLoading
  } = usePlantStore();
  
  const [showPlantForm, setShowPlantForm] = useState(false);
  const [editingPlant, setEditingPlant] = useState<PlantInfo | null>(null);
  
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  
  useEffect(() => {
    fetchLayouts();
    fetchCustomFields();
  }, [fetchLayouts, fetchCustomFields]);
  
  useEffect(() => {
    if (layouts.length > 0 && id) {
      const layout = layouts.find(l => l.id === id);
      if (layout) {
        setCurrentLayout(layout);
      } else {
        navigate('/layouts');
      }
    }
  }, [layouts, id, setCurrentLayout, navigate]);
  
  useEffect(() => {
    if (selectedArea) {
      fetchPlantInfoByArea(selectedArea.id);
      fetchRemindersByArea(selectedArea.id);
    }
  }, [selectedArea, fetchPlantInfoByArea, fetchRemindersByArea]);
  
  const handleAreaSelected = (area: AreaShape) => {
    selectArea(area);
  };
  
  const handleEditPlant = (plant: PlantInfo) => {
    setEditingPlant(plant);
    setShowPlantForm(true);
  };
  
  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowReminderForm(true);
  };
  
  const getShapeIcon = (type: string) => {
    switch (type) {
      case 'rectangle':
        return <Square size={16} className="text-gray-600" />;
      case 'circle':
        return <Circle size={16} className="text-gray-600" />;
      case 'line':
        return <Minus size={16} className="text-gray-600" />;
      case 'text':
        return <Type size={16} className="text-gray-600" />;
      default:
        return null;
    }
  };
  
  const loading = layoutLoading || dataLoading;
  
  if (loading && !currentLayout) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
        </div>
      </Layout>
    );
  }
  
  if (layoutError) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-300 rounded-lg p-8 text-red-700">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="mr-3" />
              <h2 className="text-xl font-semibold">Error Loading Layout</h2>
            </div>
            <p className="mb-4">{layoutError}</p>
            <button
              onClick={() => navigate('/layouts')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <ChevronLeft size={18} className="inline mr-1" />
              Back to Layouts
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!currentLayout) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-gray-600">Layout not found.</p>
            <button
              onClick={() => navigate('/layouts')}
              className="mt-4 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <ChevronLeft size={18} className="mr-1" />
              Back to Layouts
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Ensure areas is an array
  const layoutAreas = Array.isArray(currentLayout.areas) ? currentLayout.areas : [];
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/layouts')}
            className="mr-4 text-green-600 hover:text-green-700 focus:outline-none"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{currentLayout.name}</h1>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Layout Map</h2>
              <p className="text-sm text-gray-500 mb-4">
                Click on an area to select it and view its details. Draw new areas by clicking and dragging on the canvas.
              </p>
              {currentLayout && (
                <LayoutCanvas 
                  layout={currentLayout} 
                  onAreaSelected={handleAreaSelected}
                  selectedArea={selectedArea}
                />
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Areas</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {layoutAreas.map((area) => (
                      <tr 
                        key={area.id}
                        onClick={() => selectArea(area)}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedArea?.id === area.id ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getShapeIcon(area.type)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">{area.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{area.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            x: {area.x}, y: {area.y}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {layoutAreas.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                          No areas created yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div>
            {selectedArea ? (
              <div>
                <AreaForm area={selectedArea} onClose={() => selectArea(null)} />
                
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <Sprout size={18} className="mr-2" />
                      Plant Information
                    </h2>
                    <button
                      onClick={() => {
                        setEditingPlant(null);
                        setShowPlantForm(true);
                      }}
                      className="text-green-600 hover:text-green-700 focus:outline-none"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  {showPlantForm ? (
                    <PlantInfoForm
                      areaId={selectedArea.id}
                      plantInfo={editingPlant || undefined}
                      onClose={() => {
                        setShowPlantForm(false);
                        setEditingPlant(null);
                      }}
                    />
                  ) : plantInfo.length === 0 ? (
                    <p className="text-gray-500 italic">No plant information added yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {plantInfo.map(plant => (
                        <PlantInfoCard
                          key={plant.id}
                          plantInfo={plant}
                          customFields={customFields}
                          onEdit={handleEditPlant}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold flex items-center">
                      <BellRing size={18} className="mr-2" />
                      Reminders
                    </h2>
                    <button
                      onClick={() => {
                        setEditingReminder(null);
                        setShowReminderForm(true);
                      }}
                      className="text-green-600 hover:text-green-700 focus:outline-none"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  {showReminderForm ? (
                    <ReminderForm
                      areaId={selectedArea.id}
                      reminder={editingReminder || undefined}
                      onClose={() => {
                        setShowReminderForm(false);
                        setEditingReminder(null);
                      }}
                    />
                  ) : reminders.length === 0 ? (
                    <p className="text-gray-500 italic">No reminders set for this area.</p>
                  ) : (
                    <div className="space-y-4">
                      {reminders.map(reminder => (
                        <ReminderCard
                          key={reminder.id}
                          reminder={reminder}
                          onEdit={handleEditReminder}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 mb-4">
                  Select an area on the layout or create a new one by clicking and dragging on the canvas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LayoutDetailPage;