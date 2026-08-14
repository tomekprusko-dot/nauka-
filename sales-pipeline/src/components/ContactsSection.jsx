import { useState } from "react";

const emptyContact = { name: "", email: "" };

function ContactsSection({ contacts, onAdd, onDelete }) {
  const [form, setForm] = useState(emptyContact);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onAdd({ name: form.name.trim(), email: form.email.trim() });
    setForm(emptyContact);
  }

  return (
    <section className="detail-section">
      <h3>Osoby kontaktowe</h3>

      <form className="inline-form contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Imię i nazwisko"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Adres e-mail"
          value={form.email}
          onChange={handleChange}
        />
        <button type="submit" className="btn-secondary">Dodaj kontakt</button>
      </form>

      {contacts.length === 0 ? (
        <p className="empty-state">Brak osób kontaktowych.</p>
      ) : (
        <ul className="contacts-list">
          {contacts.map((contact) => (
            <li key={contact.id} className="contact-item">
              <div>
                <div className="contact-name">{contact.name}</div>
                <a className="contact-email" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </div>
              <button type="button" onClick={() => onDelete(contact.id)}>
                Usuń
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ContactsSection;
