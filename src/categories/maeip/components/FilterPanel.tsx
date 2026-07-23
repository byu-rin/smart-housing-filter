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

// 필터 그룹 6개가 공유하는 스타일. 반복되는 className 문자열을 한 곳에서 관리한다.
const GROUP_CLASS =
  "flex flex-col gap-3 border-b border-[var(--color-border)] py-5 first:pt-0 last:border-b-0 last:pb-0";
const LABEL_CLASS = "group flex cursor-pointer items-center gap-2";
const LABEL_TEXT_CLASS = "text-[13px] font-semibold text-neutral-700 group-hover:text-neutral-900";
const FIELD_CLASS =
  "w-full rounded-[4px] border border-[var(--color-border)] px-3 py-2.5 text-[14px] text-neutral-800 disabled:bg-neutral-50 disabled:text-[var(--color-muted)]";

function FilterPanel({ criteria, districts, maxRentCeiling, maxDepositCeiling, onChange }: FilterPanelProps) {
  const set = <K extends keyof FilterCriteria>(key: K, value: FilterCriteria[K]) => {
    onChange({ ...criteria, [key]: value });
  };

  return (
    <div className="flex flex-col gap-6 py-6 pl-6 pr-8">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-bold tracking-tight text-neutral-900">필터</h2>
        <button
          type="button"
          onClick={() => onChange(EMPTY_CRITERIA)}
          className="text-[13px] font-medium text-neutral-400 transition-colors hover:text-[var(--color-primary)]"
        >
          초기화
        </button>
      </div>

      <div className="flex flex-col">
        <div className={GROUP_CLASS}>
          <label className={LABEL_CLASS}>
            <input
              type="checkbox"
              checked={criteria.priority != null}
              onChange={(e) => set("priority", e.target.checked ? DEFAULTS.priority : null)}
            />
            <span className={LABEL_TEXT_CLASS}>순위</span>
          </label>
          <select
            disabled={criteria.priority == null}
            value={criteria.priority ?? ""}
            onChange={(e) => set("priority", e.target.value as Priority)}
            className={FIELD_CLASS}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={GROUP_CLASS}>
          <label className={LABEL_CLASS}>
            <input
              type="checkbox"
              checked={criteria.district != null}
              onChange={(e) => set("district", e.target.checked ? (districts[0] ?? null) : null)}
            />
            <span className={LABEL_TEXT_CLASS}>자치구</span>
          </label>
          <select
            disabled={criteria.district == null}
            value={criteria.district ?? ""}
            onChange={(e) => set("district", e.target.value)}
            className={FIELD_CLASS}
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className={GROUP_CLASS}>
          <label className={LABEL_CLASS}>
            <input
              type="checkbox"
              checked={criteria.gender != null}
              onChange={(e) => set("gender", e.target.checked ? DEFAULTS.gender : null)}
            />
            <span className={LABEL_TEXT_CLASS}>성별</span>
          </label>
          <select
            disabled={criteria.gender == null}
            value={criteria.gender ?? ""}
            onChange={(e) => set("gender", e.target.value as Gender)}
            className={FIELD_CLASS}
          >
            {GENDER_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={GROUP_CLASS}>
          <label className={LABEL_CLASS}>
            <input
              type="checkbox"
              checked={criteria.target != null}
              onChange={(e) => set("target", e.target.checked ? DEFAULTS.target : null)}
            />
            <span className={LABEL_TEXT_CLASS}>공급대상</span>
          </label>
          <select
            disabled={criteria.target == null}
            value={criteria.target ?? ""}
            onChange={(e) => set("target", e.target.value as Target)}
            className={FIELD_CLASS}
          >
            {TARGET_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={GROUP_CLASS}>
          <label className={LABEL_CLASS}>
            <input
              type="checkbox"
              checked={criteria.maxDeposit != null}
              onChange={(e) => set("maxDeposit", e.target.checked ? maxDepositCeiling : null)}
            />
            <span className={LABEL_TEXT_CLASS}>최대 보증금(원)</span>
          </label>
          <div className="relative">
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
              className={`${FIELD_CLASS} pr-8`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-muted)]">
              원
            </span>
          </div>
        </div>

        <div className={GROUP_CLASS}>
          <label className={LABEL_CLASS}>
            <input
              type="checkbox"
              checked={criteria.maxRent != null}
              onChange={(e) => set("maxRent", e.target.checked ? maxRentCeiling : null)}
            />
            <span className={LABEL_TEXT_CLASS}>최대 임대료(원)</span>
          </label>
          <div className="relative">
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
              className={`${FIELD_CLASS} pr-8`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-muted)]">
              원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
