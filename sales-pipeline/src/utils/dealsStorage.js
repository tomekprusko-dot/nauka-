const STORAGE_KEY = "sales-pipeline-deals";

// Mapowanie starych nazw etapów na nowe - żeby deale zapisane
// przed zmianą lejka sprzedażowego nie "zgubiły" swojego etapu.
const STAGE_MIGRATION = {
  Prospecting: "Pozyskano lead",
  Demo: "Wysłano ofertę",
  Negocjacje: "Oferta zaakceptowana przez klienta",
};

function migrateStage(stage) {
  return STAGE_MIGRATION[stage] || stage;
}

// Deale zapisane przed dodaniem notatek/kontaktów/działań nie mają tych pól -
// dopisujemy puste listy, żeby reszta appki mogła zakładać, że zawsze istnieją.
function withDefaults(deal) {
  return {
    notes: [],
    contacts: [],
    activities: [],
    source: null,
    lostReason: null,
    lostFromStage: null,
    ...deal,
    // Przeciąganie kart (drag & drop) przekazuje id zawsze jako tekst,
    // więc wymuszamy tu String() - inaczej stare, liczbowe id (np. z
    // przykładowych danych) nigdy nie dopasuje się przy porównaniu ===.
    id: String(deal.id),
    stage: migrateStage(deal.stage),
  };
}

export function loadDeals(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const deals = raw ? JSON.parse(raw) : fallback;
    return deals.map(withDefaults);
  } catch {
    return fallback.map(withDefaults);
  }
}

export function saveDeals(deals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}
