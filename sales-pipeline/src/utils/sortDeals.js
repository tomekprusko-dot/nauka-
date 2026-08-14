export function sortDeals(deals, sortBy) {
  const sorted = [...deals];

  if (sortBy === "closeDate-asc") {
    sorted.sort((a, b) => a.closeDate.localeCompare(b.closeDate));
  } else if (sortBy === "value-desc") {
    sorted.sort((a, b) => b.value - a.value);
  } else if (sortBy === "probability-desc") {
    sorted.sort((a, b) => b.probability - a.probability);
  }

  return sorted;
}
