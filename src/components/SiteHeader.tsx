import { Link } from "@tanstack/react-router";
import { Scissors } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="font-display text-xl tracking-tight">Barbearia</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/agendar"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground font-medium" }}
          >
            Agendar
          </Link>
          <Link
            to="/meus-agendamentos"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground font-medium" }}
          >
            Meus agendamentos
          </Link>
        </nav>
      </div>
    </header>
  );
}
