import type { Appointment, DayContext, Professional, Service, TimeSlot } from "./types";
import { BUSINESS_HOURS, getProfessionalsForService } from "./catalog";
import { bookingEngine } from "./rules/rules";

// ─── Helpers ───────────────────────────────────────────────

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const fromMinutes = (min: number): string => {
  const h = Math.floor(min / 60)
    .toString()
    .padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

/** "YYYY-MM-DD" of a Date in local timezone. */
export const toDateISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// ─── CanBook (delegates to RulesEngine) ────────────────────

export interface CanBookContext {
  service: Service;
  professional: Professional;
  dateISO: string;
  startHHmm: string;
  appointments: Appointment[];
  now?: Date;
}

export interface CanBookResult {
  ok: boolean;
  reason?: string;
}

/**
 * Valida todas as regras de negócio usando o RulesEngine.
 *
 * Cada regra está isolada em um arquivo próprio em `src/domain/rules/`:
 *
 *   Regra | Arquivo                                   | Descrição
 *   ──────┼───────────────────────────────────────────┼─────────────────────────────────
 *   1     | professional-performs-service.ts          | Profissional realiza o serviço
 *   2     | no-overlap.ts                              | Sem sobreposição com agendamentos
 *   3     | business-hours.ts                          | Horário comercial e almoço
 *   4     | not-in-past.ts                             | Horário não está no passado
 */
export function canBook(ctx: CanBookContext): CanBookResult {
  const { service, professional, dateISO, startHHmm, appointments, now = new Date() } = ctx;

  return bookingEngine.validate({
    service,
    professional,
    dateISO,
    startHHmm,
    appointments,
    now,
  });
}

// ─── Slot helpers ──────────────────────────────────────────

/**
 * Itera sobre os slots do dia, chamando `visit` para cada slot.
 * Elimina a repetição do loop for que aparecia em 3 funções diferentes.
 */
function forEachSlot(ctx: DayContext, visit: (start: string, end: string) => void): void {
  for (
    let m = BUSINESS_HOURS.openMin;
    m + ctx.service.durationMin <= BUSINESS_HOURS.closeMin;
    m += BUSINESS_HOURS.slotStepMin
  ) {
    const start = fromMinutes(m);
    const end = fromMinutes(m + ctx.service.durationMin);
    visit(start, end);
  }
}

/**
 * Generates 15-min slots across the day for a specific professional.
 */
export function generateSlotsForProfessional(
  ctx: DayContext,
  professional: Professional,
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  forEachSlot(ctx, (start, end) => {
    const result = canBook({
      service: ctx.service,
      professional,
      dateISO: ctx.dateISO,
      startHHmm: start,
      appointments: ctx.appointments,
      now: ctx.now,
    });
    slots.push({ start, end, available: result.ok, reason: result.reason });
  });
  return slots;
}

/**
 * Generates slots when "Qualquer profissional" is selected.
 * A slot is available if AT LEAST ONE eligible professional can take it.
 */
export function generateSlotsAnyProfessional(ctx: DayContext): TimeSlot[] {
  const eligible = getProfessionalsForService(ctx.service.id);
  const slots: TimeSlot[] = [];
  forEachSlot(ctx, (start, end) => {
    const anyOk = eligible.some(
      (p) =>
        canBook({
          service: ctx.service,
          professional: p,
          dateISO: ctx.dateISO,
          startHHmm: start,
          appointments: ctx.appointments,
          now: ctx.now,
        }).ok,
    );
    slots.push({ start, end, available: anyOk });
  });
  return slots;
}

// ─── Count available slots (helper for "any" resolution) ───

/**
 * Counts how many 15-min slots are free for a professional in a full day.
 */
function countAvailableSlotsInDay(ctx: DayContext, professional: Professional): number {
  let count = 0;
  forEachSlot(ctx, (start) => {
    const result = canBook({
      service: ctx.service,
      professional,
      dateISO: ctx.dateISO,
      startHHmm: start,
      appointments: ctx.appointments,
      now: ctx.now,
    });
    if (result.ok) count++;
  });
  return count;
}

// ─── "Any professional" resolution ─────────────────────────

/**
 * For "Qualquer profissional": picks the professional with **most**
 * free slots in the day (tie-breaker: alphabetical by name).
 */
export function pickAnyProfessional(ctx: DayContext, startHHmm: string): Professional | null {
  const eligible = getProfessionalsForService(ctx.service.id);

  const withAvailability = eligible
    .filter((p) => {
      const result = canBook({
        service: ctx.service,
        professional: p,
        dateISO: ctx.dateISO,
        startHHmm,
        appointments: ctx.appointments,
        now: ctx.now,
      });
      return result.ok;
    })
    .map((p) => ({
      professional: p,
      availableSlots: countAvailableSlotsInDay(ctx, p),
    }));

  if (withAvailability.length === 0) return null;

  // Sort by most available slots (descending), then alphabetical (ascending)
  withAvailability.sort((a, b) => {
    if (b.availableSlots !== a.availableSlots) {
      return b.availableSlots - a.availableSlots;
    }
    return a.professional.name.localeCompare(b.professional.name, "pt-BR");
  });

  return withAvailability[0].professional;
}
