import { useState } from "react";
import { ACTIVITY_TYPES } from "../data/activityTypes";

const emptyActivity = { type: ACTIVITY_TYPES[0], description: "", dueDate: "" };

function isOverdue(activity) {
  if (activity.done || !activity.dueDate) return false;
  const today = new Date().toISOString().slice(0, 10);
  return activity.dueDate < today;
}

function ActivitiesSection({ activities, onAdd, onToggle, onDelete }) {
  const [form, setForm] = useState(emptyActivity);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.description.trim() || !form.dueDate) return;
    onAdd({ ...form, description: form.description.trim() });
    setForm(emptyActivity);
  }

  const sorted = activities
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <section className="detail-section">
      <h3>Planowane działania</h3>

      <form className="inline-form activity-form" onSubmit={handleSubmit}>
        <select name="type" value={form.type} onChange={handleChange}>
          {ACTIVITY_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          type="text"
          name="description"
          placeholder="Co trzeba zrobić?"
          value={form.description}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
        />
        <button type="submit" className="btn-secondary">Zaplanuj</button>
      </form>

      {sorted.length === 0 ? (
        <p className="empty-state">Brak zaplanowanych działań.</p>
      ) : (
        <ul className="activities-list">
          {sorted.map((activity) => (
            <li
              key={activity.id}
              className={`activity-item ${activity.done ? "done" : ""} ${isOverdue(activity) ? "overdue" : ""}`}
            >
              <label className="activity-checkbox">
                <input
                  type="checkbox"
                  checked={activity.done}
                  onChange={() => onToggle(activity.id)}
                />
                <span className="activity-type">{activity.type}</span>
                <span className="activity-description">{activity.description}</span>
                <span className="activity-date">{activity.dueDate}</span>
              </label>
              <button type="button" onClick={() => onDelete(activity.id)}>
                Usuń
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ActivitiesSection;
