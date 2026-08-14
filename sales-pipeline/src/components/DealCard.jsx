import { formatCurrency } from "../utils/formatCurrency";

function DealCard({ deal, onSelect, onDragStart }) {
  return (
    <div
      className="deal-card"
      draggable
      onDragStart={(event) => onDragStart(event, deal.id)}
      onClick={() => onSelect(deal.id)}
    >
      <div className="deal-card-client">{deal.client}</div>
      <div className="deal-card-value">{formatCurrency(deal.value)}</div>
      <div className="deal-card-meta">
        {deal.probability}% · {deal.closeDate}
      </div>
    </div>
  );
}

export default DealCard;
