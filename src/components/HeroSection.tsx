import { Waves, Shield, AlertTriangle } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-primary/20 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Icon badge */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 glow animate-float">
            <Waves className="h-8 w-8 text-primary" />
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Pakistan <span className="text-gradient">Flood Risk</span> Monitor
          </h1>

          {/* Subtitle */}
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
            Real-time flood forecasting for Punjab, KPK & Balochistan using advanced hydrological models. 
            Stay informed and prepared with accurate river discharge predictions.
          </p>

          {/* Stats cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full max-w-3xl">
            <div className="card-gradient rounded-xl border border-border p-4 transition-all hover:border-primary/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Waves className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Monitoring</p>
                  <p className="text-xl font-semibold">12 Cities</p>
                </div>
              </div>
            </div>

            <div className="card-gradient rounded-xl border border-border p-4 transition-all hover:border-accent/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Forecast</p>
                  <p className="text-xl font-semibold">30 Days</p>
                </div>
              </div>
            </div>

            <div className="card-gradient rounded-xl border border-border p-4 transition-all hover:border-risk-moderate/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-risk-moderate/10">
                  <AlertTriangle className="h-5 w-5 text-risk-moderate" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">Updates</p>
                  <p className="text-xl font-semibold">Real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
