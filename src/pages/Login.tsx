import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { authStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state: { from?: string } | null };
  const from = location.state?.from || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authStore.login(email, password);
      toast({ title: "Berhasil masuk", description: "Selamat datang kembali!" });
      navigate(from, { replace: true });
    } catch (err: any) {
      toast({ title: "Login gagal", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-16 md:py-24">
        <div className="max-w-md mx-auto bg-card rounded-3xl shadow-soft border border-border/50 p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-3">Masuk</p>
          <h1 className="font-display text-3xl md:text-4xl font-medium mb-2">Selamat datang kembali</h1>
          <p className="text-muted-foreground text-sm mb-8">Login untuk lanjut menjelajahi hidden gems Indonesia.</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-full gradient-hero text-primary-foreground font-semibold shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-60">
              {loading ? "Memproses…" : "Masuk"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Daftar di sini</Link>
          </p>
          <div className="mt-6 p-4 rounded-xl bg-muted text-xs text-muted-foreground">
            <strong className="text-foreground">Akun demo:</strong><br />
            Email: <code>demo@hidn.id</code><br />
            Password: <code>demo1234</code>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
