import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User } from '../../types';
import UserList from '../../components/admin/UserList';
import { Users, LayoutGrid, Settings, FileText } from 'lucide-react';

const AdminHomePage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      setUsers(data.map(profile => ({
        id: profile.id,
        email: profile.email,
        isAdmin: profile.is_admin,
        approved: profile.approved,
        name: profile.name
      })));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveUser = async (userId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ approved: true })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, approved: true } : user
      ));
    } catch (err) {
      console.error('Error approving user:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectUser = async (userId: string) => {
    try {
      setLoading(true);
      
      // Delete the user from auth and profiles
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error rejecting user:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user?.isAdmin) {
    return null;
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-green-100 p-3 mr-3">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <h2 className="text-lg font-semibold">User Management</h2>
            </div>
            <p className="text-gray-600">
              Approve new users and manage existing accounts
            </p>
          </Link>
          
          <Link to="/admin/fields" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-green-100 p-3 mr-3">
                <FileText className="h-6 w-6 text-green-700" />
              </div>
              <h2 className="text-lg font-semibold">Custom Fields</h2>
            </div>
            <p className="text-gray-600">
              Create and manage custom fields for plant data
            </p>
          </Link>
          
          <Link to="/layouts" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-green-100 p-3 mr-3">
                <LayoutGrid className="h-6 w-6 text-green-700" />
              </div>
              <h2 className="text-lg font-semibold">Layouts</h2>
            </div>
            <p className="text-gray-600">
              View and manage all nursery layouts
            </p>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Settings className="h-5 w-5 text-green-700 mr-2" />
            <h2 className="text-xl font-semibold">User Management</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
            </div>
          ) : (
            <UserList 
              users={users}
              onApprove={handleApproveUser}
              onReject={handleRejectUser}
              loading={loading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminHomePage;