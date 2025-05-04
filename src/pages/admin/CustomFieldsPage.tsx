import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuthStore } from '../../store/authStore';
import { usePlantStore } from '../../store/plantStore';
import { useNavigate, Link } from 'react-router-dom';
import CustomFieldForm from '../../components/custom-fields/CustomFieldForm';
import { CustomField } from '../../types';
import { ChevronLeft, Plus, Edit, Trash2, Tag } from 'lucide-react';

const CustomFieldsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { customFields, fetchCustomFields, deleteCustomField, loading } = usePlantStore();
  const navigate = useNavigate();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    fetchCustomFields();
  }, [fetchCustomFields]);
  
  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setShowCreateForm(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom field? This may affect existing plant data.')) {
      await deleteCustomField(id);
    }
  };
  
  if (!user?.isAdmin) {
    return null;
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-6">
          <Link to="/admin" className="mr-4 text-green-600 hover:text-green-700 focus:outline-none">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Custom Fields</h1>
          <button
            onClick={() => {
              setEditingField(null);
              setShowCreateForm(true);
            }}
            className="ml-auto flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus size={18} className="mr-1" />
            New Field
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
          </div>
        ) : showCreateForm ? (
          <CustomFieldForm
            field={editingField || undefined}
            onClose={() => {
              setShowCreateForm(false);
              setEditingField(null);
            }}
          />
        ) : customFields.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Tag size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Custom Fields</h2>
            <p className="text-gray-600 mb-4">
              Create custom fields to track specific information about your plants.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Plus size={18} className="mr-1" />
              Create Field
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Field Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customFields.map(field => (
                  <tr key={field.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{field.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 capitalize">{field.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      {field.type === 'select' && field.options ? (
                        <div className="text-sm text-gray-500">
                          {field.options.join(', ')}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(field)}
                        className="text-green-600 hover:text-green-900 mx-2 focus:outline-none"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(field.id)}
                        className="text-red-600 hover:text-red-900 mx-2 focus:outline-none"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomFieldsPage;