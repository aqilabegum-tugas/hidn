import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { authStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { Building2, User } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"traveler" | "government">("traveler");
  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authStore.register({ email, fullName, password, role, organization, phone });
      toast({ title: "Pendaftaran berhasil", description: role === "government" ? "Kamu bisa mulai menambahkan destinasi di Dashboard." : "Selamat bergabung di HIDN!" });
      navigate(role === "government" ? "/dashboard" : "/", { replace: true });
    } catch (err: any) {
      toast({ title: "Pendaftaran gagal", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-16 md:py-24">
        <div className="max-w-md mx-auto bg-card rounded-3xl shadow-soft border border-border/50 p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-3">Daftar</p>
          <h1 className="font-display text-3xl md:text-4xl font-medium mb-2">Buat akun HIDN</h1>
          <p className="text-muted-foreground text-sm mb-6">Pilih jenis akun sesuai kebutuhanmu.</p>

          {/* Role tab */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button type="button" onClick={() => setRole("traveler")}
              className={`h-11 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-smooth ${role === "traveler" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              <User className="h-4 w-4" /> Traveler
            </button>
            <button type="button" onClick={() => setRole("government")}
              className={`h-11 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-smooth ${role === "government" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
              <Building2 className="h-4 w-4" /> Government / Mitra
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{role === "government" ? "Nama PIC / Penanggung Jawab" : "Nama lengkap"}</label>
              <input type="text" required minLength={2} value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            {role === "government" && (
              <div>
                <label className="text-sm font-medium block mb-1.5">Nama Instansi / Dinas</label>
                <input type="text" required minLength={3} value={organization} onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Contoh: Dinas Pariwisata Provinsi NTT"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium block mb-1.5">No. Telepon {role === "traveler" && <span className="text-muted-foreground font-normal">(opsional)</span>}</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+62…"
                className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Password (min. 6 karakter)</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-12 rounded-full gradient-hero text-primary-foreground font-semibold shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-60">
              {loading ? "Memproses…" : role === "government" ? "Daftar sebagai Mitra Government" : "Daftar sebagai Traveler"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
