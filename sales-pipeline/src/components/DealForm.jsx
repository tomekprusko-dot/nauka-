import { useState } from "react";
import { STAGES } from "../data/stages";

const emptyDeal = {
  client: "",
  value: "",
  stage: "Prospecting",
  probability: "",
  closeDate: "",
};

// editingDeal - jeśli podany, formularz działa w trybie edycji i wypełnia się
// jego danymi. Jeśli null - formularz jest pusty (dodawanie nowego deala).
function DealForm({ editingDeal, onSave, onCancel }) {
  const [formData, setFormData] = useState(editingDeal || emptyDeal);

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
