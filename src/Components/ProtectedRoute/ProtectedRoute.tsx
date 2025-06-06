import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';


interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const {checkLoggedInUser} = useAuth();
    const location = useLocation();
    const isLoggedIn = checkLoggedInUser();
   
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}; 