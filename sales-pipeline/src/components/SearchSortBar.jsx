import { SORT_OPTIONS } from "../data/sortOptions";

function SearchSortBar({ search, onSearchChange, sortBy, onSortChange }) {
  return (
    <div className="search-sort-bar">
      <input
        type="search"
        className="search-input"
        placeholder="Szukaj po nazwie klienta..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Sortuj: {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SearchSortBar;
