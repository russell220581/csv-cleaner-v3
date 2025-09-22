import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

function ProcessingStatus() {
  const [processes, setProcesses] = useState([]);

  useEffect(() => {
    // Simulate fetching processing status
    const mockProcesses = [
      { id: 1, name: 'sales_data.csv', status: 'completed', progress: 100 },
      { id: 2, name: 'customer_list.csv', status: 'processing', progress: 65 },
      { id: 3, name: 'inventory.csv', status: 'queued', progress: 0 },
    ];
    setProcesses(mockProcesses);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="status-completed" />;
      case 'processing':
        return <RefreshCw size={16} className="status-processing spin" />;
      case 'queued':
        return <Clock size={16} className="status-queued" />;
      case 'failed':
        return <AlertCircle size={16} className="status-failed" />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="processing-status">
      <h3>Processing Status</h3>
      <div className="process-list">
        {processes.map((process) => (
          <div key={process.id} className="process-item">
            <div className="process-info">
              <div className="process-icon">
                {getStatusIcon(process.status)}
              </div>
              <div className="process-details">
                <span className="process-name">{process.name}</span>
                <span className={`process-status status-${process.status}`}>
                  {process.status}
                </span>
              </div>
            </div>
            {process.status === 'processing' && (
              <div className="process-progress">
                <div
                  className="progress-bar"
                  style={{ width: `${process.progress}%` }}
                />
                <span>{process.progress}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProcessingStatus;
