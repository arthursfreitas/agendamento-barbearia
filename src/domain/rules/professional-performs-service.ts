import type { BookingRule, BookingRuleContext, RuleResult } from "./rule";
import type { Professional } from "../types";

/**
 * Regra: O profissional selecionado deve oferecer o serviço escolhido.
 *
 * Verifica se `service.id` está presente em `professional.serviceIds`.
 */
export const professionalPerformsService: BookingRule = {
  id: "professional-performs-service",
  description: "Profissional realiza o serviço selecionado",
  validate: (ctx: BookingRuleContext): RuleResult => {
    const { service, professional } = ctx;

    if (!professional.serviceIds.includes(service.id as Professional["serviceIds"][number])) {
      return {
        ok: false,
        reason: "Este profissional não realiza o serviço selecionado.",
      };
    }

    return { ok: true };
  },
};
