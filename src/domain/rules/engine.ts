import type { BookingRule, BookingRuleContext, RuleResult } from "./rule";

export { type BookingRule, type BookingRuleContext, type RuleResult };

/**
 * Orquestrador de regras de negócio.
 *
 * Recebe uma lista de regras e as executa em sequência.
 * Retorna o resultado da primeira regra que falhar, ou `{ ok: true }`
 * se todas passarem.
 */
export class RulesEngine {
  private rules: BookingRule[];

  constructor(rules: BookingRule[]) {
    this.rules = rules;
  }

  /**
   * Executa todas as regras na ordem definida.
   * A primeira regra que retornar `{ ok: false }` interrompe a execução
   * e retorna o resultado com a justificativa.
   */
  validate(ctx: BookingRuleContext): RuleResult {
    for (const rule of this.rules) {
      const result = rule.validate(ctx);
      if (!result.ok) {
        return result;
      }
    }
    return { ok: true };
  }
}
