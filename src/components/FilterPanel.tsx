import type { FilterCriteria, Gender, Priority, Target } from "../lib/filterHouses";

interface FilterPanelProps {
  criteria: FilterCriteria;
  districts: string[];
  onChange: (next: FilterCriteria) => void;
}

const EMPTY_CRITERIA: FilterCriteria = {
  district: null,
  gender: null,
  maxRent: null,
  priority: null,
  target: null,
};

const GENDER_OPTIONS: Array<{ label: string; value: Gender | "" }> = [
  { label: "전체", value: "" },
  { label: "여성", value: "여성" },
  { label: "남성", value: "남성" },
];

const TARGET_OPTIONS: Array<{ label: string; value: Target | "" }> = [
  { label: "전체", value: "" },
  { label: "청년", value: "youth" },
  { label: "대학생 및 취업준비생", value: "student" },
];

const PRIORITY_OPTIONS: Array<{ label: string; value: Priority | "" }> = [
  { label: "전체", value: "" },
  { label: "1순위", value: "1" },
  { label: "2~3순위", value: "23" },
];

function FilterPanel({ criteria, districts, onChange }: FilterPanelProps) {
  const set = <K extends keyof FilterCriteria>(key: K, value: FilterCriteria[K]) => {
    onChange({ ...criteria, [key]: value });
  };

  return (
    <div>
      <div>
        <label htmlFor="filter-priority">순위</label>
        <br />
        <select
          id="filter-priority"
          value={criteria.priority ?? ""}
          onChange={(e) => set("priority", e.target.value === "" ? null : (e.target.value as Priority))}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-district">자치구</label>
        <br />
        <select
          id="filter-district"
          value={criteria.district ?? ""}
          onChange={(e) => set("district", e.target.value === "" ? null : e.target.value)}
        >
          <option value="">전체</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-gender">성별</label>
        <br />
        <select
          id="filter-gender"
          value={criteria.gender ?? ""}
          onChange={(e) => set("gender", e.target.value === "" ? null : (e.target.value as Gender))}
        >
          {GENDER_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-target">대상</label>
        <br />
        <select
          id="filter-target"
          value={criteria.target ?? ""}
          onChange={(e) => set("target", e.target.value === "" ? null : (e.target.value as Target))}
        >
          {TARGET_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-max-rent">최대 임대료(원)</label>
        <br />
        <input
          id="filter-max-rent"
          type="number"
          min={0}
          value={criteria.maxRent ?? ""}
          onChange={(e) => set("maxRent", e.target.value === "" ? null : Number(e.target.value))}
        />
      </div>

      <button type="button" onClick={() => onChange(EMPTY_CRITERIA)}>
        초기화
      </button>
    </div>
  );
}

export default FilterPanel;
