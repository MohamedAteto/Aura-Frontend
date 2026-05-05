import { Redirect } from 'wouter';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: Props) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (adminOnly && !isAdmin) return <Redirect to="/" />;

  return <>{children}</>;
}
