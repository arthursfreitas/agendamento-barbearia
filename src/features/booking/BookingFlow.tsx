import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Scissors,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, phoneMask } from "@/lib/utils";

import {
  SERVICES,
  getProfessional,
  getService,
  getProfessionalsForService,
} from "@/domain/catalog";
import {
  generateSlotsAnyProfessional,
  generateSlotsForProfessional,
  toDateISO,
} from "@/domain/rules";
import type { DayContext, ServiceId } from "@/domain/types";
import { useAppointments } from "@/features/appointments/useAppointments";

type Step = 0 | 1 | 2 | 3 | 4;

const STEPS = [
  "Serviço",
  "Profissional",
  "Data e horário",
  "Seus dados",
  "Confirmação",
] as const;

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );

export function BookingFlow() {
  const { appointments, create } = useAppointments();
  const [step, setStep] = useState<Step>(0);
  const [serviceId, setServiceId] = useState<ServiceId | null>(null);
  const [professionalId, setProfessionalId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const phoneResult = phoneMask(phone);
  const [confirmed, setConfirmed] = useState<{
    id: string;
    professionalName: string;
  } | null>(null);

  const service = serviceId ? (getService(serviceId) ?? null) : null;

  const eligibleProfessionals = useMemo(
    () => (serviceId ? getProfessionalsForService(serviceId) : []),
    [serviceId],
  );

  const slots = useMemo(() => {
    if (!service || !date) return [];
    const ctx: DayContext = {
      service,
      dateISO: toDateISO(date),
      appointments,
      now: new Date(),
    };
    if (professionalId === "any" || !professionalId) {
      return generateSlotsAnyProfessional(ctx);
    }
    const pro = getProfessional(professionalId);
    if (!pro) return [];
    return generateSlotsForProfessional(ctx, pro);
  }, [service, date, professionalId, appointments]);

  const canAdvance: Record<Step, boolean> = {
    0: !!serviceId,
    1: !!professionalId,
    2: !!date && !!slot,
    3: name.trim().length >= 2 && phone.trim().length >= 8,
    4: false,
  };

  const next = () => setStep((s) => Math.min(s + 1, 4) as Step);
  const prev = () => setStep((s) => Math.max(s - 1, 0) as Step);

  const handleConfirm = () => {
    if (!serviceId || !professionalId || !date || !slot) return;
    const res = create({
      customerName: name,
      customerPhone: phone,
      serviceId,
      professionalId,
      dateISO: toDateISO(date),
      start: slot,
    });
    if (!res.ok) {
      toast.error(res.reason);
      return;
    }
    const proName = getProfessional(res.appointment.professionalId)?.name ?? "";
    setConfirmed({ id: res.appointment.id, professionalName: proName });
    toast.success("Agendamento confirmado!");
    setStep(4);
  };

  if (confirmed && step === 4) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="overflow-hidden border-gold/40">
          <div className="bg-gradient-to-br from-gold/15 to-transparent p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold text-gold-foreground">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl">Tudo certo!</h2>
            <p className="mt-2 text-muted-foreground">
              Seu agendamento foi confirmado com sucesso.
            </p>
          </div>
          <CardContent className="space-y-3 p-6 text-sm">
            <Row label="Serviço" value={service?.name ?? ""} />
            <Row label="Profissional" value={confirmed.professionalName} />
            <Row
              label="Data"
              value={
                date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : ""
              }
            />
            <Row label="Horário" value={slot ?? ""} />
            <div className="flex flex-col gap-2 pt-4 sm:flex-row">
              <Button asChild className="flex-1">
                <Link to="/meus-agendamentos">Ver meus agendamentos</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/">Voltar ao início</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Stepper current={step} />

      <div className="mt-8">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServiceId(s.id);
                  setProfessionalId(null);
                  setSlot(null);
                }}
                className={cn(
                  "group rounded-xl border bg-card p-5 text-left transition-all hover:border-gold hover:shadow-md",
                  serviceId === s.id && "border-gold ring-2 ring-gold/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Scissors className="h-4 w-4 text-gold" />
                      <h3 className="font-display text-lg">{s.name}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                    {s.durationMin}min
                  </span>
                </div>
                <div className="mt-4 font-display text-xl text-gold">
                  {formatPrice(s.priceCents)}
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && service && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ProfessionalCard
              selected={professionalId === "any"}
              onSelect={() => {
                setProfessionalId("any");
                setSlot(null);
              }}
              initials="★"
              name="Qualquer profissional"
              role="Atendimento mais rápido"
              accent
            />
            {eligibleProfessionals.map((p) => (
              <ProfessionalCard
                key={p.id}
                selected={professionalId === p.id}
                onSelect={() => {
                  setProfessionalId(p.id);
                  setSlot(null);
                }}
                initials={p.initials}
                name={p.name}
                role={p.role}
              />
            ))}
            {eligibleProfessionals.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">
                Nenhum profissional cadastrado realiza este serviço.
              </p>
            )}
          </div>
        )}

        {step === 2 && service && (
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            <Card className="p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  setSlot(null);
                }}
                disabled={(d) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return d < today;
                }}
                locale={ptBR}
                className="rounded-md"
              />
            </Card>
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-display text-lg">
                <Clock className="h-4 w-4 text-gold" />
                Horários disponíveis
              </h3>
              {!date && (
                <p className="text-sm text-muted-foreground">
                  Selecione uma data para ver os horários.
                </p>
              )}
              {date && slots.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum horário disponível neste dia.
                </p>
              )}
              {date && slots.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((s) => (
                    <button
                      key={s.start}
                      disabled={!s.available}
                      onClick={() => setSlot(s.start)}
                      className={cn(
                        "rounded-md border px-2 py-2 text-sm transition-colors",
                        s.available
                          ? "hover:border-gold hover:bg-gold/10"
                          : "cursor-not-allowed opacity-40",
                        slot === s.start &&
                          "border-gold bg-gold text-gold-foreground hover:bg-gold",
                      )}
                      title={s.available ? `${s.start} – ${s.end}` : s.reason}
                    >
                      {s.start}
                    </button>
                  ))}
                </div>
              )}
              {date && slots.every((s) => !s.available) && slots.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Tudo ocupado neste dia. Tente outra data.
                </p>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <Card className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="João da Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  value={phoneResult.value}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
            <div className="mt-6 rounded-md border bg-muted/50 p-4 text-sm">
              <h4 className="mb-2 font-medium">Resumo</h4>
              <div className="space-y-1 text-muted-foreground">
                <div>
                  Serviço:{" "}
                  <span className="text-foreground">{service?.name}</span>
                </div>
                <div>
                  Profissional:{" "}
                  <span className="text-foreground">
                    {professionalId === "any"
                      ? "Qualquer profissional"
                      : getProfessional(professionalId ?? "")?.name}
                  </span>
                </div>
                <div>
                  Quando:{" "}
                  <span className="text-foreground">
                    {date && format(date, "d 'de' MMMM", { locale: ptBR })} às{" "}
                    {slot}
                  </span>
                </div>
                <div>
                  Total:{" "}
                  <span className="text-foreground">
                    {service && formatPrice(service.priceCents)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={prev} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        {step < 3 && (
          <Button onClick={next} disabled={!canAdvance[step]}>
            Continuar <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {step === 3 && (
          <Button
            onClick={handleConfirm}
            disabled={!canAdvance[3]}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            Confirmar agendamento <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Stepper({ current }: { current: Step }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                done && "border-gold bg-gold text-gold-foreground",
                active && !done && "border-gold text-gold",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden sm:inline",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 hidden h-px w-6 bg-border sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ProfessionalCard({
  selected,
  onSelect,
  initials,
  name,
  role,
  accent,
}: {
  selected: boolean;
  onSelect: () => void;
  initials: string;
  name: string;
  role: string;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-card p-4 text-left transition-all hover:border-gold hover:shadow-md",
        selected && "border-gold ring-2 ring-gold/30",
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg",
          accent
            ? "bg-gold text-gold-foreground"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        {initials}
      </div>
      <div>
        <div className="font-medium">{name}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <UserIcon className="h-3 w-3" /> {role}
        </div>
      </div>
    </button>
  );
}
