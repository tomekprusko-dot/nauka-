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
    notes: [
      {
        id: "note-1",
        text: "Klient prosił o wersję z dłuższym okresem wdrożenia.",
        createdAt: "2026-08-01T10:00:00.000Z",
      },
    ],
    contacts: [
      { id: "contact-1", name: "Anna Kowalska", email: "a.kowalska@example.com" },
    ],
    activities: [
      {
        id: "activity-1",
        type: "Telefon",
        description: "Zapytać o decyzję zarządu",
        dueDate: "2026-08-20",
        done: false,
      },
    ],
  },
  {
    id: 2,
    client: "Nowak Industries",
    value: 120000,
    stage: "Oferta zaakceptowana przez klienta",
    probability: 85,
    closeDate: "2026-08-30",
    notes: [],
    contacts: [
      { id: "contact-2", name: "Piotr Nowak", email: "piotr.nowak@example.com" },
    ],
    activities: [],
  },
  {
    id: 3,
    client: "TechStart S.A.",
    value: 15000,
    stage: "Pozyskano lead",
    probability: 20,
    closeDate: "2026-10-01",
    notes: [],
    contacts: [],
    activities: [],
  },
];

export default initialDeals;
