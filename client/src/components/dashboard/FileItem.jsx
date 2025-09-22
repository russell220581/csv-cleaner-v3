import { useState } from 'react';
import {
  Download,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { uploadAPI } from '../../services/upload';
import toast from 'react-hot-toast';

function FileItem({ file, onDelete }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const blob = await uploadAPI.downloadFile(file._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName || `processed-${file._id}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (error) {
      toast.error('Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    setLoading(true);
    try {
      await onDelete(file._id);
    } catch (error) {
      toast.error('Failed to delete file');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case 'processing':
        return <Clock size={16} className="status-processing" />;
      case 'completed':
        return <CheckCircle size={16} className="status-completed" />;
      case 'failed':
        return <AlertCircle size={16} className="status-failed" />;
      default:
        return <Clock size={16} className="status-processing" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-item">
      <div className="file-info">
        <div className="file-icon">{getStatusIcon()}</div>
        <div className="file-details">
          <h4 className="file-name">{file.originalName}</h4>
          <p className="file-meta">
            {formatFileSize(file.size)} •{' '}
            {new Date(file.uploadedAt).toLocaleDateString()}
          </p>
          <span className={`status-badge status-${file.status}`}>
            {file.status}
          </span>
        </div>
      </div>

      <div className="file-actions">
        {file.status === 'completed' && (
          <button
            onClick={handleDownload}
            disabled={loading}
            className="btn btn-secondary btn-sm"
            title="Download file"
          >
            <Download size={16} />
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={loading}
          className="btn btn-danger btn-sm"
          title="Delete file"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default FileItem;
