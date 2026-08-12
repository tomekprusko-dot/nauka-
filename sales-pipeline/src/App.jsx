import { useState } from "react";
import Summary from "./components/Summary";
import DealTable from "./components/DealTable";
import DealForm from "./components/DealForm";
import initialDeals from "./data/initialDeals";
import "./App.css";

function App() {
  const [deals, setDeals] = useState(initialDeals);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const editingDeal = deals.find((deal) => deal.id === editingId) || null;

  function handleAddClick() {
    setEditingId(null);
    setIsFormOpen(true);
  }

  function handleEditClick(id) {
    setEditingId(id);
    setIsFormOpen(true);
  }

  function handleDelete(id) {
    setDeals((prev) => prev.filter((deal) => deal.id !== id));
  }

  function handleSave(dealData) {
    if (editingId === null) {
      const newDeal = { ...dealData, id: Date.now() };
      setDeals((prev) => [...prev, newDeal]);
    } else {
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === editingId ? { ...dealData, id: editingId } : deal
        )
      );
    }
    setIsFormOpen(false);
    setEditingId(null);
  }

  function handleCancel() {
    setIsFormOpen(false);
    setEditingId(null);
  }

  return (
    <div className="app">
      <h1>Pipeline sprzedażowy</h1>

      <Summary deals={deals} />

      {isFormOpen ? (
        <DealForm
          editingDeal={editingDeal}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <button className="add-deal-button" onClick={handleAddClick}>
          + Dodaj deal
        </button>
      )}

      <DealTable deals={deals} onEdit={handleEditClick} onDelete={handleDelete} />
    </div>
  );
}

export default App;
