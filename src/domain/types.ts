export type ServiceId = "corte" | "barba" | "corte-barba" | "hidratacao" | "corte-hidratacao";

export interface Service {
  id: ServiceId;
  name: string;
  description: string;
  durationMin: number;
  priceCents: number;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  serviceIds: ServiceId[];
  initials: string;
}

/** Stored appointment. `dateISO` is "YYYY-MM-DD"; `start`/`end` are "HH:mm". */
export interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: ServiceId;
  professionalId: string;
  dateISO: string;
  start: string;
  end: string;
  createdAt: string;
}

export interface NewAppointmentInput {
  customerName: string;
  customerPhone: string;
  serviceId: ServiceId;
  professionalId: string; // "any" allowed at UI layer; resolved before persisting
  dateISO: string;
  start: string;
}

export interface TimeSlot {
  start: string; // "HH:mm"
  end: string;
  available: boolean;
  reason?: string;
}

/** Context object grouping all day-level data for availability functions. */
export interface DayContext {
  service: Service;
  dateISO: string;
  appointments: Appointment[];
  now: Date;
}
