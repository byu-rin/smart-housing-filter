// 필터 조건(자치구/성별/공급대상/순위/최대임대료) 입력 UI. 조건 변경을 부모(App)로 올려보낸다.
import type { FilterCriteria, Gender, Priority, Target } from "../lib/filterHouses";

interface FilterPanelProps {
  criteria: FilterCriteria;
  districts: string[];
  maxRentCeiling: number;
  maxDepositCeiling: number;
  onChange: (next: FilterCriteria) => void;
}

const EMPTY_CRITERIA: FilterCriteria = {
  district: null,
  gender: null,
  maxRent: null,
  maxDeposit: null,
  priority: null,
  target: null,
};

const GENDER_OPTIONS: Array<{ label: string; value: Gender }> = [
  { label: "여성", value: "여성" },
  { label: "남성", value: "남성" },
];

const TARGET_OPTIONS: Array<{ label: string; value: Target }> = [
  { label: "청년", value: "youth" },
  { label: "대학생 및 취업준비생", value: "student" },
];

const PRIORITY_OPTIONS: Array<{ label: string; value: Priority }> = [
  { label: "1순위", value: "1" },
  { label: "2~3순위", value: "23" },
];

// 필터를 체크박스로 켤 때 기본으로 채워 넣을 값. 값 자체는 이후 컨트롤에서 바꿀 수 있다.
const DEFAULTS = {
  gender: "여성" as Gender,
  target: "youth" as Target,
  priority: "1" as Priority,
};

function FilterPanel({ criteria, districts, maxRentCeiling, maxDepositCeiling, onChange }: FilterPanelProps) {
  const set = <K extends keyof FilterCriteria>(key: K, value: FilterCriteria[K]) => {
    onChange({ ...criteria, [key]: value });
  };

  return (
    <div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={criteria.priority != null}
            onChange={(e) => set("priority", e.target.checked ? DEFAULTS.priority : null)}
          />
          순위
        </label>
        <br />
        <select
          disabled={criteria.priority == null}
          value={criteria.priority ?? ""}
          onChange={(e) => set("priority", e.target.value as Priority)}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={criteria.district != null}
            onChange={(e) => set("district", e.target.checked ? (districts[0] ?? null) : null)}
          />
          자치구
        </label>
        <br />
        <select
          disabled={criteria.district == null}
          value={criteria.district ?? ""}
          onChange={(e) => set("district", e.target.value)}
        >
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={criteria.gender != null}
            onChange={(e) => set("gender", e.target.checked ? DEFAULTS.gender : null)}
          />
          성별
        </label>
        <br />
        <select
          disabled={criteria.gender == null}
          value={criteria.gender ?? ""}
          onChange={(e) => set("gender", e.target.value as Gender)}
        >
          {GENDER_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={criteria.target != null}
            onChange={(e) => set("target", e.target.checked ? DEFAULTS.target : null)}
          />
          공급대상
        </label>
        <br />
        <select
          disabled={criteria.target == null}
          value={criteria.target ?? ""}
          onChange={(e) => set("target", e.target.value as Target)}
        >
          {TARGET_OPTIONS.map((o) => (
            <option key={o.label} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={criteria.maxDeposit != null}
            onChange={(e) => set("maxDeposit", e.target.checked ? maxDepositCeiling : null)}
          />
          최대 보증금(원)
        </label>
        <br />
        <input
          type="number"
          min={0}
          step="100000"
          placeholder="예시: 50000000"
          disabled={criteria.maxDeposit == null}
          value={criteria.maxDeposit ?? ""}
          onChange={(e) => {
            const value = e.target.value.trim();
            if (value === "") {
              return;
            }
            const num = Number(value);
            if (num > 0) set("maxDeposit", num);
          }}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={criteria.maxRent != null}
            onChange={(e) => set("maxRent", e.target.checked ? maxRentCeiling : null)}
          />
          최대 임대료(원)
        </label>
        <br />
        <input
          type="number"
          min={0}
          step="10000"
          placeholder="예시: 500000"
          disabled={criteria.maxRent == null}
          value={criteria.maxRent ?? ""}
          onChange={(e) => {
            const value = e.target.value.trim();
            if (value === "") {
              return;
            }
            const num = Number(value);
            if (num > 0) set("maxRent", num);
          }}
        />
      </div>

      <button type="button" onClick={() => onChange(EMPTY_CRITERIA)}>
        초기화
      </button>
    </div>
  );
}

export default FilterPanel;
