import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_PATH = path.join(__dirname, "..", "data", "sample.html");
const COLUMN_COUNT = 18;

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractSection(source, tagName) {
  const match = source.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? match[1] : "";
}

function extractRows(sectionHtml) {
  const rows = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = rowRe.exec(sectionHtml))) rows.push(m[1]);
  return rows;
}

function extractCells(rowHtml) {
  const cells = [];
  const cellRe = /<t[dh]([^>]*)>([\s\S]*?)<\/t[dh]>/gi;
  let m;
  while ((m = cellRe.exec(rowHtml))) {
    const attrs = m[1];
    const text = decodeEntities(
      m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() // 공백 제거(정규화)
    );
    const rowspan = parseInt((/rowspan\s*=\s*"?(\d+)"?/i.exec(attrs) || [])[1] ?? "1", 10);
    const colspan = parseInt((/colspan\s*=\s*"?(\d+)"?/i.exec(attrs) || [])[1] ?? "1", 10);
    cells.push({ text, rowspan, colspan });
  }
  return cells;
}

// rowspan/colspan을 모두 펼쳐서 완전한 2차원 grid로 변환하는 범용 함수
function buildGrid(rowsOfCells) {
  const grid = [];
  const pending = []; // pending[col] = { text, remaining }

  rowsOfCells.forEach((cells, r) => {
    grid[r] = [];
    let col = 0;

    const fillPending = () => {
      while (pending[col] && pending[col].remaining > 0) {
        grid[r][col] = pending[col].text;
        pending[col].remaining -= 1;
        if (pending[col].remaining === 0) pending[col] = undefined;
        col += 1;
      }
    };

    fillPending();

    for (const cell of cells) {
      for (let c = 0; c < cell.colspan; c += 1) {
        grid[r][col] = cell.text;
        if (cell.rowspan > 1) {
          pending[col] = { text: cell.text, remaining: cell.rowspan - 1 };
        }
        col += 1;
        fillPending();
      }
    }

    fillPending();
  });

  return grid;
}

function toNumberOrNull(raw) {
  if (raw == null) return null;
  const cleaned = String(raw).replace(/\s+/g, "").replace(/,/g, ""); // 공백 제거 + 쉼표 제거
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}

function nullIfDash(raw) {
  const cleaned = String(raw ?? "").replace(/\s+/g, " ").trim();
  return cleaned === "" || cleaned === "-" ? null : cleaned;
}

export function parseHousingHtml(html) {
  const tableHtml = extractSection(html, "table");
  const theadHtml = extractSection(tableHtml, "thead");
  const tbodyHtml = extractSection(tableHtml, "tbody");

  const headerGrid = buildGrid(extractRows(theadHtml).map(extractCells));
  const bodyGrid = buildGrid(extractRows(tbodyHtml).map(extractCells));

  headerGrid.forEach((row, i) => {
    if (row.length !== COLUMN_COUNT) {
      console.warn(`[경고] 헤더 ${i + 1}행 컬럼 수(${row.length})가 예상(${COLUMN_COUNT})과 다릅니다.`);
    }
  });

  const listings = bodyGrid.map((row, i) => {
    if (row.length !== COLUMN_COUNT) {
      console.warn(`[경고] 본문 ${i + 1}행 컬럼 수(${row.length})가 예상(${COLUMN_COUNT})과 다릅니다.`);
    }

    const [
      no, supplyType, district, unitNo, buildingName, address,
      unitType, structure, gender, areaSqm,
      y1d, y1r, s1d, s1r, y2d, y2r, s2d, s2r,
    ] = row;

    return {
      no: parseInt(String(no).trim(), 10),
      supplyType: nullIfDash(supplyType),
      district: nullIfDash(district),
      unitNo: String(unitNo).replace(/\s+/g, "").trim(),
      apartmentName: nullIfDash(buildingName),
      address: nullIfDash(address),
      type: nullIfDash(unitType),
      structure: nullIfDash(structure),
      gender: nullIfDash(gender),
      area: parseFloat(String(areaSqm).replace(/\s+/g, "")),
      depositYouth1: toNumberOrNull(y1d),
      rentYouth1: toNumberOrNull(y1r),
      depositStudent1: toNumberOrNull(s1d),
      rentStudent1: toNumberOrNull(s1r),
      depositYouth23: toNumberOrNull(y2d),
      rentYouth23: toNumberOrNull(y2r),
      depositStudent23: toNumberOrNull(s2d),
      rentStudent23: toNumberOrNull(s2r),
    };
  });

  return {
    title: "2026-1차 청년 매입임대주택 입주자모집",
    noticeDate: "2026-06-26",
    listings,
  };
}

const isDirectRun = path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const html = readFileSync(HTML_PATH, "utf-8");
  const data = parseHousingHtml(html);
  console.log(data);
}
