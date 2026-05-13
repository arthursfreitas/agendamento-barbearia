import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  Trash2,
  User as UserIcon,
  Phone,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { phoneMask } from "@/lib/utils";
import { getProfessional, getService } from "@/domain/catalog";
import { useAppointments } from "./useAppointments";

const PHONE_KEY = "barbearia.viewer-phone.v1";
const normalizePhone = (s: string) => s.replace(/\D/g, "");

export function AppointmentsList() {
  const { appointments, cancel } = useAppointments();
  const [phone, setPhone] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.sessionStorage.getItem(PHONE_KEY);
    if (saved) setPhone(saved);
  }, []);

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phoneInput);
    if (normalized.length < 8) {
      toast.error("Informe um número válido.");
      return;
    }
    window.sessionStorage.setItem(PHONE_KEY, normalized);
    setPhone(normalized);
  };

  const handleSignOut = () => {
    window.sessionStorage.removeItem(PHONE_KEY);
    setPhone(null);
    setPhoneInput("");
  };

  const sorted = useMemo(() => {
    if (!phone) return [];
    return appointments
      .filter((a) => normalizePhone(a.customerPhone) === phone)
      .sort((a, b) => {
        const k = a.dateISO.localeCompare(b.dateISO);
        return k !== 0 ? k : a.start.localeCompare(b.start);
      });
  }, [appointments, phone]);

  const handleCancel = (id: string) => {
    cancel(id);
    toast.success("Agendamento cancelado.");
  };

  if (!phone) {
    return (
      <Card className="mx-auto max-w-md p-6">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
            <Phone className="h-5 w-5 text-gold" />
          </div>
          <h3 className="font-display text-2xl">Identifique-se</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe o WhatsApp usado no agendamento para ver seus horários.
          </p>
        </div>
        <form onSubmit={handleEnter} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="viewer-phone">Telefone / WhatsApp</Label>
            <Input
              id="viewer-phone"
              value={phoneMask(phoneInput).value}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="(11) 99999-9999"
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full">
            Ver meus agendamentos
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border bg-card/60 px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          Mostrando agendamentos para{" "}
          <span className="font-medium text-foreground">
            {phoneMask(phone).value}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-3.5 w-3.5" /> Trocar número
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card className="mx-auto max-w-xl border-dashed bg-card/60 p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <CalendarIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-display text-2xl">
            Nenhum agendamento para este número
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Faça um agendamento usando este WhatsApp para vê-lo aqui.
          </p>
          <Button asChild className="mt-6">
            <Link to="/agendar">Agendar agora</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((a) => {
            const service = getService(a.serviceId);
            const pro = getProfessional(a.professionalId);
            const date = parseISO(a.dateISO);
            return (
              <Card
                key={a.id}
                className="overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="h-1 bg-gradient-to-r from-gold to-gold/30" />
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-display text-lg">
                      <Scissors className="h-4 w-4 text-gold" />
                      {service?.name ?? a.serviceId}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCancel(a.id)}
                      aria-label="Cancelar agendamento"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-3.5 w-3.5" />{" "}
                      {pro?.name ?? a.professionalId}
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> {a.start} – {a.end}
                    </div>
                  </div>
                  <div className="border-t pt-3 text-xs text-muted-foreground">
                    Cliente:{" "}
                    <span className="text-foreground">{a.customerName}</span> •{" "}
                    {a.customerPhone}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
