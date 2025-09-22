import { useState } from 'react';
import UserManagement from '../components/admin/UserManagement';
import SystemStats from '../components/admin/SystemStats';
import { Users, BarChart3 } from 'lucide-react';

function Admin() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your application and users</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          User Management
        </button>
        <button
          className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <BarChart3 size={18} />
          System Stats
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'stats' && <SystemStats />}
      </div>
    </div>
  );
}

export default Admin;
