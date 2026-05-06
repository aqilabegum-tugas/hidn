import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { destinations } from "@/data/hidn";
import { bookingsApi } from "@/lib/api";
import { useAuth } from "@/store/authStore";
import { toast } from "sonner";
import { ArrowLeft, CalendarIcon, MapPin, Users, Clock, CheckCircle2 } from "lucide-react";

const Booking = () => {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const d = destinations.find((x) => x.slug === slug);

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [visitDate, setVisitDate] = useState("");
  const [numPeople, setNumPeople] = useState(2);
  const [numDays, setNumDays] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<any>(null);

  useEffect(() => {
    const t = new Date(); t.setDate(t.getDate() + 7);
    setVisitDate(t.toISOString().slice(0, 10));
  }, []);

  if (!d) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto py-32 text-center">
        <h1 className="font-display text-4xl">Destinasi tidak ditemukan</h1>
        <Link to="/discover" className="text-primary underline mt-6 inline-block">Kembali ke discovery</Link>
      </div>
      <Footer />
    </div>
  );

  const total = d.estCost * numPeople * numDays;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // backend butuh destination UUID — fetch dari API endpoint detail
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/destinations/${d.slug}`);
      const dest = await res.json();
      const booking = await bookingsApi.create({
        destinationId: dest.id, fullName, email, phone, visitDate, numPeople, numDays, notes,
      });
      setDone(booking);
      toast.success("Booking berhasil dibuat!");
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat booking");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-16 md:py-24 max-w-2xl">
        <div className="bg-card rounded-3xl shadow-soft border border-border/50 p-10 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 inline-flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-medium mb-2">Booking berhasil dibuat</h1>
          <p className="text-muted-foreground mb-8">Tim {d.name} akan menghubungi kamu dalam 1×24 jam untuk konfirmasi.</p>

          <dl className="text-left space-y-3 bg-muted/40 rounded-2xl p-6 mb-8">
            <div className="flex justify-between"><dt className="text-muted-foreground">Kode Booking</dt><dd className="font-mono font-semibold">{done.code}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Destinasi</dt><dd className="font-medium">{d.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tanggal</dt><dd>{new Date(visitDate).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Peserta × Hari</dt><dd>{numPeople} orang × {numDays} hari</dd></div>
            <div className="flex justify-between border-t border-border pt-3"><dt className="font-medium">Total</dt><dd className="font-display text-xl font-semibold">Rp {Number(done.total_price).toLocaleString("id-ID")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium">Menunggu konfirmasi</span></dd></div>
          </dl>

          <div className="flex gap-3 justify-center">
            <Link to="/my-bookings" className="h-11 px-6 rounded-full bg-primary text-primary-foreground font-medium inline-flex items-center">Lihat Booking Saya</Link>
            <Link to="/discover" className="h-11 px-6 rounded-full border border-border font-medium inline-flex items-center">Jelajahi lagi</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-12 md:py-16 max-w-5xl">
        <Link to={`/destination/${d.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Kembali ke detail
        </Link>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Form */}
          <div className="bg-card rounded-3xl shadow-soft border border-border/50 p-6 md:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold mb-3">Booking</p>
            <h1 className="font-display text-3xl md:text-4xl font-medium mb-2">Pesan kunjungan ke {d.name}</h1>
            <p className="text-muted-foreground text-sm mb-8">Isi data di bawah. Tim pengelola destinasi akan menghubungi kamu untuk konfirmasi.</p>

            <form onSubmit={submit} className="space-y-5">
              <h2 className="font-display text-xl font-medium pt-2">Data Pemesan</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Nama lengkap</label>
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">No. WhatsApp</label>
                  <input required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62…"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>

              <h2 className="font-display text-xl font-medium pt-4">Detail Kunjungan</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Tanggal kunjungan</label>
                  <input type="date" required value={visitDate} min={new Date().toISOString().slice(0,10)}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Jumlah orang</label>
                  <input type="number" min={1} max={50} required value={numPeople}
                    onChange={(e) => setNumPeople(+e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Lama (hari)</label>
                  <input type="number" min={1} max={30} required value={numDays}
                    onChange={(e) => setNumDays(+e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Catatan / Permintaan khusus</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: vegetarian, butuh penjemputan dari bandara, dsb."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full h-13 py-4 rounded-full gradient-hero text-primary-foreground font-semibold shadow-soft hover:shadow-elegant transition-smooth disabled:opacity-60">
                {loading ? "Memproses…" : `Konfirmasi Pesan — Rp ${total.toLocaleString("id-ID")}`}
              </button>
              <p className="text-xs text-muted-foreground text-center">Pembayaran dilakukan langsung ke pengelola destinasi setelah konfirmasi.</p>
            </form>
          </div>

          {/* Summary */}
          <aside className="space-y-4">
            <div className="bg-card rounded-2xl overflow-hidden shadow-soft border border-border/40 sticky top-24">
              <img src={d.image} alt={d.name} className="w-full aspect-[4/3] object-cover" />
              <div className="p-5">
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{d.region}, {d.province}</p>
                <h3 className="font-display text-xl font-semibold mt-1 mb-3">{d.name}</h3>

                <dl className="space-y-2.5 text-sm border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Durasi ideal</dt>
                    <dd>{d.duration}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground inline-flex items-center gap-1.5"><CalendarIcon className="h-3.5 w-3.5" />Best months</dt>
                    <dd>{d.bestMonths}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Estimasi/orang/hari</dt>
                    <dd>Rp {d.estCost.toLocaleString("id-ID")}</dd>
                  </div>
                </dl>

                <div className="mt-5 pt-5 border-t border-border space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({numPeople}×{numDays})</span><span>Rp {total.toLocaleString("id-ID")}</span></div>
                  <div className="flex justify-between font-display text-lg font-semibold pt-2 border-t border-border"><span>Total</span><span>Rp {total.toLocaleString("id-ID")}</span></div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
