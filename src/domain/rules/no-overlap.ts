import type { BookingRule, BookingRuleContext, RuleResult } from "./rule";
import { toMinutes } from "../rules";
import { overlaps } from "./overlap-utils";

/**
 * Regra: O horário não pode conflitar com agendamentos existentes
 * do mesmo profissional na mesma data.
 *
 * Verifica se o intervalo `[startMin, startMin + duração]` sobrepõe
 * qualquer appointment já registrado para o profissional na data.
 */
export const noOverlap: BookingRule = {
  id: "no-overlap",
  description: "Sem sobreposição com outros agendamentos do mesmo profissional no mesmo dia",
  validate: (ctx: BookingRuleContext): RuleResult => {
    const { professional, dateISO, startHHmm, appointments, service } = ctx;
    const startMin = toMinutes(startHHmm);
    const endMin = startMin + service.durationMin;

    const dayAppointments = appointments.filter(
      (a) => a.professionalId === professional.id && a.dateISO === dateISO,
    );

    for (const a of dayAppointments) {
      const aStart = toMinutes(a.start);
      const aEnd = toMinutes(a.end);
      if (overlaps(startMin, endMin, aStart, aEnd)) {
        return {
          ok: false,
          reason: "Horário indisponível para este profissional.",
        };
      }
    }

    return { ok: true };
  },
};
