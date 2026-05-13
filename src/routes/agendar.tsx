import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";
import { BookingFlow } from "@/features/booking/BookingFlow";

export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: "Agendar horário — Barbearia" },
      {
        name: "description",
        content: "Escolha serviço, profissional, data e horário em poucos passos.",
      },
      { property: "og:title", content: "Agendar horário — Barbearia" },
      {
        property: "og:description",
        content: "Escolha serviço, profissional, data e horário em poucos passos.",
      },
    ],
  }),
  component: AgendarPage,
});

function AgendarPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 max-w-2xl">
          <h1 className="font-display text-4xl">Agendar horário</h1>
          <p className="mt-2 text-muted-foreground">
            Em poucos passos você garante o seu horário com o profissional ideal.
          </p>
        </div>
        <BookingFlow />
      </main>
    </div>
  );
}
