import StageStepper from "./StageStepper";
import NotesSection from "./NotesSection";
import ContactsSection from "./ContactsSection";
import ActivitiesSection from "./ActivitiesSection";
import { formatCurrency } from "../utils/formatCurrency";

function DealDetail({
  deal,
  editForm,
  onBack,
  onEdit,
  onDelete,
  onChangeStage,
  onAddNote,
  onDeleteNote,
  onAddContact,
  onDeleteContact,
  onAddActivity,
  onToggleActivity,
  onDeleteActivity,
}) {
  return (
    <div className="deal-detail">
      <button type="button" className="back-link" onClick={onBack}>
        ← Wróć do listy
      </button>

      <div className="detail-header">
        <div>
          <h2>{deal.client}</h2>
          <p className="detail-subtitle">
            {formatCurrency(deal.value)} · {deal.probability}% szans · zamknięcie {deal.closeDate}
          </p>
        </div>
        <div className="detail-header-actions">
          <button type="button" className="btn-secondary" onClick={onEdit}>
            Edytuj dane
          </button>
          <button type="button" className="btn-icon danger" onClick={onDelete}>
            Usuń deal
          </button>
        </div>
      </div>

      {editForm}

      <StageStepper currentStage={deal.stage} onSelectStage={onChangeStage} />

      <div className="detail-grid">
        <NotesSection
          notes={deal.notes}
          onAdd={onAddNote}
          onDelete={onDeleteNote}
        />
        <ContactsSection
          contacts={deal.contacts}
          onAdd={onAddContact}
          onDelete={onDeleteContact}
        />
        <ActivitiesSection
          activities={deal.activities}
          onAdd={onAddActivity}
          onToggle={onToggleActivity}
          onDelete={onDeleteActivity}
        />
      </div>
    </div>
  );
}

export default DealDetail;
