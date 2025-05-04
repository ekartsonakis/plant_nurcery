import React from 'react';
import { User } from '../../types';
import { Check, X, UserCheck, UserX } from 'lucide-react';

interface UserListProps {
  users: User[];
  onApprove: (userId: string) => Promise<void>;
  onReject: (userId: string) => Promise<void>;
  loading: boolean;
}

const UserList: React.FC<UserListProps> = ({ 
  users, 
  onApprove, 
  onReject, 
  loading 
}) => {
  const pendingUsers = users.filter(user => !user.approved);
  const approvedUsers = users.filter(user => user.approved);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <UserCheck size={20} className="mr-2 text-green-600" />
          Pending Approval ({pendingUsers.length})
        </h2>
        
        {pendingUsers.length === 0 ? (
          <p className="text-gray-500 italic">No pending users</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'User'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onApprove(user.id)}
                        disabled={loading}
                        className="text-green-600 hover:text-green-900 mx-2 focus:outline-none"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => onReject(user.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900 mx-2 focus:outline-none"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <UserX size={20} className="mr-2 text-green-600" />
          Approved Users ({approvedUsers.length})
        </h2>
        
        {approvedUsers.length === 0 ? (
          <p className="text-gray-500 italic">No approved users</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvedUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'User'}
                            {user.isAdmin && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;