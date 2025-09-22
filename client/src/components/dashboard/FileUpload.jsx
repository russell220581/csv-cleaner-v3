import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { validateFile } from '../../utils/validators';
import '../../styles/components/dashboard.css';

function FileUpload({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error('File is too large. Maximum size is 100MB.');
      } else if (error.code === 'file-invalid-type') {
        toast.error('Please upload a CSV or Excel file.');
      } else {
        toast.error('Invalid file. Please try again.');
      }
      return;
    }

    const file = acceptedFiles[0];
    const validationError = validateFile(file);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: false,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await onUpload(formData, (uploadProgress) => {
        setProgress(uploadProgress);
      });
      setSelectedFile(null);
      setProgress(0);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setProgress(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-upload">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${
          selectedFile ? 'has-file' : ''
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={48} className="dropzone-icon" />
        <p className="dropzone-text">
          {isDragActive
            ? 'Drop the file here...'
            : selectedFile
            ? 'File selected. Click to change'
            : 'Drag & drop a CSV file here, or click to select'}
        </p>
        <p className="dropzone-subtext">
          Supports .csv, .xls, .xlsx files (max 100MB)
        </p>
      </div>

      {selectedFile && (
        <div className="selected-file">
          <div className="file-info">
            <FileText size={20} />
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
          </div>
          <button
            onClick={removeFile}
            disabled={uploading}
            className="remove-file-btn"
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {progress > 0 && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="upload-button"
        >
          {uploading ? (
            <>
              <div className="spinner"></div>
              Uploading... ({progress}%)
            </>
          ) : (
            'Process File'
          )}
        </button>
      )}

      {!selectedFile && (
        <div className="upload-tips">
          <div className="tip">
            <AlertCircle size={16} />
            <span>Make sure your CSV file has headers in the first row</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
