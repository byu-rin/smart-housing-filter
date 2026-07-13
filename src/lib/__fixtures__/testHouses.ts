import type { House } from "../../debug/validateHtmlToHouseMapping";

/**
 * filterHouses() 테스트 전용 고정 데이터셋.
 * 실제 houses.json과 분리해, 값이 바뀌어도 테스트가 깨지지 않게 한다.
 *
 * 의도적으로 포함한 특성:
 * - 서로 다른 자치구 6개 (다중 자치구 검증용)
 * - gender: null / '여성' / '남성' 세 가지 모두 포함
 * - 임대료(rentYouth1 등) 오름/내림 폭이 넓어 maxRent 경계값 테스트 가능
 * - no5: 대학생및취업준비생 가격이 전부 null (target 필터 검증용, 실제 데이터의 삼화에코빌2차 케이스와 동일한 패턴)
 * - no9: apartmentName이 null (실제 데이터의 "-" 케이스와 동일한 패턴)
 * - no11: type이 null (실제 데이터의 "-" 케이스와 동일한 패턴)
 * - no12: 2~3순위 가격이 전부 null인 합성 엣지 케이스 (priority 필터 검증용 — 실제 데이터엔 없는 조합이라 별도로 만들어야 검증 가능)
 */
export const testHouses: House[] = [
  {
    no: 1, supplyType: "신규공급", district: "강동구", unitNo: "0101",
    apartmentName: "테스트빌라A", address: "서울특별시 강동구 테스트로 1",
    type: "25B", structure: "개방형 원룸", gender: null, area: 25.0,
    depositYouth1: 20000000, rentYouth1: 200000, depositStudent1: 1000000, rentStudent1: 240000,
    depositYouth23: 33000000, rentYouth23: 330000, depositStudent23: 2000000, rentStudent23: 400000,
  },
  {
    no: 2, supplyType: "신규공급", district: "강동구", unitNo: "0102",
    apartmentName: "테스트빌라A", address: "서울특별시 강동구 테스트로 1",
    type: "25B", structure: "개방형 원룸", gender: "여성", area: 25.5,
    depositYouth1: 21000000, rentYouth1: 300000, depositStudent1: 1000000, rentStudent1: 350000,
    depositYouth23: 35000000, rentYouth23: 500000, depositStudent23: 2000000, rentStudent23: 600000,
  },
  {
    no: 3, supplyType: "신규공급", district: "강북구", unitNo: "0201",
    apartmentName: "테스트빌라B", address: "서울특별시 강북구 테스트로 2",
    type: "30A", structure: "분리형 원룸", gender: null, area: 30.0,
    depositYouth1: 15000000, rentYouth1: 150000, depositStudent1: 1000000, rentStudent1: 180000,
    depositYouth23: 25000000, rentYouth23: 250000, depositStudent23: 2000000, rentStudent23: 300000,
  },
  {
    no: 4, supplyType: "신규공급", district: "강북구", unitNo: "0202",
    apartmentName: "테스트빌라B", address: "서울특별시 강북구 테스트로 2",
    type: "30A", structure: "분리형 원룸", gender: "남성", area: 30.5,
    depositYouth1: 24000000, rentYouth1: 400000, depositStudent1: 1000000, rentStudent1: 450000,
    depositYouth23: 40000000, rentYouth23: 700000, depositStudent23: 2000000, rentStudent23: 800000,
  },
  {
    no: 5, supplyType: "신규공급", district: "마포구", unitNo: "0301",
    apartmentName: "테스트빌라C", address: "서울특별시 마포구 테스트로 3",
    type: "38A", structure: "분리형 원룸", gender: null, area: 38.0,
    depositYouth1: 30000000, rentYouth1: 600000, depositStudent1: null, rentStudent1: null,
    depositYouth23: 50000000, rentYouth23: 900000, depositStudent23: null, rentStudent23: null,
  },
  {
    no: 6, supplyType: "신규공급", district: "마포구", unitNo: "0302",
    apartmentName: "테스트빌라C", address: "서울특별시 마포구 테스트로 3",
    type: "26B", structure: "개방형 원룸", gender: "여성", area: 26.0,
    depositYouth1: 22000000, rentYouth1: 250000, depositStudent1: 1000000, rentStudent1: 280000,
    depositYouth23: 38000000, rentYouth23: 420000, depositStudent23: 2000000, rentStudent23: 480000,
  },
  {
    no: 7, supplyType: "재공급", district: "관악구", unitNo: "0401",
    apartmentName: "테스트하임", address: "서울특별시 관악구 테스트로 4",
    type: "44C", structure: "투룸", gender: "남성", area: 44.0,
    depositYouth1: 15000000, rentYouth1: 195000, depositStudent1: 1000000, rentStudent1: 270000,
    depositYouth23: 25000000, rentYouth23: 325000, depositStudent23: 2000000, rentStudent23: 450000,
  },
  {
    no: 8, supplyType: "재공급", district: "관악구", unitNo: "0402",
    apartmentName: "테스트하임", address: "서울특별시 관악구 테스트로 4",
    type: "44C", structure: "투룸", gender: null, area: 44.5,
    depositYouth1: 16000000, rentYouth1: 210000, depositStudent1: 1000000, rentStudent1: 290000,
    depositYouth23: 27000000, rentYouth23: 350000, depositStudent23: 2000000, rentStudent23: 480000,
  },
  {
    no: 9, supplyType: "신규공급", district: "금천구", unitNo: "0501",
    apartmentName: null, address: "서울특별시 금천구 테스트로 5",
    type: "29B", structure: "개방형 원룸", gender: null, area: 25.0,
    depositYouth1: 12000000, rentYouth1: 125000, depositStudent1: 1000000, rentStudent1: 148000,
    depositYouth23: 20000000, rentYouth23: 208000, depositStudent23: 2000000, rentStudent23: 246000,
  },
  {
    no: 10, supplyType: "신규공급", district: "금천구", unitNo: "0502",
    apartmentName: "테스트빌", address: "서울특별시 금천구 테스트로 5",
    type: "29B", structure: "개방형 원룸", gender: "여성", area: 25.1,
    depositYouth1: 12400000, rentYouth1: 128000, depositStudent1: 1000000, rentStudent1: 151000,
    depositYouth23: 20700000, rentYouth23: 213000, depositStudent23: 2000000, rentStudent23: 252000,
  },
  {
    no: 11, supplyType: "재공급", district: "강남구", unitNo: "0601",
    apartmentName: "테스트백년빌", address: "서울특별시 강남구 테스트로 6",
    type: null, structure: "개방형 원룸", gender: null, area: 25.4,
    depositYouth1: 33000000, rentYouth1: 343000, depositStudent1: 1000000, rentStudent1: 410000,
    depositYouth23: 55000000, rentYouth23: 571000, depositStudent23: 2000000, rentStudent23: 682000,
  },
  {
    no: 12, supplyType: "신규공급", district: "강동구", unitNo: "0103",
    apartmentName: "테스트빌라A", address: "서울특별시 강동구 테스트로 1",
    type: "25B", structure: "개방형 원룸", gender: null, area: 25.2,
    depositYouth1: 20500000, rentYouth1: 211000, depositStudent1: 1000000, rentStudent1: 251000,
    depositYouth23: null, rentYouth23: null, depositStudent23: null, rentStudent23: null,
  },
  {
    // 대학생및취업준비생 가격이 1순위에는 있고 2~3순위에는 없는 합성 엣지 케이스.
    // target='student'만 보면 통과, priority='23'만 보면(청년23은 존재하므로) 통과 —
    // 하지만 target=student AND priority=23 조합에서는 depositStudent23이 null이므로 제외돼야 한다.
    no: 13, supplyType: "신규공급", district: "송파구", unitNo: "0701",
    apartmentName: "테스트빌라D", address: "서울특별시 송파구 테스트로 7",
    type: "27B", structure: "개방형 원룸", gender: null, area: 27.0,
    depositYouth1: 18000000, rentYouth1: 185000, depositStudent1: 1000000, rentStudent1: 220000,
    depositYouth23: 30000000, rentYouth23: 309000, depositStudent23: null, rentStudent23: null,
  },
];
