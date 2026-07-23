// filterHouses() 동작을 검증하는 단독 실행 테스트 스크립트 (npm run test:filter).
import { filterHouses } from "../src/categories/maeip/lib/filterHouses.ts";
import { testHouses } from "../src/categories/maeip/lib/__fixtures__/testHouses.ts";

interface TestCase {
  category: string;
  name: string;
  run: () => void;
}

const cases: TestCase[] = [];
const test = (category: string, name: string, run: () => void) => {
  cases.push({ category, name, run });
};

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message} (기대: ${JSON.stringify(expected)}, 실제: ${JSON.stringify(actual)})`);
  }
}

function assertNos(actual: { no: unknown }[], expectedNos: number[], message: string): void {
  const actualNos = actual.map((h) => h.no).sort((a, b) => Number(a) - Number(b));
  const expected = [...expectedNos].sort((a, b) => a - b);
  assertEqual(JSON.stringify(actualNos), JSON.stringify(expected), message);
}

function assertThrows(fn: () => void, message: string): void {
  try {
    fn();
  } catch {
    return;
  }
  throw new Error(`${message} (에러가 발생해야 하는데 발생하지 않음)`);
}

// ---------- 1. 성별 ----------
test("성별", "gender='여성' -> null(무관) + 여성만 통과, 남성 제외", () => {
  const result = filterHouses(testHouses, { gender: "여성" });
  assertNos(result, [1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13], "gender=여성 결과 no 목록 불일치");
});

test("성별", "gender='남성' -> null(무관) + 남성만 통과, 여성 제외", () => {
  const result = filterHouses(testHouses, { gender: "남성" });
  assertNos(result, [1, 3, 4, 5, 7, 8, 9, 11, 12, 13], "gender=남성 결과 no 목록 불일치");
});

// ---------- 2. 자치구 ----------
test("자치구", "district='강동구' -> 해당 자치구만 반환", () => {
  const result = filterHouses(testHouses, { district: "강동구" });
  assertNos(result, [1, 2, 12], "district=강동구 결과 no 목록 불일치");
  result.forEach((h) => assertEqual(h.district, "강동구", "district 필터에 다른 자치구가 섞임"));
});

// ---------- 3. 임대료(maxRent) ----------
test("임대료", "maxRent=250000 (기본값 youth/1) -> rentYouth1 <= 250000 인 매물만", () => {
  const result = filterHouses(testHouses, { maxRent: 250000 });
  assertNos(result, [1, 3, 6, 7, 8, 9, 10, 12, 13], "maxRent=250000 결과 no 목록 불일치");
});

test("임대료", "maxRent=250000 + target=student + priority=23 -> rentStudent23 <= 250000 인 매물만", () => {
  const result = filterHouses(testHouses, { maxRent: 250000, target: "student", priority: "23" });
  assertNos(result, [9], "maxRent+target+priority 결과 no 목록 불일치");
});

// ---------- 4. 다중 자치구 ----------
test("다중 자치구", "테스트 데이터셋 자체가 6개 이상 자치구를 포함", () => {
  const uniqueDistricts = new Set(testHouses.map((h) => h.district));
  if (uniqueDistricts.size < 5) {
    throw new Error(`고정 데이터셋의 자치구 다양성이 부족함 (실제: ${uniqueDistricts.size}개)`);
  }
});

test("다중 자치구", "district='마포구' -> 다른 자치구(강동구 등) 매물이 섞이지 않음", () => {
  const result = filterHouses(testHouses, { district: "마포구" });
  assertNos(result, [5, 6], "district=마포구 결과 no 목록 불일치");
  result.forEach((h) => assertEqual(h.district, "마포구", "district=마포구 필터에 다른 자치구가 섞임"));
});

// ---------- 5. AND 검색 ----------
test("AND 검색", "district='강동구' AND maxRent=220000 -> rentYouth1이 높은 no2는 제외", () => {
  const result = filterHouses(testHouses, { district: "강동구", maxRent: 220000 });
  assertNos(result, [1, 12], "district+maxRent AND 결과 no 목록 불일치");
});

test("AND 검색", "target=student AND priority=23 AND maxRent=500000 (3중 AND)", () => {
  const result = filterHouses(testHouses, { target: "student", priority: "23", maxRent: 500000 });
  assertNos(result, [1, 3, 6, 7, 8, 9, 10], "target+priority+maxRent AND 결과 no 목록 불일치");
});

// ---------- 6. target / priority 단독 (null 가용성 필터) ----------
test("target", "target='student' -> 대학생 가격이 전부(1·2~3순위 모두) null인 no5만 제외", () => {
  const result = filterHouses(testHouses, { target: "student" });
  // no13은 1순위엔 대학생 가격이 있으므로(2~3순위만 없음) target 단독 조건에서는 통과해야 한다.
  assertNos(result, [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13], "target=student 결과 no 목록 불일치");
});

test("priority", "priority='23' -> 2~3순위 가격이 전부(청년·대학생 모두) null인 no12만 제외", () => {
  const result = filterHouses(testHouses, { priority: "23" });
  // no13은 청년 2~3순위 가격은 있으므로(대학생만 없음) priority 단독 조건에서는 통과해야 한다.
  assertNos(result, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13], "priority=23 결과 no 목록 불일치");
});

// ---------- 6-1. target + priority "정확한 조합" (버그 회귀 테스트) ----------
// 실버그: target='student' AND priority='23'을 함께 걸었을 때, 각 조건을 독립적으로만 검사하면
// "대학생및취업준비생이 1순위엔 있고 2~3순위엔 없는" no13이 잘못 통과해버렸다(가격은 "-"로 표시됨).
// target+priority를 함께 지정한 경우엔 그 정확한 조합(depositStudent23)만 봐야 한다.
test("target+priority 조합", "target='student' AND priority='23' (maxRent 없이) -> no13(1순위에만 대학생 가격 존재)은 제외되어야 함", () => {
  const result = filterHouses(testHouses, { target: "student", priority: "23" });
  assertNos(result, [1, 2, 3, 4, 6, 7, 8, 9, 10, 11], "target=student+priority=23 결과 no 목록 불일치 (no13 누락 회귀)");
  if (result.some((h) => h.no === 13)) {
    throw new Error("no13(대학생 2~3순위 가격이 null)이 결과에 포함됨 - target/priority 조합 필터 회귀");
  }
});

// ---------- 7. 조건 없음 / null 처리 ----------
test("null 처리", "모든 조건이 null -> 전체 반환 (조건 없음과 동일하게 무시)", () => {
  const result = filterHouses(testHouses, {
    district: null,
    gender: null,
    maxRent: null,
    priority: null,
    target: null,
  });
  assertEqual(result.length, testHouses.length, "null 조건이 무시되지 않음");
});

// ---------- 8. 자동 검증(잘못된 값) ----------
test("자동 검증", "gender='무관' (허용되지 않는 값) -> 에러", () => {
  assertThrows(() => filterHouses(testHouses, { gender: "무관" as never }), "gender='무관'이 에러를 던지지 않음");
});

test("자동 검증", "target='foo' (허용되지 않는 값) -> 에러", () => {
  assertThrows(() => filterHouses(testHouses, { target: "foo" as never }), "target='foo'가 에러를 던지지 않음");
});

test("자동 검증", "district='강북' (오타, 데이터셋에 없는 값) -> 결과 0건", () => {
  const result = filterHouses(testHouses, { district: "강북" });
  assertEqual(result.length, 0, "오타 district에 대해 0건이 아님");
});

// ---------- 9. 최대 보증금(maxDeposit) ----------
test("보증금", "maxDeposit=20000000 (기본값 youth/1) -> depositYouth1 <= 20000000 인 매물만", () => {
  const result = filterHouses(testHouses, { maxDeposit: 20000000 });
  assertNos(result, [1, 3, 7, 8, 9, 10, 13], "maxDeposit=20000000 결과 no 목록 불일치");
});

test("보증금", "maxDeposit=20000000 + maxRent=200000 -> 두 조건 모두 만족하는 매물만", () => {
  const result = filterHouses(testHouses, { maxDeposit: 20000000, maxRent: 200000 });
  assertNos(result, [1, 3, 7, 9, 10, 13], "maxDeposit+maxRent 결과 no 목록 불일치");
});

test("보증금", "maxDeposit=20500000 + district='강동구' -> 해당 자치구 + 보증금 조건 동시 만족", () => {
  const result = filterHouses(testHouses, { maxDeposit: 20500000, district: "강동구" });
  assertNos(result, [1, 12], "maxDeposit+district 결과 no 목록 불일치");
});

test("보증금", "모든 필터 동시 적용 (district+gender+target+priority+maxRent+maxDeposit)", () => {
  const result = filterHouses(testHouses, {
    district: "강동구",
    gender: "여성",
    target: "youth",
    priority: "1",
    maxRent: 220000,
    maxDeposit: 20500000,
  });
  assertNos(result, [1, 12], "전체 필터 동시 적용 결과 no 목록 불일치");
});

// ---------- 실행 ----------
let passCount = 0;
let failCount = 0;

console.log("========== filterHouses 테스트 ==========");
cases.forEach((c, i) => {
  try {
    c.run();
    passCount += 1;
    console.log(`${i + 1}. [${c.category}] ${c.name} : PASS`);
  } catch (err) {
    failCount += 1;
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`${i + 1}. [${c.category}] ${c.name} : FAIL - ${msg}`);
  }
});

console.log(`\n총 ${cases.length}개 케이스 중 PASS ${passCount} / FAIL ${failCount}`);
console.log(`[최종 결과] ${failCount === 0 ? "PASS" : "FAIL"}`);
console.log("==========================================");

if (failCount > 0) {
  process.exitCode = 1;
}
