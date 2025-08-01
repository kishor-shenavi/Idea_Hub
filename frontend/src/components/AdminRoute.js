// components/AdminRoute.js
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { user } = useAuth();
  
  // Check if user is authenticated and is an admin
  return user?.isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;