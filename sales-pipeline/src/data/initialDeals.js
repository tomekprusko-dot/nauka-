// Przykładowe dane startowe - w prawdziwej appce zamiast tego
// dane przyszłyby np. z bazy danych.
const initialDeals = [
  {
    id: 1,
    client: "Firma Kowalski Sp. z o.o.",
    value: 45000,
    stage: "Wysłano ofertę",
    probability: 50,
    closeDate: "2026-09-15",
  },
  {
    id: 2,
    client: "Nowak Industries",
    value: 120000,
    stage: "Oferta zaakceptowana przez klienta",
    probability: 85,
    closeDate: "2026-08-30",
  },
  {
    id: 3,
    client: "TechStart S.A.",
    value: 15000,
    stage: "Pozyskano lead",
    probability: 20,
    closeDate: "2026-10-01",
  },
];

export default initialDeals;
