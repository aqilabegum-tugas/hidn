import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DestinationCard } from "@/components/DestinationCard";
import { destinations } from "@/data/hidn";

const categories = ["Semua", "Pantai", "Gunung", "Budaya", "Air Terjun", "Danau", "Desa"] as const;

const Discover = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof categories)[number]>("Semua");
  const [sortBy, setSortBy] = useState<"hidden" | "sentiment" | "cost">("hidden");

  const items = useMemo(() => {
    let list = destinations.filter((d) =>
      (cat === "Semua" || d.category === cat) &&
      (q === "" || (d.name + d.region + d.province).toLowerCase().includes(q.toLowerCase()))
    );
    list.sort((a, b) => {
      if (sortBy === "hidden") return b.hiddenScore - a.hiddenScore;
      if (sortBy === "sentiment") return b.sentimentScore - a.sentimentScore;
      return a.estCost - b.estCost;
    });
    return list;
  }, [q, cat, sortBy]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="container mx-auto pt-16 pb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-semibold">Hidden Gem Discovery</p>
        <h1 className="font-display text-5xl md:text-6xl font-medium leading-tight max-w-3xl">
          Jelajahi sisi Indonesia yang belum semua orang tahu.
        </h1>

        <div className="mt-12 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Cari destinasi, daerah, atau provinsi…"
              className="w-full h-12 pl-12 pr-4 rounded-full bg-card border border-border focus:border-primary outline-none transition-smooth" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-12 px-5 rounded-full bg-card border border-border outline-none">
            <option value="hidden">Paling tersembunyi</option>
            <option value="sentiment">Sentimen tertinggi</option>
            <option value="cost">Harga terendah</option>
          </select>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 h-9 rounded-full text-sm font-medium transition-smooth
                ${cat === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="container mx-auto pb-24">
        <p className="text-sm text-muted-foreground mb-6">{items.length} destinasi ditemukan</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((d) => <DestinationCard key={d.id} d={d} />)}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Discover;
