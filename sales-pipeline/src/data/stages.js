export const STAGES = [
  "Pozyskano lead",
  "Wysłano ofertę",
  "Oferta zaakceptowana przez klienta",
  "Closed Won",
  "Closed Lost",
];

export const CLOSED_STAGES = ["Closed Won", "Closed Lost"];

// CSS nie lubi spacji ani polskich znaków w nazwach klas,
// więc dla każdego etapu trzymamy osobny, bezpieczny "slug".
export const STAGE_SLUGS = {
  "Pozyskano lead": "lead",
  "Wysłano ofertę": "oferta-wyslana",
  "Oferta zaakceptowana przez klienta": "oferta-zaakceptowana",
  "Closed Won": "closed-won",
  "Closed Lost": "closed-lost",
};
