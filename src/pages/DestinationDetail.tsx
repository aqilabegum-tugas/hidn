import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Sparkles, Heart, Plus } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { destinations, personalityMeta } from "@/data/hidn";
import { hidnStore, useHidn } from "@/store/hidnStore";
import { toast } from "sonner";

const DestinationDetail = () => {
  const { slug } = useParams();
  const d = destinations.find((x) => x.slug === slug);
  const state = useHidn();
  const [open, setOpen] = useState(false);

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

  const saved = state.savedDestinations.includes(d.id);

  const addToItinerary = (itineraryId: string) => {
    hidnStore.addItem(itineraryId, {
      destinationId: d.id, destinationName: d.name,
      day: 1, time: "09:00", activity: `Eksplorasi ${d.name}`,
    });
    toast.success(`${d.name} ditambahkan ke itinerary`);
    setOpen(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto pb-16 text-primary-foreground">
            <Link to="/discover" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 mb-6">
              <ArrowLeft className="h-4 w-4" /> Discover
            </Link>
            <p className="inline-flex items-center gap-1 text-sm opacity-80 mb-2">
              <MapPin className="h-3.5 w-3.5" /> {d.region}, {d.province}
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-medium leading-tight max-w-4xl">{d.name}</h1>
            <div className="mt-6 flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-primary-foreground/15 backdrop-blur-sm text-xs font-medium inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Hidden Score {d.hiddenScore}/10
              </span>
              <span className="px-3 py-1 rounded-full bg-primary-foreground/15 backdrop-blur-sm text-xs font-medium">
                Sentimen {d.sentimentScore}/100
              </span>
              <span className="px-3 py-1 rounded-full bg-primary-foreground/15 backdrop-blur-sm text-xs font-medium">{d.category}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-20 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h2 className="font-display text-3xl font-medium mb-4">Tentang destinasi</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{d.description}</p>
          </div>
          <div>
            <h2 className="font-display text-3xl font-medium mb-4">Highlights</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {d.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/50">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm">{h}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-3xl font-medium mb-4">Cocok untuk tipe</h2>
            <div className="flex gap-3 flex-wrap">
              {d.matches.map((m) => (
                <span key={m} className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {personalityMeta[m].label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/40 sticky top-24">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimasi biaya</p>
            <p className="font-display text-4xl font-medium mt-1">Rp {d.estCost.toLocaleString("id-ID")}</p>
            <p className="text-sm text-muted-foreground">per orang per hari</p>

            <dl className="mt-6 space-y-3 text-sm border-t border-border/60 pt-6">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground inline-flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> Durasi ideal</dt>
                <dd className="font-medium">{d.duration}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground inline-flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Best months</dt>
                <dd className="font-medium">{d.bestMonths}</dd>
              </div>
            </dl>

            <div className="mt-6 space-y-2">
              <button onClick={() => setOpen(true)}
                className="w-full h-12 rounded-full gradient-hero text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:shadow-elegant transition-smooth">
                <Plus className="h-4 w-4" /> Tambahkan ke itinerary
              </button>
              <button onClick={() => hidnStore.toggleSave(d)}
                className="w-full h-12 rounded-full border border-border font-medium inline-flex items-center justify-center gap-2 hover:bg-secondary transition-smooth">
                <Heart className={`h-4 w-4 ${saved ? "fill-destructive text-destructive" : ""}`} />
                {saved ? "Tersimpan" : "Simpan"}
              </button>
            </div>
          </div>
        </aside>
      </section>

      {/* Itinerary picker */}
      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-background rounded-2xl p-6 max-w-md w-full shadow-elegant" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-2xl font-medium mb-4">Pilih itinerary</h3>
            {state.itineraries.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-4">Belum ada itinerary. Buat dulu di halaman Itinerary.</p>
            ) : (
              <div className="space-y-2 mb-4 max-h-72 overflow-auto">
                {state.itineraries.map((it) => (
                  <button key={it.id} onClick={() => addToItinerary(it.id)}
                    className="w-full text-left p-4 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground transition-smooth">
                    <p className="font-medium">{it.title}</p>
                    <p className="text-xs opacity-70">{it.items.length} aktivitas</p>
                  </button>
                ))}
              </div>
            )}
            <Link to="/itinerary" className="block text-center text-sm font-medium text-primary hover:underline">
              + Buat itinerary baru
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DestinationDetail;
