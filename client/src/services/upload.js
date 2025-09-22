import api from './api';

export const uploadAPI = {
  uploadFile: async (formData, onProgress) => {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
      timeout: 120000, // 2 minutes for large files
    });
    return response.data;
  },

  getFiles: async (page = 1, limit = 10) => {
    const response = await api.get('/upload/files', {
      params: { page, limit },
    });
    return response.data;
  },

  getFile: async (fileId) => {
    const response = await api.get(`/upload/files/${fileId}`);
    return response.data;
  },

  processFile: async (fileId, options) => {
    const response = await api.post(`/upload/process/${fileId}`, options);
    return response.data;
  },

  getProcessingStatus: async (fileId) => {
    const response = await api.get(`/upload/status/${fileId}`);
    return response.data;
  },

  downloadFile: async (fileId) => {
    const response = await api.get(`/upload/download/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/upload/${fileId}`);
    return response.data;
  },

  getFileStats: async () => {
    const response = await api.get('/upload/stats');
    return response.data;
  },
};
