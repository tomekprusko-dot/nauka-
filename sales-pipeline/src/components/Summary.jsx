import { CLOSED_STAGES } from "../data/stages";
import { formatCurrency } from "../utils/formatCurrency";

// "Aktywne" deale to takie, które nie są jeszcze zamknięte
// (ani wygrane, ani przegrane).
function Summary({ deals }) {
  const activeDeals = deals.filter(
    (deal) => !CLOSED_STAGES.includes(deal.stage)
  );

  const totalValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);

  const weightedValue = activeDeals.reduce(
    (sum, deal) => sum + (deal.value * deal.probability) / 100,
    0
  );

  return (
    <div className="summary">
      <div className="summary-card">
        <span className="summary-label">Łączna wartość aktywnych deali</span>
        <span className="summary-value">{formatCurrency(totalValue)}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Wartość ważona prawdopodobieństwem</span>
        <span className="summary-value">{formatCurrency(weightedValue)}</span>
      </div>
    </div>
  );
}

export default Summary;
