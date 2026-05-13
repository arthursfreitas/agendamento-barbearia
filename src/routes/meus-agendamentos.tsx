import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/SiteHeader";
import { AppointmentsList } from "@/features/appointments/AppointmentsList";

export const Route = createFileRoute("/meus-agendamentos")({
  head: () => ({
    meta: [
      { title: "Meus agendamentos — Barbearia" },
      { name: "description", content: "Veja e gerencie seus agendamentos." },
      { property: "og:title", content: "Meus agendamentos — Barbearia" },
      { property: "og:description", content: "Veja e gerencie seus agendamentos." },
    ],
  }),
  component: MeusPage,
});

function MeusPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 max-w-2xl">
          <h1 className="font-display text-4xl">Meus agendamentos</h1>
          <p className="mt-2 text-muted-foreground">
            Acompanhe seus horários e cancele se precisar.
          </p>
        </div>
        <AppointmentsList />
      </main>
    </div>
  );
}
