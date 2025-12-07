import { Waves, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 py-8">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-primary" />
            <span className="font-semibold">Pakistan Flood Monitor</span>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Data powered by{' '}
            <a
              href="https://open-meteo.com/en/docs/flood-api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Open-Meteo Flood API
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
