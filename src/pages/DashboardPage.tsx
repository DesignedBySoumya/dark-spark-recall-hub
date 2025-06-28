
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

export default DashboardPage;
