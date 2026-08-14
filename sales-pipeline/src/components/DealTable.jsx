import { STAGE_SLUGS } from "../data/stages";
import { formatCurrency } from "../utils/formatCurrency";

function DealTable({ deals, onSelect, onEdit, onDelete }) {
  if (deals.length === 0) {
    return <p className="empty-state">Brak deali. Dodaj pierwszy powyżej.</p>;
  }

  return (
    <table className="deal-table">
      <thead>
        <tr>
          <th>Klient</th>
          <th>Wartość</th>
          <th>Etap</th>
          <th>Prawdopodobieństwo</th>
          <th>Planowana data zamknięcia</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {deals.map((deal) => (
          <tr key={deal.id}>
            <td>
              <button type="button" className="client-link" onClick={() => onSelect(deal.id)}>
                {deal.client}
              </button>
            </td>
            <td>{formatCurrency(deal.value)}</td>
            <td>
              <span className={`stage-badge stage-${STAGE_SLUGS[deal.stage]}`}>
                {deal.stage}
              </span>
            </td>
            <td>{deal.probability}%</td>
            <td>{deal.closeDate}</td>
            <td className="actions-cell">
              <button onClick={() => onEdit(deal.id)}>Edytuj</button>
              <button onClick={() => onDelete(deal.id)} className="danger">
                Usuń
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DealTable;
