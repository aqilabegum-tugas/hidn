import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { bookingsApi } from "@/lib/api";
import { toast } from "sonner";
import { CalendarDays, MapPin, Users, X, Receipt } from "lucide-react";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  completed: "bg-sky-100 text-sky-800",
};
const statusLabel: Record<string, string> = {
  pending: "Menunggu konfirmasi",
  confirmed: "Terkonfirmasi",
  cancelled: "Dibatalkan",
  completed: "Selesai",
};

const MyBookings = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { setList(await bookingsApi.myList()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const cancel = async (id: string) => {
    if (!confirm("Yakin ingin membatalkan booking ini?")) return;
    try { await bookingsApi.cancel(id); toast.success("Booking dibatalkan"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-12 md:py-16">
        <p className="text-sm uppercase tracking-[0.2em] text-primary mb-3 font-semibold">Pemesananmu</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium mb-10">Booking saya</h1>

        {loading ? <p className="text-muted-foreground">Memuat…</p> :
          list.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground mb-4">Belum ada booking. Yuk mulai cari hidden gem!</p>
              <Link to="/discover" className="text-primary underline">Jelajahi destinasi</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {list.map((b) => (
                <div key={b.id} className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden flex flex-col md:flex-row">
                  <img src={b.destination_image} alt={b.destination_name} className="w-full md:w-56 aspect-[4/3] md:aspect-auto object-cover" />
                  <div className="flex-1 p-6 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">{b.code}</p>
                        <h3 className="font-display text-xl font-semibold">{b.destination_name}</h3>
                        <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{b.destination_region}</p>
                      </div>
                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusBadge[b.status]}`}>{statusLabel[b.status]}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Date(b.visit_date).toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}</span>
                      <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{b.num_people} orang × {b.num_days} hari</span>
                    </div>
                    {b.notes && <p className="text-sm bg-muted/50 px-3 py-2 rounded-lg">{b.notes}</p>}
                    <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                      <span className="font-display text-lg font-semibold">Rp {Number(b.total_price).toLocaleString("id-ID")}</span>
                      {(b.status === "pending" || b.status === "confirmed") && (
                        <button onClick={() => cancel(b.id)}
                          className="text-sm text-destructive hover:underline inline-flex items-center gap-1">
                          <X className="h-3.5 w-3.5" /> Batalkan
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings;
