import { Link } from "react-router-dom";
import { Heart, MapPin, Sparkles } from "lucide-react";
import { Destination, personalityMeta } from "@/data/hidn";
import { hidnStore, useHidn } from "@/store/hidnStore";

export const DestinationCard = ({ d }: { d: Destination }) => {
  const state = useHidn();
  const saved = state.savedDestinations.includes(d.id);
  return (
    <article className="group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elegant transition-smooth">
      <Link to={`/destination/${d.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={d.image} alt={d.name} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
            <Sparkles className="h-3 w-3 text-accent" />
            Hidden {d.hiddenScore}/10
          </div>
          <div className="absolute bottom-3 left-3 right-3 text-primary-foreground">
            <p className="text-xs opacity-80 inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{d.region}, {d.province}</p>
            <h3 className="font-display text-xl font-semibold leading-tight mt-1">{d.name}</h3>
          </div>
        </div>
      </Link>
      <button
        aria-label="Save"
        onClick={() => hidnStore.toggleSave(d)}
        className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm inline-flex items-center justify-center hover:scale-110 transition-smooth"
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-destructive text-destructive" : ""}`} />
      </button>
      <div className="p-5 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {d.matches.slice(0, 2).map((m) => (
            <span key={m} className="text-[10px] uppercase tracking-wide font-semibold bg-secondary px-2 py-1 rounded-full">
              {personalityMeta[m].label}
            </span>
          ))}
          <span className="text-[10px] uppercase tracking-wide font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
            {d.category}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{d.description}</p>
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <span className="text-xs text-muted-foreground">{d.duration}</span>
          <span className="text-sm font-semibold">Rp {d.estCost.toLocaleString("id-ID")}<span className="text-xs font-normal text-muted-foreground">/hari</span></span>
        </div>
      </div>
    </article>
  );
};
