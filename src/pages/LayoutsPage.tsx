import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { useLayoutStore } from '../store/layoutStore';
import { NurseryLayout } from '../types';
import LayoutForm from '../components/layout-editor/LayoutForm';
import { Plus, MapPin, Calendar, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const LayoutsPage: React.FC = () => {
  const { layouts, fetchLayouts, deleteLayout, loading } = useLayoutStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLayout, setEditingLayout] = useState<NurseryLayout | null>(null);
  
  useEffect(() => {
    fetchLayouts();
  }, [fetchLayouts]);
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this layout? This action cannot be undone.')) {
      await deleteLayout(id);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nursery Layouts</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus size={18} className="mr-1" />
            New Layout
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
          </div>
        ) : showCreateForm || editingLayout ? (
          <LayoutForm
            initialLayout={editingLayout || undefined}
            onSubmit={() => {
              setShowCreateForm(false);
              setEditingLayout(null);
            }}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingLayout(null);
            }}
          />
        ) : layouts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Layouts Yet</h2>
            <p className="text-gray-600 mb-4">
              Create your first nursery layout to start organizing your plants.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Plus size={18} className="mr-1" />
              Create Layout
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {layouts.map(layout => (
              <div key={layout.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-700 p-4 text-white flex justify-between items-center">
                  <h3 className="font-semibold">{layout.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingLayout(layout)}
                      className="text-white hover:text-green-200 focus:outline-none"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(layout.id)}
                      className="text-white hover:text-red-200 focus:outline-none"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin size={16} className="mr-1" />
                    <span>
                      {layout.areas.length} {layout.areas.length === 1 ? 'area' : 'areas'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar size={16} className="mr-1" />
                    <span>
                      Last modified: {format(new Date(layout.lastModified), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <Link
                    to={`/layouts/${layout.id}`}
                    className="inline-block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    View & Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LayoutsPage;