import { getFunnelStats } from "../utils/salesStats";
import { formatCurrency } from "../utils/formatCurrency";

function StatsView({ deals }) {
  const stats = getFunnelStats(deals);
  const maxStageValue = Math.max(1, ...stats.activeByStage.map((s) => s.value));
  const maxLostCount = Math.max(1, ...Object.values(stats.lostByReason));

  return (
    <div className="stats-view">
      <div className="summary">
        <div className="summary-card">
          <span className="summary-label">Win rate</span>
          <span className="summary-value">
            {stats.winRate === null ? "—" : `${stats.winRate.toFixed(0)}%`}
          </span>
          <p className="stats-sub">{stats.wonCount} wygranych / {stats.lostCount} przegranych</p>
        </div>
        <div className="summary-card">
          <span className="summary-label">Średnia wartość wygranego deala</span>
          <span className="summary-value">{formatCurrency(stats.avgWonValue)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Łączna wartość wygranych</span>
          <span className="summary-value">{formatCurrency(stats.totalWonValue)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Aktywne deale</span>
          <span className="summary-value">{stats.activeCount}</span>
        </div>
      </div>

      <div className="stats-grid">
        <section className="detail-section">
          <h3>Aktywne deale wg etapu</h3>
          {stats.activeByStage.every((s) => s.count === 0) ? (
            <p className="empty-state small">Brak aktywnych deali.</p>
          ) : (
            <ul className="stats-bar-list">
              {stats.activeByStage.map((s) => (
                <li key={s.stage} className="stats-bar-row">
                  <div className="stats-bar-label">
                    <span>{s.stage}</span>
                    <span>{s.count} · {formatCurrency(s.value)}</span>
                  </div>
                  <div className="stats-bar-track">
                    <div className="stats-bar-fill" style={{ width: `${(s.value / maxStageValue) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="detail-section">
          <h3>Powody przegranych</h3>
          {Object.keys(stats.lostByReason).length === 0 ? (
            <p className="empty-state small">Brak przegranych deali - trzymaj tak dalej.</p>
          ) : (
            <ul className="stats-bar-list">
              {Object.entries(stats.lostByReason)
                .sort((a, b) => b[1] - a[1])
                .map(([reason, count]) => (
                  <li key={reason} className="stats-bar-row">
                    <div className="stats-bar-label">
                      <span>{reason}</span>
                      <span>{count}</span>
                    </div>
                    <div className="stats-bar-track">
                      <div
                        className="stats-bar-fill lost"
                        style={{ width: `${(count / maxLostCount) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default StatsView;
