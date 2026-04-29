import { Link } from "react-router-dom";
import { Sparkles, Compass, Map, Heart, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DestinationCard } from "@/components/DestinationCard";
import { destinations } from "@/data/hidn";
import hero from "@/assets/hero-beach.jpg";

const features = [
  { icon: Sparkles, title: "Kuis Kepribadian Wisata", desc: "7 pertanyaan sederhana berbasis psikologi perjalanan untuk mengenali tipe travelermu." },
  { icon: Compass, title: "Hidden Gem Discovery", desc: "Database kurasi destinasi non-mainstream Indonesia dengan skor sentimen positif tinggi." },
  { icon: Map,     title: "Smart Itinerary", desc: "Susun rencana perjalanan per hari, per jam — semua tersimpan rapi." },
  { icon: Heart,   title: "Customizable Plan", desc: "Save destinasi favorit, ubah, dan atur ulang itinerary kapan saja." },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={hero} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-primary/40" />
        </div>
        <div className="container mx-auto pt-24 pb-32 md:pt-40 md:pb-48 text-primary-foreground">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 text-xs font-medium mb-6 animate-fade-in">
            ✨ Smart Tourism Technology · Indonesia
          </span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.05] max-w-4xl text-balance animate-fade-up">
            Find your <em className="italic font-light">hidden</em> Indonesia.
          </h1>
          <p className="mt-8 max-w-xl text-lg md:text-xl text-primary-foreground/85 leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Bukan destinasi viral. Bukan rekomendasi general. HIDN mempertemukanmu dengan
            tempat-tempat yang sesuai karaktermu — yang belum semua orang tahu.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/quiz" className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary-foreground text-primary font-semibold shadow-elegant hover:scale-105 transition-smooth">
              Mulai Kuis Kepribadian
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link to="/discover" className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-primary-foreground/40 text-primary-foreground font-medium hover:bg-primary-foreground/10 transition-smooth">
              Jelajahi Hidden Gems
            </Link>
          </div>
          <div className="mt-16 flex flex-wrap gap-x-12 gap-y-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {[["17.000+", "pulau di Indonesia"], ["8", "kurasi hidden gems"], ["5", "tipe kepribadian"], ["100%", "personal"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-display text-3xl md:text-4xl font-medium">{n}</div>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/70 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto py-24 md:py-32">
        <div className="max-w-2xl mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-semibold">Empat Pilar HIDN</p>
          <h2 className="font-display text-4xl md:text-5xl font-medium leading-tight text-balance">
            Discovery layer untuk perjalananmu — bukan sekedar booking platform.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="group relative bg-card rounded-2xl p-7 shadow-soft hover:shadow-elegant transition-smooth border border-border/40">
              <div className="h-12 w-12 rounded-xl gradient-hero text-primary-foreground inline-flex items-center justify-center mb-5 group-hover:scale-110 transition-smooth">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              <span className="absolute top-7 right-7 text-xs font-mono text-muted-foreground/40">0{i + 1}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HIGHLIGHTED DESTINATIONS */}
      <section className="container mx-auto pb-24 md:pb-32">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-semibold">Curated</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium leading-tight">Hidden gems pilihan minggu ini</h2>
          </div>
          <Link to="/discover" className="text-sm font-semibold underline underline-offset-4 hover:text-primary transition-smooth">
            Lihat semua →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((d) => <DestinationCard key={d.id} d={d} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto pb-32">
        <div className="relative overflow-hidden rounded-3xl gradient-hero text-primary-foreground p-12 md:p-20 shadow-elegant">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-60 w-60 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl font-medium leading-tight text-balance">
              Karaktermu unik. Liburanmu juga harus begitu.
            </h2>
            <p className="mt-6 text-primary-foreground/85 text-lg leading-relaxed">
              Mulai dengan 7 pertanyaan singkat, dapatkan rekomendasi hidden gems yang dirancang
              untuk tipe travelermu, lalu susun itinerary impianmu.
            </p>
            <Link to="/quiz" className="mt-10 inline-flex items-center h-14 px-8 rounded-full bg-primary-foreground text-primary font-semibold hover:scale-105 transition-smooth">
              Mulai Sekarang — Gratis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
