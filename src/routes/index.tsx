import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Clock, ScissorsLineDashed, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { PROFESSIONALS, SERVICES } from "@/domain/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Barbearia — Agende seu horário online" },
      {
        name: "description",
        content:
          "Agende cortes, barba e tratamentos com os melhores profissionais. Atendimento de segunda a sábado, 9h às 19h.",
      },
      { property: "og:title", content: "Barbearia — Agende seu horário online" },
      {
        property: "og:description",
        content: "Agende cortes, barba e tratamentos com os melhores profissionais.",
      },
    ],
  }),
  component: HomePage,
});

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gold/10 via-background to-background" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-foreground">
              <Sparkles className="h-3 w-3 text-gold" />
              Tradição & estilo desde 2010
            </span>
            <h1 className="mt-5 font-display text-5xl leading-tight md:text-6xl">
              Seu próximo corte começa <span className="text-gold">com um clique.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Agende com facilidade, escolha seu barbeiro de confiança e chegue na hora certa. Sem
              filas, sem complicação.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/agendar">
                  <CalendarCheck className="h-4 w-4" /> Agendar horário
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/meus-agendamentos">Meus agendamentos</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" /> Seg–Sáb · 09h–19h
              </div>
              <div className="flex items-center gap-2">
                <ScissorsLineDashed className="h-4 w-4 text-gold" /> {PROFESSIONALS.length}{" "}
                profissionais
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-gold/20 to-transparent blur-2xl" />
            <Card className="overflow-hidden border-gold/30">
              <div className="grid grid-cols-2 gap-px bg-border">
                {SERVICES.slice(0, 4).map((s) => (
                  <div key={s.id} className="bg-card p-5">
                    <div className="font-display text-base">{s.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.durationMin} min</div>
                    <div className="mt-3 font-display text-xl text-gold">
                      {formatPrice(s.priceCents)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-primary p-5 text-primary-foreground">
                <div className="text-xs uppercase tracking-wider opacity-70">Hoje em destaque</div>
                <div className="mt-1 font-display text-lg">Combo Corte + Barba</div>
                <div className="mt-1 text-sm opacity-80">60 min de cuidado completo.</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-t bg-secondary/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-4xl">Nossos serviços</h2>
            <p className="mt-3 text-muted-foreground">
              Cinco serviços pensados para você sair daqui pronto para o que vier.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <Card
                key={s.id}
                className="group transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-xl">{s.name}</h3>
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs">
                      {s.durationMin}min
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="font-display text-2xl text-gold">
                      {formatPrice(s.priceCents)}
                    </span>
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Link to="/agendar">Agendar →</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Professionals */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-2xl">
            <h2 className="font-display text-4xl">Nosso time</h2>
            <p className="mt-3 text-muted-foreground">
              Profissionais experientes, prontos para entregar o seu melhor visual.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PROFESSIONALS.map((p) => (
              <Card key={p.id} className="text-center">
                <CardContent className="p-8">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold/50 font-display text-2xl text-gold-foreground">
                    {p.initials}
                  </div>
                  <h3 className="mt-4 font-display text-xl">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center md:flex-row md:text-left">
          <div>
            <h2 className="font-display text-3xl">Pronto para o próximo corte?</h2>
            <p className="mt-2 opacity-80">
              Leva menos de um minuto. Escolha o serviço e o horário ideal.
            </p>
          </div>
          <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Link to="/agendar">Agendar agora</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Barbearia — Todos os direitos reservados.
      </footer>
    </div>
  );
}
