import { Link, useSearchParams } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DestinationCard } from "@/components/DestinationCard";
import { Personality, personalityMeta, getRecommendations } from "@/data/hidn";

const QuizResult = () => {
  const [params] = useSearchParams();
  const p = (params.get("p") || "explorer") as Personality;
  const meta = personalityMeta[p];
  const recs = getRecommendations(p).slice(0, 6);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="container mx-auto py-24 md:py-32 relative">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-sm text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3" /> Hasil Kuismu
          </span>
          <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/70 mb-3">Kamu adalah</p>
          <h1 className="font-display text-5xl md:text-7xl font-medium leading-tight animate-fade-up">{meta.label}</h1>
          <p className="font-display italic text-2xl md:text-3xl mt-2 text-primary-foreground/80">{meta.tagline}</p>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">{meta.description}</p>
        </div>
      </section>

      <section className="container mx-auto py-20">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4 font-semibold">Hidden Gems untukmu</p>
            <h2 className="font-display text-4xl md:text-5xl font-medium leading-tight">Destinasi yang cocok dengan {meta.label}</h2>
          </div>
          <Link to="/itinerary" className="text-sm font-semibold underline underline-offset-4 hover:text-primary transition-smooth">
            Susun itinerary →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recs.map((d) => <DestinationCard key={d.id} d={d} />)}
        </div>

        <div className="mt-20 text-center">
          <Link to="/quiz" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
            Ulangi kuis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default QuizResult;
