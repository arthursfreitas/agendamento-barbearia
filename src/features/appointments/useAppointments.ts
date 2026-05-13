import { useCallback, useEffect, useState } from "react";
import {
  appointmentRepository,
  emitAppointmentsChanged,
  STORAGE_EVENT,
} from "@/infrastructure/appointmentRepository";
import type { Appointment, DayContext, NewAppointmentInput } from "@/domain/types";
import { getService, getProfessional } from "@/domain/catalog";
import { canBook, fromMinutes, toMinutes, pickAnyProfessional } from "@/domain/rules";

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    setAppointments(appointmentRepository.list());
    const refresh = () => setAppointments(appointmentRepository.list());
    window.addEventListener(STORAGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STORAGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const create = useCallback(
    (input: NewAppointmentInput): { ok: true; appointment: Appointment } | { ok: false; reason: string } => {
      const service = getService(input.serviceId);
      if (!service) return { ok: false, reason: "Serviço inválido." };

      const current = appointmentRepository.list();
      let professional = getProfessional(input.professionalId) ?? null;

      if (input.professionalId === "any" || !professional) {
        const ctx: DayContext = {
          service,
          dateISO: input.dateISO,
          appointments: current,
          now: new Date(),
        };
        professional = pickAnyProfessional(ctx, input.start);
        if (!professional) return { ok: false, reason: "Nenhum profissional disponível neste horário." };
      }

      const result = canBook({
        service,
        professional,
        dateISO: input.dateISO,
        startHHmm: input.start,
        appointments: current,
      });
      if (!result.ok) return { ok: false, reason: result.reason ?? "Horário indisponível." };

      const appt: Appointment = {
        id: crypto.randomUUID(),
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        serviceId: input.serviceId,
        professionalId: professional.id,
        dateISO: input.dateISO,
        start: input.start,
        end: fromMinutes(toMinutes(input.start) + service.durationMin),
        createdAt: new Date().toISOString(),
      };
      appointmentRepository.add(appt);
      emitAppointmentsChanged();
      setAppointments(appointmentRepository.list());
      return { ok: true, appointment: appt };
    },
    [],
  );

  const cancel = useCallback((id: string) => {
    appointmentRepository.remove(id);
    emitAppointmentsChanged();
    setAppointments(appointmentRepository.list());
  }, []);

  return { appointments, create, cancel };
}
