import { useMemo, useState } from "react";
import houseData from "./data/houses.json";
import type { House } from "./debug/validateHtmlToHouseMapping";
import { filterHouses, type FilterCriteria } from "./lib/filterHouses";
import FilterPanel from "./components/FilterPanel";
import ResultList from "./components/ResultList";

const houses = houseData as unknown as House[];

const EMPTY_CRITERIA: FilterCriteria = {
  district: null,
  gender: null,
  maxRent: null,
  priority: null,
  target: null,
};

function App() {
  const [criteria, setCriteria] = useState<FilterCriteria>(EMPTY_CRITERIA);

  const districts = useMemo(() => {
    const values = houses
      .map((h) => h.district)
      .filter((d): d is string => typeof d === "string");
    return Array.from(new Set(values)).sort();
  }, []);

  const results = useMemo(() => filterHouses(houses, criteria), [criteria]);

  return (
    <div style={{ display: "flex" }}>
      <aside style={{ width: 280, flexShrink: 0 }}>
        <FilterPanel criteria={criteria} districts={districts} onChange={setCriteria} />
      </aside>
      <main style={{ flex: 1 }}>
        <ResultList houses={results} criteria={criteria} />
      </main>
    </div>
  );
}

export default App;
