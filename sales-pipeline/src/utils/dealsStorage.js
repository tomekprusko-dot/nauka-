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

export function loadDeals(fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const deals = JSON.parse(raw);
    return deals.map((deal) => ({ ...deal, stage: migrateStage(deal.stage) }));
  } catch {
    return fallback;
  }
}

export function saveDeals(deals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}
