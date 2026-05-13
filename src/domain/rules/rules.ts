export { RulesEngine, type BookingRule, type BookingRuleContext, type RuleResult } from "./engine";

import { RulesEngine } from "./engine";
import { professionalPerformsService } from "./professional-performs-service";
import { noOverlap } from "./no-overlap";
import { businessHours } from "./business-hours";
import { notInPast } from "./not-in-past";

/**
 * Engine pré-configurada com todas as 4 regras de negócio
 * na ordem de validação.
 *
 */
export const bookingEngine = new RulesEngine([
  professionalPerformsService,
  noOverlap,
  businessHours,
  notInPast,
]);
