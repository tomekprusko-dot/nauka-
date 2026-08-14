import { useState } from "react";
import { STAGES } from "../data/stages";
import { LEAD_SOURCES } from "../data/leadSources";

const emptyDeal = {
  client: "",
  value: "",
  stage: "Pozyskano lead",
  probability: "",
  closeDate: "",
  source: "",
};

// editingDeal - jeśli podany, formularz działa w trybie edycji i wypełnia się
// jego danymi. Jeśli null - formularz jest pusty (dodawanie nowego deala).
function DealForm({ editingDeal, presetStage, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    editingDeal
      ? { ...editingDeal, source: editingDeal.source || "" }
      : { ...emptyDeal, stage: presetStage || emptyDeal.stage }
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      ...formData,
      value: Number(formData.value),
      probability: Number(formData.probability),
      source: formData.source || null,
    });
  }

  return (
    <form className="deal-form" onSubmit={handleSubmit}>
      <h2>{editingDeal ? "Edytuj deal" : "Nowy deal"}</h2>

      <label>
        Nazwa klienta
        <input
          type="text"
          name="client"
          value={formData.client}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Wartość (PLN)
        <input
          type="number"
          name="value"
          min="0"
          value={formData.value}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Etap
        <select name="stage" value={formData.stage} onChange={handleChange}>
          {STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
      </label>

      <label>
        Prawdopodobieństwo zamknięcia (%)
        <input
          type="number"
          name="probability"
          min="0"
          max="100"
          value={formData.probability}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Planowana data zamknięcia
        <input
          type="date"
          name="closeDate"
          value={formData.closeDate}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Źródło leada (opcjonalnie)
        <select name="source" value={formData.source} onChange={handleChange}>
          <option value="">— nie wybrano —</option>
          {LEAD_SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </label>

      <div className="form-actions">
        <button type="submit">Zapisz</button>
        <button type="button" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
}

export default DealForm;
