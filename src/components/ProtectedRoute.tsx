import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/authStore";
import type { UserRole } from "@/lib/api";

export const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat…</div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
        <h1 className="font-display text-3xl">Akses ditolak</h1>
        <p className="text-muted-foreground">Halaman ini hanya untuk role: {roles.join(", ")}.</p>
        <a href="/" className="text-primary underline">Kembali ke beranda</a>
      </div>
    );
  }
  return <>{children}</>;
};
