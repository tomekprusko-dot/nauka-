function getTodayItems(deals) {
  const today = new Date().toISOString().slice(0, 10);
  const items = [];

  deals.forEach((deal) => {
    deal.activities.forEach((activity) => {
      if (!activity.done && activity.dueDate && activity.dueDate <= today) {
        items.push({
          ...activity,
          dealId: deal.id,
          client: deal.client,
          overdue: activity.dueDate < today,
        });
      }
    });
  });

  return items.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

function TodayPanel({ deals, onSelectDeal, onToggleActivity }) {
  const items = getTodayItems(deals);

  if (items.length === 0) {
    return (
      <div className="today-panel today-panel-empty">
        ✅ Brak zaległych i dzisiejszych działań. Dobra robota.
      </div>
    );
  }

  return (
    <div className="today-panel">
      <h2 className="section-title">Co dziś do zrobienia ({items.length})</h2>
      <ul className="today-list">
        {items.map((item) => (
          <li key={`${item.dealId}-${item.id}`} className={`today-item ${item.overdue ? "overdue" : ""}`}>
            <input
              type="checkbox"
              checked={false}
              onChange={() => onToggleActivity(item.dealId, item.id)}
            />
            <span className="today-badge">{item.overdue ? "Zaległe" : "Dziś"}</span>
            <span className="today-type">{item.type}</span>
            <span className="today-description">{item.description}</span>
            <button type="button" className="today-client" onClick={() => onSelectDeal(item.dealId)}>
              {item.client}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodayPanel;
