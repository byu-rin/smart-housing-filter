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

function MaeipPage() {
  const [criteria, setCriteria] = useState<FilterCriteria>(EMPTY_CRITERIA);

  const districts = useMemo(() => {
    const values = houses
      .map((h) => h.district)
      .filter((d): d is string => typeof d === "string");
    return Array.from(new Set(values)).sort();
  }, []);

  const maxRentCeiling = useMemo(() => {
    const rentFields = ["rentYouth1", "rentStudent1", "rentYouth23", "rentStudent23"] as const;
    let max = 0;
    houses.forEach((h) => {
      rentFields.forEach((f) => {
        const v = h[f];
        if (typeof v === "number" && v > max) max = v;
      });
    });
    return max;
  }, []);

  const results = useMemo(() => filterHouses(houses, criteria), [criteria]);

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <FilterPanel
          criteria={criteria}
          districts={districts}
          maxRentCeiling={maxRentCeiling}
          onChange={setCriteria}
        />
      </aside>
      <main className="app-main">
        <ResultList houses={results} criteria={criteria} />
      </main>
    </div>
  );
}

export default MaeipPage;
