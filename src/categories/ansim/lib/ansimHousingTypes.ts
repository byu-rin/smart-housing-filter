// 청년안심주택 데이터 타입 정의
// 1건 = 공고 표의 한 행 = 하나의 모집조건(임대료구분 단위)

export type AnsimEligibility = "청년" | "신혼Ⅰ" | "신혼Ⅱ";
export type AnsimSupplyType = "신규공급" | "재공급" | "셰어형";

export interface AnsimUnitType {
  no: number;                  // 순번
  supplyType: AnsimSupplyType; // 신규공급, 재공급, 셰어형
  district: string;            // 자치구 (서울 각 구)
  apartmentName: string;       // 단지명
  address: string;             // 주소 (지번)
  type: string;                // 공급유형 코드 (예: "19", "39A", "39B")
  area: number;                // 전용면적 (㎡)
  eligibility: AnsimEligibility; // 신청자격 (청년/신혼Ⅰ/신혼Ⅱ)
  unitCount: number;           // 공급호수 (세대수) — rowspan 병합, 하위 행에 복사
  rentLabel: string;           // "A" | "B" | "C" | "D"
  deposit: number;             // 임대보증금 계 (원)
  contractAmount: number;      // 계약금 (20%, 원)
  balanceAmount: number;       // 잔금 (80%, 원)
  monthlyRent: number;         // 월임대료 (원)
}
