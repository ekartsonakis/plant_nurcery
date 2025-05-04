import React from 'react';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/authStore';
import { useLayoutStore } from '../store/layoutStore';
import { Link } from 'react-router-dom';
import { MapPin, User, Plus, Leaf, Bell } from 'lucide-react';

const Home: React.FC = () => {
  const { user, loading } = useAuthStore();
  const { layouts } = useLayoutStore();
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to NurseryMap</h1>
            <p className="text-lg text-gray-600 mb-8">
              Manage your nursery layout, plants, and get reminders for care tasks.
            </p>
            
            <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto">
              <div className="bg-green-700 p-6 text-white">
                <h2 className="text-2xl font-semibold">Get Started</h2>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Please log in or sign up to start managing your nursery.
                </p>
                
                <div className="flex space-x-4 justify-center">
                  <Link 
                    to="/login" 
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 flex items-center"
                  >
                    <User size={18} className="mr-2" />
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="px-6 py-3 border border-green-600 text-green-600 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 flex items-center"
                  >
                    <Plus size={18} className="mr-2" />
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!user.approved) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Your account is pending approval from an administrator. Please check back later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to NurseryMap</h1>
          <p className="text-lg text-gray-600">
            Manage your nursery layout, track plants, and get reminders for care tasks.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Link to="/layouts" className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group">
            <div className="p-6 flex items-start">
              <div className="h-12 w-12 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                <MapPin className="h-6 w-6 text-green-700" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Layouts</h2>
                <p className="text-gray-600 mb-2">
                  Create and manage your nursery layouts. Divide your space into areas and track plants in each section.
                </p>
                <p className="text-sm font-medium text-green-600 group-hover:text-green-700">
                  {layouts.length === 0
                    ? 'Create your first layout →'
                    : `Manage ${layouts.length} layout${layouts.length === 1 ? '' : 's'} →`}
                </p>
              </div>
            </div>
          </Link>
          
          <Link to="/admin/fields" className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden group">
            <div className="p-6 flex items-start">
              <div className="h-12 w-12 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                <Leaf className="h-6 w-6 text-green-700" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Custom Fields</h2>
                <p className="text-gray-600 mb-2">
                  Create custom fields to track specific information about your plants, tailored to your nursery's needs.
                </p>
                <p className="text-sm font-medium text-green-600 group-hover:text-green-700">
                  Manage custom fields →
                </p>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-green-700 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Upcoming Reminders</h2>
          </div>
          
          <p className="text-gray-600">
            Select a layout and area to view and manage your reminders.
          </p>
          
          <div className="mt-4">
            <Link
              to="/layouts"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              View Layouts
            </Link>
          </div>
        </div>
        
        {user.isAdmin && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-green-700 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Admin Tools</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              As an administrator, you can manage users and system settings.
            </p>
            
            <Link
              to="/admin"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Admin Dashboard
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;