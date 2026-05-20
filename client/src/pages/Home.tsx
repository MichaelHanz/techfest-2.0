import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Compass, Sparkles, Waves, MapPin, CloudSun, Wallet } from "lucide-react";

const AGENT_FEATURES = [
  {
    icon: Compass,
    title: "Orchestrator Agent",
    text: "Coordinates the overall trip planning process and delegates tasks to specialized sub-agents.",
  },
  {
    icon: Waves,
    title: "Travel & Culture Agent",
    text: "Generates itineraries, recommends hotels, and curates local experiences and attractions.",
  },
  {
    icon: CloudSun,
    title: "Logistics Agent",
    text: "Calculates budgets in Malaysian Ringgit and checks weather conditions for optimal planning.",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className={`sticky top-0 z-50 border-b border-border/80 bg-card/40 backdrop-blur-sm transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}>
        <div className="container flex items-center justify-between py-6">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="Home"
          >
            <div className="h-10 w-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Generative AI</p>
              <p className="text-lg font-semibold">Smart Travel Planner</p>
            </div>
          </button>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <span>Agents</span>
            <span>How it works</span>
            <span>Pricing</span>
          </div>
          {isAuthenticated ? (
            <Button
              onClick={() => setLocation("/plan")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6"
            >
              Plan a trip
            </Button>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6">
                Get started
              </Button>
            </a>
          )}
        </div>
      </header>

      <main aria-label="Main content">
        <section className="container py-16 md:py-24 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-secondary/15 px-4 py-1 text-sm text-foreground font-medium">
              <Sparkles className="h-4 w-4 text-secondary" />
              AI-powered, calm by design
            </p>
            <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight">
              Intelligent travel planning in one inviting workspace.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              STRAP coordinates specialized agents to craft your itinerary, optimize your budget, and
              surface meaningful local experiences—so planning feels simple, clear, and comfortable.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {isAuthenticated ? (
                <Button
                  onClick={() => setLocation("/plan")}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-base"
                >
                  Start planning
                </Button>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-base">
                    Sign in to begin
                  </Button>
                </a>
              )}
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 text-base border-border/80 bg-card/60"
                onClick={() => setLocation("/plan")}
              >
                View sample itinerary
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                4.9/5 traveler satisfaction
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent" />
                120+ destinations covered
              </div>
            </div>
          </div>

          <div role="complementary" aria-label="Trip preview example" className="rounded-[2rem] border border-border/80 bg-card p-8 shadow-sm">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Trip Preview</p>
            <h2 className="mt-3 text-2xl font-semibold">Lisbon • 5 Days</h2>
            <p className="mt-2 text-muted-foreground">Sunset viewpoints, pastel streets, and seafood nights.</p>
            <div className="mt-6 space-y-3 text-sm">
              {[
                "Day 1: Alfama walk + Fado dinner",
                "Day 2: Belém landmarks + riverside cafés",
                "Day 3: Sintra day trip with flexible pacing",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-border/80 bg-background/90 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-secondary/15 px-4 py-3 text-sm text-foreground font-medium">
              Budget prediction: 16% under target.
            </div>
          </div>
        </section>

        <section className="container py-16 border-t border-border/80">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">AI agents</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">A friendly team for every trip</h2>
            </div>
            <p className="max-w-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              Each agent has one clear role, giving you a polished plan with thoughtful details and readable
              recommendations.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {AGENT_FEATURES.map((card) => (
              <div key={card.title} className="rounded-[1.75rem] border border-border/80 bg-card p-7 shadow-sm">
                <div className="h-11 w-11 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{card.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-16 border-t border-border/80">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: <Wallet className="h-5 w-5" />, label: "Budget clarity", value: "Transparent daily costs" },
              { icon: <MapPin className="h-5 w-5" />, label: "Local picks", value: "Handpicked neighborhoods" },
              { icon: <Sparkles className="h-5 w-5" />, label: "Flexible flow", value: "Easy pace adjustments" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3 text-secondary">
                  {item.icon}
                  <span className="text-sm uppercase tracking-[0.2em]">{item.label}</span>
                </div>
                <p className="mt-4 text-2xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container py-16 border-t border-border/80">
          <div className="rounded-[2rem] bg-accent/10 border border-accent/25 p-10 md:p-14 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Ready for your next soft landing?</h2>
              <p className="mt-3 text-muted-foreground max-w-xl leading-relaxed">
                Share your destination and budget. We handles the details while you focus on the journey.
              </p>
            </div>
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation("/plan")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-base"
              >
                Plan my trip
              </Button>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-base">
                  Get started
                </Button>
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
