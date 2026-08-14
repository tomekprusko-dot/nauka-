import { STAGES, CLOSED_STAGES } from "../data/stages";

function isSameMonth(dateString, reference) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  );
}

// Ile udało się zamknąć (wygrać) w bieżącym miesiącu kalendarzowym -
// to porównujemy z celem miesięcznym.
export function getMonthlyRealization(deals, referenceDate = new Date()) {
  return deals
    .filter((deal) => deal.stage === "Closed Won" && isSameMonth(deal.closeDate, referenceDate))
    .reduce((sum, deal) => sum + deal.value, 0);
}

export function getFunnelStats(deals) {
  const activeDeals = deals.filter((deal) => !CLOSED_STAGES.includes(deal.stage));
  const wonDeals = deals.filter((deal) => deal.stage === "Closed Won");
  const lostDeals = deals.filter((deal) => deal.stage === "Closed Lost");

  const closedCount = wonDeals.length + lostDeals.length;
  const winRate = closedCount === 0 ? null : (wonDeals.length / closedCount) * 100;

  const totalWonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  const avgWonValue = wonDeals.length === 0 ? 0 : totalWonValue / wonDeals.length;

  const activeByStage = STAGES.filter((stage) => !CLOSED_STAGES.includes(stage)).map((stage) => {
    const stageDeals = activeDeals.filter((deal) => deal.stage === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
    };
  });

  const lostByReason = {};
  lostDeals.forEach((deal) => {
    const reason = deal.lostReason || "Nie podano";
    lostByReason[reason] = (lostByReason[reason] || 0) + 1;
  });

  return {
    activeCount: activeDeals.length,
    wonCount: wonDeals.length,
    lostCount: lostDeals.length,
    winRate,
    totalWonValue,
    avgWonValue,
    activeByStage,
    lostByReason,
  };
}
