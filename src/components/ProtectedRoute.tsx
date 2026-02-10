import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userAPI } from "@/lib/api";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRole?: "parent" | "practitioner" | "admin";
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const profile = await userAPI.getProfile();
                setUser(profile);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Admins can see everything
        if (user.role === 'admin') return <>{children}</>;

        // Practitioners can see parent dashboards? Probably not, but let's be strict for now.
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
