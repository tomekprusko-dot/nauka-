import { useEffect, useState } from "react";
import Summary from "./components/Summary";
import MonthlyTargetCard from "./components/MonthlyTargetCard";
import TodayPanel from "./components/TodayPanel";
import SearchSortBar from "./components/SearchSortBar";
import DealTable from "./components/DealTable";
import BoardView from "./components/BoardView";
import StatsView from "./components/StatsView";
import DealForm from "./components/DealForm";
import DealDetail from "./components/DealDetail";
import LostReasonModal from "./components/LostReasonModal";
import initialDeals from "./data/initialDeals";
import { SORT_OPTIONS } from "./data/sortOptions";
import { loadDeals, saveDeals } from "./utils/dealsStorage";
import { loadTarget, saveTarget } from "./utils/targetStorage";
import { getMonthlyRealization } from "./utils/salesStats";
import { sortDeals } from "./utils/sortDeals";
import { createId } from "./utils/createId";
import "./App.css";

function App() {
  // Funkcja w useState() uruchamia się tylko raz, przy pierwszym renderze -
  // dzięki temu odczyt z localStorage nie powtarza się przy każdej zmianie stanu.
  const [deals, setDeals] = useState(() => loadDeals(initialDeals));
  const [monthlyTarget, setMonthlyTarget] = useState(() => loadTarget());
  const [viewMode, setViewMode] = useState("board");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addStagePreset, setAddStagePreset] = useState(null);
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [pendingLostDeal, setPendingLostDeal] = useState(null);

  const editingDeal = deals.find((deal) => deal.id === editingId) || null;
  const selectedDeal = deals.find((deal) => deal.id === selectedDealId) || null;

  const visibleDeals = sortDeals(
    deals.filter((deal) => deal.client.toLowerCase().includes(search.trim().toLowerCase())),
    sortBy
  );

  // Zapisuje deale/cel do localStorage za każdym razem, gdy się zmienią.
  useEffect(() => {
    saveDeals(deals);
  }, [deals]);

  useEffect(() => {
    saveTarget(monthlyTarget);
  }, [monthlyTarget]);

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

  // Przesunięcie na "Closed Lost" (przez pasek etapów albo przeciągnięcie na
  // tablicy) nie zmienia etapu od razu - najpierw pyta o powód, w modalu.
  function requestStageChange(dealId, stage) {
    const deal = deals.find((d) => d.id === dealId);
    if (stage === "Closed Lost" && deal && deal.stage !== "Closed Lost") {
      setPendingLostDeal({ id: dealId, client: deal.client, fromStage: deal.stage });
      return;
    }
    handleChangeStage(dealId, stage);
  }

  function confirmLostReason(reason) {
    if (!pendingLostDeal) return;
    updateDeal(pendingLostDeal.id, (deal) => ({
      ...deal,
      stage: "Closed Lost",
      lostReason: reason,
      lostFromStage: pendingLostDeal.fromStage,
    }));
    setPendingLostDeal(null);
  }

  function cancelLostReason() {
    setPendingLostDeal(null);
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

  const lostReasonModal = pendingLostDeal && (
    <LostReasonModal
      dealClient={pendingLostDeal.client}
      onConfirm={confirmLostReason}
      onCancel={cancelLostReason}
    />
  );

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
          onChangeStage={(stage) => requestStageChange(selectedDeal.id, stage)}
          onAddNote={(text) => handleAddNote(selectedDeal.id, text)}
          onDeleteNote={(noteId) => handleDeleteNote(selectedDeal.id, noteId)}
          onAddContact={(contact) => handleAddContact(selectedDeal.id, contact)}
          onDeleteContact={(contactId) => handleDeleteContact(selectedDeal.id, contactId)}
          onAddActivity={(activity) => handleAddActivity(selectedDeal.id, activity)}
          onToggleActivity={(activityId) => handleToggleActivity(selectedDeal.id, activityId)}
          onDeleteActivity={(activityId) => handleDeleteActivity(selectedDeal.id, activityId)}
        />
        {lostReasonModal}
      </div>
    );
  }

  return (
    <div className="app">
      <h1>Pipeline sprzedażowy</h1>

      <Summary deals={deals}>
        <MonthlyTargetCard
          target={monthlyTarget}
          realization={getMonthlyRealization(deals)}
          onChangeTarget={setMonthlyTarget}
        />
      </Summary>

      <TodayPanel deals={deals} onSelectDeal={setSelectedDealId} onToggleActivity={handleToggleActivity} />

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
          <button
            type="button"
            className={viewMode === "stats" ? "active" : ""}
            onClick={() => setViewMode("stats")}
          >
            Statystyki
          </button>
        </div>

        {!isFormOpen && (
          <button className="add-deal-button" onClick={() => handleAddClick()}>
            + Dodaj deal
          </button>
        )}
      </div>

      {viewMode !== "stats" && (
        <SearchSortBar search={search} onSearchChange={setSearch} sortBy={sortBy} onSortChange={setSortBy} />
      )}

      {isFormOpen && (
        <DealForm
          editingDeal={editingDeal}
          presetStage={addStagePreset}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {viewMode === "board" && (
        <BoardView
          deals={visibleDeals}
          onSelect={setSelectedDealId}
          onMoveStage={requestStageChange}
          onAddToStage={handleAddClick}
        />
      )}

      {viewMode === "table" && (
        <DealTable
          deals={visibleDeals}
          onSelect={setSelectedDealId}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}

      {viewMode === "stats" && <StatsView deals={deals} />}

      {lostReasonModal}
    </div>
  );
}

export default App;
