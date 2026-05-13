import type { Appointment, Professional, Service } from "../types";

/**
 * Resultado da validação de uma regra de negócio.
 */
export interface RuleResult {
  ok: boolean;
  reason?: string;
}

/**
 * Interface base para todas as regras de negócio.
 *
 * Cada regra é uma função pura e independente,
 * testável isoladamente sem dependências externas.
 */
export interface BookingRule {
  /** Identificador único da regra */
  id: string;
  /** Descrição legível da regra */
  description: string;
  /** Função de validação pura */
  validate: (ctx: BookingRuleContext) => RuleResult;
}

/**
 * Contexto compartilhado entre todas as regras de agendamento.
 */
export interface BookingRuleContext {
  service: Service;
  professional: Professional;
  dateISO: string;
  startHHmm: string;
  appointments: Appointment[];
  now: Date;
}
