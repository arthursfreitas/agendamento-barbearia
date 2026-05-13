import type { Professional, Service } from "./types";

export const SERVICES: Service[] = [
  {
    id: "corte",
    name: "Corte de Cabelo",
    description: "Corte clássico ou moderno feito com tesoura e máquina.",
    durationMin: 30,
    priceCents: 4500,
  },
  {
    id: "barba",
    name: "Barba",
    description: "Modelagem completa com toalha quente e finalização.",
    durationMin: 20,
    priceCents: 3000,
  },
  {
    id: "corte-barba",
    name: "Corte + Barba",
    description: "Combo completo de corte e barba alinhados.",
    durationMin: 45,
    priceCents: 6500,
  },
  {
    id: "hidratacao",
    name: "Hidratação",
    description: "Tratamento hidratante para cabelos ressecados.",
    durationMin: 40,
    priceCents: 5500,
  },
  {
    id: "corte-hidratacao",
    name: "Corte + Hidratação",
    description: "Corte preciso seguido de hidratação profunda.",
    durationMin: 60,
    priceCents: 8000,
  },
];

export const PROFESSIONALS: Professional[] = [
  {
    id: "carlos",
    name: "Carlos Silva",
    role: "Barbeiro Mestre",
    initials: "CS",
    serviceIds: ["corte", "barba", "corte-barba"],
  },
  {
    id: "joao",
    name: "João Pereira",
    role: "Barbeiro",
    initials: "JP",
    serviceIds: ["corte", "barba", "hidratacao", "corte-hidratacao"],
  },
  {
    id: "marina",
    name: "Marina Costa",
    role: "Especialista em Cabelo",
    initials: "MC",
    serviceIds: ["corte", "hidratacao"],
  },
];

export const BUSINESS_HOURS = {
  openMin: 9 * 60, // 09:00
  closeMin: 19 * 60, // 19:00
  lunchStartMin: 12 * 60, // 12:00
  lunchEndMin: 13 * 60, // 13:00
  slotStepMin: 15,
} as const;

export const getService = (id: string): Service | undefined =>
  SERVICES.find((s) => s.id === id);

export const getProfessional = (id: string): Professional | undefined =>
  PROFESSIONALS.find((p) => p.id === id);

export const getProfessionalsForService = (serviceId: string): Professional[] =>
  PROFESSIONALS.filter((p) =>
    p.serviceIds.includes(serviceId as Professional["serviceIds"][number]),
  );
