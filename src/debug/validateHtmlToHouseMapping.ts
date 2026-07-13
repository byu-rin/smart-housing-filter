export type House = Record<string, unknown>;

interface CheckResult {
  index: number;
  name: string;
  pass: boolean;
  detail: string;
}

const NUMERIC_FIELDS = [
  "depositYouth1",
  "rentYouth1",
  "depositStudent1",
  "rentStudent1",
  "depositYouth23",
  "rentYouth23",
  "depositStudent23",
  "rentStudent23",
  "area",
] as const;

function sortedKeys(obj: House): string[] {
  return Object.keys(obj).sort();
}

function sameKeys(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((key, i) => key === b[i]);
}

/**
 * HTML -> House[] 매핑 결과를 자동 검증한다.
 * FAIL이 하나라도 있으면 자동으로 데이터를 고치지 않고 결과만 보고한다.
 */
export function validateHtmlToHouseMapping(houses: House[]): boolean {
  const checks: CheckResult[] = [];
  let seq = 0;
  const record = (name: string, pass: boolean, detail: string) => {
    seq += 1;
    checks.push({ index: seq, name, pass, detail });
  };

  const hasData = Array.isArray(houses) && houses.length > 0;

  // 1. houses.length > 0
  record(
    "houses.length > 0",
    hasData,
    hasData
      ? `총 ${houses.length}개`
      : `배열이 비어있거나 유효하지 않음 (length=${Array.isArray(houses) ? houses.length : "N/A"})`
  );

  // 2. 모든 객체가 동일한 필드(키 이름 + 개수)를 가진다
  let sameFieldSet = false;
  {
    if (!hasData) {
      record("모든 객체가 동일한 필드를 가진다 (key 개수 포함)", false, "houses가 비어있어 검사 불가");
    } else {
      const refKeys = sortedKeys(houses[0]);
      const mismatches: string[] = [];
      houses.forEach((h, i) => {
        const keys = sortedKeys(h);
        if (!sameKeys(keys, refKeys)) {
          const missing = refKeys.filter((k) => !keys.includes(k));
          const extra = keys.filter((k) => !refKeys.includes(k));
          mismatches.push(
            `index ${i}(no=${String(h["no"])}): key개수=${keys.length}(기준=${refKeys.length})` +
              (missing.length ? `, 누락=[${missing.join(",")}]` : "") +
              (extra.length ? `, 추가=[${extra.join(",")}]` : "")
          );
        }
      });
      sameFieldSet = mismatches.length === 0;
      record(
        "모든 객체가 동일한 필드를 가진다 (key 개수 포함)",
        sameFieldSet,
        sameFieldSet
          ? `모든 ${houses.length}개 객체가 동일한 ${refKeys.length}개 필드를 가짐`
          : `${mismatches.length}건 불일치: ${mismatches.slice(0, 5).join(" | ")}${
              mismatches.length > 5 ? " ..." : ""
            }`
      );
    }
  }

  // 3. undefined 필드 개수 == 0
  let undefinedCount = 0;
  const undefinedLocations: string[] = [];
  houses.forEach((h, i) => {
    Object.keys(h).forEach((k) => {
      if (h[k] === undefined) {
        undefinedCount += 1;
        if (undefinedLocations.length < 5) undefinedLocations.push(`index ${i}.${k}`);
      }
    });
  });
  record(
    "undefined 필드 개수 == 0",
    undefinedCount === 0,
    undefinedCount === 0 ? "undefined 없음" : `${undefinedCount}건 발견 (예: ${undefinedLocations.join(", ")})`
  );

  // 4. 숫자 필드는 number 또는 null만 허용
  let numericTypeViolations = 0;
  const numericTypeExamples: string[] = [];
  houses.forEach((h, i) => {
    NUMERIC_FIELDS.forEach((field) => {
      const v = h[field];
      const okType = v === null || typeof v === "number";
      if (!okType) {
        numericTypeViolations += 1;
        if (numericTypeExamples.length < 5) {
          numericTypeExamples.push(`index ${i}.${field}=${JSON.stringify(v)}(${typeof v})`);
        }
      }
    });
  });
  record(
    "숫자 필드는 number 또는 null만 허용",
    numericTypeViolations === 0,
    numericTypeViolations === 0
      ? "모든 숫자 필드가 number 또는 null"
      : `${numericTypeViolations}건 위반 (예: ${numericTypeExamples.join(", ")})`
  );

  // 5. NaN 값이 존재하지 않는다
  let nanCount = 0;
  const nanExamples: string[] = [];
  houses.forEach((h, i) => {
    NUMERIC_FIELDS.forEach((field) => {
      const v = h[field];
      if (typeof v === "number" && Number.isNaN(v)) {
        nanCount += 1;
        if (nanExamples.length < 5) nanExamples.push(`index ${i}.${field}`);
      }
    });
  });
  record(
    "NaN 값이 존재하지 않는다",
    nanCount === 0,
    nanCount === 0 ? "NaN 없음" : `${nanCount}건 발견 (예: ${nanExamples.join(", ")})`
  );

  // 6. 빈 문자열("") 필드가 존재하지 않는다
  let emptyStringCount = 0;
  const emptyStringExamples: string[] = [];
  houses.forEach((h, i) => {
    Object.keys(h).forEach((k) => {
      if (h[k] === "") {
        emptyStringCount += 1;
        if (emptyStringExamples.length < 5) emptyStringExamples.push(`index ${i}.${k}`);
      }
    });
  });
  record(
    '빈 문자열("") 필드가 존재하지 않는다',
    emptyStringCount === 0,
    emptyStringCount === 0 ? "빈 문자열 없음" : `${emptyStringCount}건 발견 (예: ${emptyStringExamples.join(", ")})`
  );

  const overallPass = checks.every((c) => c.pass);

  // ---- 출력 ----
  console.log("========== validateHtmlToHouseMapping ==========");
  console.log("[검증 결과]");
  checks.forEach((c) => {
    console.log(`${c.index}. ${c.name} : ${c.pass ? "PASS" : "FAIL"} - ${c.detail}`);
  });

  console.log("\n[정보 출력]");
  if (hasData) {
    const mid = houses[Math.floor(houses.length / 2)];

    let nullCount = 0;
    const nullFieldSet = new Set<string>();
    houses.forEach((h) => {
      Object.keys(h).forEach((k) => {
        if (h[k] === null) {
          nullCount += 1;
          nullFieldSet.add(k);
        }
      });
    });

    const genderSet = new Set(houses.map((h) => h["gender"]));
    const districtSet = new Set(houses.map((h) => h["district"]));

    console.log(`1. 총 데이터 개수: ${houses.length}`);
    console.log("2. 첫 번째 객체:", houses[0]);
    console.log("3. 중간 객체:", mid);
    console.log("4. 마지막 객체:", houses[houses.length - 1]);
    console.log(`5. null 필드 개수: ${nullCount}`);
    console.log("6. null 필드 목록:", Array.from(nullFieldSet).sort());
    console.log("7. 성별 고유값:", Array.from(genderSet));
    console.log("8. 자치구 고유값:", Array.from(districtSet));
  } else {
    console.log("houses가 비어있어 정보 출력을 생략합니다.");
  }

  console.log(`\n[최종 결과] ${overallPass ? "PASS" : "FAIL"}`);
  if (!overallPass) {
    console.warn(
      "하나 이상의 검증 항목이 FAIL했습니다. 자동 수정을 수행하지 않았습니다. 원인을 분석하고 사용자 승인 후 수정하세요."
    );
  }
  console.log("=================================================");

  return overallPass;
}
