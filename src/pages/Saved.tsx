import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DestinationCard } from "@/components/DestinationCard";
import { destinations } from "@/data/hidn";
import { useHidn } from "@/store/hidnStore";

const Saved = () => {
  const state = useHidn();
  const items = destinations.filter((d) => state.savedDestinations.includes(d.id));

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="container mx-auto pt-16 pb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-semibold">Tersimpan</p>
        <h1 className="font-display text-5xl md:text-6xl font-medium leading-tight">Destinasi favoritmu</h1>
      </section>
      <section className="container mx-auto pb-24">
        {items.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">Belum ada yang disimpan.</p>
            <Link to="/discover" className="mt-4 inline-block text-primary underline">Jelajahi sekarang</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((d) => <DestinationCard key={d.id} d={d} />)}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Saved;
