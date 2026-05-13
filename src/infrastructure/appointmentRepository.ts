// localStorage-backed repository simulating a backend.
import type { Appointment } from "@/domain/types";

const STORAGE_KEY = "barbearia.appointments.v1";

const isBrowser = typeof window !== "undefined";

export const appointmentRepository = {
  list(): Appointment[] {
    if (!isBrowser) return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Appointment[]) : [];
    } catch {
      return [];
    }
  },
  saveAll(appointments: Appointment[]): void {
    if (!isBrowser) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  },
  add(appt: Appointment): Appointment[] {
    const next = [...this.list(), appt];
    this.saveAll(next);
    return next;
  },
  remove(id: string): Appointment[] {
    const next = this.list().filter((a) => a.id !== id);
    this.saveAll(next);
    return next;
  },
};

export const STORAGE_EVENT = "barbearia:appointments-changed";

export const emitAppointmentsChanged = (): void => {
  if (isBrowser) window.dispatchEvent(new Event(STORAGE_EVENT));
};
