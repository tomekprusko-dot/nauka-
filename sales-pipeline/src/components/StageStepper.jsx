import { STAGES, STAGE_SLUGS } from "../data/stages";

// Pokazuje wszystkie etapy w jednym rzędzie. Kliknięcie etapu
// od razu przenosi do niego deala (bez osobnego przycisku "Zapisz").
function StageStepper({ currentStage, onSelectStage }) {
  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <div className="stage-stepper">
      {STAGES.map((stage, index) => {
        const isActive = stage === currentStage;
        const isPast = index < currentIndex;
        return (
          <button
            key={stage}
            type="button"
            className={`stage-step stage-${STAGE_SLUGS[stage]} ${isActive ? "active" : ""} ${isPast ? "past" : ""}`}
            onClick={() => onSelectStage(stage)}
            disabled={isActive}
          >
            {stage}
          </button>
        );
      })}
    </div>
  );
}

export default StageStepper;
