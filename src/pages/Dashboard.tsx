import { FormEvent, useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { govApi } from "@/lib/api";
import { useAuth } from "@/store/authStore";
import { toast } from "sonner";
import { Building2, MapPin, Plus, Trash2, Users, BarChart3, Wallet, Calendar, Pencil, X } from "lucide-react";

const categories = ["Pantai", "Gunung", "Budaya", "Air Terjun", "Danau", "Desa", "Kuliner"];
const personalities = ["explorer", "relaxer", "culture", "adventurer", "foodie"];

const emptyForm = {
  id: "" as string | undefined,
  name: "", region: "", province: "", category: "Pantai",
  hidden_score: 5, sentiment_score: 80, est_cost: 300000,
  duration: "1-2 hari", best_months: "Sepanjang tahun",
  description: "", highlights: "", matches: [] as string[],
  image_url: "/images/dest/dest-village.jpg", capacity_per_day: 50,
};

const Dashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"overview"|"destinations"|"bookings">("overview");
  const [stats, setStats] = useState<any>({});
  const [dests, setDests] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      const [s, d, b] = await Promise.all([govApi.stats(), govApi.destinations(), govApi.bookings()]);
      setStats(s); setDests(d); setBookings(b);
    } catch (e: any) { toast.error(e.message); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        highlights: form.highlights.split("\n").map(s => s.trim()).filter(Boolean),
      };
      if (form.id) await govApi.updateDestination(form.id, payload);
      else await govApi.createDestination(payload);
      toast.success(form.id ? "Destinasi diperbarui" : "Destinasi ditambahkan");
      setShowForm(false); setForm(emptyForm); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const edit = (d: any) => {
    setForm({
      id: d.id, name: d.name, region: d.region, province: d.province,
      category: d.category, hidden_score: d.hidden_score, sentiment_score: d.sentiment_score,
      est_cost: d.est_cost, duration: d.duration, best_months: d.best_months,
      description: d.description, highlights: (d.highlights || []).join("\n"),
      matches: d.matches || [], image_url: d.image_url, capacity_per_day: d.capacity_per_day || 50,
    });
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus destinasi ini?")) return;
    try { await govApi.deleteDestination(id); toast.success("Dihapus"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const setStatus = async (id: string, status: any) => {
    try { await govApi.setBookingStatus(id, status); toast.success("Status diperbarui"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const toggleMatch = (p: string) =>
    setForm({ ...form, matches: form.matches.includes(p) ? form.matches.filter(x => x !== p) : [...form.matches, p] });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-12 md:py-16">
        <div className="flex items-center gap-3 mb-2">
          <Building2 className="h-5 w-5 text-primary" />
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Government Dashboard</p>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-medium">Halo, {user?.organization || user?.full_name}</h1>
        <p className="text-muted-foreground mt-2">Kelola destinasi & booking yang masuk ke wilayahmu.</p>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {[
            { icon: MapPin, label: "Destinasi", value: stats.total_destinations || 0 },
            { icon: Calendar, label: "Total Booking", value: stats.total_bookings || 0 },
            { icon: Users, label: "Pending", value: stats.pending_bookings || 0 },
            { icon: Wallet, label: "Pendapatan (terkonfirmasi)", value: `Rp ${Number(stats.revenue || 0).toLocaleString("id-ID")}` },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-6 border border-border/50 shadow-soft">
              <div className="h-10 w-10 rounded-xl gradient-hero text-primary-foreground inline-flex items-center justify-center mb-3">
                <s.icon className="h-4 w-4" />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="font-display text-2xl font-medium mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-10 flex gap-2 border-b border-border">
          {[
            { k: "overview", l: "Overview", i: BarChart3 },
            { k: "destinations", l: "Destinasi", i: MapPin },
            { k: "bookings", l: "Booking Masuk", i: Calendar },
          ].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k as any)}
              className={`px-5 h-11 inline-flex items-center gap-2 text-sm font-medium border-b-2 transition-smooth -mb-px
                ${tab === t.k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <t.i className="h-4 w-4" /> {t.l}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="mt-8 grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <h3 className="font-display text-xl font-medium mb-4">Booking terbaru</h3>
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{b.full_name} · <span className="text-muted-foreground">{b.destination_name}</span></p>
                    <p className="text-xs text-muted-foreground">{new Date(b.visit_date).toLocaleDateString("id-ID")} · {b.num_people} orang</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary">{b.status}</span>
                </div>
              ))}
              {bookings.length === 0 && <p className="text-sm text-muted-foreground">Belum ada booking masuk.</p>}
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border/50">
              <h3 className="font-display text-xl font-medium mb-4">Destinasimu</h3>
              {dests.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                  <img src={d.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.region} · {d.category}</p>
                  </div>
                </div>
              ))}
              {dests.length === 0 && <p className="text-sm text-muted-foreground">Belum ada destinasi.</p>}
            </div>
          </div>
        )}

        {/* DESTINATIONS */}
        {tab === "destinations" && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-medium">Destinasi yang saya kelola</h2>
              <button onClick={() => { setForm(emptyForm); setShowForm(true); }}
                className="h-11 px-5 rounded-full gradient-hero text-primary-foreground font-medium inline-flex items-center gap-2 shadow-soft">
                <Plus className="h-4 w-4" /> Tambah Destinasi
              </button>
            </div>

            {showForm && (
              <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm overflow-y-auto py-8 px-4" onClick={() => setShowForm(false)}>
                <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
                  className="max-w-3xl mx-auto bg-background rounded-2xl p-6 md:p-8 shadow-elegant space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-2xl font-medium">{form.id ? "Edit" : "Tambah"} Destinasi</h3>
                    <button type="button" onClick={() => setShowForm(false)} className="h-9 w-9 rounded-full hover:bg-muted inline-flex items-center justify-center"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input required placeholder="Nama destinasi *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 px-3 rounded-lg border border-border" />
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11 px-3 rounded-lg border border-border bg-background">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input required placeholder="Kabupaten/Kota *" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="h-11 px-3 rounded-lg border border-border" />
                    <input required placeholder="Provinsi *" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="h-11 px-3 rounded-lg border border-border" />
                    <input required placeholder="Durasi ideal (mis. 2-3 hari)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="h-11 px-3 rounded-lg border border-border" />
                    <input required placeholder="Bulan terbaik (mis. Apr - Okt)" value={form.best_months} onChange={(e) => setForm({ ...form, best_months: e.target.value })} className="h-11 px-3 rounded-lg border border-border" />
                  </div>
                  <div className="grid sm:grid-cols-4 gap-3">
                    <label className="text-xs text-muted-foreground">Hidden score (1-10)
                      <input type="number" min={1} max={10} value={form.hidden_score} onChange={(e) => setForm({ ...form, hidden_score: +e.target.value })} className="mt-1 h-11 w-full px-3 rounded-lg border border-border" /></label>
                    <label className="text-xs text-muted-foreground">Sentimen (0-100)
                      <input type="number" min={0} max={100} value={form.sentiment_score} onChange={(e) => setForm({ ...form, sentiment_score: +e.target.value })} className="mt-1 h-11 w-full px-3 rounded-lg border border-border" /></label>
                    <label className="text-xs text-muted-foreground">Biaya/hari (Rp)
                      <input type="number" min={0} value={form.est_cost} onChange={(e) => setForm({ ...form, est_cost: +e.target.value })} className="mt-1 h-11 w-full px-3 rounded-lg border border-border" /></label>
                    <label className="text-xs text-muted-foreground">Kapasitas/hari
                      <input type="number" min={1} value={form.capacity_per_day} onChange={(e) => setForm({ ...form, capacity_per_day: +e.target.value })} className="mt-1 h-11 w-full px-3 rounded-lg border border-border" /></label>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Cocok untuk personality (centang yang sesuai)</p>
                    <div className="flex gap-2 flex-wrap">
                      {personalities.map(p => (
                        <button type="button" key={p} onClick={() => toggleMatch(p)}
                          className={`px-3 h-8 rounded-full border text-xs capitalize ${form.matches.includes(p) ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea required placeholder="Deskripsi destinasi *" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border" />
                  <textarea placeholder="Highlights (1 per baris)" rows={4} value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border" />
                  <input placeholder="URL gambar (atau /images/dest/xxx.jpg)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-border" />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 h-12 rounded-full gradient-hero text-primary-foreground font-semibold">Simpan</button>
                    <button type="button" onClick={() => setShowForm(false)} className="h-12 px-6 rounded-full border border-border">Batal</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {dests.map((d) => (
                <div key={d.id} className="bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft">
                  <img src={d.image_url} alt="" className="w-full aspect-[4/3] object-cover" />
                  <div className="p-5 space-y-2">
                    <p className="text-xs text-muted-foreground">{d.region}, {d.province}</p>
                    <h3 className="font-display text-lg font-semibold">{d.name}</h3>
                    <div className="flex gap-1.5 flex-wrap text-[10px] uppercase font-semibold">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">{d.category}</span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary">Hidden {d.hidden_score}</span>
                      <span className={`px-2 py-0.5 rounded-full ${d.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{d.status}</span>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <button onClick={() => edit(d)} className="flex-1 h-9 rounded-lg border border-border text-sm inline-flex items-center justify-center gap-1"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                      <button onClick={() => remove(d.id)} className="h-9 w-9 rounded-lg border border-border text-destructive inline-flex items-center justify-center"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {dests.length === 0 && <p className="text-muted-foreground col-span-full text-center py-12">Belum ada destinasi. Klik "Tambah Destinasi" untuk mulai.</p>}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab === "bookings" && (
          <div className="mt-8 space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-card rounded-2xl p-5 border border-border/50 grid md:grid-cols-[auto_1fr_auto] gap-4 items-start">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{b.code}</p>
                  <p className="text-xs">{new Date(b.created_at).toLocaleDateString("id-ID")}</p>
                </div>
                <div>
                  <p className="font-medium">{b.full_name} · <span className="text-muted-foreground text-sm">{b.email} · {b.phone}</span></p>
                  <p className="text-sm">{b.destination_name} ({b.destination_region})</p>
                  <p className="text-xs text-muted-foreground">Tgl kunjungan: {new Date(b.visit_date).toLocaleDateString("id-ID")} · {b.num_people} orang × {b.num_days} hari · Rp {Number(b.total_price).toLocaleString("id-ID")}</p>
                  {b.notes && <p className="text-xs bg-muted/50 px-2 py-1 rounded mt-2">{b.notes}</p>}
                </div>
                <div className="flex flex-col gap-2 min-w-[180px]">
                  <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value)}
                    className="h-9 px-3 rounded-lg border border-border text-sm bg-background">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Konfirmasi</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Batalkan</option>
                  </select>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <p className="text-muted-foreground text-center py-12">Belum ada booking masuk.</p>}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
