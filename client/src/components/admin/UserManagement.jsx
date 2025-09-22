import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/users';
import UserItem from './UserItem';
import toast from 'react-hot-toast';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      setUsers(response.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = async (userId, updates) => {
    try {
      await usersAPI.updateUser(userId, updates);
      toast.success('User updated successfully');
      loadUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="admin-header">
        <h2>User Management</h2>
        <p>Manage all users in the system</p>
      </div>

      <div className="users-list">
        <div className="users-header">
          <span>Total Users: {users.length}</span>
        </div>

        {users.map((user) => (
          <UserItem
            key={user._id}
            user={user}
            onUpdate={handleUserUpdate}
            onDelete={handleUserDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default UserManagement;
