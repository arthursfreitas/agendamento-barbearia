import type { BookingRule, BookingRuleContext, RuleResult } from "./rule";
import { toMinutes } from "../rules";
import { BUSINESS_HOURS } from "../catalog";
import { overlaps } from "./overlap-utils";

/**
 * Regra: O agendamento deve respeitar o horário comercial e o intervalo de almoço.
 *
 * Valida:
 *   a) O serviço deve terminar até as 19:00 (horário de fechamento).
 *   b) O serviço não pode cruzar o intervalo de almoço (12:00–13:00).
 *
 * Horário de funcionamento: 09:00–19:00, com slots de 15 em 15 minutos.
 */
export const businessHours: BookingRule = {
  id: "business-hours",
  description: "Horário comercial (09:00–19:00) e sem conflito com almoço (12:00–13:00)",
  validate: (ctx: BookingRuleContext): RuleResult => {
    const { startHHmm, service } = ctx;
    const startMin = toMinutes(startHHmm);
    const endMin = startMin + service.durationMin;

    // a) Dentro do horário comercial
    if (startMin < BUSINESS_HOURS.openMin || endMin > BUSINESS_HOURS.closeMin) {
      return {
        ok: false,
        reason: "O serviço ultrapassa o horário de funcionamento (09:00–19:00).",
      };
    }

    // b) Sem conflito com almoço
    if (overlaps(startMin, endMin, BUSINESS_HOURS.lunchStartMin, BUSINESS_HOURS.lunchEndMin)) {
      return {
        ok: false,
        reason: "O serviço conflita com o horário de almoço (12:00–13:00).",
      };
    }

    return { ok: true };
  },
};
