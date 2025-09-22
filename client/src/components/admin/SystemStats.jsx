import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/users';
import StatsCard from '../dashboard/StatsCard';

function SystemStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalFiles: 0,
    storageUsed: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await usersAPI.getSystemStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load system stats');
    }
  };

  return (
    <div className="system-stats">
      <div className="admin-header">
        <h2>System Statistics</h2>
        <p>Overview of the system usage and performance</p>
      </div>

      <div className="stats-grid">
        <StatsCard title="Total Users" value={stats.totalUsers} icon="👥" />
        <StatsCard title="Active Users" value={stats.activeUsers} icon="✅" />
        <StatsCard title="Total Files" value={stats.totalFiles} icon="📊" />
        <StatsCard
          title="Storage Used"
          value={`${stats.storageUsed} MB`}
          icon="💾"
        />
      </div>

      <div className="charts-section">
        <h3>Usage Analytics</h3>
        <div className="chart-placeholder">
          <p>Charts and graphs would be displayed here</p>
          <span>Integration with charts library required</span>
        </div>
      </div>
    </div>
  );
}

export default SystemStats;
