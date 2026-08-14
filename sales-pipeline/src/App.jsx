import { useEffect, useState } from "react";
import Summary from "./components/Summary";
import DealTable from "./components/DealTable";
import BoardView from "./components/BoardView";
import DealForm from "./components/DealForm";
import DealDetail from "./components/DealDetail";
import initialDeals from "./data/initialDeals";
import { loadDeals, saveDeals } from "./utils/dealsStorage";
import { createId } from "./utils/createId";
import "./App.css";

function App() {
  // Funkcja w useState() uruchamia się tylko raz, przy pierwszym renderze -
  // dzięki temu odczyt z localStorage nie powtarza się przy każdej zmianie stanu.
  const [deals, setDeals] = useState(() => loadDeals(initialDeals));
  const [viewMode, setViewMode] = useState("board");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addStagePreset, setAddStagePreset] = useState(null);
  const [selectedDealId, setSelectedDealId] = useState(null);

  const editingDeal = deals.find((deal) => deal.id === editingId) || null;
  const selectedDeal = deals.find((deal) => deal.id === selectedDealId) || null;

  // Zapisuje deale do localStorage za każdym razem, gdy lista się zmieni.
  useEffect(() => {
    saveDeals(deals);
  }, [deals]);

  // Wspólna funkcja do modyfikowania jednego deala - reszta funkcji
  // (notatki, kontakty, działania, etap) korzysta z niej zamiast powtarzać ten sam kod.
  function updateDeal(id, updater) {
    setDeals((prev) => prev.map((deal) => (deal.id === id ? updater(deal) : deal)));
  }

  function handleAddClick(stage) {
    setEditingId(null);
    setAddStagePreset(stage || null);
    setIsFormOpen(true);
  }

  function handleEditClick(id) {
    setEditingId(id);
    setIsFormOpen(true);
  }

  function handleDelete(id) {
    setDeals((prev) => prev.filter((deal) => deal.id !== id));
    if (selectedDealId === id) setSelectedDealId(null);
  }

  function handleSave(dealData) {
    if (editingId === null) {
      const newDeal = {
        ...dealData,
        id: createId(),
        notes: [],
        contacts: [],
        activities: [],
      };
      setDeals((prev) => [...prev, newDeal]);
    } else {
      // Rozkładamy najpierw istniejącego deala, a dopiero na wierzch nowe dane
      // z formularza - dzięki temu notatki/kontakty/działania zostają nietknięte.
      updateDeal(editingId, (deal) => ({ ...deal, ...dealData }));
    }
    setIsFormOpen(false);
    setEditingId(null);
    setAddStagePreset(null);
  }

  function handleCancel() {
    setIsFormOpen(false);
    setEditingId(null);
    setAddStagePreset(null);
  }

  function handleChangeStage(dealId, stage) {
    updateDeal(dealId, (deal) => ({ ...deal, stage }));
  }

  function handleAddNote(dealId, text) {
    const note = { id: createId(), text, createdAt: new Date().toISOString() };
    updateDeal(dealId, (deal) => ({ ...deal, notes: [...deal.notes, note] }));
  }

  function handleDeleteNote(dealId, noteId) {
    updateDeal(dealId, (deal) => ({
      ...deal,
      notes: deal.notes.filter((note) => note.id !== noteId),
    }));
  }

  function handleAddContact(dealId, contact) {
    updateDeal(dealId, (deal) => ({
      ...deal,
      contacts: [...deal.contacts, { id: createId(), ...contact }],
    }));
  }

  function handleDeleteContact(dealId, contactId) {
    updateDeal(dealId, (deal) => ({
      ...deal,
      contacts: deal.contacts.filter((contact) => contact.id !== contactId),
    }));
  }

  function handleAddActivity(dealId, activity) {
    updateDeal(dealId, (deal) => ({
      ...deal,
      activities: [...deal.activities, { id: createId(), done: false, ...activity }],
    }));
  }

  function handleToggleActivity(dealId, activityId) {
    updateDeal(dealId, (deal) => ({
      ...deal,
      activities: deal.activities.map((activity) =>
        activity.id === activityId ? { ...activity, done: !activity.done } : activity
      ),
    }));
  }

  function handleDeleteActivity(dealId, activityId) {
    updateDeal(dealId, (deal) => ({
      ...deal,
      activities: deal.activities.filter((activity) => activity.id !== activityId),
    }));
  }

  if (selectedDeal) {
    return (
      <div className="app">
        <DealDetail
          deal={selectedDeal}
          editForm={
            isFormOpen && (
              <DealForm
                editingDeal={editingDeal}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )
          }
          onBack={() => setSelectedDealId(null)}
          onEdit={() => handleEditClick(selectedDeal.id)}
          onDelete={() => handleDelete(selectedDeal.id)}
          onChangeStage={(stage) => handleChangeStage(selectedDeal.id, stage)}
          onAddNote={(text) => handleAddNote(selectedDeal.id, text)}
          onDeleteNote={(noteId) => handleDeleteNote(selectedDeal.id, noteId)}
          onAddContact={(contact) => handleAddContact(selectedDeal.id, contact)}
          onDeleteContact={(contactId) => handleDeleteContact(selectedDeal.id, contactId)}
          onAddActivity={(activity) => handleAddActivity(selectedDeal.id, activity)}
          onToggleActivity={(activityId) => handleToggleActivity(selectedDeal.id, activityId)}
          onDeleteActivity={(activityId) => handleDeleteActivity(selectedDeal.id, activityId)}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Pipeline sprzedażowy</h1>

      <Summary deals={deals} />

      <div className="main-toolbar">
        <div className="view-switch">
          <button
            type="button"
            className={viewMode === "board" ? "active" : ""}
            onClick={() => setViewMode("board")}
          >
            Tablica
          </button>
          <button
            type="button"
            className={viewMode === "table" ? "active" : ""}
            onClick={() => setViewMode("table")}
          >
            Lista
          </button>
        </div>

        {!isFormOpen && (
          <button className="add-deal-button" onClick={() => handleAddClick()}>
            + Dodaj deal
          </button>
        )}
      </div>

      {isFormOpen && (
        <DealForm
          editingDeal={editingDeal}
          presetStage={addStagePreset}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {viewMode === "board" ? (
        <BoardView
          deals={deals}
          onSelect={setSelectedDealId}
          onMoveStage={handleChangeStage}
          onAddToStage={handleAddClick}
        />
      ) : (
        <DealTable
          deals={deals}
          onSelect={setSelectedDealId}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default App;
