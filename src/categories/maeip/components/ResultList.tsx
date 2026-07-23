// 필터링된 매물 목록을 카드 형태로 렌더링한다.
import type { House } from "../debug/validateHtmlToHouseMapping";
import { getPriceFieldNames, type FilterCriteria } from "../lib/filterHouses";

interface ResultListProps {
  houses: House[];
  criteria: FilterCriteria;
}

function toDisplay(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function formatWon(value: unknown): string {
  return typeof value === "number" ? `${value.toLocaleString("ko-KR")}원` : "-";
}

function ResultList({ houses, criteria }: ResultListProps) {
  const target = criteria.target ?? "youth";
  const priority = criteria.priority ?? "1";
  const { depositField, rentField } = getPriceFieldNames(target, priority);

  return (
    <div>
      <p>총 {houses.length}건</p>
      <ul>
        {houses.map((house) => (
          <li key={toDisplay(house.no)}>
            <div>
              {toDisplay(house.district)} · {toDisplay(house.apartmentName, "(이름 없음)")}
            </div>
            <div>{toDisplay(house.address)}</div>
            <div>
              {toDisplay(house.type)} / {toDisplay(house.structure)} / {toDisplay(house.gender, "성별무관")} /{" "}
              {toDisplay(house.area)}㎡
            </div>
            <div>
              보증금 {formatWon(house[depositField])} · 임대료 {formatWon(house[rentField])}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ResultList;
