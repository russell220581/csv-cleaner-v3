import { useState, useEffect } from 'react';
import FileUpload from '../components/dashboard/FileUpload';
import FileList from '../components/dashboard/FileList';
import ProcessingStatus from '../components/dashboard/ProcessingStatus';
import StatsCard from '../components/dashboard/StatsCard';
import { uploadAPI } from '../services/upload';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { RefreshCw, UploadCloud, FileText, Database } from 'lucide-react';
import '../styles/components/dashboard.css';

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    processedFiles: 0,
    storageUsed: 0,
    processingQueue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadFiles(), loadStats()]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFiles = async () => {
    try {
      const response = await uploadAPI.getFiles();
      setFiles(response.files || []);
    } catch (error) {
      throw error;
    }
  };

  const loadStats = async () => {
    try {
      const response = await uploadAPI.getFileStats();
      setStats(
        response.stats || {
          totalFiles: 0,
          processedFiles: 0,
          storageUsed: 0,
          processingQueue: 0,
        }
      );
    } catch (error) {
      throw error;
    }
  };

  const handleFileUpload = async (formData, onProgress) => {
    try {
      const response = await uploadAPI.uploadFile(formData, onProgress);
      setFiles((prev) => [response.file, ...prev]);
      await loadStats(); // Refresh stats after upload
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      throw error;
    }
  };

  const handleFileDelete = async (fileId) => {
    try {
      await uploadAPI.deleteFile(fileId);
      setFiles((prev) => prev.filter((file) => file._id !== fileId));
      await loadStats(); // Refresh stats after delete
      toast.success('File deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete file');
      throw error;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
      toast.success('Dashboard refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your CSV files and processing tasks</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="refresh-btn"
          title="Refresh dashboard"
        >
          <RefreshCw size={20} className={refreshing ? 'spinning' : ''} />
        </button>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total Files"
          value={stats.totalFiles}
          icon={<FileText size={24} />}
          subtitle="All uploaded files"
        />
        <StatsCard
          title="Processed"
          value={stats.processedFiles}
          icon={<Database size={24} />}
          subtitle="Successfully processed"
        />
        <StatsCard
          title="Storage Used"
          value={`${stats.storageUsed.toFixed(2)} MB`}
          icon={<Database size={24} />}
          subtitle="Total storage usage"
        />
        <StatsCard
          title="In Queue"
          value={stats.processingQueue}
          icon={<UploadCloud size={24} />}
          subtitle="Files waiting to process"
        />
      </div>

      <div className="dashboard-content">
        <div className="upload-section">
          <div className="section-header">
            <h2>Upload New File</h2>
            <p>Process your CSV files with our advanced tools</p>
          </div>
          <FileUpload onUpload={handleFileUpload} />
        </div>

        <div className="files-section">
          <div className="section-header">
            <h2>Your Files ({files.length})</h2>
            <p>Manage your uploaded and processed files</p>
          </div>
          <FileList
            files={files}
            onDelete={handleFileDelete}
            onRefresh={loadFiles}
          />
        </div>

        <div className="processing-section">
          <div className="section-header">
            <h2>Processing Status</h2>
            <p>Real-time updates on file processing</p>
          </div>
          <ProcessingStatus />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
