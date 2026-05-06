import logo from "@/assets/hidn-logo.png";

export const Footer = () => (
  <footer className="border-t border-border/60 mt-32">
    <div className="container mx-auto py-16 grid md:grid-cols-4 gap-10">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <img src={logo} alt="" className="h-8 w-8" width={32} height={32} />
          <span className="font-display text-xl font-semibold">HIDN</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          Find Your Hidden Indonesia. Platform travel personal yang membantumu menemukan
          destinasi sesuai karakter — bukan sekadar yang viral.
        </p>
      </div>
      <div>
        <h4 className="font-display text-sm font-semibold mb-4">Produk</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Kuis Kepribadian</li>
          <li>Hidden Gem Discovery</li>
          <li>Smart Itinerary</li>
          <li>Customizable Plan</li>
        </ul>
      </div>
      <div>
        <h4 className="font-display text-sm font-semibold mb-4">Kontak</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Technopreneurship for AI</li>
          <li>Kelompok 16</li>
          <li>IPB University</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/60">
      <p className="container mx-auto py-6 text-xs text-muted-foreground text-center">
        © 2026 HIDN — Find Your Hidden Indonesia
      </p>
    </div>
  </footer>
);
