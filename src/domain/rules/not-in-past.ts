import type { BookingRule, BookingRuleContext, RuleResult } from "./rule";
import { toMinutes, toDateISO } from "../rules";

/**
 * Regra: O horário não pode estar no passado.
 *
 * Valida:
 *   a) Datas anteriores a hoje são bloqueadas por completo.
 *   b) Se a data é hoje, o horário deve ser posterior ao momento atual.
 */
export const notInPast: BookingRule = {
  id: "not-in-past",
  description: "Horário não está no passado",
  validate: (ctx: BookingRuleContext): RuleResult => {
    const { dateISO, startHHmm, now } = ctx;
    const startMin = toMinutes(startHHmm);
    const todayISO = toDateISO(now);

    // a) Datas passadas
    if (dateISO < todayISO) {
      return { ok: false, reason: "Não é possível agendar em datas passadas." };
    }

    // b) Hoje — horário já passou?
    if (dateISO === todayISO) {
      const nowMin = now.getHours() * 60 + now.getMinutes();
      if (startMin <= nowMin) {
        return { ok: false, reason: "Este horário já passou." };
      }
    }

    return { ok: true };
  },
};
