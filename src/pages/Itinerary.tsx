import { useState } from "react";
import { Plus, Trash2, Calendar, Clock, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { hidnStore, useHidn } from "@/store/hidnStore";
import { destinations } from "@/data/hidn";
import { toast } from "sonner";

const Itinerary = () => {
  const state = useHidn();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [active, setActive] = useState<string | null>(state.itineraries[0]?.id ?? null);
  const it = state.itineraries.find((x) => x.id === active);

  const create = () => {
    if (!title.trim()) return;
    const id = hidnStore.createItinerary(title.trim());
    setTitle(""); setCreating(false); setActive(id);
    toast.success("Itinerary baru dibuat");
  };

  const [form, setForm] = useState({ destinationId: destinations[0].id, day: 1, time: "09:00", activity: "", notes: "" });
  const addItem = () => {
    if (!it || !form.activity.trim()) return;
    const dest = destinations.find((d) => d.id === form.destinationId)!;
    hidnStore.addItem(it.id, {
      destinationId: dest.id, destinationName: dest.name,
      day: form.day, time: form.time, activity: form.activity, notes: form.notes,
    });
    setForm({ ...form, activity: "", notes: "" });
    toast.success("Aktivitas ditambahkan");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="container mx-auto pt-16 pb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-semibold">Smart Itinerary</p>
        <h1 className="font-display text-5xl md:text-6xl font-medium leading-tight max-w-3xl">
          Susun perjalananmu, fleksibel kapan saja.
        </h1>
      </section>

      <section className="container mx-auto pb-24 grid lg:grid-cols-[320px_1fr] gap-8">
        {/* Sidebar list */}
        <aside className="space-y-3">
          <button onClick={() => setCreating(true)}
            className="w-full h-12 rounded-2xl gradient-hero text-primary-foreground font-medium inline-flex items-center justify-center gap-2 shadow-soft hover:shadow-elegant transition-smooth">
            <Plus className="h-4 w-4" /> Itinerary baru
          </button>
          {creating && (
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                placeholder="Misal: Trip Flores 5 hari"
                className="w-full h-10 px-3 rounded-lg border border-border outline-none focus:border-primary" />
              <div className="flex gap-2">
                <button onClick={create} className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Buat</button>
                <button onClick={() => setCreating(false)} className="h-9 px-4 rounded-lg bg-secondary text-sm">Batal</button>
              </div>
            </div>
          )}
          {state.itineraries.length === 0 && !creating && (
            <p className="text-sm text-muted-foreground p-4">Belum ada itinerary. Buat satu untuk mulai.</p>
          )}
          {state.itineraries.map((x) => (
            <button key={x.id} onClick={() => setActive(x.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-smooth
                ${active === x.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/50"}`}>
              <p className="font-medium truncate">{x.title}</p>
              <p className="text-xs opacity-70 mt-1">{x.items.length} aktivitas · {new Date(x.createdAt).toLocaleDateString("id-ID")}</p>
            </button>
          ))}
        </aside>

        {/* Detail */}
        <div>
          {!it ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Pilih atau buat itinerary untuk mulai menyusun rencana</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-3xl font-medium">{it.title}</h2>
                <button onClick={() => { hidnStore.removeItinerary(it.id); setActive(null); toast.success("Itinerary dihapus"); }}
                  className="text-sm text-destructive hover:underline inline-flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>

              {/* Add form */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Tambah aktivitas</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <select value={form.destinationId} onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
                    className="h-11 px-3 rounded-lg border border-border bg-background outline-none">
                    {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <input type="number" min={1} value={form.day} onChange={(e) => setForm({ ...form, day: +e.target.value })}
                    placeholder="Hari ke-" className="h-11 px-3 rounded-lg border border-border outline-none" />
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="h-11 px-3 rounded-lg border border-border outline-none" />
                </div>
                <input value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })}
                  placeholder="Aktivitas, misal: Trekking ke titik sunrise"
                  className="w-full h-11 px-3 rounded-lg border border-border outline-none" />
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Catatan (opsional)"
                  className="w-full h-11 px-3 rounded-lg border border-border outline-none" />
                <button onClick={addItem}
                  className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Tambah
                </button>
              </div>

              {/* Days */}
              {it.items.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">Belum ada aktivitas. Tambah dari form di atas.</p>
              ) : (
                Object.entries(
                  it.items.reduce<Record<number, typeof it.items>>((acc, x) => {
                    (acc[x.day] ||= []).push(x); return acc;
                  }, {})
                )
                .sort(([a], [b]) => +a - +b)
                .map(([day, items]) => (
                  <div key={day}>
                    <h3 className="font-display text-xl font-medium mb-3">Hari {day}</h3>
                    <div className="space-y-2">
                      {items.sort((a, b) => a.time.localeCompare(b.time)).map((x) => (
                        <div key={x.id} className="flex gap-4 p-4 bg-card border border-border rounded-xl group">
                          <div className="text-sm font-mono font-medium text-primary inline-flex items-center gap-1 min-w-[70px]">
                            <Clock className="h-3.5 w-3.5" /> {x.time}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{x.activity}</p>
                            <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" /> {x.destinationName}
                            </p>
                            {x.notes && <p className="text-sm text-muted-foreground mt-2">{x.notes}</p>}
                          </div>
                          <button onClick={() => hidnStore.removeItem(it.id, x.id)}
                            className="opacity-0 group-hover:opacity-100 transition-smooth text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Itinerary;
