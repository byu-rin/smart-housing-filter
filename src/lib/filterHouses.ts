import type { House } from "../debug/validateHtmlToHouseMapping";

export type Target = "youth" | "student";
export type Priority = "1" | "23";
export type Gender = "여성" | "남성";

export interface FilterCriteria {
  district?: string | null;
  gender?: Gender | null;
  maxRent?: number | null;
  priority?: Priority | null;
  target?: Target | null;
}

const VALID_GENDERS: Gender[] = ["여성", "남성"];
const VALID_TARGETS: Target[] = ["youth", "student"];
const VALID_PRIORITIES: Priority[] = ["1", "23"];

// undefined와 null을 모두 "조건 없음(무시)"으로 취급한다.
// House 데이터 자체가 성별/주택명/주택형에 null을 쓰므로, 필터 호출 쪽에서도
// null이 자연스럽게 들어올 수 있다 (예: UI에서 "선택 안 함" 상태를 null로 표현).
function isProvided<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function depositField(target: Target, priority: Priority): string {
  return `deposit${capitalize(target)}${priority}`;
}

function rentField(target: Target, priority: Priority): string {
  return `rent${capitalize(target)}${priority}`;
}

/**
 * filterHouses 인자를 자동 검증한다. 잘못된 값(오타/타입 불일치)은 즉시 에러를 던져
 * "조건이 없어서 무시된 것"과 "값이 잘못돼서 실수로 다 걸러진 것"을 구분한다.
 * (undefined인 조건은 정상이며 그냥 무시한다)
 */
function validateCriteria(houses: House[], criteria: FilterCriteria): void {
  if (!Array.isArray(houses)) {
    throw new TypeError(`filterHouses: houses는 배열이어야 합니다. (received: ${typeof houses})`);
  }

  const { district, gender, maxRent, priority, target } = criteria;

  if (isProvided(district)) {
    if (typeof district !== "string" || district.trim() === "") {
      throw new TypeError(
        `filterHouses: district는 비어있지 않은 문자열이어야 합니다. (received: ${JSON.stringify(district)})`
      );
    }
    const knownDistricts = new Set(houses.map((h) => h["district"]));
    if (!knownDistricts.has(district)) {
      console.warn(`[filterHouses] district "${district}" 는 현재 데이터셋에 존재하지 않습니다. (오타 확인)`);
    }
  }

  if (isProvided(gender) && !VALID_GENDERS.includes(gender)) {
    throw new TypeError(
      `filterHouses: gender는 ${VALID_GENDERS.join(" | ")} 중 하나여야 합니다. (received: ${JSON.stringify(gender)})`
    );
  }

  if (isProvided(target) && !VALID_TARGETS.includes(target)) {
    throw new TypeError(
      `filterHouses: target은 ${VALID_TARGETS.join(" | ")} 중 하나여야 합니다. (received: ${JSON.stringify(target)})`
    );
  }

  if (isProvided(priority) && !VALID_PRIORITIES.includes(priority)) {
    throw new TypeError(
      `filterHouses: priority는 ${VALID_PRIORITIES.join(" | ")} 중 하나여야 합니다. (received: ${JSON.stringify(priority)})`
    );
  }

  if (isProvided(maxRent)) {
    if (typeof maxRent !== "number" || !Number.isFinite(maxRent) || maxRent < 0) {
      throw new TypeError(
        `filterHouses: maxRent는 0 이상의 유한한 숫자여야 합니다. (received: ${JSON.stringify(maxRent)})`
      );
    }
  }
}

/**
 * district / gender / maxRent / priority / target 을 모두 AND 조건으로 적용해
 * houses 배열을 필터링한다. 각 조건은 값이 주어지지 않으면(undefined 또는 null) 무시된다.
 *
 * - gender: 매물의 gender가 null(성별무관)이면 어떤 요청 gender와도 항상 통과한다.
 * - target: 해당 대상군(청년/대학생및취업준비생) 가격이 아예 제공되지 않는(1순위·2~3순위 보증금이 모두 null) 매물은 제외한다.
 * - priority: 해당 순위(1순위/2~3순위) 가격이 아예 제공되지 않는(청년·대학생 보증금이 모두 null) 매물은 제외한다.
 * - maxRent: target/priority로 정해지는 임대료 컬럼과 비교한다. target/priority 미지정 시 기본값은 "youth"/"1"이다.
 */
export function filterHouses(houses: House[], criteria: FilterCriteria = {}): House[] {
  validateCriteria(houses, criteria);

  const { district, gender, maxRent, priority, target } = criteria;
  const effectiveTarget: Target = target ?? "youth";
  const effectivePriority: Priority = priority ?? "1";
  const maxRentField = rentField(effectiveTarget, effectivePriority);

  return houses.filter((house) => {
    if (isProvided(district) && house["district"] !== district) {
      return false;
    }

    if (isProvided(gender) && house["gender"] !== null && house["gender"] !== gender) {
      return false;
    }

    if (isProvided(target)) {
      const d1 = house[depositField(target, "1")];
      const d23 = house[depositField(target, "23")];
      if (d1 === null && d23 === null) return false;
    }

    if (isProvided(priority)) {
      const dYouth = house[depositField("youth", priority)];
      const dStudent = house[depositField("student", priority)];
      if (dYouth === null && dStudent === null) return false;
    }

    if (isProvided(maxRent)) {
      const rent = house[maxRentField];
      if (typeof rent !== "number" || rent > maxRent) return false;
    }

    return true;
  });
}
