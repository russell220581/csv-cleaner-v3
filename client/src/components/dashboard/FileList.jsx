import { RefreshCw } from 'lucide-react';
import FileItem from './FileItem';

function FileList({ files, onDelete, onRefresh }) {
  if (files.length === 0) {
    return (
      <div className="empty-state">
        <h3>No files yet</h3>
        <p>Upload your first CSV file to get started</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      <div className="file-list-header">
        <h3>Your Files ({files.length})</h3>
        <button onClick={onRefresh} className="btn btn-secondary btn-sm">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="files-grid">
        {files.map((file) => (
          <FileItem key={file._id} file={file} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

export default FileList;
