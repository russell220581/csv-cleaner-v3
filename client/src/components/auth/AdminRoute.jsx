import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated && isAdmin ? children : null;
}

export default AdminRoute;
