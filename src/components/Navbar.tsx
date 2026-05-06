import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "@/assets/hidn-logo.png";
import { useHidn } from "@/store/hidnStore";
import { authStore, useAuth } from "@/store/authStore";
import { Heart, LogOut, User, LayoutDashboard, Receipt } from "lucide-react";

export const Navbar = () => {
  const state = useHidn();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGov = user?.role === "government" || user?.role === "admin";
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-smooth hover:text-primary ${isActive ? "text-primary" : "text-foreground/70"}`;

  const onLogout = () => { authStore.logout(); navigate("/"); };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/60">
      <nav className="container mx-auto flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="HIDN logo" className="h-9 w-9" width={36} height={36} />
          <span className="font-display text-2xl font-semibold tracking-tight">HIDN</span>
        </Link>
        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/" end className={linkCls}>Beranda</NavLink>
          {!isGov && <NavLink to="/quiz" className={linkCls}>Kuis</NavLink>}
          <NavLink to="/discover" className={linkCls}>Hidden Gems</NavLink>
          {!isGov && user && <NavLink to="/itinerary" className={linkCls}>Itinerary</NavLink>}
          {!isGov && user && <NavLink to="/my-bookings" className={linkCls}>Booking Saya</NavLink>}
          {isGov && <NavLink to="/dashboard" className={linkCls}>Dashboard</NavLink>}
        </div>
        <div className="flex items-center gap-2">
          {user && !isGov && (
            <Link to="/saved" className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-secondary hover:bg-secondary/70 transition-smooth" aria-label="Saved">
              <Heart className="h-4 w-4" />
              {state.savedDestinations.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full h-5 w-5 inline-flex items-center justify-center">
                  {state.savedDestinations.length}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-sm text-foreground/80">
                {isGov ? <LayoutDashboard className="h-4 w-4" /> : <User className="h-4 w-4" />}
                {user.full_name.split(" ")[0]}
                {isGov && <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">{user.role}</span>}
              </span>
              <button onClick={onLogout} className="inline-flex items-center justify-center h-10 px-4 rounded-full border border-border text-sm font-medium hover:bg-secondary transition-smooth">
                <LogOut className="h-4 w-4 sm:mr-1.5" /><span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline-flex items-center justify-center h-10 px-4 rounded-full text-sm font-medium hover:bg-secondary transition-smooth">Masuk</Link>
              <Link to="/register" className="inline-flex items-center justify-center h-10 px-5 rounded-full gradient-hero text-primary-foreground font-medium text-sm shadow-soft hover:shadow-elegant transition-smooth">Daftar</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
