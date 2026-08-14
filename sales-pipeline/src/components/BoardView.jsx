import { useState } from "react";
import { STAGES, CLOSED_STAGES, STAGE_SLUGS } from "../data/stages";
import { formatCurrency } from "../utils/formatCurrency";
import DealCard from "./DealCard";

function BoardView({ deals, onSelect, onMoveStage, onAddToStage }) {
  const [showClosed, setShowClosed] = useState(false);
  const [dragOverStage, setDragOverStage] = useState(null);

  const visibleStages = showClosed
    ? STAGES
    : STAGES.filter((stage) => !CLOSED_STAGES.includes(stage));

  function handleDragStart(event, dealId) {
    event.dataTransfer.setData("text/plain", dealId);
  }

  function handleDrop(event, stage) {
    event.preventDefault();
    const dealId = event.dataTransfer.getData("text/plain");
    onMoveStage(dealId, stage);
    setDragOverStage(null);
  }

  return (
    <div>
      <div className="board-toolbar">
        <label className="show-closed-toggle">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(event) => setShowClosed(event.target.checked)}
          />
          Pokaż zamknięte etapy
        </label>
      </div>

      <div className="board">
        {visibleStages.map((stage) => {
          const stageDeals = deals.filter((deal) => deal.stage === stage);
          const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);

          return (
            <div
              key={stage}
              className={`board-column ${dragOverStage === stage ? "drag-over" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage((current) => (current === stage ? null : current))}
              onDrop={(event) => handleDrop(event, stage)}
            >
              <div className={`board-column-header stage-${STAGE_SLUGS[stage]}`}>
                <div>
                  <div className="board-column-title">{stage}</div>
                  <div className="board-column-value">{formatCurrency(stageValue)}</div>
                </div>
                <button
                  type="button"
                  className="board-add-button"
                  onClick={() => onAddToStage(stage)}
                  title={`Dodaj deal w etapie ${stage}`}
                >
                  +
                </button>
              </div>

              <div className="board-column-cards">
                {stageDeals.length === 0 ? (
                  <p className="empty-state small">Brak deali na tym etapie.</p>
                ) : (
                  stageDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onSelect={onSelect}
                      onDragStart={handleDragStart}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BoardView;
